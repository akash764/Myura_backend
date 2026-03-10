const fs = require("fs");
const path = require("path");

const logsDir = path.join(process.cwd(), "logs");
const errorLogFile = path.join(logsDir, "error.log");
const accessLogFile = path.join(logsDir, "access.log");

function ensureLogDirectory() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function getAccessLogStream() {
  ensureLogDirectory();
  return fs.createWriteStream(accessLogFile, { flags: "a" });
}

function logError(error, req) {
  ensureLogDirectory();

  const entry = {
    timestamp: new Date().toISOString(),
    request_id: req.requestId,
    method: req.method,
    url: req.originalUrl,
    status_code: Number(error.statusCode) || 500,
    message: error.message,
    stack: error.stack
  };

  fs.appendFile(errorLogFile, JSON.stringify(entry) + "\n", "utf8", () => {});
}

module.exports = { logError, getAccessLogStream };
