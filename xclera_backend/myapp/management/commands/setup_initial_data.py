# management/commands/setup_initial_data.py
from django.core.management.base import BaseCommand
from myapp.models import Level

class Command(BaseCommand):
    help = 'Set up initial data for the Xclera Matrix Marketing System'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial level data...')
        
        # Clear existing levels
        Level.objects.all().delete()
        
        # Create level 1
        Level.objects.create(
            level_number=1,
            price=100,
            min_direct_referrals=0,
            min_referral_depth=0
        )
        
        # Create level 2 (requires 3 direct referrals)
        Level.objects.create(
            level_number=2,
            price=150,
            min_direct_referrals=3,
            min_referral_depth=0
        )
        
        # Create levels 3-19
        for i in range(3, 20):
            Level.objects.create(
                level_number=i,
                price=50 + (i * 50),
                min_direct_referrals=0,
                min_referral_depth=i - 1
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {Level.objects.count()} levels'))