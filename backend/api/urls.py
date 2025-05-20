from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import RegisterView, WalletView
from transactions.views import (
    InitiateTransactionView, VerifyTransactionView, 
    WebhookView, TransactionListView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Wallet endpoints
    path('wallet/balance/', WalletView.as_view(), name='wallet_balance'),
    path('wallet/fund/', InitiateTransactionView.as_view(), name='fund_wallet'),
    path('wallet/verify/<str:reference>/', VerifyTransactionView.as_view(), name='verify_transaction'),
    
    # Transaction endpoints
    path('transactions/', TransactionListView.as_view(), name='transaction_list'),
    
    # Webhook endpoint
    path('webhook/monnify/', WebhookView.as_view(), name='monnify_webhook'),
]
