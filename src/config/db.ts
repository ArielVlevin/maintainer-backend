import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} - Resolves when the connection is successful.
 *
 * @throws {Error} - Logs an error and exits the process if the connection fails.
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exits the process with a failure code if the connection fails
  }
};

export default connectDB;
