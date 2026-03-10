# Myura Backend Assignment

A simple backend assignment project for Myura Wellness.

## Stack

- Node.js (Express)
- MySQL
- Basic HTML/CSS/JS UI

## What it does

- `GET /api/products` - get all products
- `POST /api/products` - add product
- `PUT /api/products/:id/stock` - update stock
- `POST /api/orders` - place order and reduce stock
- Prevents order when stock is insufficient (`409`)

## Bonus implemented

- `POST /api/admin/login` for JWT token
- Admin auth required for product write APIs
- Rate limiting (global + login + orders)
- Error logging to `logs/error.log` and access log to `logs/access.log`
- `POST /api/products/:id/image` to upload product image (JPG/PNG/WEBP)

## Run locally

1. Create a `.env` file from `.env.example`
2. Run `db/schema.sql` in MySQL
3. Optional: run `db/seed.sql`
4. Install and start:

```bash
npm install
npm run dev
```

Server: `http://localhost:5000`  
UI: `http://localhost:5000/`  
Health: `http://localhost:5000/api/health`

Note for existing DB: rerun `db/schema.sql` once so `products.image_url` is added.
For admin login, use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`.

## Admin login example

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myura.com","password":"admin123"}'
```

## Deployment (fill before submission)

- Live URL: `TODO`
- Backend API URL: `TODO`
- DB details: `TODO`

## API docs

See: `docs/API_DOCUMENTATION.md`
