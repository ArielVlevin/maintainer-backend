import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Middleware to handle errors in a consistent format.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`❌ Error: ${err.message}`);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
