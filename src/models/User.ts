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

  createdAt: Date;
  profileCompleted: boolean;
  emailVerified: boolean;
}

import mongoose, { Model, Schema } from "mongoose";
import { logAction } from "../services/logAction";
import { generateAndSendVerificationEmail } from "../services/authService";

/**
 * User Schema - Defines the structure of the user document in MongoDB.
 *
 * The schema includes user identification details such as Google ID, name, email, and profile picture.
 * Additionally, it tracks user roles and associated products.
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    profileCompleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
  },

  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

UserSchema.post("save", async function (doc, next) {
  try {
    if (doc.isModified("email")) {
      doc.emailVerified = false;
      generateAndSendVerificationEmail(doc.email);
    }
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
  }
  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as mongoose.UpdateQuery<IUser>; // 💡 Type Assertion

  if (update?.email) {
    update.emailVerified = false;

    // 🔍 מקבל את המשתמש לפני העדכון כדי לבדוק האם האימייל השתנה
    const user = await this.model.findOne(this.getQuery());
    if (user && user.email !== update.email)
      generateAndSendVerificationEmail(update.email);
  }
  next();
});
/**
 * User Model - Exported for use in controllers and database interactions.
 */
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
