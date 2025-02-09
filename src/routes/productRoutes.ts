import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getProductTasks,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

/**
 * Express router for handling product-related operations.
 *
 * @route POST /products
 * @description Creates a new product.
 * @access Public
 */
router.post("/", verifyToken, createProduct);

/**
 * @route GET /products
 * @description Retrieves a list of products with pagination and optional filtering.
 * @access Public
 */
router.get("/", verifyToken, getProducts);

/**
 * @route GET /products/categories
 * @description Retrieves a list of unique product categories.
 * @access Public
 */
router.get("/categories", verifyToken, getCategories);

/**
 * @route GET /products/:product_id
 * @description Retrieves a specific product by its ID.
 * @param product_id - The ID of the product to retrieve.
 * @access Public
 */
router.get("/:product_id", verifyToken, getProductById);

/**
 * @route GET /products/:product_id/tasks
 * @description Retrieves all maintenance tasks associated with a product.
 * @param product_id - The ID of the product whose tasks are to be fetched.
 * @access Public
 */
router.get("/:product_id/tasks", verifyToken, getProductTasks);

/**
 * @route PUT /products/:product_id
 * @description Updates a product by its ID.
 * @param product_id - The ID of the product to update.
 * @access Public
 */
router.put("/:product_id", verifyToken, updateProduct);

/**
 * @route DELETE /products/:product_id
 * @description Deletes a product by its ID.
 * @param product_id - The ID of the product to delete.
 * @access Public
 */
router.delete("/:product_id", verifyToken, deleteProduct);

export default router;
