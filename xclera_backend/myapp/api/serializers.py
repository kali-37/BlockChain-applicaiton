# xclera/api/serializers.py
from rest_framework import serializers
from django.db import transaction
from ..models import User, ReferralRelationship, Transaction, UserReferralStats, LevelUpgradeRequirement

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'wallet_address', 'current_level', 
                  'is_registered_on_chain', 'created_at']
        read_only_fields = ['is_registered_on_chain', 'current_level', 'created_at']

class UserReferralStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReferralStats
        fields = ['direct_referrals_count', 'max_referral_depth', 
                  'total_network_size', 'last_updated']
        read_only_fields = ['direct_referrals_count', 'max_referral_depth', 
                           'total_network_size', 'last_updated']

class UserWithStatsSerializer(UserSerializer):
    referral_stats = UserReferralStatsSerializer(read_only=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['referral_stats']

class ReferralSerializer(serializers.ModelSerializer):
    referrer_username = serializers.ReadOnlyField(source='referrer.username')
    referee_username = serializers.ReadOnlyField(source='referee.username')
    
    class Meta:
        model = ReferralRelationship
        fields = ['id', 'referrer', 'referrer_username', 'referee', 
                  'referee_username', 'level', 'created_at']
        read_only_fields = ['created_at']

class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'username', 'transaction_type', 'amount', 
                  'tx_hash', 'status', 'from_address', 'to_address', 
                  'level', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class LevelUpgradeRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelUpgradeRequirement
        fields = ['level', 'price', 'min_direct_referrals', 'min_network_depth']

class RegistrationSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    referrer_code = serializers.CharField(max_length=50)
    
    def validate_wallet_address(self, value):
        from web3 import Web3
        if not Web3.is_address(value):
            raise serializers.ValidationError("Invalid wallet address")
        if User.objects.filter(wallet_address=value).exists():
            raise serializers.ValidationError("Wallet address already registered")
        return value
    
    def validate_referrer_code(self, value):
        try:
            referrer = User.objects.get(username=value)
            if not referrer.is_registered_on_chain:
                raise serializers.ValidationError("Referrer is not registered on blockchain")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid referrer code")
        return value

class LevelUpgradeSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    target_level = serializers.IntegerField(min_value=2, max_value=19)
    
    def validate(self, data):
        from web3 import Web3
        from ..blockchain import BlockchainService
        
        wallet_address = data['wallet_address']
        target_level = data['target_level']
        
        if not Web3.is_address(wallet_address):
            raise serializers.ValidationError({"wallet_address": "Invalid wallet address"})
        
        try:
            user = User.objects.get(wallet_address=wallet_address)
        except User.DoesNotExist:
            raise serializers.ValidationError({"wallet_address": "User not found"})
        
        # Check if already at or above target level
        if user.current_level >= target_level:
            raise serializers.ValidationError(
                {"target_level": f"User is already at level {user.current_level}"}
            )
        
        # Check if trying to skip levels
        if user.current_level + 1 != target_level:
            raise serializers.ValidationError(
                {"target_level": f"Cannot skip levels. Current level is {user.current_level}"}
            )
        
        # Check requirements for level 2
        if target_level == 2:
            direct_referrals = ReferralRelationship.objects.filter(
                referrer=user, level=1
            ).count()
            
            if direct_referrals < 3:
                raise serializers.ValidationError(
                    {"target_level": f"Need at least 3 direct referrals for Level 2 (current: {direct_referrals})"}
                )
        
        # Check requirements for levels above 2
        if target_level > 2:
            try:
                stats = UserReferralStats.objects.get(user=user)
                if stats.max_referral_depth < target_level - 1:
                    raise serializers.ValidationError(
                        {"target_level": f"Insufficient referral depth. Need {target_level - 1} but have {stats.max_referral_depth}"}
                    )
            except UserReferralStats.DoesNotExist:
                raise serializers.ValidationError({"target_level": "User referral statistics not found"})
        
        return data