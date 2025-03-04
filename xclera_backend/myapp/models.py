# models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# models.py
from django.db import models
from django.utils import timezone

class UserProfile(models.Model):
    """User profile with blockchain and referral data"""
    # Basic user information (can be added after wallet registration)
    username = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    
    # Blockchain and referral data
    wallet_address = models.CharField(max_length=42, unique=True)
    referrer = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals')
    current_level = models.PositiveSmallIntegerField(default=1)
    direct_referrals_count = models.PositiveIntegerField(default=0)
    max_referral_depth = models.PositiveSmallIntegerField(default=0)
    is_registered_on_chain = models.BooleanField(default=False)
    date_registered = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if self.username:
            return f"{self.username} - {self.wallet_address[:10]}...{self.wallet_address[-6:]}"
        return f"{self.wallet_address[:10]}...{self.wallet_address[-6:]}"
    
    @property
    def is_profile_complete(self):
        """Check if user has completed their profile"""
        return bool(self.username and self.country and self.phone_number)
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

class Level(models.Model):
    """Defines the level requirements and costs"""
    level_number = models.PositiveSmallIntegerField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    min_direct_referrals = models.PositiveSmallIntegerField(default=0)
    min_referral_depth = models.PositiveSmallIntegerField(default=0)
    
    def __str__(self):
        return f"Level {self.level_number} - {self.price} USDT"


class ReferralRelationship(models.Model):
    """Tracks the hierarchical relationships between users"""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='uplines')
    upline = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='downlines')
    level = models.PositiveSmallIntegerField()  # Level of depth in the referral tree
    date_created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'upline')
        verbose_name = "Referral Relationship"
        verbose_name_plural = "Referral Relationships"
    
    def __str__(self):
        return f"{self.user} -> {self.upline} (Level {self.level})"


class Transaction(models.Model):
    """Records all blockchain transactions"""
    TRANSACTION_TYPES = [
        ('REGISTRATION', 'Registration'),
        ('UPGRADE', 'Level Upgrade'),
        ('REWARD', 'Reward Payment'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=6)
    level = models.PositiveSmallIntegerField(null=True, blank=True)
    recipient = models.ForeignKey(UserProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name='received_transactions')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.user} - {self.amount} USDT - {self.status}"
    
    class Meta:
        ordering = ['-created_at']