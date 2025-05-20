from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Wallet

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        """Create and return a new user with encrypted password."""
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create a wallet for the user with 0 balance
        Wallet.objects.create(user=user)
        
        return user


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for the Wallet model."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Wallet
        fields = ('id', 'user_email', 'balance', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user_email', 'balance', 'created_at', 'updated_at')
