import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../types";

/**
 * User Schema - Defines the structure of the user document in MongoDB.
 *
 * The schema includes user identification details such as Google ID, name, email, and profile picture.
 * Additionally, it tracks user roles and associated products.
 */
const UserSchema = new Schema<IUser>(
  {
    /**
     * Unique identifier from Google OAuth (Required)
     */
    googleId: {
      type: String,
      required: true,
      unique: true,
    },

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
    picture: {
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
      default: "user",
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

/**
 * User Model - Exported for use in controllers and database interactions.
 */
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
