# Xclera Matrix Marketing System - API Documentation

## Introduction

The Xclera Matrix Marketing System API provides endpoints for interacting with the blockchain-backed MLM platform. This document outlines the API implementation details, request/response formats, and transaction flows for developers.

The API follows a RESTful architecture and supports a two-phase transaction model for all blockchain interactions to ensure security and user control.

## Base URL

```
http://localhost:8000/api/
```

## Authentication

The API uses JWT-based authentication with wallet signatures for secure access.

### Authentication Flow

1. Request a nonce
2. Sign the nonce with a wallet
3. Submit the signature to obtain JWT tokens
4. Use the access token for authenticated requests

### Endpoints

#### 1. Get Nonce

```http
GET /auth/nonce/{wallet_address}/
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
POST /auth/authenticate/
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

#### 3. Refresh Token

```http
POST /auth/refresh/
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

#### 4. Verify Token

```http
GET /auth/verify/
Authorization: Bearer {access_token}
```

**Response:**

```json
{
    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "username": "username",
    "current_level": 1,
    "is_profile_complete": true
}
```

## User Management

### Login (Check/Create Wallet Profile)

This endpoint checks if a wallet exists in the system. If not, it creates a Level 0 profile.

```http
POST /login/
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
    "current_level": level-of-user,
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

### Get User Profile

```http
GET /profiles/by_wallet/?address=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Authorization: Bearer {access_token}
```

**Response:**

```json
{
    "id": 123,
    "username": "username",
    "country": "United States",
    "phone_number": "+1234567890",
    "email": "user@example.com",
    "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "referrer": 1,
    "referrer_username": "root_user",
    "current_level": 1,
    "direct_referrals_count": 3,
    "max_referral_depth": 2,
    "is_registered_on_chain": true,
    "date_registered": "2025-03-01T12:00:00.000000",
    "is_profile_complete": true
}
```

### Update User Profile

```http
PATCH /profiles/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "username": "new_username",
  "country": "Canada",
  "phone_number": "+1987654321",
  "email": "new_email@example.com"
}
```

**Response:**

```json
{
    "username": "new_username",
    "country": "Canada",
    "phone_number": "+1987654321",
    "email": "new_email@example.com"
}
```

### Get User's Direct Referrals

```http
GET /profiles/{id}/referrals/
Authorization: Bearer {access_token}
```

### Get User's Transactions

```http
GET /profiles/{id}/transactions/
Authorization: Bearer {access_token}
```

### Get User's Uplines

```http
GET /profiles/{id}/uplines/
Authorization: Bearer {access_token}
```

### Get User's Downlines

```http
GET /profiles/{id}/downlines/
Authorization: Bearer {access_token}
```

## Level Management

### Get All Levels

```http
GET /levels/
Authorization: Bearer {access_token}
```

**Response:**

```json
[
    {
        "level_number": 1,
        "price": 100.00,
        "min_direct_referrals": 0,
        "min_referral_depth": 0
    },
    {
        "level_number": 2,
        "price": 150.00,
        "min_direct_referrals": 3,
        "min_referral_depth": 0
    },
    {
        "level_number": 3,
        "price": 200.00,
        "min_direct_referrals": 0,
        "min_referral_depth": 2
    }
    // Additional levels...
]
```

## Blockchain Transactions

All blockchain operations follow a two-phase transaction model:

1. Phase 1: Request transaction data (unsigned)
2. Phase 2: Submit signed transaction

### Registration (Two-Phase)

#### Phase 1: Prepare Registration Transaction

```http
POST /register/
Content-Type: application/json

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "referrer_wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "username": "new_user",
  "country": "Germany",
  "phone_number": "+4912345678"
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

#### Phase 2: Submit Signed Registration Transaction

```http
POST /register/
Content-Type: application/json

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "referrer_wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "username": "new_user",
  "country": "Germany",
  "phone_number": "+4912345678",
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

This endpoint automatically increments the user's level by 1.

#### Phase 1: Prepare Upgrade Transaction

```http
POST /upgrade/
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

#### Phase 2: Submit Signed Upgrade Transaction

```http
POST /upgrade/
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

## Transactions History

### Get Transaction History

```http
GET /transactions/?wallet_address=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Authorization: Bearer {access_token}
```

**Response:**

```json
[
    {
        "id": 1,
        "user": 123,
        "user_username": "username",
        "transaction_type": "REGISTRATION",
        "amount": 115.000000,
        "level": 1,
        "recipient": 1,
        "recipient_username": "Root User",
        "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "status": "CONFIRMED",
        "created_at": "2025-03-01T12:00:00.000000",
        "updated_at": "2025-03-01T12:00:00.000000"
    },
    {
        "id": 2,
        "user": 123,
        "user_username": "username",
        "transaction_type": "UPGRADE",
        "amount": 150.000000,
        "level": 2,
        "recipient": null,
        "recipient_username": null,
        "transaction_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        "status": "CONFIRMED",
        "created_at": "2025-03-02T12:00:00.000000",
        "updated_at": "2025-03-02T12:00:00.000000"
    }
]
```

## Important Notes

### Two-Phase Transaction Model

All blockchain interactions follow a two-phase transaction model:

1. **Phase 1: Transaction Preparation**
   - Backend prepares transaction data and returns it to the frontend
   - No blockchain transaction has occurred yet
   - No funds have been transferred

2. **Phase 2: Transaction Execution**
   - Frontend gets the user to sign the transaction with their wallet
   - Signed transaction is submitted back to the backend
   - Backend submits the transaction to the blockchain
   - Funds are transferred at this point

This approach ensures:
- Users explicitly approve every transaction
- Users maintain full control of their funds
- Transparency in all blockchain operations

### Hex Values for Blockchain Transactions

All numeric values in transaction objects are provided in hexadecimal format:
- `value`: Transaction amount in wei (hex)
- `gas`: Gas limit (hex)
- `gasPrice`: Gas price in wei (hex)
- `nonce`: Transaction nonce (hex)

### Error Handling

Standard error responses:

```json
{
    "error": "Error message",
    "details": {}  // Optional additional details
}
```

Common error codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error (server-side issue)

## Level Requirements

The system implements specific requirements for level upgrades:

1. **Level 1 Registration (100 USDT + 15 USDT service fee)**
   - Requires username, country, and phone_number

2. **Level 2 Upgrade (150 USDT)**
   - Requires at least 3 direct referrals

3. **Level 3+ Upgrades**
   - Price increases by 50 USDT per level
   - Requires referral depth matching level-1
   - Profile must be complete
   - Cannot skip levels