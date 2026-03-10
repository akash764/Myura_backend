const { logError } = require("../utils/logger");

function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    request_id: req.requestId
  });
}

function errorHandler(err, req, res, next) {
  const isBadJson =
    err instanceof SyntaxError &&
    Object.prototype.hasOwnProperty.call(err, "body");

  const isMulterError = err && err.name === "MulterError";

  let statusCode = isBadJson ? 400 : Number(err.statusCode) || 500;
  let message = statusCode === 500 ? "Internal server error" : err.message;

  if (isMulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxMb = Number(process.env.MAX_IMAGE_SIZE_MB || 5);
      message = `Image size exceeds the ${maxMb}MB limit`;
    } else {
      message = "Invalid image upload request";
    }
  }

  logError(err, req);

  const payload = { message, request_id: req.requestId };
  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    payload.debug = err.message;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFound,
  errorHandler
};
