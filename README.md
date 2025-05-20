# Mini Wallet System with Monnify Integration

A dockerized full-stack application that allows users to manage a digital wallet, fund it via Monnify payment gateway, and view transaction history.

## Project Structure

```
mini-wallet-system/
├── backend/               # Django backend application
│   ├── wallet/            # Main Django project
│   ├── api/               # API endpoints
│   ├── users/             # User authentication
│   ├── transactions/      # Transaction management
│   ├── Dockerfile         # Backend Docker configuration
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend application
│   ├── public/            # Static files
│   ├── src/               # React source code
│   ├── Dockerfile         # Frontend Docker configuration
│   └── package.json       # Node.js dependencies
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

## Features

- User Authentication (Register/Login with JWT)
- Wallet Management
  - View Balance
  - Fund Wallet via Monnify
- Transaction History
- Dockerized Deployment

## Tech Stack

- **Backend**: Django, Django REST Framework, PostgreSQL, JWT
- **Frontend**: React, Axios, React Router
- **Deployment**: Docker, Docker Compose
- **Payment Integration**: Monnify Sandbox API

## Setup and Installation

### Prerequisites

- Docker and Docker Compose installed
- Monnify Sandbox API credentials

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Database
DB_NAME=wallet_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Django
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Monnify API
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code
MONNIFY_BASE_URL=https://sandbox.monnify.com/api/v1
```

### Running the Application

1. Clone the repository
2. Navigate to the project directory
3. Run the application with Docker Compose:

```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/

## API Endpoints

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT token
- `GET /api/wallet/balance/` - Get wallet balance
- `POST /api/wallet/fund/` - Initialize wallet funding
- `GET /api/transactions/` - Get transaction history

## Docker Hub

The Docker image is available at: `dockerhub-username/wallet-system:v1.0`
