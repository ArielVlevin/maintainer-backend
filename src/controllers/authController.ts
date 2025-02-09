import { Request, Response } from "express";
import { User } from "../models/User";

/**
 * @controller verifyUser
 * @desc    Handles user verification after OAuth sign-in.
 * @access  Public (called after authentication)
 *
 * This function ensures that the authenticated user exists in the database and has all required fields.
 *
 * 1️⃣ If the user exists and already has a `role`, no update is performed.
 * 2️⃣ If the user exists but lacks required fields (indicating a first-time login), those fields are populated.
 * 3️⃣ If the user is not found by `_id`, it attempts to find the user by `email`.
 * 4️⃣ If the user is still not found, it returns a `404` error.
 *
 * @param {Request} req - The Express request object containing user details.
 * @param {Response} res - The Express response object.
 * @returns {Response} - JSON response with success or error message.
 */
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { _id, name, email, image, emailVerified } = req.body;

    // ✅ Validate request payload
    if (!_id || !email) {
      res.status(400).json({ error: "Missing required user data" });
      return;
    }

    // 🔍 Try finding the user by `_id` first
    let user = await User.findOne({ _id });

    if (!user) {
      console.log("⚠️ User not found by _id, attempting to find by email...");
      user = await User.findOne({ email });
    }

    if (user) {
      console.log("user: ", user);
      // ✅ If user already has a `role`, assume it's not a first-time login
      if (user.role) {
        res
          .status(200)
          .json({ message: "User exists, no update needed", user });
        return;
      }

      //console.log("🔄 First-time login detected, updating missing fields...");

      // 🛠 Fields to update (only if missing)
      const fieldsToUpdate = {
        name: user.name || name,
        image: user.image || image,
        role: "user",
        createdAt: user.createdAt || new Date(),
        products: user.products || [],
        emailVerified: user.emailVerified || emailVerified || false,
        profileCompleted: false,
      };

      await User.updateOne({ _id: user._id }, { $set: fieldsToUpdate });

      //console.log("✅ User updated successfully:", fieldsToUpdate);
      res
        .status(200)
        .json({ message: "User profile completed", user: fieldsToUpdate });
      return;
    }

    // ❌ User not found in database
    res.status(404).json({ error: "User not found in database." });
    return;
  } catch (error) {
    console.error("❌ Error verifying user:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
