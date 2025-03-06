# middleware.py
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import get_authorization_header

class AuthExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt specific routes from authentication
    """
    
    #    In myapp/middleware.py
    def process_view(self, request, view_func, view_args, view_kwargs):
        path = request.path_info
        print(f"Current path: {path}")
        print(f"Exempt routes: {settings.AUTH_EXEMPT_ROUTES}")
        
        for exempt_route in settings.AUTH_EXEMPT_ROUTES:
            if path.startswith(exempt_route):
                print(f"Exempting {path} from authentication")
                request.auth_exempt = True
                break
        
        return None

# Then add this to MIDDLEWARE in settings.py: