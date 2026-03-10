# API Documentation

Base URL (local): `http://localhost:5000`

## Authentication

Admin write APIs require a JWT token in header:

`Authorization: Bearer <token>`

Get token:

### `POST /api/admin/login`

Request body:

```json
{
  "email": "admin@myura.com",
  "password": "admin123"
}
```

Success `200`:

```json
{
  "message": "Login successful",
  "token_type": "Bearer",
  "access_token": "<jwt-token>",
  "expires_in": "1d"
}
```

---

## Health

### `GET /api/health`

Success `200`:

```json
{
  "status": "ok",
  "timestamp": "2026-03-09T15:00:00.000Z"
}
```

---

## Products

### `GET /api/products`

Returns all products.

Success `200`:

```json
{
  "products": [
    {
      "id": 1,
      "product_name": "Ashwagandha Capsules",
      "price": "499.00",
      "category": "Supplements",
      "stock": 50,
      "image_url": "/uploads/products/example.png"
    }
  ]
}
```

### `POST /api/products` (Admin)

Request body:

```json
{
  "product_name": "Brahmi Powder",
  "price": 399,
  "category": "Supplements",
  "stock": 25
}
```

Success `201`:

```json
{
  "message": "Product created successfully",
  "product": {
    "id": 4,
    "product_name": "Brahmi Powder",
    "price": "399.00",
    "category": "Supplements",
    "stock": 25,
    "image_url": null
  }
}
```

### `PUT /api/products/:id/stock` (Admin)

Request body:

```json
{
  "stock": 100
}
```

Success `200`:

```json
{
  "message": "Product stock updated successfully",
  "product": {
    "id": 1,
    "stock": 100
  }
}
```

### `POST /api/products/:id/image` (Admin, Bonus)

Content type: `multipart/form-data`  
Field name: `image`  
Allowed: `jpg`, `png`, `webp`

Success `200`:

```json
{
  "message": "Product image uploaded successfully",
  "product": {
    "id": 1,
    "image_url": "/uploads/products/1773069772958-786397453.png"
  }
}
```

---

## Orders

### `POST /api/orders`

Request body:

```json
{
  "customer_name": "Aarav Sharma",
  "customer_email": "aarav@example.com",
  "customer_phone": "9999999999",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

Success `201`:

```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "customer_name": "Aarav Sharma",
    "customer_email": "aarav@example.com",
    "customer_phone": "9999999999",
    "total_amount": "1297.00",
    "status": "PLACED"
  },
  "items": [
    {
      "product_id": 1,
      "product_name": "Ashwagandha Capsules",
      "quantity": 2,
      "unit_price": 499,
      "line_total": 998
    }
  ]
}
```

Insufficient stock `409`:

```json
{
  "message": "Insufficient stock for one or more products",
  "details": {
    "items": [
      {
        "product_id": 1,
        "product_name": "Ashwagandha Capsules",
        "available_stock": 1,
        "requested_quantity": 2
      }
    ]
  }
}
```

---

## Common Error Responses

`400` Validation error:

```json
{
  "message": "Validation failed",
  "request_id": "<request-id>",
  "details": {
    "errors": ["product_name is required"]
  }
}
```

`401` Unauthorized:

```json
{
  "message": "Authorization token is required",
  "request_id": "<request-id>"
}
```

`429` Rate limited:

```json
{
  "message": "Too many requests, please try again later.",
  "request_id": "<request-id>"
}
```

