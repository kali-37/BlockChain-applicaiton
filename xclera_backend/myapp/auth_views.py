# auth_views.py
import random
import string
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .models import UserProfile
from .authentication import Web3AuthBackend

class NonceView(APIView):
    """
    Generate a random nonce for wallet signature
    """
    permission_classes = [AllowAny]
    
    def get(self, request, wallet_address=None):
        if not wallet_address:
            return Response(
                {"error": "Wallet address is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate a random nonce (challenge)
        nonce = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        
        # Create the message to be signed
        message = f"Sign this message to authenticate with Xclera Matrix: {nonce}"
        
        # Store the nonce in the session (can also be stored in cache or database)
        request.session[f"nonce_{wallet_address}"] = nonce
        
        return Response({
            "message": message,
            "nonce": nonce
        })

class AuthenticateView(APIView):
    """
    Authenticate a user with their wallet signature
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        nonce = request.data.get('nonce')
        
        if not all([wallet_address, signature, nonce]):
            return Response(
                {"error": "Wallet address, signature, and nonce are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the nonce matches what was issued
        stored_nonce = request.session.get(f"nonce_{wallet_address}")
        if not stored_nonce or stored_nonce != nonce:
            return Response(
                {"error": "Invalid or expired nonce"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the message that was signed
        message = f"Sign this message to authenticate with Xclera Matrix: {nonce}"
        
        # Verify the signature
        is_valid = Web3AuthBackend.verify_signature(wallet_address, message, signature)
        
        if not is_valid:
            return Response(
                {"error": "Invalid signature"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if the user exists
        profile_exists = UserProfile.objects.filter(wallet_address=wallet_address).exists()
        
        # Generate token
        token, expiration = Web3AuthBackend.generate_token(wallet_address)
        
        # Clear the used nonce
        request.session.pop(f"nonce_{wallet_address}", None)
        
        return Response({
            "token": token,
            "expires_at": expiration.isoformat(),
            "wallet_address": wallet_address,
            "profile_exists": profile_exists
        })

class VerifyTokenView(APIView):
    """
    Verify a token is valid and return user info
    """
    def get(self, request):
        # Authentication happens in Web3Authentication class
        # If we reach here, the token is valid
        profile = request.user
        
        return Response({
            "wallet_address": profile.wallet_address,
            "username": profile.username,
            "current_level": profile.current_level,
            "is_profile_complete": profile.is_profile_complete
        })