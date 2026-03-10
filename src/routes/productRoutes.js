const express = require("express");
const {
  getProducts,
  createProduct,
  updateProductStock,
  updateProductImage
} = require("../controllers/productController");
const { requireAdminAuth } = require("../middleware/authMiddleware");
const { uploadProductImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.post("/", requireAdminAuth, createProduct);
router.put("/:id/stock", requireAdminAuth, updateProductStock);
router.post(
  "/:id/image",
  requireAdminAuth,
  uploadProductImage.single("image"),
  updateProductImage
);

module.exports = router;
