from rest_framework import viewsets, status
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from blockchain.settings import ROOT_USER_ADDRESS
from .models import UserProfile, Level, Transaction, ReferralRelationship
from .serializers import (
    LoginSerializer,
    UserProfileSerializer,
    LevelSerializer,
    TransactionSerializer,
    ReferralRelationshipSerializer,
    ProfileUpdateSerializer,
)
from .services.blockchain import BlockchainService
from .services.referral import ReferralService, get_company_wallet_profile
from django.utils.dateparse import parse_date
from datetime import timedelta, datetime
from django.utils import timezone
from django.db.models import Q,Sum


class LoginView(viewsets.ViewSet):
    """
    API endpoint for checking wallet status and creating Level 0 profiles
    for new users with referrers
    """

    permission_classes = [permissions.AllowAny]  # Now requires auth token

    @transaction.atomic
    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        # Print all data from serializer :
        if serializer.is_valid():
            wallet_address = serializer.validated_data["wallet_address"]

            # Check if the wallet already exists as a profile
            try:
                # Existing user - return profile info
                profile = UserProfile.objects.get(wallet_address=wallet_address)

                return Response(
                    {
                        "message": "Profile found",
                        "wallet_address": wallet_address,
                        "username": profile.username,
                        "current_level": profile.current_level,
                        "is_profile_complete": profile.is_profile_complete,
                        "is_registered_on_chain": profile.is_registered_on_chain,
                    },
                    status=status.HTTP_200_OK,
                )

            except UserProfile.DoesNotExist:
                # New user - check for referrer
                referrer_wallet = serializer.validated_data.get("referrer_wallet")
                referrer_profile = None
                # if not referrer_wallet then return error for new users
                if not referrer_wallet:
                    return Response(
                        data={
                            "error": "You need a referrer to join. Please enter a referrer wallet address."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # if referrer is provided, check if it exists in the database
                try:
                    referrer_profile = UserProfile.objects.get(
                        wallet_address=referrer_wallet
                    )
                except UserProfile.DoesNotExist:
                    return Response(
                        {"error": "Referrer not found"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Create a Level 0 user profile (not registered on chain yet)
                profile = UserProfile.objects.create(
                    wallet_address=wallet_address,
                    referrer=referrer_profile,
                    current_level=0,  # Level 0 until officially registered
                    is_registered_on_chain=False,
                )

                # Establish referral relationships right away for Level 0 users
                if referrer_profile:
                    # Create direct referral relationship (Level 1)
                    ReferralRelationship.objects.create(
                        user=profile, upline=referrer_profile, level=1
                    )

                    # Build referral tree by adding all uplines at their respective levels
                    current_upline = referrer_profile
                    level = 2
                    processed_uplines = set()

                    while current_upline and current_upline.referrer:
                        # Create relationship to this upline
                        if (
                            current_upline.referrer.id in processed_uplines
                            or current_upline.referrer.pk == profile.pk
                        ):
                            break
                        processed_uplines.add(current_upline.referrer.id)
                        if not ReferralRelationship.objects.filter(
                            user=profile, upline=current_upline.referrer
                        ).exists():
                            ReferralRelationship.objects.create(
                                user=profile,
                                upline=current_upline.referrer,
                                level=level,
                            )

                        # Move up the tree
                        current_upline = current_upline.referrer
                        level += 1


                return Response(
                    {
                        "message": "New profile created",
                        "wallet_address": wallet_address,
                        "current_level": 0,
                        "is_registered_on_chain": False,
                        "referrer": (
                            referrer_profile.wallet_address
                            if referrer_profile
                            else None
                        ),
                    },
                    status=status.HTTP_201_CREATED,
                )

        return Response(
            {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileViewSet(viewsets.ModelViewSet):
    """API endpoint for viewing and updating user profiles"""

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return ProfileUpdateSerializer
        return UserProfileSerializer

    def get_queryset(self):
        """Allow filtering by wallet address"""
        queryset = UserProfile.objects.all()
        wallet_address = self.request.GET.get("wallet_address", None)
        if wallet_address:
            queryset = queryset.filter(wallet_address=wallet_address)
        return queryset

    @action(detail=True, methods=["get"])
    def referrals(self, request, pk=None):
        """Get direct referrals for a user"""
        profile = self.get_object()
        direct_referrals = UserProfile.objects.filter(referrer=profile)
        return Response(UserProfileSerializer(direct_referrals, many=True).data)

    @action(detail=True, methods=["get"])
    def transactions(self, request, pk=None):
        """Get transactions for a user with filtering support"""
        profile = self.get_object()
        
        # Only get transactions where the current user is the primary user (not as recipient)
        # For a complete financial picture, we only need the transactions where the user
        # is the main actor (paying or receiving)
        queryset = Transaction.objects.filter(user=profile).order_by("-created_at")
        
        # Apply filters
        transaction_type = request.query_params.get("transaction_type", None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        status = request.query_params.get("status", None)
        if status:
            queryset = queryset.filter(status=status)
        
        from_date = request.query_params.get("from_date", None)
        to_date = request.query_params.get("to_date", None)
        
        if from_date:
            try:
                from_datetime = datetime.strptime(from_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                queryset = queryset.filter(created_at__gte=from_datetime)
            except ValueError:
                pass  # Invalid date format, ignore filter
        
        if to_date:
            try:
                to_datetime = datetime.strptime(to_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
                queryset = queryset.filter(created_at__lte=to_datetime)
            except ValueError:
                pass  # Invalid date format, ignore filter
        
        level = request.query_params.get("level", None)
        if level:
            queryset = queryset.filter(level=level)
                
        # Important: Pass the request in the context so the serializer can determine the transaction direction
        serializer = TransactionSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def dashboard_stats(self, request, pk=None):
        """Get dashboard statistics for a user"""
        profile = self.get_object()

        # Get time periods for filtering
        now = timezone.now()
        last_24_hours = now - timedelta(hours=24)
        last_7_days = now - timedelta(days=7)
        last_10_days = now - timedelta(days=10)

        # Get time period from request params (default to 24h)
        time_period = request.query_params.get("period", "24h")

        if time_period == "7d":
            period_start = last_7_days
        elif time_period == "10d":
            period_start = last_10_days
        else:  # Default to 24h
            period_start = last_24_hours

        # Get new team members (direct referrals) in the selected period
        new_members = UserProfile.objects.filter(
            referrer=profile, date_registered__gte=period_start
        ).count()

        # Calculate total team size - get unique users in downline
        # Using distinct() to avoid counting the same user multiple times
        team_size = UserProfile.objects.filter(
            uplines__upline=profile
        ).distinct().count()

        # Verify with profile's direct_referrals_count - this should match or be investigated
        direct_referrals = profile.direct_referrals_count

        # Calculate accumulated earnings (rewards received)
        earnings = (
            Transaction.objects.filter(
                user=profile, transaction_type="REWARD"
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # Calculate earnings in the selected period
        period_earnings = (
            Transaction.objects.filter(
                user=profile, transaction_type="REWARD", created_at__gte=period_start
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        return Response(
            {
                "new_members": new_members,
                "team_size": team_size,
                "direct_referrals": direct_referrals,  # Add this for debugging/verification
                "total_earnings": float(earnings),
                "period_earnings": float(period_earnings),
                "time_period": time_period,
            }
        )
    @action(detail=True, methods=["get"])
    def uplines(self, request, pk=None):
        """Get all uplines for a user"""
        profile = self.get_object()
        relationships = ReferralRelationship.objects.filter(user=profile).order_by(
            "level"
        )
        return Response(ReferralRelationshipSerializer(relationships, many=True).data)

    @action(detail=True, methods=["get"])
    def downlines(self, request, pk=None):
        """Get all downlines for a user"""
        profile = self.get_object()
        relationships = ReferralRelationship.objects.filter(upline=profile).order_by(
            "level"
        )
        return Response(ReferralRelationshipSerializer(relationships, many=True).data)

    @action(detail=False, methods=["get"])
    def by_wallet(self, request):
        """Get profile by wallet address"""
        wallet_address = request.query_params.get("address", None)
        if not wallet_address:
            return Response(
                {"error": "Wallet address parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            profile = UserProfile.objects.get(wallet_address=wallet_address)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class LevelViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing level information"""

    queryset = Level.objects.all().order_by("level_number")
    serializer_class = LevelSerializer


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing transactions with filtering"""

    queryset = Transaction.objects.all().order_by("-created_at")
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """Allow filtering by various parameters"""
        queryset = Transaction.objects.all().order_by("-created_at")

        # Filter by wallet address if provided
        wallet_address = self.request.query_params.get("wallet_address", None)
        if wallet_address:
            try:
                profile = UserProfile.objects.get(wallet_address=wallet_address)
                queryset = queryset.filter(user=profile)
            except UserProfile.DoesNotExist:
                return Transaction.objects.none()

        # Filter by transaction type
        transaction_type = self.request.query_params.get("transaction_type", None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        # Filter by status
        status = self.request.query_params.get("status", None)
        if status:
            queryset = queryset.filter(status=status)

        # Filter by date range
        from_date = self.request.query_params.get("from_date", None)
        to_date = self.request.query_params.get("to_date", None)

        if from_date:
            # Convert string to datetime (assumes YYYY-MM-DD format)
            from_datetime = datetime.strptime(from_date, "%Y-%m-%d").replace(
                tzinfo=timezone.utc
            )
            queryset = queryset.filter(created_at__gte=from_datetime)

        if to_date:
            # Convert string to datetime and set to end of day
            to_datetime = datetime.strptime(to_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, tzinfo=timezone.utc
            )
            queryset = queryset.filter(created_at__lte=to_datetime)

        # Filter by level
        level = self.request.query_params.get("level", None)
        if level:
            queryset = queryset.filter(level=level)

        return queryset


class RegistrationView(viewsets.ViewSet):
    """API endpoint for registering new users (upgrading from Level 0 to Level 1)"""

    permission_classes = [permissions.IsAuthenticated]  # Require authentication

    @transaction.atomic
    def create(self, request):
        # Extract wallet_address from the request
        wallet_address = request.data.get("wallet_address")

        if not wallet_address:
            return Response(
                {"error": "Wallet address is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify that the authenticated user matches the requested wallet
        if request.user.wallet_address != wallet_address:
            return Response(
                {"error": "Authenticated wallet doesn't match requested wallet"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            # Get the user profile
            profile = UserProfile.objects.get(wallet_address=wallet_address)

            # Check if user is already registered
            if profile.is_registered_on_chain or profile.current_level > 0:
                return Response(
                    {
                        "error": f"User is already registered and already at level {profile.current_level}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if profile is complete
            if not profile.is_profile_complete:
                missing_fields = []
                for field in ["username", "phone_number", "country"]:
                    if not getattr(profile, field):
                        missing_fields.append(field)

                return Response(
                    {
                        "error": "Profile is incomplete",
                        "missing_fields": missing_fields,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get referrer from the profile
            referrer_profile = profile.referrer
            if not referrer_profile:
                return Response(
                    {"error": "No referrer found for this user"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check the registration mode
            # If  tx_hahs is provided, process a completed registration
            if "transaction_hash" in request.data:

                try:
                    # Initialize blockchain service
                    blockchain_service = BlockchainService()

                    # Submit the signed transaction
                    tx_result = blockchain_service.verify_transaction(
                        request.data["transaction_hash"]
                    )
                    if tx_result["status"] == "success":
                        # Update the user's status
                        profile.is_registered_on_chain = True
                        profile.current_level = 1
                        profile.save()

                        # Constants for registration fees
                        level_fee = 100  # 100 USDT to referrer
                        service_fee = 15  # 15 USDT service fee
                        total_fee = level_fee + service_fee  # 115 USDT total

                        # Create main registration transaction record
                        registration_tx = Transaction.objects.create(
                            user=profile,
                            transaction_type="REGISTRATION",
                            amount=total_fee,  # 115 USDT total
                            level=1,
                            # No recipient for the registration transaction itself
                            transaction_hash=tx_result["transaction_hash"],
                            status="CONFIRMED",
                        )

                        # Create reward transaction for referrer (100 USDT)
                        referrer_tx = Transaction.objects.create(
                            user=referrer_profile,  # Referrer receives the reward
                            transaction_type="REWARD",
                            amount=level_fee,  # 100 USDT
                            level=1,
                            recipient=profile,  # New user is the source of reward
                            transaction_hash=tx_result["transaction_hash"],
                            status="CONFIRMED",
                        )

                        company_wallet_profile = get_company_wallet_profile()
                        company_tx = Transaction.objects.create(
                            user=company_wallet_profile,  # Company wallet receives the fee
                            transaction_type="REWARD",
                            amount=service_fee,  # 15 USDT service fee
                            level=1,
                            recipient=profile,  # New user is the source of fee
                            transaction_hash=tx_result["transaction_hash"],
                            status="CONFIRMED",
                        )

                        # Update referrer's direct referral count
                        referrer_profile.direct_referrals_count += 1
                        referrer_profile.save()

                        # Update max_referral_depth for each upline
                        ReferralService.update_referral_depths(profile)

                        return Response(
                            {
                                "message": "Registration successful",
                                "profile_id": profile.pk,
                                "transaction_hash": tx_result["transaction_hash"],
                                "current_level": profile.current_level,
                            },
                            status=status.HTTP_201_CREATED,
                        )
                    else:
                        return Response(
                            {
                                "error": "Blockchain registration failed",
                                "details": tx_result,
                            },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )
                except Exception as e:
                    return Response(
                        {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                # Just prepare the transaction for the frontend to sign
                try:
                    # Initialize blockchain service
                    blockchain_service = BlockchainService()

                    # Build the transaction for signing
                    transaction = blockchain_service.build_register_transaction(
                        user_wallet=wallet_address,
                        referrer_wallet=referrer_profile.wallet_address,
                    )

                    return Response(
                        {
                            "message": "Transaction prepared for signing",
                            "transaction": transaction,
                            "instructions": "Sign this transaction with your wallet and submit the signed transaction back to this endpoint",
                        },
                        status=status.HTTP_200_OK,
                    )
                except Exception as e:
                    return Response(
                        {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class UpgradeLevelView(viewsets.ViewSet):
    """API endpoint for upgrading user levels"""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request):
        # Extract wallet_address from the request
        wallet_address = request.data.get("wallet_address")

        if not wallet_address:
            return Response(
                {"error": "Wallet address is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify that the authenticated user matches the requested wallet
        if request.user.wallet_address != wallet_address:
            return Response(
                {"error": "Authenticated wallet doesn't match requested wallet"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            # Get user profile
            profile = UserProfile.objects.get(wallet_address=wallet_address)

            # Calculate the next level automatically
            current_level = profile.current_level
            target_level = current_level + 1

            # Check if target_level is valid (max is 19)
            if target_level >= 19:
                return Response(
                    {"error": "Already at maximum level"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check eligibility
            eligible, message = ReferralService.check_level_upgrade_eligibility(
                profile, target_level
            )

            if not eligible:
                return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

            # Find eligible upline
            eligible_upline = ReferralService.find_eligible_upline(
                profile, target_level
            )
            upline_wallet = (
                eligible_upline.wallet_address if eligible_upline else ROOT_USER_ADDRESS
            )

            # Check the upgrade mode
            # If transaction_hash  is provided, process a completed upgrade
            if "transaction_hash" in request.data:
                try:
                    # Initialize blockchain service
                    blockchain_service = BlockchainService()

                    # Submit the signed transaction
                    tx_result = blockchain_service.verify_transaction(
                        request.data["transaction_hash"]
                    )

                    if tx_result["status"] == "success":
                        # Update in Django database - ReferralService.upgrade_user_level will
                        # handle updating the user's level and creating reward transactions
                        upgrade_result = ReferralService.upgrade_user_level(
                            profile=profile,
                            target_level=target_level,
                            transaction_hash=tx_result["transaction_hash"],
                        )

                        return Response(
                            {
                                "message": "Level upgrade successful",
                                "new_level": target_level,
                                "transaction_hash": tx_result["transaction_hash"],
                                "upline_rewarded": upgrade_result["upline_rewarded"],
                                "upline_reward": float(upgrade_result["upline_reward"]),
                            },
                            status=status.HTTP_200_OK,
                        )
                    else:
                        return Response(
                            {
                                "error": "Blockchain upgrade failed",
                                "details": tx_result,
                            },
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )
                except Exception as e:
                    return Response(
                        {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                # Just prepare the transaction for the frontend to sign
                try:
                    # Initialize blockchain service
                    blockchain_service = BlockchainService()

                    # Build the transaction for signing
                    transaction = blockchain_service.build_upgrade_transaction(
                        user_wallet=profile.wallet_address,
                        new_level=target_level,
                        upline_wallet=upline_wallet,
                    )

                    return Response(
                        {
                            "message": "Transaction prepared for signing",
                            "transaction": transaction,
                            "instructions": "Sign this transaction with your wallet and submit the signed transaction back to this endpoint",
                        },
                        status=status.HTTP_200_OK,
                    )
                except Exception as e:
                    return Response(
                        {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
