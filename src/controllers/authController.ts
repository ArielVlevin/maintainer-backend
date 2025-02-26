import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

/**
 * @controller verifyUser
 * @desc    Handles user verification after OAuth sign-in.
 * @access  Public (called after authentication)
 *
 * Ensures that the authenticated user exists in the database and has all required fields.
 *
 * @param {Request} req - The Express request object containing user details.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 * @returns {Response} - JSON response with success or error message.
 */
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, name, email } = req.body;

    if (!_id || !email || !name) throw new Error("Missing required user data");

    let user = await User.findOne({ _id });
    if (!user) {
      user = await User.findOne({ email });
      if (!user) throw new Error("User not found in database.");
    }

    const fieldsToUpdate = {
      name: name || user.name,
      role: user.role || "user",
      createdAt: user.createdAt || new Date(),
      products: user.products || [],
      emailVerified: user.emailVerified || false,
      profileCompleted: true,
    };

    await User.updateOne({ _id: user._id }, { $set: fieldsToUpdate });
    res
      .status(200)
      .json({ message: "User profile completed", user: fieldsToUpdate });
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getUserById
 * @desc    Retrieves a user from the database based on user ID.
 * @route   GET /api/users/:userId
 * @access  Private (requires authentication)
 *
 * @param {AuthRequest} req - Express request object with params.userId.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 * @returns {Response} - JSON response with user data or error message.
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id } = req.user!;
    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
