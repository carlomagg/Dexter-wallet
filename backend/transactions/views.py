import uuid
import json
import base64
import hmac
import hashlib
import requests
from django.conf import settings
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Transaction
from .serializers import TransactionSerializer
from users.models import Wallet


class MonnifyAPI:
    """Utility class for interacting with Monnify API."""
    
    @staticmethod
    def get_auth_token():
        """Get authentication token from Monnify API."""
        auth_string = f"{settings.MONNIFY_API_KEY}:{settings.MONNIFY_SECRET_KEY}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {encoded_auth}"
        }
        
        url = f"{settings.MONNIFY_BASE_URL}/auth/login"
        response = requests.post(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()['responseBody']['accessToken']
        return None
    
    @staticmethod
    def initialize_transaction(amount, email, reference, redirect_url):
        """Initialize a transaction on Monnify."""
        token = MonnifyAPI.get_auth_token()
        
        if not token:
            return None
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "amount": float(amount),
            "customerName": email.split('@')[0],
            "customerEmail": email,
            "paymentReference": reference,
            "paymentDescription": f"Wallet funding for {email}",
            "currencyCode": "NGN",
            "contractCode": settings.MONNIFY_CONTRACT_CODE,
            "redirectUrl": redirect_url,
            "paymentMethods": ["CARD", "ACCOUNT_TRANSFER"]
        }
        
        url = f"{settings.MONNIFY_BASE_URL}/merchant/transactions/init-transaction"
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            return response.json()['responseBody']
        return None
    
    @staticmethod
    def verify_transaction(payment_reference):
        """Verify a transaction on Monnify."""
        token = MonnifyAPI.get_auth_token()
        
        if not token:
            return None
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        url = f"{settings.MONNIFY_BASE_URL}/merchant/transactions/query?paymentReference={payment_reference}"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()['responseBody']
        return None
    
    @staticmethod
    def verify_webhook_signature(request_body, signature):
        """Verify that the webhook request is from Monnify."""
        computed_signature = hmac.new(
            settings.MONNIFY_SECRET_KEY.encode(),
            request_body.encode(),
            hashlib.sha512
        ).hexdigest()
        
        return computed_signature == signature


class InitiateTransactionView(APIView):
    """View for initiating a transaction."""
    
    def post(self, request):
        amount = request.data.get('amount')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {'error': 'Amount must be greater than 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate a unique reference for this transaction
        reference = f"WAL-{uuid.uuid4().hex[:10].upper()}"
        
        # Frontend URL that Monnify will redirect to after payment
        redirect_url = request.data.get('redirectUrl', 'http://localhost:3000/payment/callback')
        
        # Initialize transaction on Monnify
        transaction_data = MonnifyAPI.initialize_transaction(
            amount, request.user.email, reference, redirect_url
        )
        
        if not transaction_data:
            return Response(
                {'error': 'Failed to initialize transaction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create a transaction record in our database
        transaction = Transaction.objects.create(
            user=request.user,
            amount=amount,
            transaction_type=Transaction.DEPOSIT,
            status=Transaction.PENDING,
            reference=reference,
            payment_reference=transaction_data.get('paymentReference'),
            description=f"Wallet funding of ₦{amount}",
            metadata=transaction_data
        )
        
        serializer = TransactionSerializer(transaction)
        
        return Response({
            'transaction': serializer.data,
            'checkout_url': transaction_data.get('checkoutUrl')
        })


class VerifyTransactionView(APIView):
    """View for verifying a transaction."""
    
    def get(self, request, reference):
        try:
            transaction = Transaction.objects.get(reference=reference, user=request.user)
        except Transaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # If transaction is already completed or failed, return its status
        if transaction.status != Transaction.PENDING:
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data)
        
        # Verify transaction with Monnify
        transaction_data = MonnifyAPI.verify_transaction(transaction.payment_reference)
        
        if not transaction_data:
            return Response(
                {'error': 'Failed to verify transaction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Update transaction status based on Monnify response
        payment_status = transaction_data.get('paymentStatus')
        
        with transaction.atomic():
            if payment_status == 'PAID':
                transaction.status = Transaction.COMPLETED
                transaction.payment_method = transaction_data.get('paymentMethod')
                transaction.save()
                
                # Update user's wallet balance
                wallet = Wallet.objects.get(user=request.user)
                wallet.balance += transaction.amount
                wallet.save()
            elif payment_status in ['FAILED', 'CANCELLED']:
                transaction.status = Transaction.FAILED
                transaction.save()
        
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)


class WebhookView(APIView):
    """View for handling Monnify webhooks."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Verify that the request is from Monnify
        signature = request.headers.get('monnify-signature')
        
        if not signature or not MonnifyAPI.verify_webhook_signature(
            json.dumps(request.data), signature
        ):
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        event_type = request.data.get('eventType')
        
        if event_type != 'SUCCESSFUL_TRANSACTION':
            # We're only interested in successful transactions
            return Response({'status': 'ignored'})
        
        event_data = request.data.get('eventData', {})
        payment_reference = event_data.get('paymentReference')
        
        if not payment_reference:
            return Response(
                {'error': 'Payment reference not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transaction = Transaction.objects.get(payment_reference=payment_reference)
        except Transaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # If transaction is already completed, return success
        if transaction.status == Transaction.COMPLETED:
            return Response({'status': 'success'})
        
        # Update transaction status
        with transaction.atomic():
            transaction.status = Transaction.COMPLETED
            transaction.payment_method = event_data.get('paymentMethod')
            transaction.save()
            
            # Update user's wallet balance
            wallet = Wallet.objects.get(user=transaction.user)
            wallet.balance += transaction.amount
            wallet.save()
        
        return Response({'status': 'success'})


class TransactionListView(APIView):
    """View for listing user transactions."""
    
    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
