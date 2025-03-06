# Xclera Matrix Marketing System - Local Development Setup

This guide provides comprehensive instructions for setting up and testing the Xclera Matrix Marketing System in a local development environment. The system consists of a Solidity smart contract deployed on a local blockchain and a Django backend that interacts with the blockchain.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
  - [1. Setting Up the Blockchain Environment](#1-setting-up-the-blockchain-environment)
  - [2. Deploying the Smart Contract](#2-deploying-the-smart-contract)
  - [3. Setting Up the Django Backend](#3-setting-up-the-django-backend)
- [Running the System](#running-the-system)
- [API Testing Guide](#api-testing-guide)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js v14+ and npm
- Python 3.8+
- MySQL or MariaDB
- Git

### Required Packages
For Node.js:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts dotenv
```

For Python:
```bash
pip install -r requirements.txt
```

## Project Structure

The project is organized into two main components:

```
xclera-matrix/
├── contracts/                  # Solidity smart contracts
│   └── SimplifiedMatrixCore.sol # Simplified Matrix contract
├── scripts/                    # Contract deployment scripts
│   └── deploy.js               # Hardhat deployment script
├── test/                       # Contract tests
│   └── MatrixCore.test.js      # Contract test suite
├── hardhat.config.js           # Hardhat configuration
├── deployments/                # Deployed contract artifacts (generated)
│   ├── contract-data.json      # Contract address and ABI
│   └── contract_abi.json       # Contract ABI only
│
└── xclera_backend/             # Django project root
    ├── manage.py               # Django management script
    ├── blockchain/             # Django project settings
    │   ├── settings.py         # Django settings with dotenv
    │   ├── urls.py             # Main URL configuration
    │   └── wsgi.py             # WSGI configuration
    └── myapp/                  # Matrix app
        ├── models.py           # Database models
        ├── views.py            # API views and endpoints
        ├── serializers.py      # API serializers
        ├── urls.py             # App URL routing
        ├── tests.py            # Django tests
        ├── services/           # Business logic services
        │   ├── blockchain.py   # Web3.py integration service
        │   └── referral.py     # Referral tree management service
        └── static/             # Static files
            └── contract_abi.json # Contract ABI (copy from deployments)
```

## Local Development Setup

### 1. Setting Up the Blockchain Environment

#### Install Hardhat and Configure the Project

If not already done:

```bash
mkdir blockchain-testing  # If the directory doesn't exist
cd blockchain-testing
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts dotenv
npx hardhat init
```

Choose "Create a JavaScript project" when prompted.

#### Create Environment File

Create a `.env` file in the project root:

```
# Django settings
DEBUG=True
SECRET_KEY=your-django-secret-key-change-me
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=xclera
DB_USER=xclera_user
DB_PASSWORD=""

# Web3 and Blockchain settings (these will be updated after deployment)
WEB3_PROVIDER_URL=http://127.0.0.1:8545
CHAIN_ID=31337
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ROOT_USER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
COMPANY_WALLET_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### Start the Local Blockchain Node

In a dedicated terminal window:

```bash
npx hardhat node
```

This will start a local Ethereum node at `http://127.0.0.1:8545` with Chain ID `31337` and display a list of 20 pre-funded accounts with their private keys.

**Example output:**
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Important**: Keep this terminal open throughout the development session. The local blockchain will reset if you close this terminal.

### 2. Deploying the Smart Contract

In a new terminal window:

#### Copy Contract to Contracts Directory

Ensure your `SimplifiedMatrixCore.sol` contract is in the `contracts/` directory.

#### Configure the Deployment Script

Create or edit `scripts/deploy.js`:

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment process...");

  // Get deployer account (first account by default)
  const [deployer, account1] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Use Account #0 as root user and Account #1 as company wallet
  const rootUser = deployer.address;
  const companyWallet = account1.address;

  console.log(`Root user: ${rootUser}`);
  console.log(`Company wallet: ${companyWallet}`);

  // Deploy the contract
  const MatrixCore = await ethers.getContractFactory("SimplifiedMatrixCore");
  const matrix = await MatrixCore.deploy(companyWallet, rootUser);
  
  await matrix.deployed();
  console.log(`Contract deployed to: ${matrix.address}`);

  // Create deployments directory if it doesn't exist
  const deployDirectory = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployDirectory)) {
    fs.mkdirSync(deployDirectory);
  }

  // Save the contract address and ABI to files
  const contractData = {
    address: matrix.address,
    abi: JSON.parse(matrix.interface.format('json'))
  };

  fs.writeFileSync(
    path.join(deployDirectory, "contract-data.json"),
    JSON.stringify(contractData, null, 2)
  );

  fs.writeFileSync(
    path.join(deployDirectory, "contract_abi.json"),
    JSON.stringify(contractData.abi, null, 2)
  );

  // Write .env values to console for easy copy/paste
  console.log("\n----- COPY THESE VALUES TO YOUR .ENV FILE -----");
  console.log(`WEB3_PROVIDER_URL=http://127.0.0.1:8545`);
  console.log(`CHAIN_ID=31337`);
  console.log(`CONTRACT_ADDRESS=${matrix.address}`);
  console.log(`ROOT_USER_ADDRESS=${rootUser}`);
  console.log(`COMPANY_WALLET_ADDRESS=${companyWallet}`);
  console.log("----------------------------------------------\n");

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### Deploy the Contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### Update Environment File

Copy the values displayed after deployment to your `.env` file. The values should match approximately these:

```
WEB3_PROVIDER_URL=http://127.0.0.1:8545
CHAIN_ID=31337
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ROOT_USER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
COMPANY_WALLET_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### Copy ABI to Django Static Directory

```bash
mkdir -p xclera_backend/myapp/static
cp deployments/contract_abi.json xclera_backend/myapp/static/
```

### 3. Setting Up the Django Backend

In a third terminal window:

#### Create and Set Up the Database

```bash
# For MySQL/MariaDB
sudo mysql -e "CREATE DATABASE xclera CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'xclera_user'@'localhost';"
sudo mysql -e "GRANT ALL PRIVILEGES ON xclera.* TO 'xclera_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Run Database Migrations

```bash
cd xclera_backend
python manage.py migrate
```

#### Initialize Level Data

```bash
python manage.py setup_initial_data
```

#### Test Database Connection (Optional)

```bash
python tests/database_test.py
```

## Running the System

### Terminal 1: Hardhat Node
```bash
npx hardhat node
```

### Terminal 2: Django Server
```bash
cd xclera_backend
python manage.py runserver
```

## API Testing Guide

### Authentication Workflow

The Xclera system uses a three-step authentication process:

1. **Request a nonce** for your wallet address
2. **Sign the nonce** with your wallet
3. **Submit the signature** to receive a JWT token

#### Step 1: Get a Nonce

**Request:**
```http
GET /api/auth/nonce/0xYourWalletAddress/
```

**Response:**
```json
{
  "message": "Sign this message to authenticate with Xclera Matrix: ab12cd34ef56",
  "nonce": "ab12cd34ef56"
}
```

#### Step 2: Sign the Message

You can use one of the private keys provided by Hardhat for testing:

**Using Web3.py (for automated testing):**
```python
from web3 import Web3
from eth_account.messages import encode_defunct

w3 = Web3()
private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"  # Account #0
message = "Sign this message to authenticate with Xclera Matrix: ab12cd34ef56"
message_hash = encode_defunct(text=message)
signed_message = w3.eth.account.sign_message(message_hash, private_key=private_key)
signature = signed_message.signature.hex()
print(signature)
```

#### Step 3: Authenticate and Get JWT Token

**Request:**
```http
POST /api/auth/authenticate/
Content-Type: application/json

{
  "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "signature": "0x...[signature from step 2]...",
  "nonce": "ab12cd34ef56"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_at": "2025-03-11T12:00:00.000000",
  "wallet_address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "profile_exists": true
}
```

### Using the JWT Token

For all authenticated requests, include the JWT token in the Authorization header:

```http
GET /api/profiles/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Key API Endpoints

1. **User Registration**
```http
POST /api/register/
Content-Type: application/json
Authorization: Bearer [token]

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "referrer_wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "private_key": "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "username": "TestUser",
  "country": "United States",
  "phone_number": "+1234567890",
  "email": "test@example.com"
}
```

2. **Update User Profile**
```http
PATCH /api/profiles/[profile_id]/
Content-Type: application/json
Authorization: Bearer [token]

{
  "username": "UpdatedName",
  "country": "Canada"
}
```

3. **Level Upgrade**
```http
POST /api/upgrade/
Content-Type: application/json
Authorization: Bearer [token]

{
  "wallet_address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "target_level": 2,
  "private_key": "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
}
```

4. **Get User Profile**
```http
GET /api/profiles/[profile_id]/
Authorization: Bearer [token]
```

5. **Search by Wallet Address**
```http
GET /api/profiles/by_wallet/?address=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Authorization: Bearer [token]
```

6. **Get User's Direct Referrals**
```http
GET /api/profiles/[profile_id]/referrals/
Authorization: Bearer [token]
```

7. **View User's Transactions**
```http
GET /api/profiles/[profile_id]/transactions/
Authorization: Bearer [token]
```

8. **Get All Levels**
```http
GET /api/levels/
Authorization: Bearer [token]
```

## Troubleshooting

### Hardhat Issues

1. **"Cannot connect to the network"**
   - Ensure the Hardhat node is running in a separate terminal
   - Check that you're using the correct port (8545)

2. **"Contract deployment failed"**
   - Check your Solidity code for errors
   - Ensure you have correct imports
   - Try increasing the gas limit

3. **"The node reset its state"**
   - This happens when the Hardhat node is restarted
   - You need to redeploy the contract and update your `.env` file

### Django Issues

1. **Database Connection Problems**
   - Ensure MySQL/MariaDB is running
   - Verify that the xclera database exists
   - Check database user permissions
   - Run `python tests/database_test.py` to test the connection

2. **Web3 Connection Issues**
   - Confirm the Hardhat node is running
   - Verify the contract address in your `.env` file
   - Check if the ABI file is in the correct location

3. **"Invalid private key" or "Invalid signature"**
   - Ensure you're using the correct private key format (with 0x prefix)
   - Verify the message being signed matches exactly what was provided

4. **"User not registered on blockchain"**
   - Ensure the registration transaction was successful
   - Check the wallet address is in the correct format

### Level Upgrade Issues

1. **"Need 3 direct referrals for Level 2"**
   - You must have three referrals before upgrading to Level 2
   - Register three users with the wallet as referrer

2. **"Insufficient referral depth"**
   - For levels above 2, you need the appropriate referral depth
   - Build out your referral tree to the required depth

3. **"Cannot skip levels"**
   - You must upgrade sequentially (Level 1 → Level 2 → Level 3, etc.)

4. **"Profile incomplete"**
   - Complete your profile (username, country, phone) for levels above 2