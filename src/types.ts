import mongoose from "mongoose";

/**
 * @interface ITask
 * @description Represents a maintenance task for a product.
 */
export interface ITask extends Document {
  _id?: mongoose.Types.ObjectId | string; // Unique identifier

  product_id: mongoose.Types.ObjectId | string; // Reference to the product
  taskName: string; // Name of the maintenance task
  description?: string; // Optional: Task description
  lastMaintenance: Date; // Last maintenance date
  frequency: number; // Frequency of maintenance in days
  nextMaintenance: Date; // Next scheduled maintenance date
}

/**
 * @interface IProduct
 * @description Represents a product that requires maintenance.
 */
export interface IProduct extends Document {
  _id?: mongoose.Types.ObjectId | string; // Unique identifier
  name: string; // Product name

  user_id: mongoose.Types.ObjectId | string;

  category?: string; // Optional: Product category
  manufacturer?: string; // Optional: Manufacturer name
  model?: string; // Optional: Product model
  tags?: string[]; // Optional: Product tags for categorization
  purchaseDate?: Date; // Optional: Purchase date of the product

  taskIds: mongoose.Types.ObjectId[]; // Array of maintenance task IDs associated with the product

  lastOverallMaintenance?: mongoose.Types.ObjectId | ITask; // Reference to the last completed maintenance task
  nextOverallMaintenance?: mongoose.Types.ObjectId | ITask; // Reference to the next upcoming maintenance task

  iconUrl?: string; // URL for the product's icon or image
}

/**
 * Interface representing a User document in MongoDB.
 */

/**
 * @interface IUser
 * @description Represents a user in the system.
 *
 * Each user is uniquely identified by their Google ID and has an email, name, and optional profile picture.
 * Users can also own multiple products, referenced by their IDs.
 */
export interface IUser extends Document {
  _id?: mongoose.Types.ObjectId | string; // Unique identifier

  /**
   * Unique Google ID of the user (Required)
   */
  googleId: string;

  /**
   * Full name of the user (Required)
   */
  name: string;

  /**
   * Email address of the user (Required)
   */
  email: string;

  /**
   * Profile picture URL of the user (Optional)
   */
  picture?: string;

  /**
   * Role of the user - Determines user permissions
   * Can be either "user" (default) or "admin"
   */
  role: "user" | "admin";

  /**
   * Array of product IDs owned by the user
   * References the "Product" model
   */
  products: mongoose.Types.ObjectId[];

  /**
   * Date when the user was created in the system
   */
  createdAt: Date;
}
