const jwt = require("jsonwebtoken");
const { authConfig, validateAuthConfig } = require("../config/auth");
const ApiError = require("../utils/ApiError");

function getBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function requireAdminAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  const authConfigError = validateAuthConfig();
  if (authConfigError) {
    return next(new ApiError(500, authConfigError));
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);

    if (!decoded || decoded.role !== "admin") {
      return next(new ApiError(403, "Admin access required"));
    }

    req.admin = {
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token has expired"));
    }
    return next(new ApiError(401, "Invalid authorization token"));
  }
}

module.exports = { requireAdminAuth };
