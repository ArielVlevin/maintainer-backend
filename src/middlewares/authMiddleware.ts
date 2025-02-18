import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { IUser } from "../types";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ _id: userId }, ACCESS_SECRET, {
    expiresIn: "15m", // טוקן הגישה יהיה תקף ל-15 דקות
  });

  const refreshToken = jwt.sign({ _id: userId }, REFRESH_SECRET, {
    expiresIn: "7d", // טוקן הרענון יהיה תקף ל-7 ימים
  });

  return { accessToken, refreshToken };
};

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

      const user = await User.findById(decoded._id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: "token_expired" });
        return;
      }
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(403).json({ error: "Authentication failed" });
    return;
  }
};
