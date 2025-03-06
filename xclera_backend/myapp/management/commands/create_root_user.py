# xclera_backend/myapp/management/commands/create_root_user.py
from django.core.management.base import BaseCommand
from django.conf import settings
from myapp.models import UserProfile
import dotenv 
import os

dotenv.load_dotenv()


class Command(BaseCommand):
    help = 'Create the root user for the Xclera Matrix Marketing System'

    
    def handle(self, *args, **options):
        self.stdout.write('Creating root user...')
        
        # Get wallet addresses from settings
        root_wallet =  os.getenv('ROOT_USER_ADDRESS') 
        
        if not root_wallet:
            self.stdout.write(self.style.ERROR('ROOT_USER_ADDRESS not set in environment variables'))
            return
            
        # Check if root user already exists
        if UserProfile.objects.filter(wallet_address=root_wallet).exists():
            self.stdout.write(self.style.WARNING(f'Root user with wallet {root_wallet} already exists'))
            return
            
        # Create the root user
        root_user = UserProfile.objects.create(
            username="Root User",
            wallet_address=root_wallet,
            current_level=19,  # Max level for root user
            is_registered_on_chain=True,
            # No referrer for root user
            direct_referrals_count=0,
            max_referral_depth=0
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created root user with wallet {root_wallet}'))