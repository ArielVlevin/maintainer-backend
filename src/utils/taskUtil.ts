import { NextFunction } from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task";

/**
 * Helper function to find a task by ID and validate ownership.
 */
export const findTaskById = async (
  taskId: string,
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
