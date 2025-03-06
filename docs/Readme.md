# Xclera Matrix Marketing System

A centralized implementation of the Xclera Matrix Marketing System using Django backend and Solidity smart contract integration. This hybrid approach handles most of the referral tree logic in Django to save gas costs, while only performing necessary transactions on the blockchain.

## Features

- **Decentralized Registration & Payments**: All financial transactions are handled on-chain
- **Centralized Referral Management**: Complex referral tree logic is managed in Django
- **Admin Dashboard**: Complete visibility and control over the entire matrix
- **REST API**: Well-documented API for frontend integration
- **Efficient Gas Usage**: Only essential operations happen on-chain
- **Environment Configuration**: Uses dotenv for flexible environment configuration

## Technology Stack

- **Backend**: Django 4.2 with Django REST Framework
- **Blockchain**: Solidity 0.8.20 with Web3.py integration
- **Smart Contract Environment**: Hardhat for testing and deployment
- **Database**: PostgreSQL (recommended for production) or SQLite (development)
- **Configuration**: python-dotenv for environment variables

## Project Structure

```
xclera-matrix/
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignore file
├── README.md                   # Project documentation
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
│
├── contracts/                  # Solidity smart contracts
│   └── SimplifiedMatrixCore.sol # Simplified Matrix contract
│
├── scripts/                    # Contract deployment scripts
│   └── deploy.js               # Hardhat deployment script
│
├── test/                       # Contract tests
│   └── SimplifiedMatrixCore.test.js # Contract test suite
│
├── hardhat.config.js           # Hardhat configuration
│
├── deployments/                # Deployed contract artifacts (generated)
│   ├── contract-data.json      # Contract address and ABI
│   └── contract_abi.json       # Contract ABI only
│
└── matrix_project/             # Django project root
    ├── manage.py               # Django management script
    │
    ├── matrix_project/         # Django project settings
    │   ├── __init__.py
    │   ├── asgi.py
    │   ├── settings.py         # Django settings with dotenv
    │   ├── urls.py             # Main URL configuration
    │   └── wsgi.py             # WSGI configuration
    │
    └── matrix/                 # Matrix app
        ├── __init__.py
        ├── admin.py            # Admin interface configuration
        ├── apps.py             # App configuration
        ├── models.py           # Database models
        ├── serializers.py      # API serializers
        ├── views.py            # API views and endpoints
        ├── urls.py             # App URL routing
        ├── tests.py            # Django tests
        │
        ├── management/         # Django management commands
        │   └── commands/
        │       └── setup_initial_data.py # Initialize level data
        │
        ├── migrations/         # Database migrations (generated)
        │
        ├── services/           # Business logic services
        │   ├── __init__.py
        │   ├── blockchain.py   # Web3.py integration service
        │   └── referral.py     # Referral tree management service
        │
        └── static/             # Static files
            └── contract_abi.json # Contract ABI (copy from deployments)
```

## Requirements

### Python Dependencies
```
Django==4.2.7
djangorestframework==3.14.0
web3==6.11.0
python-dotenv==1.0.0
dj-database-url==2.1.0
psycopg2-binary==2.9.9  # For PostgreSQL
gunicorn==21.2.0        # For production deployments
```

### Node.js Dependencies
```
"dependencies": {
  "@openzeppelin/contracts": "^4.9.3",
  "dotenv": "^16.3.1"
},
"devDependencies": {
  "@nomicfoundation/hardhat-toolbox": "^3.0.0",
  "hardhat": "^2.17.2"
}
```

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL (optional, SQLite works for development)
- Git

### Initial Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/xclera-matrix.git
cd xclera-matrix
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env file with your configuration
```

3. Set up Python environment
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

4. Set up Node.js environment
```bash
npm install
```

### Smart Contract Deployment

1. Start a local Hardhat node (for development)
```bash
npx hardhat node
```

2. Deploy the contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Copy contract ABI to Django
```bash
mkdir -p matrix_project/matrix/static
cp deployments/contract_abi.json matrix_project/matrix/static/
```

### Django Setup

1. Apply migrations
```bash
cd matrix_project
python manage.py migrate
```

2. Initialize level data
```bash
python manage.py setup_initial_data
```

3. Create a superuser
```bash
python manage.py createsuperuser
```

4. Run the development server
```bash
python manage.py runserver
```

## Testing

### Smart Contract Tests
```bash
npx hardhat test
```

### Django Tests
```bash
cd matrix_project
python manage.py test matrix
```

## API Endpoints

The following API endpoints are available:

- `GET /api/profiles/` - List all user profiles
- `GET /api/profiles/{id}/` - Get a specific user profile
- `GET /api/profiles/{id}/referrals/` - Get direct referrals for a user
- `GET /api/profiles/{id}/transactions/` - Get transactions for a user
- `GET /api/profiles/{id}/uplines/` - Get all uplines for a user
- `GET /api/profiles/{id}/downlines/` - Get all downlines for a user
- `GET /api/levels/` - List all levels and their requirements
- `GET /api/transactions/` - List all transactions
- `POST /api/register/` - Register a new user
- `POST /api/upgrade/` - Upgrade a user's level

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This system is designed to implement a multi-level marketing structure on blockchain. Please ensure compliance with all relevant regulations in your jurisdiction before deployment.