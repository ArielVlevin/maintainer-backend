import { User } from "../models/User";
import {
  deleteVerificationToken,
  getVerificationEmail,
  setVerificationToken,
} from "../config/redis";
import { DBError, ValidationError } from "../utils/CustomError";
import { id } from "../types/MongoDB";
import crypto from "crypto";
import { sendVerificationEmail } from "./emailServices";

/**
 * Ensures that a user exists in the database.
 * If the user does not exist, it creates a new one.
 * @param email - The email of the user.
 * @param name - The name of the user.
 * @returns The user document.
 */
export const createUserIfNotExists = async (email: string, name: string) => {
  if (!email) throw new ValidationError("Email is required");
  let user = await User.findOne({ email });
  if (!user) {
    try {
      user = new User({ email, name });
      await user.save();
    } catch {
      throw new DBError("Error creating new user in database");
    }
  }
  return user;
};

/**
 * Updates an existing user in the database.
 * @param userId - The ID of the user.
 * @param name - The updated name of the user.
 * @param email - The updated email of the user.
 * @returns The updated user document.
 */
export const updateUserById = async (_id: id, name: string, email: string) => {
  if (!_id || !email || !name)
    throw new ValidationError("Missing required fields");

  const existingUser = await User.findById(_id);
  if (!existingUser) throw new DBError("User not found");

  try {
    existingUser.name = name;
    existingUser.email = email;
    existingUser.profileCompleted = true;

    await existingUser.save();
    return existingUser;
  } catch (error) {
    throw new DBError("Error updating user in database");
  }
};

/**
 * Retrieves a user by their ID.
 * @param userId - The ID of the user.
 * @returns The user document if found.
 */
export const findUserById = async (user_id: id) => {
  const user = await User.findById(user_id);
  if (!user) throw new DBError("User not found");

  return user;
};
/**
 * Generates a verification token, stores it in Redis, and sends a verification email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<string>}
 */
export async function generateAndSendVerificationEmail(
  email: string
): Promise<string> {
  if (!email) throw new DBError("Email is required.");

  const token = crypto.randomBytes(32).toString("hex");

  await setVerificationToken(email, token);
  await sendVerificationEmail(email, token);

  return token;
}

/**
 * Sends a verification email to the user if they haven't verified their email.
 * @param userId - The ID of the user.
 */
export const sendVerification = async (_id: id) => {
  const user = await User.findById(_id);
  if (!user) throw new DBError("User not found");
  if (user.emailVerified)
    throw new ValidationError("Email is already verified");
  return generateAndSendVerificationEmail(user.email);
};

/**
 * Verifies a user's email using a token from Redis.
 *
 * @param {string} token - The verification token.
 * @returns {Promise<{ success: boolean, message: string }>} - Verification result.
 */
export const verifyEmailToken = async (token: string) => {
  if (!token) throw new ValidationError("Verification token is required");

  const email = await getVerificationEmail(token);
  if (!email) {
    return {
      success: false,
      message:
        "Token expired or invalid. Please request a new verification email.",
    };
  }

  const user = await User.findOne({ email });
  if (!user) throw new DBError("User not found");
  try {
    user.emailVerified = true;
    await user.save();
    await deleteVerificationToken(token);
  } catch {
    throw new DBError("Error verifying email token");
  }

  return { success: true, message: "Email verified successfully." };
};
