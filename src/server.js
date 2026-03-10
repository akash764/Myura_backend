require("dotenv").config();

const app = require("./app");
const { testDatabaseConnection, ensureDatabaseSchema } = require("./config/db");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await testDatabaseConnection();
    await ensureDatabaseSchema();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
