import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { validateUserAuth } from "../utils/validationUtils";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "../services/productService";
import { sendSuccessResponse } from "../services/apiResponse";
import logger from "../utils/logger";
import { ProductQueryParams } from "../types/QueryParams";

/**
 * @route   POST /products
 * @desc    Create a new product
 * @access  Private
 */
export const createProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const product = await createProduct(user_id, req.body);
    sendSuccessResponse(res, product, "Product created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /products/:product_id
 * @desc    Update an existing product
 * @access  Private
 */
export const updateProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product_id } = req.params;
    const updatedProduct = await updateProduct(product_id, req.body);
    sendSuccessResponse(res, updatedProduct, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/products
 * @desc    Fetch products with pagination, filtering, and field selection.
 * @access  Public
 */
export const getProductsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const params = (req.query.params as ProductQueryParams) || {};
    const products = await getProducts({ ...params, user_id });
    sendSuccessResponse(res, products, "Products fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /products/:product_id
 * @desc    Delete a product
 * @access  Private
 */
export const deleteProductHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const { product_id } = req.params;
    const result = await deleteProduct(product_id, user_id);
    sendSuccessResponse(res, result, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /products/categories
 * @desc    Fetch unique product categories
 * @access  Public
 */
export const getCategoriesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getCategories();
    sendSuccessResponse(res, categories, "Categories fetched successfully");
  } catch (error) {
    next(error);
  }
};
