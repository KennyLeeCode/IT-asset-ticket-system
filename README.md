# IT Asset and Ticket Management System

A full stack web application for managing IT assets and help desk support tickets. Built for companies that need to track hardware inventory, handle employee support requests, and manage IT workflows.

## Features

- User login with role-based access (Admin, Technician, User)
- Help desk ticket submission, assignment, and status tracking
- Device inventory management with warranty tracking
- Dashboard with live stats and expiring warranty alerts
- Assign devices to employees
- Admin user management

## Tech Stack

- **Frontend:** React, React Router, Axios, Vite
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** JWT (JSON Web Tokens) with bcrypt password hashing

## Project Structure

```
it-asset-ticket-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route logic
│   │   ├── database/       # Schema SQL and seed script
│   │   ├── middleware/      # JWT auth and role checks
│   │   └── routes/         # API route definitions
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance
│   │   ├── components/     # Navbar, PrivateRoute
    │   ├── context/        # Auth context
    │   └── pages/          # Login, Dashboard, Tickets, Assets
    └── package.json
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/KennyLeeCode/IT-asset-ticket-system.git
cd IT-asset-ticket-system
```

### 2. Set up the database

Make sure MySQL is running, then create the database:

```bash
mysql -u root -p -e "CREATE DATABASE it_asset_system;"
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials and a JWT secret key.

### 4. Install backend dependencies and run the seed script

```bash
npm install
npm run seed
```

This creates all the tables and adds a default admin account:
- **Email:** admin@company.com
- **Password:** admin123

### 5. Start the backend server

```bash
npm run dev
```

The API will be running at `http://localhost:5000`

### 6. Install and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app will be running at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create a new account |
| POST | /api/auth/login | Log in and receive a token |
| GET | /api/auth/me | Get current user profile |
| GET | /api/tickets | Get all tickets |
| POST | /api/tickets | Submit a new ticket |
| PATCH | /api/tickets/:id/status | Update ticket status |
| PATCH | /api/tickets/:id/assign | Assign ticket to technician |
| GET | /api/devices | Get all devices |
| POST | /api/devices | Add a device |
| PUT | /api/devices/:id | Update a device |
| PATCH | /api/devices/:id/assign | Assign device to user |
| GET | /api/users | Get all users (admin only) |
| PATCH | /api/users/:id/role | Change a user's role (admin only) |
