import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../services/apiResponse";
import logger from "../utils/logger";

/**
 * Middleware to handle errors in a consistent format.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`❌ Error: ${err.message}`);

  const statusCode = err.statusCode || 500;
  sendResponse(
    res,
    statusCode,
    false,
    err.message,
    null,
    err.name || "ServerError"
  );
};
