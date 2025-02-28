import { NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import { Task } from "../models/Task";

import { logAction } from "./logAction";
import { addTimeToDate } from "../utils/dateUtils";
import { findProductById } from "./productService";
import { DBError } from "../utils/CustomError";

/**
 * Helper function to find a task by ID and validate ownership.
 */
export const findTaskById = async (
  taskId: string | Types.ObjectId,
  userId: string | mongoose.Types.ObjectId,
  next: NextFunction
) => {
  try {
    if (!mongoose.isValidObjectId(taskId)) throw new Error("Invalid Task ID");
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");
    if (task.user_id.toString() !== userId.toString())
      throw new Error("Unauthorized");
    return task;
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new task for a given product.
 * @param userId - The ID of the user creating the task.
 * @param productId - The ID of the product to associate the task with.
 * @param taskData - The details of the new task.
 * @returns The newly created task.
 */
export const createTask = async (
  user_id: string | Types.ObjectId,
  product_id: string,
  taskData: any
) => {
  const product = await findProductById(product_id);

  const nextMaintenance = addTimeToDate(
    taskData.lastMaintenance,
    taskData.frequency
  );

  const newTask = new Task({
    product_id,
    user_id,
    taskName: taskData.taskName,
    description: taskData.description,
    lastMaintenance: taskData.lastMaintenance,
    frequency: taskData.frequency,
    nextMaintenance,
  });

  await newTask.save();

  product.tasks.push(newTask._id);
  await product.save();

  return { product, task: newTask };
};

/**
 * Updates an existing task.
 * @param taskId - The ID of the task to update.
 * @param updatedData - The updated task data.
 * @returns The updated task.
 */
export const updateTask = async (task_id: string, updatedData: any) => {
  const updatedTask = await Task.findByIdAndUpdate(task_id, updatedData, {
    new: true,
  });

  if (!updatedTask) throw new DBError("Task not found");

  return updatedTask;
};

/**
 * Deletes a task and removes its reference from the associated product.
 * @param taskId - The ID of the task to delete.
 * @returns A success message.
 */
export const deleteTask = async (task_id: string) => {
  const task = await Task.findById(task_id);
  if (!task) throw new DBError("Task not found");

  await task.deleteOne();

  // Remove the task reference from the associated product
  await Task.updateMany(
    { product_id: task.product_id },
    { $pull: { tasks: task_id } }
  );

  return { message: "Task deleted successfully" };
};

/**
 * Fetch tasks based on filtering options.
 * @param user_id - The authenticated user ID.
 * @param filters - The query filters.
 * @returns The list of tasks matching the filters.
 */
export const getTasks = async (
  user_id: string | Types.ObjectId,
  filters: any
) => {
  const { taskId, productId, page = 1, limit = 10, status, search } = filters;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Fetch a single task if taskId is provided
  if (taskId) {
    if (!mongoose.isValidObjectId(taskId)) throw new DBError("Invalid Task ID");

    const task = await Task.findOne({
      _id: taskId,
      user_id,
    }).populate("product_id", "name category");

    if (!task) throw new DBError("Task not found");

    return {
      success: true,
      items: [task],
      total: 1,
      page: 1,
      totalPages: 1,
    };
  }

  // Apply filters for task search
  const query: any = { user_id: user_id };
  if (productId) query.product_id = productId;
  if (status) query.status = status;
  if (search) query.taskName = { $regex: search, $options: "i" };

  const tasks = await Task.find(query)
    .sort({ nextMaintenance: 1 }) // Sort by next maintenance date
    .skip(skip)
    .limit(parseInt(limit as string))
    .populate("product_id", "name category");

  const total = await Task.countDocuments(query);

  return {
    success: true,
    items: tasks,
    total,
    page: parseInt(page as string),
    totalPages: Math.ceil(total / parseInt(limit as string)),
  };
};

/**
 * Marks a task as completed and updates maintenance dates.
 * @param taskId - The ID of the task to complete.
 * @returns The updated task.
 */
export const completeTask = async (taskId: string) => {
  const task = await Task.findById(taskId);
  if (!task) throw new DBError("Task not found");

  task.status = "completed";
  task.lastMaintenance = new Date();
  task.nextMaintenance = addTimeToDate(task.lastMaintenance, task.frequency);

  await task.save();
  return task;
};

/**
 * Postpones a task by a given number of days.
 * @param taskId - The ID of the task to postpone.
 * @param days - The number of days to postpone.
 * @returns The updated task.
 */
export const postponeTask = async (taskId: string, days: number) => {
  const task = await Task.findById(taskId);
  if (!task) throw new DBError("Task not found");

  task.nextMaintenance = addTimeToDate(task.nextMaintenance, days);
  await task.save();

  return task;
};
