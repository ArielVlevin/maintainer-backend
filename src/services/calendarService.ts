import { Task } from "../models/Task";
import { Product } from "../models/Product";
import { DBError } from "../utils/CustomError";
import { id } from "../types/MongoDB";
import { findProductById } from "./productService";

/**
 * Fetch all maintenance tasks for a user in a calendar format.
 * @param userId - The authenticated user ID.
 * @returns A structured list of calendar events.
 */
export const getUserTasksForCalendar = async (user_id: id) => {
  if (!user_id) throw new DBError("Unauthorized: No user found");

  // Fetch all user tasks
  const tasks = await Task.find({ user_id }).lean();

  // Extract unique product IDs
  const productIds = tasks.map((task) => task.product_id);
  const products = await Product.find({ _id: { $in: productIds } })
    .select("_id name")
    .lean();

  // Create a map of product names by ID
  const productMap = new Map(
    products.map((prod) => [prod._id.toString(), prod.name])
  );

  // Structure events for the calendar
  return tasks.map((task) => ({
    _id: task._id,
    title: task.taskName,
    description: task.description,
    start: task.nextMaintenance,
    end: task.nextMaintenance,
    product: {
      _id: task.product_id,
      name: productMap.get(task.product_id.toString()) || "Unknown Product",
    },
  }));
};

/**
 * Fetch all maintenance tasks for a specific product in a calendar format.
 * @param productId - The product ID.
 * @returns A structured list of calendar events for the product.
 */
export const getProductTasksForCalendar = async (product_id: id | string) => {
  if (!product_id) throw new DBError("Product ID is required");
  // Fetch tasks for the given product
  const tasks = await Task.find({ product_id }).lean();
  // Fetch product name
  const product = await findProductById(product_id);
  // Structure events for the calendar
  return tasks.map((task) => ({
    _id: task._id,
    title: task.taskName,
    description: task.description,
    start: task.nextMaintenance,
    end: task.nextMaintenance,
    product: {
      _id: product._id,
      name: product.name,
    },
  }));
};
