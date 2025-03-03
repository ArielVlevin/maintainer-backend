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
 * Checks if Redis connection is active.
 */
export const isRedisConnected = async (): Promise<boolean> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.ping(); // בדיקת חיבור
      return true;
    }
    return false;
  } catch (error) {
    logger.error("⚠️ Redis connection check failed:", error);
    return false;
  }
};

export const flushRedis = async () => {
  try {
    if (await isRedisConnected()) {
      await redisClient.flushAll();
      logger.info("🧹 Redis cache cleared");
    }
  } catch (error) {
    logger.error("⚠️ Error flushing Redis:", error);
  }
};

/**
 * Stores a verification token in Redis for 1 hour.
 * @param email - The user's email.
 * @param token - The verification token.
 */
export async function setVerificationToken(email: string, token: string) {
  try {
    if (!(await isRedisConnected())) throw new Error("Redis is not connected");
    await redisClient.set(`verify:${token}`, email, { EX: 3600 });
  } catch (error) {
    logger.error("❌ Failed to set verification token:", error);
  }
}

/**
 * Retrieves the email associated with a verification token.
 * @param token - The verification token.
 * @returns The associated email, or null if not found.
 */
/**
 * Retrieves the email associated with a verification token.
 * @param token - The verification token.
 * @returns The associated email, or null if not found.
 */
export async function getVerificationEmail(
  token: string
): Promise<string | null> {
  try {
    if (!(await isRedisConnected())) throw new Error("Redis is not connected");
    return await redisClient.get(`verify:${token}`);
  } catch (error) {
    logger.error("❌ Failed to get verification email:", error);
    return null;
  }
}

/**
 * Deletes a verification token from Redis.
 * @param token - The verification token.
 */
export async function deleteVerificationToken(token: string) {
  try {
    if (!(await isRedisConnected())) throw new Error("Redis is not connected");
    await redisClient.del(`verify:${token}`);
  } catch (error) {
    logger.error("❌ Failed to delete verification token:", error);
  }
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
