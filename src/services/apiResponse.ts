import { Response } from "express";
import { ApiResponse } from "../types/ApiResponse";

/**
 * Sends a standardized API response.
 *
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param success - Whether the request was successful
 * @param message - Success or error message
 * @param data - The response data (optional)
 * @param errorType - The type of error (optional, used in error cases)
 */

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null,
  error: string | null = null
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({ success, message, data, error });
};

/**
 * Shortcut function for successful responses.
 *
 * @param res - Express response object
 * @param data - The response data
 * @param message - Optional success message
 */
export const sendSuccessResponse = (
  res: Response,
  data: any,
  message = "Success",
  statusCode?: number
) => {
  sendResponse(res, statusCode ? statusCode : 200, true, message, data);
};
