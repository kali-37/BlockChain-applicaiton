from rest_framework import serializers
from myapp.models import UserProfile, Level, Transaction, ReferralRelationship
from myapp.services.referral import ReferralService
import re


class UserProfileSerializer(serializers.ModelSerializer):
    referrer_username = serializers.SerializerMethodField()
    is_profile_complete = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "country",
            "phone_number",
            "email",
            "wallet_address",
            "referrer",
            "referrer_username",
            "current_level",
            "direct_referrals_count",
            "max_referral_depth",
            "is_registered_on_chain",
            "date_registered",
            "is_profile_complete",
        ]
        read_only_fields = [
            "id",
            "direct_referrals_count",
            "max_referral_depth",
            "is_registered_on_chain",
            "date_registered",
            "wallet_address",
        ]

    def get_referrer_username(self, obj):
        if obj.referrer:
            return obj.referrer.username or obj.referrer.wallet_address[:10] + "..."
        return None
class LoginSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    referrer_wallet = serializers.CharField(max_length=42, required=False)

    def validate_wallet_address(self, value):
        # Basic validation for wallet address format
        if not re.match(r'^0x[a-fA-F0-9]{40}$', value):
            raise serializers.ValidationError("Invalid wallet address format")
        return value
        
    def validate_referrer_wallet(self, value):
        # Only validate referrer if provided
        if value and value != "0x0000000000000000000000000000000000000000":
            try:
                UserProfile.objects.get(wallet_address=value)
            except UserProfile.DoesNotExist:
                raise serializers.ValidationError("Referrer wallet address not found")
        return value
class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile information"""

    class Meta:
        model = UserProfile
        fields = ["username", "country", "phone_number", "email"]

    def validate(self, data):
        """
        Validate profile data to ensure required fields are provided,
        especially for users who need to complete their profile for registration
        """
        instance = self.instance
        current_level = instance.current_level if instance else 0
        required_fields = ["username", "country", "phone_number"]
        
        # For partial updates, combine existing values with new values
        if self.partial:
            # Identify which fields will be missing after the update
            updated_data = {}
            
            # Start with existing values
            for field in required_fields:
                updated_data[field] = getattr(instance, field, None)
                
            # Add new values from the update
            for field, value in data.items():
                updated_data[field] = value
                
            # Check if any required fields will still be missing after update
            missing_fields = [field for field in required_fields if not updated_data.get(field)]
            
            # For level 0 users trying to prepare for registration, enforce required fields
            if current_level == 0 and missing_fields:
                raise serializers.ValidationError({
                    "error": "Profile incomplete",
                    "missing_fields": missing_fields,
                    "message": "These fields are required to complete your profile for registration"
                })
                
        # For full updates, ensure all required fields are present
        else:
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                raise serializers.ValidationError({
                    "error": "Profile incomplete",
                    "missing_fields": missing_fields,
                    "message": "All required fields must be provided when updating your profile"
                })

        return data


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["level_number", "price", "min_direct_referrals", "min_referral_depth", "rank_fee"]


# Update the TransactionSerializer in myapp/serializers.py

class TransactionSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    recipient_username = serializers.SerializerMethodField()
    transaction_direction = serializers.SerializerMethodField()
    display_amount = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "user",
            "user_username",
            "transaction_type",
            "amount",
            "display_amount",  # New field for display with +/- sign
            "transaction_direction",  # New field for inflow/outflow
            "level",
            "recipient",
            "recipient_username",
            "transaction_hash",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    
    def get_user_username(self, obj):
        return obj.user.username or obj.user.wallet_address[:10] + "..."

    def get_recipient_username(self, obj):
        if obj.recipient:
            return obj.recipient.username or obj.recipient.wallet_address[:10] + "..."
        return None
        
    def get_transaction_direction(self, obj):
        
        if obj.transaction_type in ["REGISTRATION", "UPGRADE"]:
            return "outgoing"
        elif obj.transaction_type == "REWARD":
            return "incoming"
        
        return "unknown"  # Fallback
        
    def get_display_amount(self, obj):
        """
        Format amount with + or - sign based on transaction direction
        """
        direction = self.get_transaction_direction(obj)
        
        if direction == "incoming":
            return f"+{obj.amount}"
        elif direction == "outgoing":
            return f"-{obj.amount}"
        else:
            return f"{obj.amount}"

class ReferralRelationshipSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    upline_username = serializers.SerializerMethodField()

    class Meta:
        model = ReferralRelationship
        fields = [
            "id",
            "user",
            "user_username",
            "upline",
            "upline_username",
            "level",
            "date_created",
        ]
        read_only_fields = ["id", "date_created"]

    def get_user_username(self, obj):
        return obj.user.username or obj.user.wallet_address[:10] + "..."

    def get_upline_username(self, obj):
        return obj.upline.username or obj.upline.wallet_address[:10] + "..."
