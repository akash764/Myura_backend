const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "myura_backend",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}

async function ensureDatabaseSchema() {
  const dbName = process.env.DB_NAME || "myura_backend";
  const [columnRows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME = 'image_url'
    `,
    [dbName]
  );

  if (Number(columnRows[0].total) === 0) {
    await pool.execute("ALTER TABLE products ADD COLUMN image_url VARCHAR(500) NULL");
  }
}

module.exports = { pool, testDatabaseConnection, ensureDatabaseSchema };
