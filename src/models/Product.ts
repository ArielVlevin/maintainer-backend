/**
 * @interface IProduct
 * @description Represents a product that requires maintenance.
 */

export type ProductStatus = "healthy" | "maintenance" | "overdue";

export interface IProduct extends Document {
  _id: id;
  name: string; // Product name
  slug: string;
  user_id: id;

  status: ProductStatus;

  category?: string; // Optional: Product category
  manufacturer?: string; // Optional: Manufacturer name
  model?: string; // Optional: Product model
  tags?: string[]; // Optional: Product tags for categorization
  purchaseDate?: Date; // Optional: Purchase date of the product

  tasks: id[]; // Array of maintenance task IDs associated with the product

  lastOverallMaintenance?: id | ITask; // Reference to the last completed maintenance task
  nextOverallMaintenance?: id | ITask; // Reference to the next upcoming maintenance task

  iconUrl?: string; // URL for the product's icon or image
  createdAt: Date;
  updatedAt: Date;

  notificationPreferences?: number[]; // Optional: Notification preferences
}

import mongoose, { Schema, Model } from "mongoose";
import { ITask, Task } from "./Task";
import slugify from "slugify";
import { id } from "../types/MongoDB";
/**
 * Product Schema - Defines the structure of the product document in MongoDB.
 *
 * Each product can have multiple maintenance tasks associated with it.
 * The schema includes details such as name, category, manufacturer,
 * purchase date, tags, and maintenance tracking fields.
 */
const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: { type: String },
  manufacturer: { type: String },
  model: { type: String },
  purchaseDate: { type: Date },
  tags: [{ type: String }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  lastOverallMaintenance: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  nextOverallMaintenance: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  iconUrl: { type: String, default: "/uploads/default-product.png" },

  status: {
    type: String,
    enum: ["maintenance", "overdue", "healthy"],
    default: "healthy",
  },

  notificationPreferences: {
    type: [Number],
    default: [1, 0], // Default: notify 1 day before and on the due date
  },
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
  if (product) await Task.deleteMany({ product_id: product._id });
  next();
});

ProductSchema.index({ category: 1 });
ProductSchema.index({ user_id: 1 });

export const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  ProductSchema
);
