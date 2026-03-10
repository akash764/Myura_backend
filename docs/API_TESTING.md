# API Testing Quick Guide

Base URL (local): `http://localhost:5000`

## 1) Admin login (bonus)

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@myura.com",
    "password": "admin123"
  }'
```

Use the returned token as:

`Authorization: Bearer <token>`

## 2) Health

```bash
curl http://localhost:5000/api/health
```

## 3) Get products

```bash
curl http://localhost:5000/api/products
```

## 4) Create product (admin token required)

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Cold Pressed Oil",
    "price": 650,
    "category": "Nutrition",
    "stock": 20
  }'
```

## 5) Update stock (admin token required)

```bash
curl -X PUT http://localhost:5000/api/products/1/stock \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "stock": 70 }'
```

## 6) Upload product image (bonus)

```bash
curl -X POST http://localhost:5000/api/products/1/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@./sample.png"
```

## 7) Place order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Demo User",
    "customer_email": "demo@example.com",
    "customer_phone": "9999999999",
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 2, "quantity": 1 }
    ]
  }'
```

## 8) Insufficient stock check

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Demo User",
    "customer_email": "demo@example.com",
    "items": [
      { "product_id": 1, "quantity": 99999 }
    ]
  }'
```
