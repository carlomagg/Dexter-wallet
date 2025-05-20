from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for the Transaction model."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = (
            'id', 'user_email', 'amount', 'transaction_type', 'status',
            'reference', 'payment_reference', 'payment_method',
            'description', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'user_email', 'reference', 'payment_reference',
            'status', 'created_at', 'updated_at'
        )
