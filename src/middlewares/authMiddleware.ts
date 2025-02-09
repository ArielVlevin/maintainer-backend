import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { User } from "../models/User";
import { IUser } from "../types";

/**
 * Interface extending the Express Request object to include user information.
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Middleware to verify the Google OAuth token sent in the Authorization header.
 * Extracts user details from Google's UserInfo API and attaches them to `req.user`.
 * If the user does not exist in the database, a new user record is created.
 *
 * @param {AuthRequest} req - The Express request object with user authentication details.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the request-response cycle.
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🔍 Request Headers:", req.headers); // ✅ Log headers for debugging

    // Extract the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided");
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];
    console.log("🔑 Extracted Token:", token); // ✅ Log the extracted token

    // ✅ Verify the token using Google UserInfo API
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Extract the user information from Google's API response
    const payload = response.data;
    if (!payload.sub) {
      console.log("❌ Invalid token payload");
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    // 🔹 Check if the user exists in the database
    let user = await User.findOne({ googleId: payload.sub });

    // If the user doesn't exist, create a new one
    if (!user) {
      user = new User({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        role: "user",
        createdAt: new Date(),
        products: [],
      });

      await user.save();
    }

    // Attach user data to `req.user` for use in other middleware/controllers
    req.user = {
      _id: user._id,
      googleId: user.googleId ?? "",
      name: user.name ?? "",
      email: user.email ?? "",
      picture: user.picture ?? "",
      role: user.role,
      createdAt: user.createdAt,
      products: user.products,
    } as IUser;

    console.log("✅ User authenticated:", req.user); // ✅ Log user details
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
};
