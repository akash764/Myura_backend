const { timingSafeEqual } = require("crypto");
const jwt = require("jsonwebtoken");

const { authConfig, validateAuthConfig } = require("../config/auth");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function secureCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

const loginAdmin = asyncHandler(async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const authConfigError = validateAuthConfig();
  if (authConfigError) {
    throw new ApiError(500, authConfigError);
  }

  const isEmailValid = secureCompare(
    email.toLowerCase(),
    authConfig.adminEmail.toLowerCase()
  );
  const isPasswordValid = secureCompare(password, authConfig.adminPassword);

  if (!isEmailValid || !isPasswordValid) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = jwt.sign(
    { role: "admin", email: authConfig.adminEmail.toLowerCase() },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );

  res.status(200).json({
    message: "Login successful",
    token_type: "Bearer",
    access_token: token,
    expires_in: authConfig.jwtExpiresIn
  });
});

module.exports = { loginAdmin };
