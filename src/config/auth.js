const isProduction = process.env.NODE_ENV === "production";

const authConfig = {
  jwtSecret: process.env.JWT_SECRET || (isProduction ? "" : "dev_only_change_this_secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  adminEmail: process.env.ADMIN_EMAIL || "admin@myura.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123"
};

function validateAuthConfig() {
  if (!authConfig.jwtSecret) {
    return "JWT_SECRET is required in production";
  }
  return null;
}

module.exports = { authConfig, validateAuthConfig };
