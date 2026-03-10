const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  validateCreateProductPayload,
  validateStockUpdatePayload
} = require("../utils/validation");

function resolveFilePathFromUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  const relativePath = imageUrl.replace(/^\/+/, "");
  return path.join(process.cwd(), relativePath);
}

const getProducts = asyncHandler(async (req, res) => {
  const category = req.query.category ? String(req.query.category).trim() : "";
  let query = `
    SELECT id, product_name, price, category, stock, image_url, created_at, updated_at
    FROM products
  `;
  const params = [];

  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }

  query += " ORDER BY id DESC";

  const [rows] = await pool.execute(query, params);
  res.status(200).json({ products: rows });
});

const createProduct = asyncHandler(async (req, res) => {
  const { value, errors } = validateCreateProductPayload(req.body);
  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", { errors });
  }

  const { product_name, price, category, stock } = value;

  const [result] = await pool.execute(
    `
      INSERT INTO products (product_name, price, category, stock)
      VALUES (?, ?, ?, ?)
    `,
    [product_name, price, category, stock]
  );

  const [createdRows] = await pool.execute(
    `
      SELECT id, product_name, price, category, stock, image_url, created_at, updated_at
      FROM products
      WHERE id = ?
    `,
    [result.insertId]
  );

  res.status(201).json({
    message: "Product created successfully",
    product: createdRows[0]
  });
});

const updateProductStock = asyncHandler(async (req, res) => {
  const { value, errors } = validateStockUpdatePayload(req.params, req.body);
  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", { errors });
  }

  const { productId, stock } = value;

  const [updateResult] = await pool.execute(
    `
      UPDATE products
      SET stock = ?
      WHERE id = ?
    `,
    [stock, productId]
  );

  if (updateResult.affectedRows === 0) {
    throw new ApiError(404, "Product not found");
  }

  const [rows] = await pool.execute(
    `
      SELECT id, product_name, price, category, stock, image_url, created_at, updated_at
      FROM products
      WHERE id = ?
    `,
    [productId]
  );

  res.status(200).json({
    message: "Product stock updated successfully",
    product: rows[0]
  });
});

const updateProductImage = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new ApiError(400, "id must be a positive integer");
  }

  if (!req.file) {
    throw new ApiError(400, "image file is required");
  }

  const imageUrl = `/uploads/products/${req.file.filename}`;

  const [existingRows] = await pool.execute(
    `
      SELECT id, image_url
      FROM products
      WHERE id = ?
    `,
    [productId]
  );

  if (existingRows.length === 0) {
    fs.unlinkSync(req.file.path);
    throw new ApiError(404, "Product not found");
  }

  const previousImageUrl = existingRows[0].image_url;

  await pool.execute(
    `
      UPDATE products
      SET image_url = ?
      WHERE id = ?
    `,
    [imageUrl, productId]
  );

  if (previousImageUrl && previousImageUrl !== imageUrl) {
    const previousPath = resolveFilePathFromUrl(previousImageUrl);
    if (previousPath && fs.existsSync(previousPath)) {
      fs.unlinkSync(previousPath);
    }
  }

  const [updatedRows] = await pool.execute(
    `
      SELECT id, product_name, price, category, stock, image_url, created_at, updated_at
      FROM products
      WHERE id = ?
    `,
    [productId]
  );

  res.status(200).json({
    message: "Product image uploaded successfully",
    product: updatedRows[0]
  });
});

module.exports = {
  getProducts,
  createProduct,
  updateProductStock,
  updateProductImage
};
