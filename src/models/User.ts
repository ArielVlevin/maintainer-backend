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
  _id: id;
  name: string;
  email: string;
  image: string;
  role: "user" | "admin";
  products: id[];
  profileCompleted: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import mongoose, { Model, Schema } from "mongoose";
import { generateAndSendVerificationEmail } from "../services/authService";
import { id } from "../types/MongoDB";

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
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
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
