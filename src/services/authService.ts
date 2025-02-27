import crypto from "crypto";
import { setVerificationToken } from "./redis";
import { sendVerificationEmail } from "./emailServices";

/**
 * Generates a verification token, stores it in Redis, and sends a verification email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
export async function generateAndSendVerificationEmail(
  email: string
): Promise<void> {
  if (!email) throw new Error("Email is required.");

  const token = crypto.randomBytes(32).toString("hex");

  await setVerificationToken(email, token);
  await sendVerificationEmail(email, token);

  console.log(`📧 Verification email sent to ${email}`);
}
