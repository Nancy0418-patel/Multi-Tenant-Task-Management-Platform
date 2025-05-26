# Multi-Tenant Task Management Platform

A full-stack MERN application for managing tasks across multiple organizations with role-based access control.

## Features

- Multi-tenant user management with organization-based isolation
- Role-based authentication (Admin, Manager, Member)
- Task management with expiry and notifications
- Organization management dashboard
- Email-based invitation system

## Tech Stack

- MongoDB: Database
- Express.js: Backend framework
- React: Frontend framework
- Node.js: Runtime environment
- JWT: Authentication
- Docker: Containerization

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Docker and Docker Compose (for containerization)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up environment variables:
   - Create `.env` files in both `backend` and `frontend` directories
   - Copy the respective `.env.example` files and fill in the values

4. Start the development servers:
   ```bash
   npm start
   ```

## Project Structure

```
.
├── backend/           # Express.js backend
├── frontend/         # React frontend
├── docker/           # Docker configuration files
└── docs/            # Documentation
```

## API Documentation

API documentation is available at `/api-docs` when running the backend server.

## Testing

Run tests for both frontend and backend:
```bash
npm test
```

## Docker Deployment

1. Build the containers:
   ```bash
   docker-compose build
   ```

2. Run the containers:
   ```bash
   docker-compose up
   ```

## License

MIT 