import { Request, Response, NextFunction } from "express";
import { logAction } from "../services/logAction";
import { AuthRequest } from "../types/AuthRequest";

/**
 * Middleware to log all incoming requests after they are processed.
 * Logs include user ID, method, route, response status, and execution time.
 */
export const requestLogger = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    await logAction(
      req.user?._id!,
      "REQUEST",
      req.method,
      req.user?._id!,
      `Request to ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
