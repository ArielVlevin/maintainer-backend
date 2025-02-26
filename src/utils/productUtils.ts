import { NextFunction } from "express";
import { Product } from "../models/Product";

/**
 * Finds a product by ID and throws an error if not found.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Product>} - The found product document.
 * @throws {Error} - If the product does not exist.
 */
export const findProductById = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  return product;
};

/**
 * Helper function to update product tasks after deletion.
 */
export const updateProductTasks = async (
  taskId: string,
  next: NextFunction
) => {
  try {
    const affectedProducts = await Product.find({ tasks: taskId });
    for (const product of affectedProducts) {
      product.tasks = product.tasks.filter((id) => id.toString() !== taskId);
      if (product.lastOverallMaintenance?.toString() === taskId)
        product.lastOverallMaintenance = undefined;
      if (product.nextOverallMaintenance?.toString() === taskId)
        product.nextOverallMaintenance = undefined;
      await product.save();
    }
  } catch (error) {
    next(error);
  }
};
