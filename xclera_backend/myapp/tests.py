# tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .models import UserProfile, Level, ReferralRelationship, Transaction
from .services.referral import ReferralService

class ReferralServiceTests(TestCase):
    def setUp(self):
        # Create users
        self.root_user = User.objects.create_user(username='root', password='password')
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.user2 = User.objects.create_user(username='user2', password='password')
        self.user3 = User.objects.create_user(username='user3', password='password')
        
        # Create profiles
        self.root_profile = UserProfile.objects.create(
            user=self.root_user,
            wallet_address='0x0000000000000000000000000000000000000001',
            current_level=19,
            is_registered_on_chain=True
        )
        
        self.user1_profile = UserProfile.objects.create(
            user=self.user1,
            wallet_address='0x0000000000000000000000000000000000000002',
            referrer=self.root_profile,
            current_level=1,
            is_registered_on_chain=True
        )
        
        # Create levels
        Level.objects.create(level_number=1, price=100, min_direct_referrals=0, min_referral_depth=0)
        Level.objects.create(level_number=2, price=150, min_direct_referrals=3, min_referral_depth=0)
        Level.objects.create(level_number=3, price=200, min_direct_referrals=0, min_referral_depth=2)
        
        # Update referral counts
        self.root_profile.direct_referrals_count = 1
        self.root_profile.save()
        
        # Create referral relationship
        ReferralRelationship.objects.create(
            user=self.user1_profile,
            upline=self.root_profile,
            level=1
        )
    
    def test_register_user(self):
        # Register a new user
        profile = ReferralService.register_user(
            user=self.user2,
            wallet_address='0x0000000000000000000000000000000000000003',
            referrer_profile=self.user1_profile
        )
        
        # Check profile creation
        self.assertEqual(profile.user, self.user2)
        self.assertEqual(profile.referrer, self.user1_profile)
        self.assertEqual(profile.current_level, 1)
        
        # Check referrer's direct referral count update
        self.user1_profile.refresh_from_db()
        self.assertEqual(self.user1_profile.direct_referrals_count, 1)
        
        # Check referral relationships
        relationships = ReferralRelationship.objects.filter(user=profile)
        self.assertEqual(relationships.count(), 2)  # Direct referrer and root
        
        # Check specific relationships
        direct_rel = relationships.get(level=1)
        self.assertEqual(direct_rel.upline, self.user1_profile)
        
        indirect_rel = relationships.get(level=2)
        self.assertEqual(indirect_rel.upline, self.root_profile)
    
    def test_check_level_upgrade_eligibility_level2(self):
        # User without enough referrals
        eligible, message = ReferralService.check_level_upgrade_eligibility(
            self.user1_profile, 2
        )
        self.assertFalse(eligible)
        self.assertTrue("Need 3 direct referrals" in message)
        
        # Add 3 referrals to user1
        for i in range(3):
            user = User.objects.create_user(username=f'ref{i}', password='password')
            profile = UserProfile.objects.create(
                user=user,
                wallet_address=f'0x000000000000000000000000000000000000000{i+4}',
                referrer=self.user1_profile,
                current_level=1
            )
            ReferralRelationship.objects.create(
                user=profile,
                upline=self.user1_profile,
                level=1
            )
        
        # Update referral count
        self.user1_profile.direct_referrals_count = 3
        self.user1_profile.save()
        
        # Check eligibility again
        eligible, message = ReferralService.check_level_upgrade_eligibility(
            self.user1_profile, 2
        )
        self.assertTrue(eligible)
        self.assertEqual(message, "Eligible for upgrade")
    
    def test_find_eligible_upline(self):
        # Create test data
        self.user1_profile.current_level = 2
        self.user1_profile.save()
        
        user3_profile = UserProfile.objects.create(
            user=self.user3,
            wallet_address='0x0000000000000000000000000000000000000004',
            referrer=self.user1_profile,
            current_level=1
        )
        
        # Create relationships
        ReferralRelationship.objects.create(
            user=user3_profile,
            upline=self.user1_profile,
            level=1
        )
        
        ReferralRelationship.objects.create(
            user=user3_profile,
            upline=self.root_profile,
            level=2
        )
        
        # Test finding upline for level 2
        upline = ReferralService.find_eligible_upline(user3_profile, 2)
        self.assertEqual(upline, self.user1_profile)
        
        # Test finding upline for level 3
        upline = ReferralService.find_eligible_upline(user3_profile, 3)
        self.assertEqual(upline, self.root_profile)

class APITests(TestCase):
    def setUp(self):
        # Set up test client
        self.client = APIClient()
        
        # Create users and profiles
        self.user = User.objects.create_user(username='testuser', password='password')
        self.root_user = User.objects.create_user(username='root', password='password')
        
        self.root_profile = UserProfile.objects.create(
            user=self.root_user,
            wallet_address='0x0000000000000000000000000000000000000001',
            current_level=19,
            is_registered_on_chain=True
        )
        
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            wallet_address='0x0000000000000000000000000000000000000002',
            referrer=self.root_profile,
            current_level=1,
            is_registered_on_chain=True
        )
        
        # Create levels
        Level.objects.create(level_number=1, price=100, min_direct_referrals=0, min_referral_depth=0)
        Level.objects.create(level_number=2, price=150, min_direct_referrals=3, min_referral_depth=0)
        
        # Create referral relationships
        ReferralRelationship.objects.create(
            user=self.user_profile,
            upline=self.root_profile,
            level=1
        )
    
    @patch('matrix.services.blockchain.BlockchainService.register_user')
    def test_registration_api(self, mock_register_user):
        # Mock blockchain service
        mock_register_user.return_value = {
            'tx_hash': '0x1234567890abcdef',
            'status': 'success',
            'block_number': 123456
        }
        
        # Test registration API
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password123',
            'wallet_address': '0x0000000000000000000000000000000000000003',
            'referrer_wallet': '0x0000000000000000000000000000000000000002',
            'private_key': '0xprivatekey'
        }
        
        response = self.client.post(reverse('register-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserProfile.objects.count(), 3)
        
        # Check transaction creation
        self.assertEqual(Transaction.objects.count(), 1)
        transaction = Transaction.objects.first()
        self.assertEqual(transaction.transaction_type, 'REGISTRATION')
        self.assertEqual(transaction.amount, 115)
    
    @patch('matrix.services.blockchain.BlockchainService.upgrade_level')
    def test_upgrade_level_api(self, mock_upgrade_level):
        # Mock blockchain service
        mock_upgrade_level.return_value = {
            'tx_hash': '0x1234567890abcdef',
            'status': 'success',
            'block_number': 123456
        }
        
        # Add 3 referrals to user
        for i in range(3):
            user = User.objects.create_user(username=f'ref{i}', password='password')
            profile = UserProfile.objects.create(
                user=user,
                wallet_address=f'0x000000000000000000000000000000000000000{i+4}',
                referrer=self.user_profile,
                current_level=1
            )
            ReferralRelationship.objects.create(
                user=profile,
                upline=self.user_profile,
                level=1
            )
        
        # Update referral count
        self.user_profile.direct_referrals_count = 3
        self.user_profile.save()
        
        # Test upgrade API
        data = {
            'wallet_address': '0x0000000000000000000000000000000000000002',
            'target_level': 2,
            'private_key': '0xprivatekey'
        }
        
        response = self.client.post(reverse('upgrade-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check user level update
        self.user_profile.refresh_from_db()
        self.assertEqual(self.user_profile.current_level, 2)
        
        # Check transaction creation
        self.assertEqual(Transaction.objects.count(), 1)
        transaction = Transaction.objects.first()
        self.assertEqual(transaction.transaction_type, 'UPGRADE')
        self.assertEqual(transaction.level, 2)