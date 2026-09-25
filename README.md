# NovaCart

NovaCart is a full-stack e-commerce platform built with React, Node.js, Express, and MongoDB. It provides product browsing, authentication, shopping cart management, wishlists, reviews, orders, categories, and secure user accounts.

## Tech stack

- **Frontend:** React 19, React Router, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express 5, JWT authentication, bcryptjs
- **Database:** MySQL 8 with `mysql2`
- **Build:** Vite production bundles served by the Express server

## Features

- Product browsing, search, category filters, sorting, deals, and product details
- Customer sign-up, sign-in, profile updates, and order history
- Cart and checkout flow with stock-aware order creation
- Wishlist and product reviews
- Admin dashboard for products, categories, customers, orders, reviews, analytics, and settings
- JWT-protected customer and administrator API routes
- MySQL schema and sample catalog data

## Project structure

```text
.
├── client/                  # React/Vite storefront
│   ├── public/              # Static assets
│   └── src/                 # Pages, components, contexts, and API client
├── database/                # MySQL schema and seed data
├── server/                  # Express API and authentication
│   ├── data/                # Server-side catalog data
│   └── scripts/seed.js      # Database setup and seed script
├── .gitignore
├── package.json             # Root development scripts
└── README.md
```

## Requirements

- Node.js 20.19 or newer
- npm
- MySQL 8.0 or newer

## Getting started

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

This installs the root, server, and client dependencies.

### 2. Configure the API

Create the server environment file:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Set the MySQL connection and a strong JWT secret in `server/.env`:

```env
PORT=5000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=novacart
MYSQL_CONNECTION_LIMIT=10
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173
```

Use the port and credentials for your local MySQL instance. The API does not start until it can connect to the configured database.

### 3. Seed the database

```bash
npm run seed
```

The seed command runs `database/schema.sql` and `database/seed.sql`. It creates the NovaCart tables, sample categories, products, customers, orders, and development accounts. It is destructive for the NovaCart database because the schema resets those tables; do not run it against a database containing data you need to keep.

### 4. Start development servers

```bash
npm run dev
```

The storefront runs at `http://localhost:5173` and the API runs at `http://localhost:5000`. Vite proxies `/api` requests to the Express server.

Check the API with:

```text
GET http://localhost:5000/api/health
```

## Development accounts

The seeded data includes these development-only accounts:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `aarav@example.com` | `Customer123!` |
| Admin | `admin@novacart.local` | `Admin123!` |

Change or remove these accounts before deploying publicly.

## Available scripts

Run these commands from the project root:

| Command | Description |
| --- | --- |
| `npm run install:all` | Install root, server, and client dependencies |
| `npm run dev` | Start the client and API together |
| `npm run dev:client` | Start only the Vite client |
| `npm run dev:server` | Start only the Express API |
| `npm run seed` | Create the schema and load sample data |
| `npm run build` | Build the client for production |
| `npm start` | Start the API and serve `client/dist` when present |

To serve a production build locally:

```bash
npm run build
npm start
```

## API overview

The API is mounted under `/api`. Protected endpoints require an `Authorization: Bearer <token>` header.

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `GET /api/auth/me/orders`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/deals`
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews`
- `POST /api/orders`
- Admin product, category, order, customer, review, dashboard, analytics, and settings endpoints

Product listing supports `search`, `category`, `deal`, `tag`, `min`, `max`, and `sort` query parameters.

## Security notes

- Never commit `.env` files, database credentials, or real JWT secrets.
- Use a long, random `JWT_SECRET` outside local development.
- Restrict `CORS_ORIGINS` to the deployed client origins.
- Replace the seeded development passwords before production use.
- Add a real payment provider before treating the sandbox payment records as live payments.
