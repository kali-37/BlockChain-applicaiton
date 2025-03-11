from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import get_authorization_header
from myapp.models import UserProfile


class ProtectedFieldsMiddleware(MiddlewareMixin):
    """Middleware to prevent changes to protected fields in admin"""
    
    def process_request(self, request):
        if request.path.startswith('/admin/') and request.method == 'POST':
            # For UserProfile form submissions
            if 'myapp/userprofile' in request.path and '_save' in request.POST:
                user_id = request.path.split('/')[-3]
                if user_id.isdigit():  # It's an edit, not a new entry
                    original = UserProfile.objects.get(pk=user_id)
                    
                    # If someone tries to modify wallet_address or referrer
                    # through direct form submission or inspector modification
                    if 'wallet_address' in request.POST:
                        request.POST = request.POST.copy()  # Make mutable
                        request.POST['wallet_address'] = original.wallet_address
                    
                    if 'referrer' in request.POST:
                        request.POST = request.POST.copy()  # Make mutable
                        if original.referrer:
                            request.POST['referrer'] = original.referrer.id
                        else:
                            request.POST['referrer'] = ''
        
        return None


class AuthExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt specific routes from authentication
    """
    
    #    In myapp/middleware.py
    def process_view(self, request, view_func, view_args, view_kwargs):
        path = request.path_info
        
        for exempt_route in settings.AUTH_EXEMPT_ROUTES:
            if path.startswith(exempt_route):
                request.auth_exempt = True
                break
        
        return None

# Then add this to MIDDLEWARE in settings.py: