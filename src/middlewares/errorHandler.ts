import { Request, Response, NextFunction } from "express";

/**
 * Middleware for handling errors globally in the API.
 *
 * @param {Error} err - The error object thrown in the API.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The Express next function.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", err.message);

  // If status is not set, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};
