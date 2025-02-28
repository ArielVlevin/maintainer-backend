import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../types/AuthRequest";
import { id } from "../types/MongoDB";

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

    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw new Error("Unauthorized: No token provided");

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        _id: id;
        email: string;
      };

      const user = await User.findById(decoded._id);
      if (!user) throw new Error("User not found");

      console.log("user: ", user);
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new Error("token_expired");
      throw new Error("Invalid or expired token");
    }
  } catch (error) {
    next(error);
  }
};

export const ensureEmailVerified = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) throw new Error("Unauthorized. Please log in.");

  if (!req.user.emailVerified)
    throw new Error("Email not verified. Please verify your email.");

  next();
};
