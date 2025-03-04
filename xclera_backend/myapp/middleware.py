# middleware.py
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import get_authorization_header

class AuthExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt specific routes from authentication
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Check if the path starts with any exempt route
        path = request.path_info
        
        # If the path is in the exempt routes, skip authentication
        for exempt_route in settings.AUTH_EXEMPT_ROUTES:
            if path.startswith(exempt_route):
                # Mark the request as exempt from authentication
                request.auth_exempt = True
                break
        
        return None


# Then add this to MIDDLEWARE in settings.py: