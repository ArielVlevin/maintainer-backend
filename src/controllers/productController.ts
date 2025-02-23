import { NextFunction, Request, Response } from "express";
import { Product } from "../models/Product";
import { Task } from "../models/Task";
import { AuthRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import mongoose from "mongoose";

/**
 * @route   POST /products
 * @desc    Create a new product
 * @access  Public
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, manufacturer, model, tags, purchaseDate, iconUrl } =
      req.body;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    const url = iconUrl || "/uploads/default-product.png";

    const user_id = req.user._id;

    const newProduct = new Product({
      name,
      user_id,
      category,
      manufacturer,
      model,
      tags: tags, //todo: repair? tags.split(",").map((tag: string) => tag.trim()) : [],
      purchaseDate,
      tasks: [],
      iconUrl: url,
    });

    await newProduct.save();

    await User.findByIdAndUpdate(user_id, {
      $push: { products: newProduct._id },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({
      error: "Error creating product",
      details: (error as Error).message,
    });
  }
};
/**
 * @route   GET /api/products
 * @desc    Fetch products with pagination, filtering, and field selection.
 * @access  Public (or User-only filtering with authentication)
 */
export const getProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      productId,
      slug,
      page = "1",
      limit = "10",
      search,
      category,
      fields,
      userOnly,
    } = req.query;

    console.log("📢 Incoming Request:", req.query);

    // ✅ Ensure valid pagination numbers
    const pageNumber = Math.max(parseInt(page as string, 10), 1);
    const limitNumber = Math.max(parseInt(limit as string, 10), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // ✅ If `productId` is provided, fetch a **specific product**.
    if (productId) {
      if (!mongoose.isValidObjectId(productId))
        throw new Error("Invalid Product ID");

      const product = await Product.findById(productId)
        //.populate("tasks") //todo - maybe delete later - its for tasks fetch
        .populate("lastOverallMaintenance")
        .populate("nextOverallMaintenance")
        .lean();

      if (!product) throw new Error("Product not found");

      res.status(200).json({
        success: true,
        items: [product],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      return;
    }
    if (!productId && slug) {
      const product = await Product.findOne({ slug })
        .populate("lastOverallMaintenance")
        .populate("nextOverallMaintenance")
        .lean();

      if (!product) throw new Error("Product not found");

      res.status(200).json({
        success: true,
        items: [product],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      return;
    }

    // ✅ Build dynamic filtering options
    const query: any = {};
    if (search) query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    if (category) query.category = category; // Category filter
    if (userOnly === "true" && req.user?._id) query.user_id = req.user._id; // Fetch user's products

    // ✅ Select specific fields if requested
    const fieldsParam = Array.isArray(fields) ? fields[0] : fields;
    const projection = fieldsParam
      ? fieldsParam.toString().split(",").join(" ") + " _id"
      : "";

    // ✅ Fetch products with pagination & filtering
    const products = await Product.find(query)
      .select(projection)
      .skip(skip)
      .limit(limitNumber)
      .populate("tasks")
      .populate("lastOverallMaintenance")
      .populate("nextOverallMaintenance")
      .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      items: products,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /products/:product_id
 * @desc    Update an existing product
 * @access  Public
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      error: "Error updating product",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   DELETE /products/:product_id
 * @desc    Delete a product
 * @access  Public
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const deletedProduct = await Product.findOneAndDelete({ _id: product_id });

    if (!deletedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting product",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   GET /products/categories
 * @desc    Fetch unique product categories
 * @access  Public
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Fetch unique categories, filtering out empty or null values
    const categories = await Product.distinct("category");
    const filteredCategories = categories.filter(
      (category) => category && category.trim() !== ""
    );

    res.json(filteredCategories);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ error: "Error fetching categories" });
  }
};

/**
 * @route   GET /products/:product_id/tasks
 * @desc    Fetch tasks of a specific product
 * @access  Public
 
export const getProductTasks = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const tasks = await Task.find({ product_id });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching tasks",
      details: (error as Error).message,
    });
  }
};*/
