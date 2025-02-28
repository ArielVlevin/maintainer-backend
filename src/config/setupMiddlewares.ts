import { Application } from "express";
import express from "express";
import cors from "cors";
import { corsOptions, handleCorsError } from "./cors";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";

/**
 * @function setupMiddlewares
 * @description Configures global middlewares for the Express application.
 * @param {Application} app - The Express application instance.
 */
export const setupMiddlewares = (app: Application) => {
  app.use(express.json()); // Parses incoming JSON requests
  // Enables CORS for cross-origin requests
  app.use(cors(corsOptions));
  app.use(handleCorsError);
  app.use(helmet()); // Enables security headers
  app.use(compression()); // Compresses responses

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
    if (fs.existsSync(imagePath)) res.sendFile(imagePath);
    else res.sendFile(path.join(__dirname, "../uploads/default-product.png"));
  });
};
