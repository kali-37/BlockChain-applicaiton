# Xclera Matrix Marketing System - Developer Guide

## API Implementation

This guide details the API endpoints, request/response formats, and implementation details for developers working with the Xclera Matrix Marketing System.

### Core API Concepts

#### Authentication Flow

The system uses a secure wallet-based authentication flow:

1. User connects their blockchain wallet (MetaMask, etc.)
2. Backend issues a nonce for the wallet to sign
3. User signs the nonce with their wallet
4. Backend verifies the signature and issues JWT tokens
5. Subsequent API calls use these tokens for authentication

#### User Progression Flow

1. **Level 0**: Initial account creation (via `/login/`)
   - Profile created with referrer relationship
   - Referral tree structure established
   - No blockchain registration yet

2. **Level 1**: On-chain registration (via `/register/`)
   - Requires completed profile (username, country, phone)
   - Two-phase transaction process
   - 115 USDT fee (100 USDT to referrer, 15 USDT service fee)

3. **Level 2+**: Level upgrades (via `/upgrade/`)
   - Requires meeting level-specific requirements
   - Two-phase transaction process
   - Fee increases by 50 USDT per level

#### Two-Phase Transaction Model

All blockchain interactions follow a two-phase transaction model:

1. **Phase 1: Transaction Preparation**
   - Request transaction data (unsigned)
   - Backend validates eligibility and prepares transaction parameters
   - No blockchain interaction or payment happens yet

2. **Phase 2: Transaction Execution**
   - Frontend gets the user to sign the transaction
   - Signed transaction is submitted back to backend
   - Backend broadcasts the transaction to the blockchain
   - Transaction is executed and payment is processed

### API Endpoints

#### Authentication

##### 1. Get Nonce for Authentication

```http
GET /api/auth/nonce/{wallet_address}/
```

**Response:**

```json
{
    "message": "Sign this message to authenticate with Xclera Matrix: ab12cd34ef56",
    "nonce": "ab12cd34ef56"
}
```

##### 2. Authenticate with Signed Message

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
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access_expires_at": "2025-03-14T12:30:00.000000",
    "refresh_expires_at": "2025-03-21T12:00:00.000000",
    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "profile_exists": true
}
```

##### 3. Refresh Token

```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**

```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_at": "2025-03-14T13:00:00.000000",
    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

#### User Management

##### 1. Login/Create Level 0 Account

This endpoint either retrieves an existing user's profile or creates a new Level 0 account. When creating a new account, it also establishes all referral relationships in the database.

```http
POST /api/login/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "referrer_wallet": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"  // Optional
}
```

**Response (Existing User):**

```json
{
    "message": "Profile found",
    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "username": "username",
    "current_level": 1,
    "is_profile_complete": true,
    "is_registered_on_chain": true
}
```

**Response (New User):**

```json
{
    "message": "New profile created",
    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "current_level": 0,
    "is_registered_on_chain": false,
    "referrer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
}
```

##### 2. Get/Update User Profile

```http
GET /api/profiles/by_wallet/?address=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Authorization: Bearer {access_token}
```

```http
PATCH /api/profiles/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "username": "new_username",
  "country": "Canada",
  "phone_number": "+1987654321",
  "email": "new_email@example.com"
}
```

#### Blockchain Operations

##### 1. Registration (Level 0 to Level 1)

This endpoint handles the upgrade from Level 0 to Level 1, which requires a blockchain transaction.

###### Phase 1: Prepare Registration Transaction

```http
POST /api/register/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
}
```

**Response:**

```json
{
    "message": "Transaction prepared for signing",
    "transaction": {
        "from": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "to": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        "value": "0x6691b7a2c10000",
        "data": "0x6c5412440000000000000000000000000xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "chainId": "0x7a69",
        "gas": "0x1e8480",
        "gasPrice": "0x77359400",
        "nonce": "0x0"
    },
    "instructions": "Sign this transaction with your wallet and submit the signed transaction back to this endpoint"
}
```

###### Phase 2: Submit Signed Registration Transaction

```http
POST /api/register/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "signed_transaction": "0x..."
}
```

**Response:**

```json
{
    "message": "Registration successful",
    "profile_id": 123,
    "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "current_level": 1
}
```

##### 2. Level Upgrade

This endpoint automatically increments the user's level (e.g., Level 1 to Level 2, Level 2 to Level 3, etc.).

###### Phase 1: Prepare Upgrade Transaction

```http
POST /api/upgrade/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
}
```

**Response:**

```json
{
    "message": "Transaction prepared for signing",
    "transaction": {
        "from": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "to": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        "value": "0x8ac7230489e80000",
        "data": "0xeb9dcf0100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "chainId": "0x7a69",
        "gas": "0x1e8480",
        "gasPrice": "0x77359400",
        "nonce": "0x1"
    },
    "instructions": "Sign this transaction with your wallet and submit the signed transaction back to this endpoint"
}
```

###### Phase 2: Submit Signed Upgrade Transaction

```http
POST /api/upgrade/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
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

#### Data Queries

##### 1. Get User's Direct Referrals

```http
GET /api/profiles/{id}/referrals/
Authorization: Bearer {access_token}
```

##### 2. Get User's Transactions

```http
GET /api/profiles/{id}/transactions/
Authorization: Bearer {access_token}
```

##### 3. Get User's Uplines/Downlines

```http
GET /api/profiles/{id}/uplines/
Authorization: Bearer {access_token}
```

```http
GET /api/profiles/{id}/downlines/
Authorization: Bearer {access_token}
```

##### 4. Get Levels Information

```http
GET /api/levels/
Authorization: Bearer {access_token}
```

### Implementation Details

#### Authentication Implementation

The system uses JWT (JSON Web Tokens) with wallet signatures:

1. The server generates a random nonce for each authentication attempt
2. The user signs this nonce with their private key
3. The server verifies the signature and issues JWT tokens
4. Access tokens expire in 30 minutes, refresh tokens in 7 days

#### User Creation Flow

1. **User connects wallet**: Frontend shows wallet connect options
2. **User authenticates**: Wallet signs nonce to prove ownership
3. **Account creation**:
   - `/login/` endpoint creates a Level 0 profile
   - Referral relationships are established in database
4. **Profile completion**:
   - User must provide username, country, phone
   - This is required before registration on blockchain

#### Registration Implementation

The registration process (Level 0 to Level 1) involves:

1. **Profile validation**:
   - Check profile is complete
   - Confirm user has a referrer
   - Ensure user isn't already registered

2. **Blockchain transaction**:
   - Two-phase process (prepare → sign → submit)
   - 115 USDT payment (100 USDT to referrer, 15 USDT service fee)
   - Smart contract updates the user's on-chain status

3. **Database updates**:
   - User's level updated to 1
   - is_registered_on_chain flag set to true
   - Transaction record created

#### Level Upgrade Implementation

Level upgrades (Level 1 and beyond) involve:

1. **Eligibility checks**:
   - Level 2 requires 3 direct referrals
   - Higher levels require referral depth matching level-1
   - Profile must be complete
   - Cannot skip levels

2. **Upline determination**:
   - System automatically finds eligible upline at the right position
   - If no eligible upline, reward goes to company wallet

3. **Blockchain transaction**:
   - Two-phase process (prepare → sign → submit)
   - Fee increases by 50 USDT per level (150 for Level 2, 200 for Level 3, etc.)
   - 20% of fee goes to company wallet, 80% to eligible upline

4. **Database updates**:
   - User's level updated
   - Transaction records created

### Error Handling

The API uses standard HTTP status codes and consistent error responses:

```json
{
    "error": "Error message",
    "details": {}  // Optional additional details
}
```

Common error scenarios:

#### Registration Errors

- **Profile Incomplete**:
  ```json
  {
      "error": "Profile is incomplete",
      "missing_fields": ["username", "country", "phone_number"]
  }
  ```

- **Already Registered**:
  ```json
  {
      "error": "User is already registered on the blockchain"
  }
  ```

#### Upgrade Errors

- **Insufficient Referrals**:
  ```json
  {
      "error": "Need 3 direct referrals for Level 2"
  }
  ```

- **Insufficient Depth**:
  ```json
  {
      "error": "Insufficient referral depth, need depth of 4"
  }
  ```

### Security Considerations

1. **Authentication Security**:
   - Only wallet owners can authorize actions
   - JWT tokens have limited timeframes
   - Refresh tokens can be revoked if needed

2. **Authorization Control**:
   - Users can only perform actions on their own wallet
   - Each endpoint validates that the authorized user matches the requested wallet

3. **Transaction Security**:
   - Two-phase transaction model ensures user approval
   - All