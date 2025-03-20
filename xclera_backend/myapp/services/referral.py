from django.db import transaction
from django.db.models import F
from ..models import UserProfile, ReferralRelationship, Level, Transaction
from django.conf import settings


def get_company_wallet_profile():
    # Get company wallet profile
    try:
        company_wallet_profile = UserProfile.objects.get(
            wallet_address=settings.COMPANY_WALLET_ADDRESS
        )
    except UserProfile.DoesNotExist:
        # Fallback to root user if company wallet profile doesn't exist
        company_wallet_profile = UserProfile.objects.get(
            wallet_address=settings.ROOT_USER_ADDRESS
        )
    return company_wallet_profile


class ReferralService:
    """Service for managing referral relationships and level upgrades"""

    @staticmethod
    @transaction.atomic
    def register_user(wallet_address, referrer_profile, profile_data=None):
        """
        Register a new user in the system and set up referral relationships

        Args:
            wallet_address: Blockchain wallet address
            referrer_profile: The UserProfile of the referrer
            profile_data: Optional dict with username, country, phone_number, email

        Returns:
            UserProfile: The newly created user profile
        """
        # Default empty dict if None provided
        if profile_data is None:
            profile_data = {}

        # Create user profile
        profile = UserProfile.objects.create(
            wallet_address=wallet_address,
            referrer=referrer_profile,
            current_level=1,
            is_registered_on_chain=True,
            username=profile_data.get("username"),
            country=profile_data.get("country"),
            phone_number=profile_data.get("phone_number"),
            email=profile_data.get("email"),
        )

        # Update referrer's direct referral count
        if referrer_profile:
            referrer_profile.direct_referrals_count = F("direct_referrals_count") + 1
            referrer_profile.save(update_fields=["direct_referrals_count"])

            # Create direct referral relationship
            ReferralRelationship.objects.create(
                user=profile, upline=referrer_profile, level=1
            )

            # Build referral tree by adding all uplines at their respective levels
            current_upline = referrer_profile
            level = 2

            while current_upline and current_upline.referrer:
                # Create relationship to this upline
                ReferralRelationship.objects.create(
                    user=profile, upline=current_upline.referrer, level=level
                )

                # Move up the tree
                current_upline = current_upline.referrer
                level += 1

            # Update max_referral_depth for each upline
            ReferralService.update_referral_depths(profile)

        return profile

    @staticmethod
    def update_referral_depths(profile):
        """
        Update max_referral_depth for all uplines of a user
        """
        # Get all uplines in reverse order (deepest first)
        uplines = ReferralRelationship.objects.filter(user=profile).order_by("-level")

        for relationship in uplines:
            upline = relationship.upline
            level = relationship.level

            # Only update if this depth is greater than current max
            if level > upline.max_referral_depth:
                upline.max_referral_depth = level
                upline.save(update_fields=["max_referral_depth"])

    @staticmethod
    def check_level_upgrade_eligibility(profile, target_level):
        """
        Check if a user is eligible to upgrade to the target level
        """
        try:
            level_requirements = Level.objects.get(level_number=target_level)
        except Level.DoesNotExist:
            return False, "Level does not exist"

        # Check if user is already at this level or higher
        if profile.current_level >= target_level:
            return False, "Already at this level or higher"

        # Check if user is trying to skip levels
        if profile.current_level != target_level - 1:
            return False, "Cannot skip levels"

        # For levels beyond 2, check if profile is complete
        if target_level > 2 and not profile.is_profile_complete:
            missing_fields = []
            for field in ["username", "country", "phone_number"]:
                if not getattr(profile, field):
                    missing_fields.append(field)

            return False, f"Profile incomplete. Missing: {', '.join(missing_fields)}"

        # Check direct referrals requirement (for level 2)
        if (
            target_level == 2
            and profile.direct_referrals_count < level_requirements.min_direct_referrals
        ):
            return (
                False,
                f"Need {level_requirements.min_direct_referrals} direct referrals for Level 2",
            )

        # Check referral depth requirement (for level 3+)
        if (
            target_level > 2
            and profile.max_referral_depth < level_requirements.min_referral_depth
        ):
            return (
                False,
                f"Insufficient referral depth, need depth of {level_requirements.min_referral_depth}",
            )

        return True, "Eligible for upgrade"

    @staticmethod
    def find_eligible_upline(profile, target_level):
        """
        Find the eligible upline for a level upgrade reward
        """
        # For level 1, this shouldn't be called
        if target_level == 1:
            return None

        # Try to find an upline at the appropriate level with sufficient level
        try:
            relationship = ReferralRelationship.objects.get(
                user=profile,
                level=target_level - 1,  # Level depth matches the target level
            )

            upline = relationship.upline
            if upline.current_level >= target_level:
                return upline

        except ReferralRelationship.DoesNotExist:
            pass

        # If no eligible upline found, return None (company wallet will be used)
        return None


@staticmethod
@transaction.atomic
def upgrade_user_level(profile, target_level, transaction_hash=None):
    """
    Upgrade a user to a new level and record the transaction
    """
    # Get level info
    level_info = Level.objects.get(level_number=target_level)

    # Find eligible upline
    eligible_upline = ReferralService.find_eligible_upline(profile, target_level)

    # Calculate fees
    company_fee_percentage = 20
    company_fee = (level_info.price * company_fee_percentage) / 100
    upline_reward = level_info.price - company_fee

    # Record upgrade transaction
    upgrade_tx = Transaction.objects.create(
        user=profile,
        transaction_type="UPGRADE",
        amount=level_info.price,
        level=target_level,
        # No recipient for upgrade transactions
        transaction_hash=transaction_hash,
        status="CONFIRMED" if transaction_hash else "PENDING",
    )

    company_wallet_profile = get_company_wallet_profile()
    # Record company fee transaction (20%)
    company_tx = Transaction.objects.create(
        user=company_wallet_profile,  # User receiving the fee
        transaction_type="REWARD",
        amount=company_fee,
        level=target_level,
        recipient=profile,  # User who paid the fee
        transaction_hash=transaction_hash,
        status="CONFIRMED" if transaction_hash else "PENDING",
    )

    # Record reward transaction for the remaining 80%
    if eligible_upline:
        # If there's an eligible upline, they get the reward
        reward_tx = Transaction.objects.create(
            user=eligible_upline,  # User receiving the reward
            transaction_type="REWARD",
            amount=upline_reward,
            level=target_level,
            recipient=profile,  # User who triggered the reward
            transaction_hash=transaction_hash,
            status="CONFIRMED" if transaction_hash else "PENDING",
        )
        rewarded_user = eligible_upline
    else:
        # If no eligible upline, company wallet gets the reward
        reward_tx = Transaction.objects.create(
            user=company_wallet_profile,
            transaction_type="REWARD",
            amount=upline_reward,
            level=target_level,
            recipient=profile,
            transaction_hash=transaction_hash,
            status="CONFIRMED" if transaction_hash else "PENDING",
        )
        rewarded_user = company_wallet_profile

    # Update user level
    profile.current_level = target_level
    profile.save(update_fields=["current_level"])

    return {
        "success": True,
        "new_level": target_level,
        "upline_rewarded": (
            rewarded_user.username
            if rewarded_user and rewarded_user.username
            else rewarded_user.wallet_address[:10] + "..." if rewarded_user else None
        ),
        "upline_reward": upline_reward,
        "company_fee": company_fee,
    }
