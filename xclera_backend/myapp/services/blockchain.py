import json
import os
from web3 import Web3
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

class BlockchainService:
    """Service for interacting with the blockchain contract"""
    
    def __init__(self):
        # Get contract address and ABI from settings
        try:
            self.contract_abi_path = settings.CONTRACT_ABI_PATH
            self.web3_provider_url = settings.WEB3_PROVIDER_URL
            self.chain_id = settings.CHAIN_ID

            # Convert contract address to checksum format
            self.contract_address = Web3.to_checksum_address(settings.CONTRACT_ADDRESS)
        except AttributeError:
            raise ImproperlyConfigured("Missing blockchain settings in Django settings.py")
        
        # Load contract ABI
        with open(self.contract_abi_path, 'r') as abi_file:
            self.contract_abi = json.load(abi_file)
        
        # Initialize Web3 connection
        self.w3 = Web3(Web3.HTTPProvider(self.web3_provider_url))
        if not self.w3.is_connected():
            raise ConnectionError("Cannot connect to Ethereum node")
        
        # Initialize contract
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
    
    def is_user_registered(self, wallet_address):
        """Check if user is registered on blockchain"""
        return self.contract.functions.isUserRegistered(wallet_address).call()
    
    def get_user_level(self, wallet_address):
        """Get user's current level on blockchain"""
        return self.contract.functions.getUserLevel(wallet_address).call()
    
    def get_user_referrer(self, wallet_address):
        """Get user's referrer on blockchain"""
        return self.contract.functions.getUserReferrer(wallet_address).call()
    
    def build_register_transaction(self, user_wallet, referrer_wallet):
        """
        Build an unsigned transaction for user registration
        
        Returns transaction data that needs to be signed by the user's wallet
        """
        # Get constants from contract
        level_1_price = 100  # 100 USDT
        service_fee = 15     # 15 USDT
        total_amount = level_1_price + service_fee
        
        # Convert wallet addresses to checksum format
        user_wallet = self.w3.to_checksum_address(user_wallet)
        referrer_wallet = self.w3.to_checksum_address(referrer_wallet)
            
        # Build transaction
        transaction = self.contract.functions.register(referrer_wallet).build_transaction({
            'from': user_wallet,
            'value': self.w3.to_wei(total_amount, 'ether'),
            'chainId': self.chain_id,
            'gas': 2000000,  # Estimate gas more accurately in production
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(user_wallet)
        })
        
        return transaction
    
    def build_upgrade_transaction(self, user_wallet, new_level, upline_wallet):
        """
        Build an unsigned transaction for level upgrade
        
        Returns transaction data that needs to be signed by the user's wallet
        """
        # Calculate upgrade fee (150 for level 2, 200 for level 3, etc.)
        upgrade_fee = (new_level * 50) + 50

        # Convert wallet addresses to checksum format
        user_wallet = self.w3.to_checksum_address(user_wallet)
        upline_wallet = self.w3.to_checksum_address(upline_wallet)
        
        # Build transaction
        transaction = self.contract.functions.upgradeLevel(
            new_level, 
            upline_wallet
        ).build_transaction({
            'from': user_wallet,
            'value': self.w3.to_wei(upgrade_fee, 'ether'),
            'chainId': self.chain_id,
            'gas': 2000000,  # Estimate gas more accurately in production
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(user_wallet)
        })
        
        return transaction
    
    def submit_transaction(self, signed_transaction):
        """
        Submit a previously signed transaction to the blockchain
        
        Args:
            signed_transaction: The signed transaction from the user's wallet
            
        Returns:
            Dict with transaction hash, status, and block number
        """
        # Send the signed transaction
        tx_hash = self.w3.eth.send_raw_transaction(signed_transaction)
        
        # Wait for transaction receipt
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            'tx_hash': tx_hash.hex(),
            'status': 'success' if tx_receipt["status"] == 1 else 'failed',
            'block_number': tx_receipt["blockNumber"]
        }