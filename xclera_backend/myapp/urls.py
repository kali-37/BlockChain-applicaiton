from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, LevelViewSet, TransactionViewSet,
    RegistrationView, UpgradeLevelView, LoginView
)
from .auth_views import NonceView, AuthenticateView, VerifyTokenView

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)
router.register(r'levels', LevelViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'register', RegistrationView, basename='register')
router.register(r'upgrade', UpgradeLevelView, basename='upgrade')
router.register(r'login', LoginView, basename='login')


urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/nonce/<str:wallet_address>/', NonceView.as_view(), name='auth-nonce'),
    path('api/auth/authenticate/', AuthenticateView.as_view(), name='auth-authenticate'),
    path('api/auth/verify/', VerifyTokenView.as_view(), name='auth-verify'),
]
