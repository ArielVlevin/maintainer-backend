import cors from "cors";
import { Request, Response, NextFunction } from "express";

const allowedOrigins = [
  "http://localhost:3000", // Development Frontend
  process.env.CLIENT_URL || "", // Production Frontend (from env variable)
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow sending cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * Middleware to handle CORS errors explicitly.
 */
export const handleCorsError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message === "Not allowed by CORS") {
    res
      .status(403)
      .json({ success: false, message: "CORS error: Access denied." });
  } else {
    next(err);
  }
};
