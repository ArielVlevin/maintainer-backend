import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../models/AuthRequest";
import { validateUserAuth } from "../utils/validationUtils";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "../services/productService";

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
    res.status(201).json(product);
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
    res.json(updatedProduct);
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
    const user_id = req.user?._id?.toString();
    const products = await getProducts({ ...req.query, user_id });
    res.status(200).json(products);
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
    res.json(result);
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
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
