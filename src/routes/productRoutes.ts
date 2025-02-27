import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController";
import {
  ensureEmailVerified,
  verifyToken,
} from "../middlewares/authMiddleware";

const router = Router();

router.use(verifyToken);
router.use(ensureEmailVerified);

/**
 * Express router for handling product-related operations.
 *
 * @route POST /products
 * @description Creates a new product.
 * @access Public
 */
router.post("/", createProduct);

/**
 * @route GET /products
 * @description Retrieves a list of products with pagination and optional filtering.
 * @access Public
 */
router.get("/", getProducts);

/**
 * @route GET /products/categories
 * @description Retrieves a list of unique product categories.
 * @access Public
 */
router.get("/categories", getCategories);

/**
 * @route PUT /products/:product_id
 * @description Updates a product by its ID.
 * @param product_id - The ID of the product to update.
 * @access Public
 */
router.put("/:product_id", updateProduct);

/**
 * @route DELETE /products/:product_id
 * @description Deletes a product by its ID.
 * @param product_id - The ID of the product to delete.
 * @access Public
 */
router.delete("/:product_id", deleteProduct);

export default router;
