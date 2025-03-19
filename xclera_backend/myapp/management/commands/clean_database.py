from django.core.management.base import BaseCommand
from django.db import transaction
from myapp.models import UserProfile, Level, Transaction, ReferralRelationship

class Command(BaseCommand):
    help = 'Clean the Xclera Matrix Marketing System database tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-confirm',
            action='store_true',
            dest='no_confirm',
            help='Do not ask for confirmation',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Starting database cleanup process...')
        
        if not options['no_confirm']:
            confirm = input(
                '\n\033[91mWARNING: This will delete ALL data from the following tables:\033[0m\n'
                '- User Profiles\n'
                '- Referral Relationships\n'
                '- Transactions\n'
                '- Levels\n\n'
                'This action cannot be undone. Continue? (y/N): '
            )
            
            if confirm.lower() != 'y':
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return
        
        # Count records before deletion
        user_count = UserProfile.objects.count()
        relationship_count = ReferralRelationship.objects.count()
        transaction_count = Transaction.objects.count()
        level_count = Level.objects.count()
        
        self.stdout.write(f'Found:')
        self.stdout.write(f'- {user_count} User Profiles')
        self.stdout.write(f'- {relationship_count} Referral Relationships')
        self.stdout.write(f'- {transaction_count} Transactions')
        self.stdout.write(f'- {level_count} Levels')
        
        # Delete in specific order to avoid foreign key constraint issues
        self.stdout.write('Deleting Transactions...')
        Transaction.objects.all().delete()
        
        self.stdout.write('Deleting Referral Relationships...')
        ReferralRelationship.objects.all().delete()
        
        self.stdout.write('Deleting User Profiles...')
        UserProfile.objects.all().delete()
        
        self.stdout.write('Deleting Levels...')
        Level.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('Database cleanup complete!'))
        self.stdout.write(
            '\nTo restore the necessary system data, run:\n'
            'python xclera_backend/manage.py create_root_user\n'
            'python xclera_backend/manage.py setup_initial_data'
        )