import { Router } from "express";
import {
  createProductHandler,
  getProductsHandler,
  updateProductHandler,
  deleteProductHandler,
  getCategoriesHandler,
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
router.post("/", createProductHandler);

/**
 * @route GET /products
 * @description Retrieves a list of products with pagination and optional filtering.
 * @access Public
 */
router.get("/", getProductsHandler);

/**
 * @route GET /products/categories
 * @description Retrieves a list of unique product categories.
 * @access Public
 */
router.get("/categories", getCategoriesHandler);

/**
 * @route PUT /products/:product_id
 * @description Updates a product by its ID.
 * @param product_id - The ID of the product to update.
 * @access Public
 */
router.put("/:product_id", updateProductHandler);

/**
 * @route DELETE /products/:product_id
 * @description Deletes a product by its ID.
 * @param product_id - The ID of the product to delete.
 * @access Public
 */
router.delete("/:product_id", deleteProductHandler);

export default router;
