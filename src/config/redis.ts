import { createClient } from "redis";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => logger.error("❌ Redis error:", err));

/**
 * Connects to Redis only if not already connected.
 */
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info("✅ Redis connected successfully");
    }
  } catch (error) {
    logger.error("❌ Failed to connect to Redis:", error);
  }
};

/**
 * Stores a verification token in Redis for 1 hour.
 * @param email - The user's email.
 * @param token - The verification token.
 */
export async function setVerificationToken(email: string, token: string) {
  await redisClient.set(`verify:${token}`, email, { EX: 3600 });
}

/**
 * Retrieves the email associated with a verification token.
 * @param token - The verification token.
 * @returns The associated email, or null if not found.
 */
export async function getVerificationEmail(
  token: string
): Promise<string | null> {
  return await redisClient.get(`verify:${token}`);
}

/**
 * Deletes a verification token from Redis.
 * @param token - The verification token.
 */
export async function deleteVerificationToken(token: string) {
  await redisClient.del(`verify:${token}`);
}

/**
 * Disconnects from Redis properly.
 */
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info("🔌 Redis Disconnected");
    }
  } catch (error) {
    logger.error("⚠️ Error disconnecting Redis:", error);
  }
};

export default redisClient;
