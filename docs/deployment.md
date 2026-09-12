# Hospital Management System Deployment Guide

## Requirements

- Node.js 20+
- PostgreSQL
- Git

---

# Repository

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/Ghost-HMS.git
cd Ghost-HMS
```

---

# Backend deployment

The backend lives in `server/` and can be deployed to a Node.js host such as Render or Railway.

## Install dependencies

```bash
cd server
npm ci
```

## Required environment variables

Create these variables in the deployment platform. Do not commit a real `.env` file.

```text
PORT=5000

DB_HOST=<postgres-host>
DB_PORT=5432
DB_USER=<postgres-user>
DB_PASSWORD=<postgres-password>
DB_NAME=<database-name>

JWT_SECRET=<long-random-secret-at-least-32-characters>
JWT_EXPIRES_IN=12h
NODE_ENV=production

CORS_ORIGINS=https://<your-frontend-domain>
PUBLIC_API_URL=https://<your-backend-domain>
ENABLE_API_DOCS=false
```

`CORS_ORIGINS` must contain the frontend origin(s), while `PUBLIC_API_URL` is the public backend URL used by Swagger and deployment documentation.

## Database

Create a PostgreSQL database and run:

```text
database/schema.sql
database/seed.sql
```

Run the seed script only when sample data is required.

## Start the backend

Production command:

```bash
npm start
```

---

# Frontend deployment

The frontend lives in `client/` and is built with Vite.

## Install dependencies

```bash
cd client
npm ci
```

## Configure the backend URL

Create the frontend environment variable:

```text
VITE_API_URL=https://<your-backend-domain>
```

The frontend reads this value at build time. Local development falls back to `http://localhost:5000`.

## Create the production build

```bash
npm run build
```

Deploy the generated:

```text
client/dist
```

folder to a static hosting service.

---

# Local development

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

The default local addresses are:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

# Swagger API documentation

Swagger is available locally at:

```text
http://localhost:5000/api-docs
```

For production, Swagger remains disabled unless:

```text
ENABLE_API_DOCS=true
```

is explicitly configured.

---

# Production checklist

- PostgreSQL is provisioned.
- Production environment variables are configured in the host dashboard.
- `JWT_SECRET` is a long random secret and is never committed.
- `CORS_ORIGINS` contains the deployed frontend origin.
- `PUBLIC_API_URL` points to the deployed backend.
- `VITE_API_URL` points to the deployed backend before the frontend build.
- Backend starts with `npm start`.
- Frontend builds successfully with `npm run build`.
- Only `client/dist` is deployed for the static frontend.
- `node_modules` and `.env` files are not committed.

---

# Features

- JWT Authentication
- Role-Based Access Control
- PostgreSQL Database
- Offline Synchronization
- Dashboard Statistics
- Medical Records
- Billing and Payments
- Laboratory
- Emergency Cases
- Medicine Inventory
- Prescription Management
