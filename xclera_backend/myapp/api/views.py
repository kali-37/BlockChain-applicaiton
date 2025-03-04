# xclera/api/views.py
import logging
from django.db import transaction
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (User, ReferralRelationship, Transaction, 
                     UserReferralStats, LevelUpgradeRequirement)
from ..blockchain import BlockchainService
from .serializers import (UserSerializer, UserWithStatsSerializer, ReferralSerializer,
                         TransactionSerializer, LevelUpgradeRequirementSerializer,
                         RegistrationSerializer, LevelUpgradeSerializer)

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing users"""
    queryset = User.objects.all()
    serializer_class = UserWithStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on query params"""
        queryset = super().get_queryset()
        # Filter by level
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(current_level=level)
        
        # Filter by on-chain registration status
        is_registered = self.request.query_params.get('is_registered_on_chain')
        if is_registered:
            is_registered = is_registered.lower() == 'true'
            queryset = queryset.filter(is_registered_on_chain=is_registered)
            
        return queryset
    
    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """Get all referrals for a user (direct and indirect)"""
        user = self.get_object()
        referrals = ReferralRelationship.objects.filter(referrer=user)
        
        # Filter by level if provided
        level = request.query_params.get('level')
        if level:
            referrals = referrals.filter(level=level)
            
        serializer = ReferralSerializer(referrals, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for a user"""
        user = self.get_object()
        transactions = Transaction.objects.filter(user=user)
        
        # Filter by transaction type if provided
        tx_type = request.query_params.get('type')
        if tx_type:
            transactions = transactions.filter(transaction_type=tx_type)
            
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_stats(self, request, pk=None):
        """Manually update referral stats for a user"""
        user = self.get_object()
        stats, created = UserReferralStats.objects.get_or_create(user=user)
        stats.update_stats()
        
        serializer = UserWithStatsSerializer(user)
        return Response(serializer.data)


class LevelUpgradeRequirementViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing level upgrade requirements"""
    queryset = LevelUpgradeRequirement.objects.all().order_by('level')
    serializer_class = LevelUpgradeRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegistrationView(APIView):
    """API endpoint for user registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            wallet_address = serializer.validated_data['wallet_address']
            referrer_code = serializer.validated_data['referrer_code']
            
            # Get referrer
            try:
                referrer = User.objects.get(username=referrer_code)
            except User.DoesNotExist:
                return Response(
                    {"error": "Invalid referrer code"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if referrer has wallet address and is registered on chain
            if not referrer.wallet_address or not referrer.is_registered_on_chain:
                return Response(
                    {"error": "Referrer is not properly registered on blockchain"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize blockchain service
            blockchain = BlockchainService()
            if not blockchain.is_connected():
                return Response(
                    {"error": "Blockchain service unavailable"}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            try:
                with transaction.atomic():
                    # Create user (or get if exists by email)
                    username = f"user_{wallet_address[-8:]}"
                    email = f"{wallet_address}@xclera.example.com"
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'username': username,
                            'wallet_address': wallet_address,
                        }
                    )
                    
                    if not created:
                        user.wallet_address = wallet_address
                        user.save()
                    
                    # Prepare blockchain registration data
                    tx_data = blockchain.register_user(
                        wallet_address, 
                        referrer.wallet_address
                    )
                    
                    # Create transaction record
                    transaction_record = Transaction.objects.create(
                        user=user,
                        transaction_type='REGISTRATION',
                        amount=blockchain.level_1_price + blockchain.service_fee,
                        from_address=wallet_address,
                        to_address=referrer.wallet_address,
                        status='PENDING',
                        notes="User registration transaction data prepared"
                    )
                    
                    # Return transaction data for the frontend to sign
                    return Response({
                        'transaction_data': tx_data,
                        'transaction_id': transaction_record.pk,
                        'message': "Please sign and submit this transaction to complete registration"
                    })
                    
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                return Response(
                    {"error": str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LevelUpgradeView(APIView):
    """API endpoint for level upgrades"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = LevelUpgradeSerializer(data=request.data)
        if serializer.is_valid():
            wallet_address = serializer.validated_data['wallet_address']
            target_level = serializer.validated_data['target_level']
            
            # Get user
            try:
                user = User.objects.get(wallet_address=wallet_address)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Initialize blockchain service
            blockchain = BlockchainService()
            if not blockchain.is_connected():
                return Response(
                    {"error": "Blockchain service unavailable"}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            try:
                with transaction.atomic():
                    # Find the eligible upline for this level
                    eligible_upline = self._find_eligible_upline(user, target_level)
                    
                    # Process the level upgrade on blockchain
                    tx_hash = blockchain.process_level_upgrade(
                        wallet_address, 
                        target_level,
                        eligible_upline.wallet_address if eligible_upline else None
                    )
                    
                    # Calculate the upgrade fee
                    upgrade_fee = (target_level * 50) + 50
                    
                    # Create transaction record
                    transaction_record = Transaction.objects.create(
                        user=user,
                        transaction_type='LEVEL_UPGRADE',
                        amount=upgrade_fee,
                        tx_hash=tx_hash,
                        from_address=settings.ADMIN_WALLET_ADDRESS,
                        to_address=wallet_address,
                        level=target_level,
                        status='PENDING',
                        notes=f"Level upgrade to {target_level}"
                    )
                    
                    # If there's an eligible upline, create a reward transaction
                    if eligible_upline:
                        company_fee = (upgrade_fee * 20) / 100  # 20% company fee
                        reward_amount = upgrade_fee - company_fee
                        
                        Transaction.objects.create(
                            user=eligible_upline,
                            transaction_type='REWARD',
                            amount=reward_amount,
                            tx_hash=tx_hash,
                            from_address=settings.ADMIN_WALLET_ADDRESS,
                            to_address=eligible_upline.wallet_address,
                            level=target_level,
                            status='PENDING',
                            notes=f"Reward for {user.username}'s upgrade to level {target_level}"
                        )
                    
                    # Return success response with transaction hash
                    return Response({
                        'tx_hash': tx_hash,
                        'transaction_id': transaction_record.id,
                        'message': "Level upgrade transaction submitted"
                    })
                    
            except Exception as e:
                logger.error(f"Level upgrade error: {str(e)}")
                return Response(
                    {"error": str(e)}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _find_eligible_upline(self, user, target_level):
        """
        Find eligible upline for a level upgrade reward
        This is the centralized version of the _findUplineForLevel function in the smart contract
        """
        if target_level == 1:
            return user.referrer_relation.first().referrer if user.referrer_relation.exists() else None
        
        # Start with the direct referrer
        current_referrer = user
        current_level = 1
        
        while current_level < target_level:
            # Get the referrer relationship
            relation = current_referrer.referrer_relation.first()
            if not relation:
                return None
                
            current_referrer = relation.referrer
            current_level += 1
        
        # Check if the found upline is eligible (has purchased the target level)
        if current_referrer and current_referrer.current_level >= target_level:
            return current_referrer
        
        return None


class TransactionCallbackView(APIView):
    """API endpoint for transaction callbacks from the frontend"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        tx_hash = request.data.get('tx_hash')
        transaction_id = request.data.get('transaction_id')
        
        if not tx_hash or not transaction_id:
            return Response(
                {"error": "Missing tx_hash or transaction_id"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the transaction
        transaction_record = get_object_or_404(Transaction, id=transaction_id)
        
        # Update transaction hash if not already set
        if not transaction_record.tx_hash:
            transaction_record.tx_hash = tx_hash
            transaction_record.save()
        
        # Initialize blockchain service and verify transaction
        blockchain = BlockchainService()
        
        try:
            verification_result = blockchain.verify_transaction(tx_hash)
            
            if verification_result:
                # If this is a registration transaction, create the referral relationships
                if (transaction_record.transaction_type == 'REGISTRATION' and 
                    transaction_record.status == 'COMPLETED'):
                    self._create_referral_relationships(transaction_record.user)
                
                return Response({
                    "status": "success",
                    "message": "Transaction verified successfully",
                    "transaction_status": transaction_record.status
                })
            else:
                return Response({
                    "status": "error",
                    "message": "Transaction verification failed",
                    "transaction_status": transaction_record.status
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Transaction verification error: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _create_referral_relationships(self, user):
        """Create all referral relationships in the database after successful registration"""
        # Get the direct referrer from blockchain data
        try:
            referrer_relation = user.referrer_relation.first()
            if not referrer_relation:
                return
                
            referrer = referrer_relation.referrer
            
            # Create referral stats if not exists
            UserReferralStats.objects.get_or_create(user=user)
            
            # Start with direct referrer (level 1)
            current_referrer = referrer
            current_level = 1
            
            # Create relationships up the tree
            while current_referrer:
                # Check if relationship already exists to avoid duplicates
                relation, created = ReferralRelationship.objects.get_or_create(
                    referrer=current_referrer,
                    referee=user,
                    defaults={'level': current_level}
                )
                
                # Update referrer stats
                stats, _ = UserReferralStats.objects.get_or_create(user=current_referrer)
                stats.update_stats()
                
                # Move up the tree
                referrer_relation = current_referrer.referrer_relation.first()
                if not referrer_relation:
                    break
                    
                current_referrer = referrer_relation.referrer
                current_level += 1
                
        except Exception as e:
            logger.error(f"Error creating referral relationships: {str(e)}")