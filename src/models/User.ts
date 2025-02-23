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
  image: string;

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

  profileCompleted: boolean;

  emailVerified: boolean | null;
}

import mongoose, { Model, Schema } from "mongoose";
import { logAction } from "../lib/logAction";

/**
 * User Schema - Defines the structure of the user document in MongoDB.
 *
 * The schema includes user identification details such as Google ID, name, email, and profile picture.
 * Additionally, it tracks user roles and associated products.
 */
const UserSchema = new Schema<IUser>(
  {
    /**
     * Full name of the user (Required)
     */
    name: {
      type: String,
      required: true,
    },

    /**
     * Email address of the user (Required)
     * Ensures uniqueness to prevent duplicate accounts.
     */
    email: {
      type: String,
      required: true,
      unique: true,
    },

    /**
     * Profile picture URL (Optional)
     * Defaults to an empty string if no picture is provided.
     */
    image: {
      type: String,
      default: "",
    },

    /**
     * User role - Defines permissions in the system
     * Can be either "user" or "admin" (default: "user")
     */
    role: {
      type: String,
      enum: ["user", "admin"],
    },

    /**
     * List of product IDs owned by the user
     * References the "Product" model in MongoDB
     */
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    /**
     * Timestamp when the user was created
     * Automatically set when a new user is registered.
     */
    createdAt: {
      type: Date,
      default: Date.now,
    },
    profileCompleted: { type: Boolean, default: false },
  },

  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

/**
 * Automatically logs user creation.
 */
UserSchema.post("save", async function (doc) {
  await logAction(
    doc._id as string,
    "CREATE",
    "USER",
    doc._id as string,
    `User "${doc.name}" registered`
  );
});

/**
 * Automatically logs user profile updates.
 */
UserSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await logAction(
      doc._id,
      "UPDATE",
      "USER",
      doc._id,
      `User "${doc.name}" updated profile`
    );
  }
});

/**
 * Automatically logs user deletion.
 */
UserSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await logAction(
      doc._id,
      "DELETE",
      "USER",
      doc._id,
      `User "${doc.name}" deleted their account`
    );
  }
});
/**
 * User Model - Exported for use in controllers and database interactions.
 */
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
