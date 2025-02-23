import { NextFunction, Request, Response } from "express";
import { Task } from "../models/Task";
import { Product } from "../models/Product";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";
import { logAction } from "../lib/logAction";

/**
 * @route   POST /tasks/:product_id
 * @desc    Create a new maintenance task for a specific product
 * @access  Public
 */
export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("createTask");
    const { product_id } = req.params;
    const { taskName, description, lastMaintenance, frequency } = req.body;

    // Check if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    // Calculate next maintenance date
    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + frequency);

    // Create new task
    const newTask = new Task({
      product_id,
      user_id: req.user._id,
      taskName,
      description,
      lastMaintenance,
      frequency,
      nextMaintenance,
    });

    await newTask.save();

    // Add task to the product's task list
    product.tasks.push(newTask._id as mongoose.Types.ObjectId);
    await product.save();

    res.status(201).json({
      message: "Task added successfully",
      product,
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error creating task",
      details: (error as Error).message,
    });
  }
};

/**
 * Fetch tasks for the authenticated user with pagination, filtering, and task lookup by ID.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new Error("Unauthorized: User not found");
    const userId = req.user._id;
    const {
      taskId,
      productId,
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // ✅ אם נשלח `taskId` - נחפש את המשימה הספציפית
    if (taskId) {
      if (!mongoose.isValidObjectId(taskId)) throw new Error("Invalid Task ID");

      const task = await Task.findOne({
        _id: taskId,
        user_id: userId,
      }).populate("product_id", "name category");
      if (!task) throw new Error("Task not found");

      res.status(200).json({
        success: true,
        items: [task],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      return;
    }

    // ✅ אם לא - נשלוף לפי מסננים
    const filter: any = { user_id: userId };
    if (productId) filter.product_id = productId;
    if (status) filter.status = status;

    if (search) {
      filter.taskName = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(filter)
      .sort({ nextMaintenance: 1 }) // Upcoming tasks first
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate("product_id", "name category");

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      items: tasks,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /tasks/:taskId
 * @desc    Update an existing task
 * @access  Public
 */
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });

    if (!updatedTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      error: "Error updating task",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   DELETE /tasks/:taskId
 * @desc    Delete a task and remove its reference from associated products
 * @access  Public
 */
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;

    // Delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Remove the task from any products that referenced it
    await Product.updateMany(
      { taskIds: taskId },
      { $pull: { taskIds: taskId } }
    );

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting task",
      details: (error as Error).message,
    });
  }
};

/**
 * Marks a task as completed and updates the relevant maintenance dates.
 *
 * @param {Request} req - Express request object, containing the task ID in params.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 */
export const completeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user found" });
      return;
    }
    // ✅ Validate task existence
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    // ✅ Update maintenance fields
    const now = new Date();
    task.lastMaintenance = now;
    task.status = "completed"; // Mark as completed

    // ✅ Set next maintenance date
    if (task.frequency) {
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + task.frequency);
      task.nextMaintenance = nextDate;
      task.status = "pending"; // Task is now waiting for next occurrence
    }

    // ✅ Save updated task
    await task.save();

    // ✅ Update product's maintenance status
    if (task.product_id) {
      await Product.findByIdAndUpdate(
        task.product_id,
        {
          lastOverallMaintenance: new Date(),
          nextOverallMaintenance: new Date(task.nextMaintenance),
        },
        { new: true }
      );
    }

    // ✅ Log action
    await logAction(
      userId as string,
      "COMPLETE",
      "TASK",
      task._id as string,
      `Task "${task.taskName}" was marked as completed`
    );

    res.json({ success: true, message: "Task completed successfully", task });
  } catch (error) {
    next(error);
  }
};
/**
 * Postpone a task by updating its next maintenance date.
 *
 * @route PATCH /tasks/:taskId/postpone
 * @param {Request} req - Express request object containing task ID and days in the body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 * @returns {Promise<void>} - Returns success message and updated task.
 *
 * @example
 * PATCH /tasks/123/postpone { days: 7 }
 * Response: { success: true, message: "Task postponed by 7 days", task: {...} }
 */

export const postponeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const { days } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user found" });
      return;
    }

    if (!days || days < 1) {
      res
        .status(400)
        .json({ success: false, message: "Invalid days parameter" });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    // ✅ Update nextMaintenance correctly
    const newNextMaintenance = new Date(task.nextMaintenance);
    newNextMaintenance.setDate(newNextMaintenance.getDate() + days);

    task.nextMaintenance = newNextMaintenance;

    // ensure Mongoose detects the change
    task.markModified("nextMaintenance");

    const updatedTask = await task.save();

    // ✅ Log the action
    await logAction(
      userId as string,
      "UPDATE",
      "TASK",
      taskId,
      `Task "${task.taskName}" postponed by ${days} days`
    );

    res.json({
      success: true,
      message: `Task postponed by ${days} days`,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};
