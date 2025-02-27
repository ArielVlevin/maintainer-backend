import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("❌ Redis error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
  }
})();

export async function setVerificationToken(email: string, token: string) {
  await redisClient.set(`verify:${token}`, email, { EX: 3600 }); // 1 hours token
}

export async function getVerificationEmail(
  token: string
): Promise<string | null> {
  return await redisClient.get(`verify:${token}`);
}

export async function deleteVerificationToken(token: string) {
  await redisClient.del(`verify:${token}`);
}

export default redisClient;
