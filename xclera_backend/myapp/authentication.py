from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from eth_account.messages import encode_defunct
from web3 import Web3
from web3.auto import w3
import jwt
import datetime

from .models import UserProfile


class Web3Authentication(BaseAuthentication):
    """
    Custom authentication class for Web3 wallet-based authentication
    Uses a signed message to verify the wallet owner
    """

    def authenticate(self, request):
        # Check if this route is exempt from authentication
        if getattr(request, "auth_exempt", False):
            return None

        # Get the Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            return None

        # Check if it's a Bearer token
        try:
            auth_type, token = auth_header.split()
            if auth_type.lower() != "bearer":
                return None
        except ValueError:
            return None

        print(f"{settings.JWT_SECRET_KEY},  {token}")
        # Verify the JWT token
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
            wallet_address = payload.get("wallet_address")
            print("PAYLOAD  ", payload)
        except Exception as e:
            raise AuthenticationFailed(f"Invalid or expired token")

        # Get the user profile
        try:
            profile = UserProfile.objects.get(wallet_address=wallet_address)
        except UserProfile.DoesNotExist:
            raise AuthenticationFailed("User not found")

        # Return the authentication tuple (user, auth)
        return (profile, token)

    def authenticate_header(self, request):
        return "Bearer"


class Web3AuthBackend:
    """
    Backend for verifying Web3 signatures and issuing tokens
    """

    @staticmethod
    def verify_signature(wallet_address, message, signature):
        """
        Verify that a message was signed by the owner of a specific wallet address
        """
        try:
            # Create the message object
            message_obj = encode_defunct(text=message)

            # Recover the address from the signature
            recovered_address = w3.eth.account.recover_message(
                message_obj, signature=signature
            )

            # Convert addresses to checksum format for comparison
            wallet_address = Web3.to_checksum_address(wallet_address)
            recovered_address = Web3.to_checksum_address(recovered_address)

            # Return whether the addresses match
            return wallet_address == recovered_address
        except Exception as e:
            print(f"Signature verification error: {e}")
            return False

    @staticmethod
    def generate_token(wallet_address):
        """
        Generate a JWT token for a wallet address
        """
        expiration = datetime.datetime.utcnow() + settings.JWT_EXPIRATION_DELTA

        payload = {"wallet_address": wallet_address, "exp": expiration}

        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")

        return token, expiration
