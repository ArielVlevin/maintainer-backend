import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { IUser } from "../types";

/**
 * @interface AuthRequest
 * @description Extends Express Request to include authenticated user data.
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * @middleware verifyToken
 * @desc Middleware to authenticate users based on JWT.
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        _id: string;
        email: string;
      };

      // 🔹 חיפוש המשתמש במסד הנתונים
      let user = await User.findById(decoded._id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // ✅ הוספת המשתמש לבקשה
      req.user = user;
      next();
    } catch (error) {
      console.error("❌ JWT verification failed:", error);
      res.status(403).json({ error: "Invalid or expired JWT token" });
      return;
    }
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(403).json({ error: "Authentication failed" });
  }
};
