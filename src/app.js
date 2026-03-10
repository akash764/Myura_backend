const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const requestContext = require("./middleware/requestContext");
const { getAccessLogStream } = require("./utils/logger");

const app = express();

const requestLogFormat = ":method :url :status :response-time ms req_id=:requestId";

function createRateLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message,
        request_id: req.requestId
      });
    }
  });
}

const apiLimiter = createRateLimiter(
  Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  Number(process.env.RATE_LIMIT_MAX_REQUESTS || 300),
  "Too many requests, please try again later."
);

const loginLimiter = createRateLimiter(
  Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
  "Too many login attempts, please try again later."
);

const orderLimiter = createRateLimiter(
  Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  Number(process.env.ORDER_RATE_LIMIT_MAX || 80),
  "Too many order requests, please try again later."
);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);
morgan.token("requestId", (req) => req.requestId || "-");
app.use(morgan(requestLogFormat));
app.use(morgan(requestLogFormat, { stream: getAccessLogStream() }));
app.use("/api", apiLimiter);
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/admin/login", loginLimiter);
app.use("/api/orders", orderLimiter);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  return res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
