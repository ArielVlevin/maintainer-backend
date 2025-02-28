import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../models/AuthRequest";
import {
  deleteVerificationToken,
  getVerificationEmail,
  setVerificationToken,
} from "../services/redis";
import { validateUserAuth } from "../utils/validationUtils";
import { generateAndSendVerificationEmail } from "../services/authService";

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
    const { email, name } = req.body;

    if (!email) throw new Error("Email is required");

    let user = await User.findOne({ email });

    if (!user) {
      console.log("🔍 New user detected, creating...");
      user = new User({ email, name });
      await user.save();
    }

    res.status(200).json({ user });
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

/**
 * Updates user information (name & email) in the database.
 *
 * @route   POST /api/auth/update-user
 * @access  Private (User must be authenticated)
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);

    const { name, email } = req.body;
    if (!user_id || !email || !name) throw new Error("Missing required fields");

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { name, email, profileCompleted: true },
      { new: true }
    );

    if (!updatedUser) throw new Error("User not found");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const user = await User.findById(user_id);
    if (!user) throw new Error("User not found");

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /auth/send-verification-email
 * @desc    Sends a verification email to the user
 * @access  Private (Requires authentication)
 */
export const sendVerificationEmailHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const user = await User.findOne({ _id: user_id });
    if (!user) throw new Error("User not found.");

    if (user.emailVerified) throw new Error("Email is already verified.");

    generateAndSendVerificationEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Verification email sent." });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /auth/verify-email
 * @desc    Verifies user's email using a token
 * @access  Public
 */
export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    if (!token) throw new Error("Verification token is required.");

    const email = await getVerificationEmail(token);
    if (!email) {
      console.log("⚠️ Token expired or invalid.");
      res.status(200).json({
        success: false,
        message:
          "Token expired or invalid. Please request a new verification email.",
      });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found.");

    user.emailVerified = true;
    await user.save();

    await deleteVerificationToken(token);

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
};
