# Xclera Matrix Marketing System - Developer Guide

## Introduction

The Xclera Matrix Marketing System is a hybrid application that combines blockchain technology with traditional database management to create an efficient and transparent multi-level marketing platform. This guide provides comprehensive instructions for developers who want to set up, extend, or maintain the system.

The system uses blockchain (specifically the Binance Smart Chain) to handle all financial transactions, ensuring transparency and immutability, while using a Django backend to manage the complex referral relationships and business logic. This hybrid approach gives us the best of both worlds: the security of blockchain for financial operations and the efficiency of a traditional database for relationship management.

## System Architecture

### High-Level Architecture

```
User/Frontend ↔ Django Backend ↔ Blockchain Smart Contract
                     ↕
                  Database
```

### Key Components

1. **Smart Contract (Solidity)**
   - Handles financial transactions (registration fees, level upgrade fees)
   - Implements reward distribution logic (20% to company, 80% to eligible upline)
   - Maintains minimal state to reduce gas costs

2. **Django Backend**
   - Manages user profiles and relationships
   - Validates business rules before allowing blockchain transactions
   - Provides REST API for frontend interaction
   - Synchronizes with blockchain for transaction confirmation

3. **Database (MySQL/MariaDB)**
   - Stores user profiles, referral relationships, and transaction history
   - Tracks membership levels and eligibility for upgrades
   - Maintains the complete referral tree structure

4. **Web3.py Integration**
   - Connects Django backend to the blockchain
   - Builds and submits transactions
   - Verifies transaction receipts

5. **Authentication System**
   - Wallet-based authentication using cryptographic signatures
   - JWT token issuance for API access

## Setup Instructions

### Prerequisites

- Node.js v14+ and npm
- Python 3.8+
- MySQL or MariaDB
- Git

### Step 1: Clone the Repository

```bash
git clone git@github.com:kali-37/BlockChain-applicaiton.git
cd xclera-matrix
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

Create a `.env` file in the project root with the following content:

```
# Django settings
DEBUG=True
SECRET_KEY=your-django-secret-key-change-me
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=xclera
DB_USER=xclera_user
DB_PASSWORD=""
JWT_SECRET_KEY=your-jwt-secret-key-change-me

# Web3 settings
WEB3_PROVIDER_URL=http://127.0.0.1:8545
CHAIN_ID=31337
CONTRACT_ADDRESS=  # Will be filled by setup.py
ROOT_USER_ADDRESS=  # Will be filled by setup.py
COMPANY_WALLET_ADDRESS=  # Will be filled by setup.py

# For development only
DEVELOPER_MODE=True
```

### Step 4: Set Up the Database

```bash
# Create MySQL database and user
sudo mysql -e "CREATE DATABASE xclera CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'xclera_user'@'localhost';"
sudo mysql -e "GRANT ALL PRIVILEGES ON xclera.* TO 'xclera_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### Step 5: Start Local Blockchain Node

In a dedicated terminal window:

```bash
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with pre-funded test accounts. Keep this terminal open during development.

### Step 6: Run Automated Setup Script

The `setup.py` script automates the deployment process:

```bash
python setup.py
```

This script:
- Deploys the smart contract to the local blockchain
- Updates your `.env` file with contract address and wallet information
- Copies the contract ABI to the Django static directory
- Creates the root user in the database
- Sets up initial level data

### Step 7: Start the Django Server

```bash
cd xclera_backend
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`.

## Database Schema

### Core Models

1. **UserProfile**
   - Stores user information and links to blockchain address
   - Tracks current level, referrals count, and profile completeness

   ```python
   class UserProfile(models.Model):
       wallet_address = models.CharField(max_length=42, unique=True)
       username = models.CharField(max_length=100, null=True, blank=True)
       email = models.EmailField(null=True, blank=True)
       country = models.CharField(max_length=100, null=True, blank=True)
       phone_number = models.CharField(max_length=20, null=True, blank=True)
       current_level = models.IntegerField(default=1)
       referrer = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='direct_referrals')
       direct_referrals_count = models.IntegerField(default=0)
       max_referral_depth = models.IntegerField(default=0)
       created_at = models.DateTimeField(auto_now_add=True)
       updated_at = models.DateTimeField(auto_now=True)
       
       @property
       def is_profile_complete(self):
           return all([self.username, self.country, self.phone_number])
   ```

2. **ReferralRelationship**
   - Maps the referral tree structure
   - Tracks the depth between users

   ```python
   class ReferralRelationship(models.Model):
       upline = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='downline_relationships')
       downline = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='upline_relationships')
       depth = models.IntegerField()  # How many levels between upline and downline
       
       class Meta:
           unique_together = ['upline', 'downline']
   ```

3. **Level**
   - Defines each membership level and its requirements

   ```python
   class Level(models.Model):
       level_number = models.IntegerField(unique=True)
       price = models.DecimalField(max_digits=10, decimal_places=2)
       min_direct_referrals = models.IntegerField(default=0)
       min_referral_depth = models.IntegerField(default=0)
       requires_complete_profile = models.BooleanField(default=False)
   ```

4. **Transaction**
   - Records all blockchain interactions

   ```python
   class Transaction(models.Model):
       user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='transactions')
       tx_hash = models.CharField(max_length=66, unique=True)
       tx_type = models.CharField(max_length=20, choices=[
           ('REGISTRATION', 'Registration'),
           ('LEVEL_UPGRADE', 'Level Upgrade'),
       ])
       level = models.IntegerField(null=True, blank=True)
       amount = models.DecimalField(max_digits=10, decimal_places=2)
       status = models.CharField(max_length=20, default='PENDING')
       created_at = models.DateTimeField(auto_now_add=True)
   ```

## Two-Phase Transaction Model

The system uses a two-phase transaction approach for all blockchain interactions:

### Phase 1: Transaction Preparation

1. User initiates an action (registration or level upgrade) through the frontend
2. Frontend sends a request to the Django backend
3. Backend validates the request against business rules
4. If valid, backend prepares an unsigned transaction and returns it to the frontend

### Phase 2: Transaction Execution

1. Frontend gets the user to sign the transaction with their wallet
2. Frontend sends the signed transaction back to the backend
3. Backend submits the signed transaction to the blockchain
4. Backend waits for transaction confirmation
5. Upon confirmation, backend updates the database
6. Backend returns a success response to the frontend

This approach ensures that:
- All transactions are properly validated before being submitted to the blockchain
- The user explicitly approves each transaction with their wallet
- The database state accurately reflects the blockchain state

## API Documentation

### Authentication

#### 1. Get a Nonce for Authentication

```http
GET /api/auth/nonce/<wallet_address>/
```

**Response:**
```json
{
  "message": "Sign this message to authenticate with Xclera Matrix: ab12cd34ef56",
  "nonce": "ab12cd34ef56"
}
```

#### 2. Authenticate with Signed Message

```http
POST /api/auth/authenticate/
Content-Type: application/json

{
  "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "signature": "0x...",
  "nonce": "ab12cd34ef56"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_at": "2025-03-18T12:00:00.000000",
  "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "profile_exists": true
}
```

### Registration (Two-Phase)

#### Phase 1: Prepare Registration Transaction

```http
POST /api/register/
Content-Type: application/json
Authorization: Bearer <token>

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "referrer_wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "username": "TestUser",
  "country": "United States",
  "phone_number": "+1234567890",
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "message": "Transaction prepared for signing",
  "transaction": {
    "from": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "to": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    "value": "115000000000000000000",
    "data": "0x6c5412440000000000000000000000000xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 31337,
    "gas": 2000000,
    "gasPrice": "8000000000",
    "nonce": 0
  },
  "instructions": "Sign this transaction with your wallet and submit the signed transaction back to this endpoint"
}
```

#### Phase 2: Submit Signed Registration Transaction

```http
POST /api/register/
Content-Type: application/json
Authorization: Bearer <token>

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "referrer_wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "username": "TestUser",
  "country": "United States",
  "phone_number": "+1234567890",
  "email": "test@example.com",
  "signed_transaction": "0x..."
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "profile_id": 123,
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "is_profile_complete": true
}
```

### Level Upgrade (Two-Phase)

#### Phase 1: Prepare Upgrade Transaction

```http
POST /api/upgrade/
Content-Type: application/json
Authorization: Bearer <token>

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "target_level": 2
}
```

**Response:**
```json
{
  "message": "Transaction prepared for signing",
  "transaction": {
    "from": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "to": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    "value": "150000000000000000000",
    "data": "0xeb9dcf0100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "chainId": 31337,
    "gas": 2000000,
    "gasPrice": "8000000000",
    "nonce": 1
  },
  "instructions": "Sign this transaction with your wallet and submit the signed transaction back to this endpoint"
}
```

#### Phase 2: Submit Signed Upgrade Transaction

```http
POST /api/upgrade/
Content-Type: application/json
Authorization: Bearer <token>

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "target_level": 2,
  "signed_transaction": "0x..."
}
```

**Response:**
```json
{
  "message": "Level upgrade successful",
  "new_level": 2,
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "upline_rewarded": "Root User",
  "upline_reward": 120.0
}
```

### User Profile Operations

#### Get User Profile by Wallet Address

```http
GET /api/profiles/by_wallet/?address=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Authorization: Bearer <token>
```

#### Update User Profile

```http
PATCH /api/profiles/123/
Content-Type: application/json
Authorization: Bearer <token>

{
  "username": "UpdatedName",
  "country": "Canada",
  "phone_number": "+1987654321"
}
```

#### Get User's Direct Referrals

```http
GET /api/profiles/123/referrals/
Authorization: Bearer <token>
```

#### View User's Transactions

```http
GET /api/profiles/123/transactions/
Authorization: Bearer <token>
```

#### Get User's Uplines (Users Above in the Referral Tree)

```http
GET /api/profiles/123/uplines/
Authorization: Bearer <token>
```

#### Get User's Downlines (Users Below in the Referral Tree)

```http
GET /api/profiles/123/downlines/
Authorization: Bearer <token>
```

#### Get All Levels and Requirements

```http
GET /api/levels/
Authorization: Bearer <token>
```

## Smart Contract Details

The `SimplifiedMatrixCore` contract has been optimized to minimize gas costs while maintaining essential functionality:

### Key Contract Functions

#### Registration

```solidity
function register(address _referrer) external payable
```

This function:
- Registers a new user with their referrer
- Requires 115 USDT payment (100 USDT level fee + 15 USDT service fee)
- Sends 100 USDT to the referrer and 15 USDT to the company wallet
- Initializes the user at Level 1

#### Level Upgrade

```solidity
function upgradeLevel(uint8 _level, address _uplineAddress) external payable
```

This function:
- Upgrades a user to a higher level
- Requires payment based on the level (150 USDT for Level 2, 200 USDT for Level 3, etc.)
- Sends 20% of the fee to the company wallet
- Sends 80% of the fee to the eligible upline
- Updates the user's current level

### Core Contract Structure

```solidity
// User structure
struct User {
    bool isRegistered;
    address referrer;
    uint8 currentLevel;
    uint16 referralsCount;
    uint8 maxReferralDepth;
}

// State variables
mapping(address => User) public users;
mapping(address => mapping(uint8 => ReferralList)) public userReferrals;
address[] public allUsers;
address public companyWallet;
address public immutable rootUser;
```

The contract maintains minimal state to reduce gas costs. Most of the complex referral logic is handled by the Django backend, which determines the eligible upline before submitting the transaction.

## Level Upgrade Requirements

The system enforces specific requirements for level upgrades:

1. **Level 2 Upgrade**:
   - Must have at least 3 direct referrals
   - Cost: 150 USDT

2. **Level 3 and Above**:
   - Profile must be complete (username, country, phone number)
   - Must have sufficient referral depth (depth = level - 1)
   - Cannot skip levels (must upgrade sequentially)
   - Cost: Previous level cost + 50 USDT
     - Level 3: 200 USDT
     - Level 4: 250 USDT
     - And so on up to Level 19: 1,000 USDT

These requirements are enforced by the Django backend before allowing a transaction to be created, and are also implemented in the smart contract as a secondary validation layer.

## Blockchain Service Implementation

The `BlockchainService` class in Django handles all interactions with the blockchain:

```python
class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))
        self.contract_address = settings.CONTRACT_ADDRESS
        self.contract_abi = self._load_contract_abi()
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        self.chain_id = settings.CHAIN_ID

    def _load_contract_abi(self):
        abi_path = os.path.join(settings.BASE_DIR, 'myapp/static/contract_abi.json')
        with open(abi_path, 'r') as f:
            return json.load(f)

    def build_register_transaction(self, wallet_address, referrer_address):
        """Build an unsigned registration transaction"""
        # Calculate registration fee (100 USDT + 15 USDT service fee)
        registration_fee = Web3.to_wei(115, 'ether')  # Using ether as the denomination for USDT
        
        # Get the nonce for the wallet
        nonce = self.w3.eth.get_transaction_count(wallet_address)
        
        # Build the transaction
        tx = {
            'from': wallet_address,
            'to': self.contract_address,
            'value': registration_fee,
            'gas': 2000000,  # Gas limit
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
            'chainId': self.chain_id,
            'data': self.contract.encodeABI(
                fn_name='register',
                args=[referrer_address]
            )
        }
        
        return tx

    def build_upgrade_transaction(self, wallet_address, level, upline_address):
        """Build an unsigned level upgrade transaction"""
        # Calculate upgrade fee based on level
        upgrade_fee = Web3.to_wei((level * 50) + 50, 'ether')
        
        # Get the nonce for the wallet
        nonce = self.w3.eth.get_transaction_count(wallet_address)
        
        # Build the transaction
        tx = {
            'from': wallet_address,
            'to': self.contract_address,
            'value': upgrade_fee,
            'gas': 2000000,  # Gas limit
            'gasPrice': self.w3.eth.gas_price,
            'nonce': nonce,
            'chainId': self.chain_id,
            'data': self.contract.encodeABI(
                fn_name='upgradeLevel',
                args=[level, upline_address]
            )
        }
        
        return tx

    def submit_transaction(self, signed_tx):
        """Submit a signed transaction to the blockchain"""
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            'tx_hash': tx_hash.hex(),
            'status': 'SUCCESS' if tx_receipt['status'] == 1 else 'FAILED',
            'block_number': tx_receipt['blockNumber']
        }
```

## Testing

### Unit Tests

Run Django unit tests:

```bash
cd xclera_backend
python manage.py test
```

Run smart contract tests:

```bash
npx hardhat test
```

### Integration Testing

The automated test suite includes integration tests that verify the entire flow from Django to blockchain and back:

```bash
cd xclera_backend
python manage.py test myapp.tests.integration_tests
```

### Manual Testing

For manual testing, use the following test accounts provided by Hardhat:

1. Root User (Level 19):
   - Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   - Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

2. Test Account 1:
   - Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   - Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

3. Test Account 2:
   - Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
   - Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

You can use these accounts with any Ethereum wallet that supports custom networks by adding the Hardhat local network:
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH

## Troubleshooting

### Common Issues

1. **"Cannot connect to the network"**
   - Ensure the Hardhat node is running in a separate terminal
   - Check that you're using the correct port (8545)

2. **"Invalid signature" During Authentication**
   - Ensure you're signing exactly the message provided by the `/api/auth/nonce/` endpoint
   - Check that you're using the correct private key for the wallet address

3. **"Need 3 direct referrals for Level 2" Error**
   - Ensure the user has at least 3 direct referrals before attempting to upgrade to Level 2
   - Verify the `direct_referrals_count` field in the user's profile

4. **Profile Incomplete Error When Upgrading Beyond Level 2**
   - Ensure the user's profile has username, country, and phone_number fields filled out
   - Update the profile with this information before attempting the upgrade

5. **Database Connection Issues**
   - Verify database credentials in your `.env` file
   - Ensure the MySQL server is running

6. **"The node reset its state" Error**
   - This happens when the Hardhat node is restarted
   - You need to redeploy the contract and update the contract address in your `.env` file
   - Running `python setup.py` will handle this for you

### Debugging Tools

1. **Django Debug Toolbar**
   - Install with `pip install django-debug-toolbar`
   - Follow setup instructions in `settings.py`
   - Helps debug database queries and performance issues

2. **Blockchain Explorer**
   - Access the local blockchain explorer at http://localhost:8545/explorer
   - View transactions, blocks, and contract state

3. **Transaction Logs**
   - All transactions are recorded in the `Transaction` model
   - Check the transaction status and hash for debugging

4. **Web3.py Console**
   - Use the Django shell for direct Web3.py interactions:
   ```bash
   python manage.py shell
   ```
   ```python
   from web3 import Web3
   from django.conf import settings
   w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URL))
   # Check connection
   w3.is_connected()
   # Get blockchain info
   w3.eth.block_number
   ```

## Security Considerations

### Wallet Security

1. **Private Keys**
   - Never expose private keys in production environments
   - Use a secure wallet connection (like MetaMask) for signing transactions
   - In development, use the provided test accounts only

2. **Environment Variables**
   - Protect your `.env` file and never commit it to version control
   - Use strong, unique values for `SECRET_KEY` and `JWT_SECRET_KEY` in production

### Transaction Security

1. **Double Validation**
   - All transactions are validated both on the backend and the blockchain
   - The backend checks eligibility before allowing a transaction
   - The blockchain contract provides a second layer of validation

2. **Front-Running Protection**
   - The two-phase transaction model reduces risk of front-running attacks
   - The backend prepares transactions with appropriate gas settings

3. **Re-entrancy Protection**
   - The smart contract uses the ReentrancyGuard from OpenZeppelin
   - Critical operations use the nonReentrant modifier

### Database Security

1. **Protected Fields**
   - Critical fields like `wallet_address` and `referrer` are protected from modification
   - The `ProtectedFieldsMiddleware` prevents updates to these fields through the admin interface

2. **Transaction Atomicity**
   - Database operations use `transaction.atomic` to ensure consistency
   - If any part of a transaction fails, all changes are rolled back

## Deployment to Production

For production deployment:

1. **Update Environment Variables**
   - Set `DEBUG=False`
   - Use strong, unique keys for `SECRET_KEY` and `JWT_SECRET_KEY`
   - Update `ALLOWED_HOSTS` with your production domain

2. **Deploy the Smart Contract to BSC Testnet/Mainnet**
   - Update `hardhat.config.js` with your BSC configuration
   - Deploy with `npx hardhat run scripts/deploy.js --network bsc_testnet`
   - Update `CONTRACT_ADDRESS` and `CHAIN_ID` in your production `.env`

3. **Set Up Database**
   - Use a production-grade MySQL/MariaDB setup
   - Configure with strong password and restricted access

4. **Set Up HTTPS**
   - Configure your web server with HTTPS
   - Update CORS settings to allow only your frontend domain

5. **Scale Appropriately**
   - Use Gunicorn or uWSGI as WSGI server
   - Configure Nginx as reverse proxy
   - Set up database replication for read-heavy operations

## Conclusion

The Xclera Matrix Marketing System offers a powerful hybrid approach that leverages both blockchain technology and traditional database systems to create an efficient and transparent MLM platform. By following this guide, developers can set up, extend, and maintain the system with confidence.

Remember that the key to success with this system is maintaining proper synchronization between the blockchain and database states. Always ensure that database updates occur only after blockchain confirmation, and validate all operations through the Django backend before submitting them to the blockchain.
