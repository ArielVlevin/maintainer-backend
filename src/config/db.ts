import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import logger from "../utils/logger";

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  const isTestEnv = process.env.NODE_ENV === "test";

  try {
    if (isTestEnv) {
      logger.info("🧪 Running in TEST mode - Using in-memory MongoDB");
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    } else {
      const mongoUri =
        process.env.MONGO_URI || "mongodb://localhost:27017/maintainer";
      await mongoose.connect(mongoUri);
    }

    logger.info("✅ MongoDB Connected");
  } catch (error) {
    logger.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    logger.info("🔌 MongoDB Disconnected");
  } catch (error) {
    logger.error("⚠️ Error during MongoDB disconnection:", error);
  }
};
