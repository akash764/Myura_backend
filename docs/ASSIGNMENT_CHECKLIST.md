# Assignment Checklist

Use this checklist before final submission.

## Core tasks

- [x] Task 1: Product APIs (`GET /api/products`, `POST /api/products`, `PUT /api/products/:id/stock`)
- [x] Task 2: Order API (`POST /api/orders`) with stock deduction and insufficient stock protection
- [x] Task 3: Security basics (SQL injection prevention, validation, error handling)
- [x] Task 4: Basic UI for product list, add product, place order
- [ ] Task 5: Public deployment completed

## Submission requirements

- [ ] GitHub repository link added
- [x] Database schema created by you (`db/schema.sql`)
- [x] API documentation in README
- [ ] README contains final live URLs (frontend + backend)
- [ ] README contains final production DB setup details
- [ ] README contains exact deployment steps followed by you

## Bonus tasks

- [x] JWT auth for admin APIs
- [x] API rate limiting
- [x] Backend error logging
- [x] Product image upload API

## Final manual checks

- [ ] `/api/health` works on deployed backend
- [ ] `/api/products` works on deployed backend
- [ ] Create product works on deployed backend
- [ ] Place order works on deployed backend
- [ ] Insufficient stock returns `409` with clear message
