import { Types } from "mongoose";
import { AuthRequest } from "../models/AuthRequest";

/**
 * Validates user authentication and returns the user ID.
 * Throws an error if the user is not authenticated.
 *
 * @param {AuthRequest} req - The Express request object.
 * @returns {Types.ObjectId } - The authenticated user's ID.
 * @throws {Error} - If the user is not authenticated.
 */
export const validateUserAuth = (req: AuthRequest): Types.ObjectId => {
  if (!req.user) throw new Error("Unauthorized: No user found");
  return req.user._id as Types.ObjectId;
};
