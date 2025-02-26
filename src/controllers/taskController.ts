import { NextFunction, Request, Response } from "express";
import { Task } from "../models/Task";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";
import { findProductById, updateProductTasks } from "../utils/productUtils";
import { findTaskById } from "../utils/taskUtil";
import { logAction } from "../lib/logAction";
import { addTimeToDate } from "../utils/dateUtils";
import { validateUserAuth } from "../utils/validationUtils";

/**
 * @route   POST /tasks/:product_id
 * @desc    Create a new maintenance task for a specific product
 * @access  Public
 */
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = validateUserAuth(req);
    const { product_id } = req.params;
    const { taskName, description, lastMaintenance, frequency } = req.body;

    const product = await findProductById(product_id);

    // Calculate next maintenance date
    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + frequency);

    // Create new task
    const newTask = new Task({
      product_id,
      user_id: userId,
      taskName,
      description,
      lastMaintenance,
      frequency,
      nextMaintenance,
    });

    await newTask.save();

    // Add task to the product's task list
    product.tasks.push(newTask._id);
    await product.save();

    res.status(201).json({
      message: "Task added successfully",
      product,
      task: newTask,
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = validateUserAuth(req);
    const { taskId } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });

    if (!updatedTask) throw new Error("updateTask: Task not found");
    res.json(updatedTask);

    await logAction(
      userId,
      "UPDATE",
      "TASK",
      taskId,
      `Task "${updatedTask.taskName}" was updated`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /tasks/:taskId
 * @desc    Delete a task and remove its reference from associated products
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = validateUserAuth(req);

    const { taskId } = req.params;
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) throw new Error("Task not found");
    await updateProductTasks(taskId, next);
    res.json({ message: "Task deleted successfully" });

    await logAction(
      userId,
      "DELETE",
      "TASK",
      taskId,
      `Task "${deletedTask.taskName}" was deleted`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch tasks for the authenticated user with pagination, filtering, and task lookup by ID.
 *
 * @param {AuthRequest} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = validateUserAuth(req);
    const {
      taskId,
      productId,
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (taskId) {
      if (!mongoose.isValidObjectId(taskId)) throw new Error("Invalid Task ID");
      const task = await Task.findOne({
        _id: taskId,
        user_id: userId,
      }).populate("product_id", "name category");
      if (!task) throw new Error("getTasks: Task not found");

      res.status(200).json({
        success: true,
        items: [task],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    } else {
      // Apply filters
      const filter: any = { user_id: userId };
      if (productId) filter.product_id = productId;
      if (status) filter.status = status;
      if (search) filter.taskName = { $regex: search, $options: "i" };

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
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /tasks/:taskId
 * @desc    Mark a task as completed and update maintenance dates.
 */
export const completeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized: No user found");
    const task = await findTaskById(taskId, userId, next);
    if (!task) return;

    task.status = "completed";
    task.lastMaintenance = new Date();
    task.nextMaintenance = addTimeToDate(task.lastMaintenance, task.frequency);

    await task.save();

    await logAction(
      userId,
      "COMPLETE",
      "TASK",
      task._id.toString(),
      `Task "${task.taskName}" was completed`
    );
    res.json({ success: true, message: "Task completed successfully", task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /tasks/:taskId/postpone
 * @desc    Postpone a task's next maintenance date.
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
    if (!userId) throw new Error("Unauthorized: No user found");
    if (!days || days < 1) throw new Error("Invalid days parameter");
    const task = await findTaskById(taskId, userId, next);
    if (!task) return;
    task.nextMaintenance = addTimeToDate(task.nextMaintenance, days);
    await task.save();

    res.json({
      success: true,
      message: `Task postponed by ${days} days`,
      task,
    });
    await logAction(
      userId,
      "UPDATE",
      "TASK",
      taskId,
      `Task "${task.taskName}" postponed by ${days} days`
    );
  } catch (error) {
    next(error);
  }
};
