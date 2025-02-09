import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Task } from "../models/Task";
import { AuthRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";

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
      tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
      purchaseDate,
      taskIds: [],
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
 * @route   GET /products
 * @desc    Fetch products with pagination and filtering
 * @access  Public
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const fields = req.query.fields as string | undefined; // Selected fields

    const skip = (page - 1) * limit;

    // Dynamic query object
    const query: any = {};
    if (search) query.name = { $regex: search, $options: "i" }; // Search by name
    if (category) query.category = category; // Filter by category

    // Selecting specific fields if requested
    const projection = fields ? fields.split(",").join(" ") + " _id" : "";

    const products = await Product.find(query)
      .select(projection) // Limit selected fields
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   GET /products/:product_id
 * @desc    Fetch a product by ID including its tasks
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const product = await Product.findById(product_id)
      .populate("taskIds")
      .populate("lastOverallMaintenance")
      .populate("nextOverallMaintenance");

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching product",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   GET /products/:product_id/tasks
 * @desc    Fetch tasks of a specific product
 * @access  Public
 */
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
    const deletedProduct = await Product.findByIdAndDelete(product_id);

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
