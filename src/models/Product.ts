/**
 * @interface IProduct
 * @description Represents a product that requires maintenance.
 */
export interface IProduct extends Document {
  _id?: mongoose.Types.ObjectId | string; // Unique identifier
  name: string; // Product name
  slug: string;
  user_id: mongoose.Types.ObjectId | string;

  category?: string; // Optional: Product category
  manufacturer?: string; // Optional: Manufacturer name
  model?: string; // Optional: Product model
  tags?: string[]; // Optional: Product tags for categorization
  purchaseDate?: Date; // Optional: Purchase date of the product

  tasks: mongoose.Types.ObjectId[]; // Array of maintenance task IDs associated with the product

  lastOverallMaintenance?: mongoose.Types.ObjectId | ITask; // Reference to the last completed maintenance task
  nextOverallMaintenance?: mongoose.Types.ObjectId | ITask; // Reference to the next upcoming maintenance task

  iconUrl?: string; // URL for the product's icon or image
}

import mongoose, { Schema, Model } from "mongoose";
import { ITask, Task } from "./Task";
import { logAction } from "../lib/logAction";
import slugify from "slugify";
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
  slug: { type: String, unique: true },
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
  if (this.isModified("name") || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.model("Product").exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
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

ProductSchema.pre("findOneAndDelete", async function (next) {
  const product = await this.model.findOne(this.getQuery());

  if (product) {
    await Task.deleteMany({ product_id: product._id });
    console.log(
      `✅ All tasks linked to product ${product._id} have been deleted.`
    );
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
