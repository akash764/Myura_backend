const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsDir = path.join(process.cwd(), "uploads", "products");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);

  if (!allowedMimeTypes.has(file.mimetype)) {
    const error = new Error("Only JPG, PNG, and WEBP files are allowed");
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
}

const maxImageSizeBytes = Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024;

const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxImageSizeBytes
  }
});

module.exports = {
  uploadProductImage
};

