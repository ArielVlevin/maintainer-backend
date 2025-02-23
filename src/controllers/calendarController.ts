import { Request, Response, NextFunction } from "express";
import { Task } from "../models/Task";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Fetches all maintenance tasks for a user in a calendar format.
 */
export const getUserTasksCalendar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const tasks = await Task.find({ user_id: userId }).lean();

    const calendarEvents = tasks.map((task) => ({
      id: task._id,
      title: task.taskName,
      start: task.nextMaintenance,
      end: task.nextMaintenance,
      product: task.product_id,
    }));

    res.json({ success: true, events: calendarEvents });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches all maintenance tasks for a specific product in a calendar format.
 */
export const getProductTasksCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
      return;
    }

    const tasks = await Task.find({ product_id: productId }).lean();

    const calendarEvents = tasks.map((task) => ({
      id: task._id,
      title: task.taskName,
      start: task.nextMaintenance,
      end: task.nextMaintenance,
    }));

    res.json({ success: true, events: calendarEvents });
  } catch (error) {
    next(error);
  }
};
