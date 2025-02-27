import mongoose from "mongoose";
import { AuthRequest } from "../models/AuthRequest";

/**
 * Validates user authentication and returns the user ID.
 * Throws an error if the user is not authenticated.
 *
 * @param {AuthRequest} req - The Express request object.
 * @returns {string} - The authenticated user's ID.
 * @throws {Error} - If the user is not authenticated.
 */
export const validateUserAuth = (req: AuthRequest): mongoose.Types.ObjectId => {
  if (!req.user) throw new Error("Unauthorized: No user found");
  return req.user._id as mongoose.Types.ObjectId;
};
