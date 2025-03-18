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
from .services.referral import ReferralService


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

                    # Update max_referral_depth for each upline
                    ReferralService.update_referral_depths(profile)

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
        """Get transactions for a user"""
        profile = self.get_object()
        transactions = Transaction.objects.filter(user=profile)
        return Response(TransactionSerializer(transactions, many=True).data)

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
    """API endpoint for viewing transactions"""

    queryset = Transaction.objects.all().order_by("-created_at")
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """Allow filtering by wallet address"""
        queryset = Transaction.objects.all().order_by("-created_at")
        wallet_address = self.request.GET.get("wallet_address", None)
        if wallet_address:
            try:
                profile = UserProfile.objects.get(wallet_address=wallet_address)
                queryset = queryset.filter(user=profile)
            except UserProfile.DoesNotExist:
                return Transaction.objects.none()
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
                    {"error": "User is already registered on the blockchain"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if profile is complete
            if not profile.is_profile_complete:
                missing_fields = []
                for field in ["username", "phone_number","country"]:
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
            # If signed_transaction is provided, process a completed registration
            if "signed_transaction" in request.data:
                try:
                    # Initialize blockchain service
                    blockchain_service = BlockchainService()

                    # Submit the signed transaction
                    tx_result = blockchain_service.submit_transaction(
                        request.data["signed_transaction"]
                    )

                    if tx_result["status"] == "success":
                        # Just update the user's status - no need to modify relationships
                        # Relationships should have been created during Level 0 account creation
                        profile.is_registered_on_chain = True
                        profile.current_level = 1
                        profile.save()


                        # Create transaction record
                        Transaction.objects.create(
                            user=profile,
                            transaction_type="REGISTRATION",
                            amount=115,  # 100 USDT level fee + 15 USDT service fee
                            level=1,
                            recipient=referrer_profile,
                            transaction_hash=tx_result["tx_hash"],
                            status="CONFIRMED",
                        )

                        return Response(
                            {
                                "message": "Registration successful",
                                "profile_id": profile.pk,
                                "transaction_hash": tx_result["tx_hash"],
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
            if target_level > 19:
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
            # If signed_transaction is provided, process a completed upgrade
            if "signed_transaction" in request.data:
                try:
                    # Initialize blockchain service
                    blockchain_service = BlockchainService()

                    # Submit the signed transaction
                    tx_result = blockchain_service.submit_transaction(
                        request.data["signed_transaction"]
                    )

                    if tx_result["status"] == "success":
                        # Update in Django database - ReferralService.upgrade_user_level will
                        # handle updating the user's level and creating reward transactions
                        upgrade_result = ReferralService.upgrade_user_level(
                            profile=profile,
                            target_level=target_level,
                            transaction_hash=tx_result["tx_hash"],
                        )

                        return Response(
                            {
                                "message": "Level upgrade successful",
                                "new_level": target_level,
                                "transaction_hash": tx_result["tx_hash"],
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
