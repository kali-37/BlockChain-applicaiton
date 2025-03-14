import random
import string
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .models import UserProfile,RefreshToken
from .authentication import Web3AuthBackend
import jwt
from datetime import timedelta 
from django.utils import timezone
from django.conf import settings
import secrets

nonce_values = []


class NonceView(APIView):
    """
    Generate a random nonce for wallet signature
    """

    permission_classes = [AllowAny]

    def get(self, request, wallet_address=None):
        if not wallet_address:
            return Response(
                {"error": "Wallet address is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate a random nonce (challenge)
        nonce = "".join(random.choices(string.ascii_letters + string.digits, k=32))

        # Create the message to be signed
        message = f"Sign this message to authenticate with Xclera Matrix: {nonce}"

        # Store the nonce in the session (can also be stored in cache or database)
        # Let's save it on more authentic place like redis
        request.session[f"nonce_{wallet_address}"] = nonce
        return Response({"message": message, "nonce": nonce})


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
    
       # Generate tokens
       tokens = Web3AuthBackend.generate_tokens(wallet_address)
    
       # Clear the used nonce
       request.session.pop(f"nonce_{wallet_address}", None)
    
       return Response({
           "access_token": tokens["access_token"],
           "refresh_token": tokens["refresh_token"],
           "access_expires_at": tokens["access_expires_at"].isoformat(),
           "refresh_expires_at": tokens["refresh_expires_at"].isoformat(),
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

        return Response(
            {
                "wallet_address": profile.wallet_address,
                "username": profile.username,
                "current_level": profile.current_level,
                "is_profile_complete": profile.is_profile_complete,
            }
        )

class RefreshTokenView(APIView):
    """
    Refresh an expired access token using a valid refresh token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the refresh token
        try:
            # Decode without verification first to get the wallet address
            payload = jwt.decode(
                refresh_token, 
                options={"verify_signature": False}
            )
            
            # Check token type
            if payload.get('type') != 'refresh':
                return Response(
                    {"error": "Invalid token type"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            wallet_address = payload.get('wallet_address')
            
            # Now verify the token is valid and in our database
            try:
                # First, decode with verification
                jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
                
                # Then check it exists in the database and is active
                stored_token = RefreshToken.objects.get(
                    token=refresh_token,
                    user__wallet_address=wallet_address,
                    is_active=True,
                    expires_at__gt=timezone.now()
                )
                
                # Generate a new access token
                access_expiration = timezone.now() + timedelta(minutes=30)
                access_payload = {
                    "wallet_address": wallet_address,
                    "exp": access_expiration,
                    "type": "access",
                    "jti": secrets.token_hex(8)
                }
                access_token = jwt.encode(
                    access_payload, 
                    settings.JWT_SECRET_KEY, 
                    algorithm="HS256"
                )
                
                return Response({
                    "access_token": access_token,
                    "expires_at": access_expiration.isoformat(),
                    "wallet_address": wallet_address
                })
                
            except jwt.ExpiredSignatureError:
                return Response(
                    {"error": "Refresh token has expired"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except RefreshToken.DoesNotExist:
                return Response(
                    {"error": "Refresh token not found or inactive"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except jwt.InvalidTokenError:
                return Response(
                    {"error": "Invalid refresh token"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except Exception as e:
            return Response(
                {"error": f"Token verification failed: {str(e)}"},
                status=status.HTTP_401_UNAUTHORIZED
            )