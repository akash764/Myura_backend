const { pool } = require("../config/db");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { validateCreateOrderPayload } = require("../utils/validation");

const createOrder = asyncHandler(async (req, res) => {
  const { value, errors } = validateCreateOrderPayload(req.body);
  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", { errors });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = value.items.map((item) => item.product_id);
    const placeholders = productIds.map(() => "?").join(",");

    const [productRows] = await connection.execute(
      `
        SELECT id, product_name, price, stock
        FROM products
        WHERE id IN (${placeholders})
        FOR UPDATE
      `,
      productIds
    );

    const productMap = new Map(productRows.map((product) => [product.id, product]));

    const missingProductIds = productIds.filter((id) => !productMap.has(id));
    if (missingProductIds.length > 0) {
      throw new ApiError(400, "Some products do not exist", {
        missing_product_ids: missingProductIds
      });
    }

    const insufficientItems = [];
    const orderItems = [];
    let totalAmount = 0;

    for (const item of value.items) {
      const product = productMap.get(item.product_id);

      if (product.stock < item.quantity) {
        insufficientItems.push({
          product_id: product.id,
          product_name: product.product_name,
          available_stock: product.stock,
          requested_quantity: item.quantity
        });
        continue;
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.product_name,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal
      });
    }

    if (insufficientItems.length > 0) {
      throw new ApiError(409, "Insufficient stock for one or more products", {
        items: insufficientItems
      });
    }

    const [orderResult] = await connection.execute(
      `
        INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, status)
        VALUES (?, ?, ?, ?, 'PLACED')
      `,
      [
        value.customer_name,
        value.customer_email,
        value.customer_phone || null,
        totalAmount
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.execute(
        `
          UPDATE products
          SET stock = stock - ?
          WHERE id = ?
        `,
        [item.quantity, item.product_id]
      );

      await connection.execute(
        `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
    }

    await connection.commit();

    const [orderRows] = await connection.execute(
      `
        SELECT id, customer_name, customer_email, customer_phone, total_amount, status, created_at
        FROM orders
        WHERE id = ?
      `,
      [orderId]
    );

    res.status(201).json({
      message: "Order placed successfully",
      order: orderRows[0],
      items: orderItems
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = { createOrder };
