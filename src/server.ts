import dotenv from "dotenv";
import express, { Application } from "express";
import connectDB from "./config/db";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import upload from "./routes/upload";

import path from "path";
import fs from "fs";
import productRoutes from "./routes/productRoutes";

dotenv.config();

const app: Application = express();

/**
 * @description Express application setup
 */

// ✅ Middleware setup
app.use(express.json()); // Parses incoming JSON requests
app.use(cors()); // Enables CORS for cross-origin requests

// ✅ Connect to MongoDB
connectDB();

// ✅ Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/**
 * @route GET /uploads/products/:imageName
 * @description Serves product images or a default placeholder if not found
 * @param {string} imageName - The name of the image file
 */
app.get("/uploads/products/:imageName", (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, "../uploads/products", imageName);

  // ✅ Check if the file exists; if not, return a default image
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.sendFile(path.join(__dirname, "../uploads/default-product.png"));
  }
});

// ✅ Route management
app.use("/api/products", productRoutes); // Routes for product operations
app.use("/api/tasks", taskRoutes); // Routes for task operations
app.use("/api/upload", upload); // Routes for file uploads

/**
 * @route Any
 * @description Handles non-existing routes and returns a 404 error
 */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Server startup
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
