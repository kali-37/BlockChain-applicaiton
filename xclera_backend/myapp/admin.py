from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import UserProfile, Level, Transaction, ReferralRelationship

class ReadOnlyModelAdmin(admin.ModelAdmin):
    """Base admin class for models that should be read-only"""
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'wallet_address', 'get_referrer', 'current_level', 
                    'direct_referrals_count', 'max_referral_depth', 'is_profile_complete')
    list_filter = ('current_level', 'is_registered_on_chain', 'date_registered', 'country')
    search_fields = ('username', 'wallet_address', 'email', 'phone_number')
    
    # These fields are completely read-only and cannot be changed
    readonly_fields = ('wallet_address', 'referrer', 'date_registered', 
                      'is_registered_on_chain', 'direct_referrals_count', 
                      'max_referral_depth', 'current_level')
    
    # Only allow editing specific fields, excluding critical system fields
    fields = (
        # Read-only blockchain fields
        'wallet_address', 'referrer', 'date_registered', 'is_registered_on_chain',
        'current_level', 'direct_referrals_count', 'max_referral_depth',
        # Editable profile fields
        'username', 'email', 'country', 'phone_number',
    )
    
    def display_name(self, obj):
        if obj.username:
            return obj.username
        return f"{obj.wallet_address[:10]}...{obj.wallet_address[-6:]}"
    display_name.short_description = 'Name'
    
    def get_referrer(self, obj):
        if obj.referrer:
            display_name = obj.referrer.username or f"{obj.referrer.wallet_address[:10]}..."
            url = reverse('admin:myapp_userprofile_change', args=[obj.referrer.id])
            return format_html('<a href="{}">{}</a>', url, display_name)
        return "-"
    get_referrer.short_description = 'Referrer'
    
    def has_add_permission(self, request):
        # Profiles should be created through the registration process
        return False
    
    def get_readonly_fields(self, request, obj=None):
        # If this is an existing object, prevent changing critical fields
        if obj: 
            return self.readonly_fields
        return []

@admin.register(Level)
class LevelAdmin(ReadOnlyModelAdmin):
    """
    Levels should be read-only to preserve system integrity.
    Changing level requirements would disrupt the matrix structure.
    """
    list_display = ('level_number', 'price', 'min_direct_referrals', 'min_referral_depth')
    ordering = ('level_number',)
    search_fields = ('level_number',)

@admin.register(Transaction)
class TransactionAdmin(ReadOnlyModelAdmin):
    """
    Transactions must be immutable for blockchain consistency and audit trails
    """
    list_display = ('id', 'get_user', 'transaction_type', 'amount', 'level', 
                   'get_recipient', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'level', 'created_at')
    search_fields = ('user__username', 'user__wallet_address', 'transaction_hash', 
                    'recipient__username', 'recipient__wallet_address')
    
    def get_user(self, obj):
        display_name = obj.user.username or f"{obj.user.wallet_address[:10]}..."
        url = reverse('admin:myapp_userprofile_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, display_name)
    get_user.short_description = 'User'
    
    def get_recipient(self, obj):
        if obj.recipient:
            display_name = obj.recipient.username or f"{obj.recipient.wallet_address[:10]}..."
            url = reverse('admin:myapp_userprofile_change', args=[obj.recipient.id])
            return format_html('<a href="{}">{}</a>', url, display_name)
        return "-"
    get_recipient.short_description = 'Recipient'

@admin.register(ReferralRelationship)
class ReferralRelationshipAdmin(ReadOnlyModelAdmin):
    """
    Referral relationships must be immutable to preserve network integrity
    """
    list_display = ('id', 'get_user', 'get_upline', 'level', 'date_created')
    list_filter = ('level', 'date_created')
    search_fields = ('user__username', 'user__wallet_address', 
                    'upline__username', 'upline__wallet_address')
    
    def get_user(self, obj):
        display_name = obj.user.username or f"{obj.user.wallet_address[:10]}..."
        url = reverse('admin:myapp_userprofile_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, display_name)
    get_user.short_description = 'User'
    
    def get_upline(self, obj):
        display_name = obj.upline.username or f"{obj.upline.wallet_address[:10]}..."
        url = reverse('admin:myapp_userprofile_change', args=[obj.upline.id])
        return format_html('<a href="{}">{}</a>', url, display_name)
    get_upline.short_description = 'Upline'