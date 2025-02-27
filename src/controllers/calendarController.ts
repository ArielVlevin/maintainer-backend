import { Request, Response, NextFunction } from "express";
import { Task } from "../models/Task";
import { Product } from "../models/Product"; // ✅ יבוא מודל המוצרים
import { AuthRequest } from "../models/AuthRequest";

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

    // ✅ שליפת המשימות של המשתמש
    const tasks = await Task.find({ user_id: userId }).lean();

    // ✅ שליפת כל המוצרים הקשורים למשימות
    const productIds = tasks.map((task) => task.product_id);
    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id name")
      .lean();

    // ✅ יצירת מפת מוצרים לפי _id
    const productMap = new Map(
      products.map((prod) => [prod._id.toString(), prod.name])
    );

    // ✅ יצירת מבנה האירועים ללוח השנה
    const calendarEvents = tasks.map((task) => ({
      _id: task._id,
      title: task.taskName,
      description: task.description,
      start: task.nextMaintenance,
      end: task.nextMaintenance,
      product: {
        _id: task.product_id.toString(),
        name: productMap.get(task.product_id.toString()) || "Unknown Product",
      },
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

    // ✅ שליפת המשימות של המוצר הספציפי
    const tasks = await Task.find({ product_id: productId }).lean();

    // ✅ שליפת שם המוצר
    const product = await Product.findById(productId).select("_id name").lean();

    // ✅ יצירת מבנה האירועים ללוח השנה
    const calendarEvents = tasks.map((task) => ({
      _id: task._id,
      title: task.taskName,
      description: task.description,
      start: task.nextMaintenance,
      end: task.nextMaintenance,
      product: {
        _id: product?._id.toString() || "",
        name: product?.name || "Unknown Product",
      },
    }));

    res.json({ success: true, events: calendarEvents });
  } catch (error) {
    next(error);
  }
};
