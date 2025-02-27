import { NextFunction, Request, Response } from "express";
import { Product } from "../models/Product";
import { AuthRequest } from "../models/AuthRequest";
import { User } from "../models/User";
import mongoose from "mongoose";
import { logAction } from "../services/logAction";
import { validateUserAuth } from "../utils/validationUtils";

/**
 * @route   POST /products
 * @desc    Create a new product
 * @access  Public
 */
export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const { name, category, manufacturer, model, tags, purchaseDate, iconUrl } =
      req.body;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    const url = iconUrl || "/uploads/default-product.png";

    const newProduct = new Product({
      name,
      user_id,
      category,
      manufacturer,
      model,
      tags: tags,
      purchaseDate,
      tasks: [],
      iconUrl: url,
    });

    await newProduct.save();

    await User.findByIdAndUpdate(user_id, {
      $push: { products: newProduct._id },
    });

    res.status(201).json(newProduct);
    await logAction(
      user_id,
      "CREATE",
      "PRODUCT",
      newProduct._id.toString(),
      `Product "${newProduct.name}" was created`
    );
  } catch (error) {
    next(error);
  }
};
/**
 * @route   PUT /products/:product_id
 * @desc    Update an existing product
 * @access  Public
 */
export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const { product_id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) throw new Error("Product not found");

    res.json(updatedProduct);
    await logAction(
      user_id,
      "UPDATE",
      "PRODUCT",
      product_id,
      `Product "${updatedProduct.name}" was updated`
    );
  } catch (error) {
    next(error);
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
    const user_id = validateUserAuth(req);

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

    // ✅ Ensure valid pagination numbers
    const pageNumber = Math.max(parseInt(page as string, 10), 1);
    const limitNumber = Math.max(parseInt(limit as string, 10), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // ✅ If `productId` is provided, fetch a **specific product**.
    if (productId || slug) {
      let product;
      if (productId) {
        if (!mongoose.isValidObjectId(productId))
          throw new Error("Invalid Product ID");

        product = await Product.findById(productId)
          .populate("lastOverallMaintenance")
          .populate("nextOverallMaintenance")
          .lean();
      } else if (!productId && slug) {
        product = await Product.findOne({ slug })
          .populate("lastOverallMaintenance")
          .populate("nextOverallMaintenance")
          .lean();
      }
      if (!product) throw new Error("Product not found");

      res.status(200).json({
        success: true,
        items: [product],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    } else {
      const query: any = {}; //  Build dynamic filtering options
      if (search) query.name = { $regex: search, $options: "i" }; // Case-insensitive search
      if (category) query.category = category; // Category filter
      if (userOnly === "true" && req.user?._id) query.user_id = req.user._id; // Fetch user's products

      //  Select specific fields if requested
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

      res.status(200).json({
        success: true,
        items: products,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /products/:product_id
 * @desc    Delete a product
 * @access  Public
 */
export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const { product_id } = req.params;
    const deletedProduct = await Product.findOneAndDelete({ _id: product_id });

    if (!deletedProduct) throw new Error("Product not found");
    await logAction(
      user_id,
      "DELETE",
      "PRODUCT",
      product_id,
      `Product "${deletedProduct.name}" was deleted`
    );
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
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
