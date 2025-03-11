# Xclera Matrix Marketing System

A secure and transparent multi-level marketing platform built on blockchain technology with centralized management capabilities.

## Overview

The Xclera Matrix Marketing System is a hybrid application that combines the security and transparency of blockchain technology with the efficiency of traditional database management. This innovative approach allows for trustless financial transactions while maintaining high performance for complex referral relationship management.

The system implements a 19-level membership structure where participants can earn rewards by recruiting others and upgrading their own membership levels. All financial transactions are handled on the blockchain, ensuring complete transparency and immutability, while the complex referral relationships are managed efficiently in a traditional database.

## Key Features

- **Blockchain-Secured Transactions**: All payments and rewards are processed on-chain for full transparency
- **Wallet-Based Authentication**: Secure user authentication using cryptographic wallet signatures
- **Two-Phase Transaction Model**: Transactions are prepared, signed by users, and then submitted to the blockchain
- **19-Level Membership Structure**: Progressive membership levels with increasing benefits and costs
- **Direct and Indirect Rewards**: Earn from both direct referrals and your extended network
- **Complete Admin Dashboard**: Full visibility and control over the entire matrix structure
- **Comprehensive API**: Well-documented API for seamless frontend integration
- **Gas-Efficient Design**: Optimized smart contract to minimize blockchain transaction costs

## Technology Stack

- **Smart Contract**: Solidity 0.8.20 on Binance Smart Chain (BSC)
- **Smart Contract Environment**: Hardhat for development, testing, and deployment
- **Backend Framework**: Django 4.2 with Django REST Framework
- **Blockchain Integration**: Web3.py for contract interaction
- **Database**: MySQL/MariaDB for production, SQLite for development
- **Authentication**: JWT tokens with wallet signature verification
- **Configuration**: Environment variables via python-dotenv

## System Architecture

The system uses a hybrid architecture:

1. **Smart Contract Layer**: Handles all financial transactions (registration fees, level upgrades, reward distribution)
2. **Django Backend**: Manages user profiles, referral relationships, and business logic
3. **Database Layer**: Stores the complete referral tree structure and transaction history
4. **Authentication System**: Verifies wallet ownership through cryptographic signatures
5. **API Layer**: Provides endpoints for frontend integration

This architecture combines the best of both worlds:
- **Security & Transparency**: Financial transactions are secured by blockchain
- **Performance & Flexibility**: Complex referral logic is handled efficiently in a traditional database
- **User Experience**: Two-phase transaction model keeps users in control of their funds

## Membership Structure

The system implements a 19-level membership structure:

- **Level 1**: Entry level (100 USDT)
- **Level 2**: Requires 3 direct referrals (150 USDT)
- **Levels 3-19**: Require referral depth matching level - 1 (price increases by 50 USDT per level)

For each upgrade transaction:
- 20% of the upgrade fee goes to the company wallet
- 80% goes to the eligible upline (member who is at or above the target level)

This creates a powerful incentive structure that rewards active participants and encourages network growth.

## Quick Start

### Prerequisites
- Node.js v14+ and npm
- Python 3.8+
- MySQL or MariaDB
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xclera-matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create MySQL database and user
   sudo mysql -e "CREATE DATABASE xclera CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   sudo mysql -e "CREATE USER 'xclera_user'@'localhost';"
   sudo mysql -e "GRANT ALL PRIVILEGES ON xclera.* TO 'xclera_user'@'localhost';"
   sudo mysql -e "FLUSH PRIVILEGES;"
   ```

5. **Start local blockchain and deploy contract**
   ```bash
   # In terminal 1: Start Hardhat node
   npx hardhat node
   
   # In terminal 2: Run automated setup
   python setup.py
   ```

6. **Start Django server**
   ```bash
   cd xclera_backend
   python manage.py runserver
   ```

7. **Access the API at http://localhost:8000/api/**

For detailed setup instructions and API documentation, see the [Developer Guide](docs/DeveloperGuide.md).

## Project Structure

```
xclera-matrix/
├── contracts/                  # Solidity smart contracts
├── scripts/                    # Deployment scripts
├── test/                       # Smart contract tests
├── setup.py                    # Automated deployment script
├── hardhat.config.js           # Hardhat configuration
│
└── xclera_backend/             # Django backend
    ├── blockchain/             # Project settings
    └── myapp/                  # Main application
        ├── models.py           # Database models
        ├── views.py            # API endpoints
        ├── services/           # Business logic
        │   ├── blockchain.py   # Web3 integration
        │   └── referral.py     # Referral management
        └── management/         # Django commands
            └── commands/
                ├── create_root_user.py
                └── setup_initial_data.py
```

## Documentation

- [Developer Guide](docs/DeveloperGuide.md): Detailed technical documentation
- API Documentation: Available at `/api/docs/` when running the server
- [Smart Contract Documentation](contracts/README.md): Solidity contract details

## License

This project is licensed under the MIT License.