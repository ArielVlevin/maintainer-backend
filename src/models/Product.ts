import mongoose, { Schema, Model } from "mongoose";
import { IProduct } from "../types";

/**
 * Product Schema - Defines the structure of the product document in MongoDB.
 *
 * Each product can have multiple maintenance tasks associated with it.
 * The schema includes details such as name, category, manufacturer,
 * purchase date, tags, and maintenance tracking fields.
 */
const ProductSchema = new Schema<IProduct>({
  /**
   * Product name (Required)
   */
  name: { type: String, required: true },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  /**
   * Category of the product (Optional)
   */
  category: { type: String },

  /**
   * Manufacturer name (Optional)
   */
  manufacturer: { type: String },

  /**
   * Model name (Optional)
   */
  model: { type: String },

  /**
   * Date when the product was purchased (Optional)
   */
  purchaseDate: { type: Date },

  /**
   * Array of tags associated with the product (Optional)
   */
  tags: [{ type: String }],

  /**
   * Array of maintenance task IDs associated with the product
   */
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

  /**
   * The most recent maintenance task performed on this product
   */
  lastOverallMaintenance: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },

  /**
   * The next scheduled maintenance task for this product
   */
  nextOverallMaintenance: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },

  /**
   * URL of the product's icon image
   */
  iconUrl: { type: String, default: "/uploads/default-product.png" },
});

/**
 * Middleware (Pre-Save Hook) - Updates maintenance tracking fields
 *
 * Before saving a product, this middleware:
 * 1. Fetches all associated tasks based on taskIds.
 * 2. Determines the most recent completed maintenance task.
 * 3. Determines the next upcoming maintenance task.
 * 4. Updates `lastOverallMaintenance` and `nextOverallMaintenance` fields accordingly.
 */
ProductSchema.pre("save", async function (next) {
  if (this.tasks.length > 0) {
    const tasks = await mongoose
      .model("Task")
      .find({ _id: { $in: this.tasks } });

    // Find the most recently completed maintenance task
    const lastTask = tasks
      .filter((task) => task.lastMaintenance)
      .sort(
        (a, b) => b.lastMaintenance.getTime() - a.lastMaintenance.getTime()
      )[0];

    // Find the next scheduled maintenance task
    const nextTask = tasks
      .filter((task) => task.nextMaintenance)
      .sort(
        (a, b) => a.nextMaintenance.getTime() - b.nextMaintenance.getTime()
      )[0];

    // Update last and next maintenance fields
    this.lastOverallMaintenance = lastTask ? lastTask._id : undefined;
    this.nextOverallMaintenance = nextTask ? nextTask._id : undefined;
  } else {
    this.lastOverallMaintenance = undefined;
    this.nextOverallMaintenance = undefined;
  }

  next();
});

/**
 * Product Model - Exported for use in controllers and database interactions
 */
export const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);
