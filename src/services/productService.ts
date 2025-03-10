import { NextFunction } from "express";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { logAction } from "../services/logAction";
import { DBError } from "../utils/CustomError";
import { id, isValidId } from "../types/MongoDB";
import { updateData, updateEntity } from "../utils/updateData";
import logger from "../utils/logger";
import { extractTags } from "../utils/stringUtils";
import { Task } from "../models/Task";
import { ProductQueryParams } from "../types/QueryParams";

/**
 * Finds a product by ID and throws an error if not found.
 * @param {id} product_id - The ID of the product.
 * @returns {Promise<Product>} - The found product document.
 * @throws {Error} - If the product does not exist.
 */
export const findProductById = async (product_id: string | id) => {
  if (!isValidId(product_id)) throw new DBError("Invalid Product ID");
  const product = await Product.findById(product_id);
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

/**
 * Creates a new product and adds it to the user's list.
 * @param user_id - The ID of the user creating the product.
 * @param productData - The product data.
 * @returns The created product.
 */
export const createProduct = async (user_id: id, productData: any) => {
  const { name, category, manufacturer, model, tags, purchaseDate, iconUrl } =
    productData;

  const url = iconUrl || "/uploads/default-product.png";

  const newProduct = new Product({
    name,
    user_id,
    category,
    manufacturer,
    model,
    tags,
    purchaseDate,
    tasks: [],
    iconUrl: url,
  });

  console.log("*****createProduct:::: newProduct", newProduct);
  await newProduct.save();

  await User.findByIdAndUpdate(user_id, {
    $push: { products: newProduct._id },
  });

  /*
  await logAction(
    user_id,
    "CREATE",
    "PRODUCT",
    newProduct._id,
    `Product "${newProduct.name}" was created`
  );
*/
  return newProduct;
};

/**
 * Updates an existing product.
 * @param product_id - The ID of the product.
 * @param updatedData - The new product data.
 * @returns The updated product.
 */
export const updateProduct = async (
  product_id: id | string,
  updatedData: any
) => {
  return updateEntity(findProductById, product_id, updatedData);
};
/**
 * Fetches products with filtering, pagination, and field selection.
 * @param queryParams - Query parameters for filtering and pagination.
 * @returns List of products.
 */
export const getProducts = async (queryParams: ProductQueryParams) => {
  const {
    product_id,
    slug,
    page = "1",
    limit = "10",
    search,
    category,
    fields,
    userOnly = true,
    user_id,
  } = queryParams;

  const pageNumber = Math.max(parseInt(page as string, 10), 1);
  const limitNumber = Math.max(parseInt(limit as string, 10), 1);
  const skip = (pageNumber - 1) * limitNumber;

  if (product_id || slug) {
    let product;
    if (product_id) {
      if (!isValidId(product_id)) throw new DBError("Invalid Product ID");

      product = await Product.findById(product_id)
        .populate("lastOverallMaintenance")
        .populate("nextOverallMaintenance")
        .lean();
    } else if (slug) {
      product = await Product.findOne({ slug })
        .populate("lastOverallMaintenance")
        .populate("nextOverallMaintenance")
        .lean();
    }
    if (!product) throw new DBError("Product not found");

    return {
      success: true,
      items: [product],
      total: 1,
      page: 1,
      totalPages: 1,
    };
  }

  const query: any = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (userOnly && user_id) query.user_id = user_id;

  const fieldsParam = Array.isArray(fields) ? fields[0] : fields;
  const projection = fieldsParam
    ? fieldsParam.toString().split(",").join(" ") + " _id"
    : "";

  const products = await Product.find(query)
    .select(projection)
    .skip(skip)
    .limit(limitNumber)
    .populate("lastOverallMaintenance")
    .populate("nextOverallMaintenance")
    .lean();

  const total = await Product.countDocuments(query);

  return {
    success: true,
    items: products,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

/**
 * Deletes a product.
 * @param product_id - The ID of the product to delete.
 * @returns Deletion success message.
 */
export const deleteProduct = async (product_id: id | string, user_id: id) => {
  const product = await findProductById(product_id);
  await product.deleteOne();
  await User.findByIdAndUpdate(user_id, { $pull: { products: product_id } });

  /*
  await logAction(
    user_id,
    "DELETE",
    "PRODUCT",
    product_id as id,
    `Product "${product.name}" was deleted`
  );
*/
  return { message: "Product deleted successfully" };
};

/**
 * Fetches unique product categories.
 * @returns A list of categories.
 */
export const getCategories = async () => {
  const categories = await Product.distinct("category");
  return categories.filter((category) => category && category.trim() !== "");
};

/**
 * Automatically updates a product's status based on its tasks.
 *
 * @param productId - The ID of the product to update
 */
export const updateProductStatus = async (product_id: string | id) => {
  try {
    const product = await findProductById(product_id);
    const tasks = await Task.find({ product_id: product_id });

    let newStatus = "healthy";

    if (tasks.length)
      if (tasks.some((task) => task.status === "overdue"))
        newStatus = "overdue";
      else if (tasks.some((task) => task.status === "maintenance"))
        newStatus = "maintenance";

    if (product.status !== newStatus) {
      await Product.findByIdAndUpdate(product_id, { status: newStatus });
      logger.info(
        `🔄 Product ${product_id} status updated to ${newStatus.toUpperCase()}`
      );
    }
  } catch (error) {
    logger.error("❌ Error updating product status:", error);
  }
};
