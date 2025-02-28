import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/AuthRequest";
import {
  getUserTasksForCalendar,
  getProductTasksForCalendar,
} from "../services/calendarService";
import { validateUserAuth } from "../utils/validationUtils";
import { sendSuccessResponse } from "../services/apiResponse";

/**
 * @route   GET /calendar/user
 * @desc    Fetches all maintenance tasks for a user in a calendar format.
 */
export const getUserTasksCalendar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const calendarEvents = await getUserTasksForCalendar(user_id);
    sendSuccessResponse(res, calendarEvents, "User tasks fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /calendar/product/:productId
 * @desc    Fetches all maintenance tasks for a specific product in a calendar format.
 */
export const getProductTasksCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { product_id } = req.params;
    const calendarEvents = await getProductTasksForCalendar(product_id);
    sendSuccessResponse(
      res,
      calendarEvents,
      "Product tasks fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};
