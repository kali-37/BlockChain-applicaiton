# serializers.py
from rest_framework import serializers
from myapp.models import UserProfile, Level, Transaction, ReferralRelationship
from myapp.services.referral import ReferralService


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


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile information"""

    class Meta:
        model = UserProfile
        fields = ["username", "country", "phone_number", "email"]

    def validate(self, data):
        """Ensure all required fields are provided for profile completion"""
        # For partial updates, merge existing data with new data
        if self.partial:
            instance = self.instance
            # Check if this update would complete the profile
            if any(
                field not in data for field in ["username", "country", "phone_number"]
            ):
                # Only check fields that aren't being updated
                for field in ["username", "country", "phone_number"]:
                    if field not in data and not getattr(instance, field, None):
                        # Don't require completion unless explicitly requested
                        pass
        else:
            # For full updates, ensure all fields are present
            missing_fields = []
            for field in ["username", "country", "phone_number"]:
                if not data.get(field):
                    missing_fields.append(field)

            if missing_fields:
                raise serializers.ValidationError(
                    f"Fields {', '.join(missing_fields)} are required to complete profile."
                )

        return data


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["level_number", "price", "min_direct_referrals", "min_referral_depth"]


class TransactionSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    recipient_username = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "user",
            "user_username",
            "transaction_type",
            "amount",
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


class RegistrationSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    referrer_wallet = serializers.CharField(max_length=42)

    # Optional profile fields
    username = serializers.CharField(
        max_length=100, required=False, allow_null=True, allow_blank=True
    )
    country = serializers.CharField(
        max_length=100, required=False, allow_null=True, allow_blank=True
    )
    phone_number = serializers.CharField(
        max_length=20, required=False, allow_null=True, allow_blank=True
    )
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)

    def validate_wallet_address(self, value):
        if UserProfile.objects.filter(wallet_address=value).exists():
            raise serializers.ValidationError("Wallet address already registered")
        return value

    def validate_referrer_wallet(self, value):
        try:
            UserProfile.objects.get(wallet_address=value)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("Referrer wallet address not found")
        return value


class UpgradeLevelSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    target_level = serializers.IntegerField(min_value=2, max_value=19)

    def validate(self, data):
        try:
            profile = UserProfile.objects.get(wallet_address=data["wallet_address"])
            eligible, message = ReferralService.check_level_upgrade_eligibility(
                profile, data["target_level"]
            )
            if not eligible:
                raise serializers.ValidationError(message)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("Wallet address not found")
        return data
