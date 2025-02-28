import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  completeTask,
  postponeTask,
} from "../services/taskService";
import { validateUserAuth } from "../utils/validationUtils";
import { sendSuccessResponse } from "../services/apiResponse";

/**
 * @route   POST /tasks/:product_id
 * @desc    Create a new maintenance task for a specific product
 */
export const createTaskHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const { product_id } = req.params;
    const taskData = req.body;

    const result = await createTask(user_id, product_id, taskData);
    sendSuccessResponse(res, result, "Task added successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /tasks/:taskId
 * @desc    Update an existing task
 */
export const updateTaskHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { task_id } = req.params;
    const updatedTask = await updateTask(task_id, req.body);
    sendSuccessResponse(res, updatedTask, "Task updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /tasks/:taskId
 * @desc    Delete a task and remove its reference from associated products
 */
export const deleteTaskHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { task_id } = req.params;
    const result = await deleteTask(task_id);
    sendSuccessResponse(res, result, "Task deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /tasks
 * @desc    Fetch tasks with filtering options
 */
export const getTasksHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const tasks = await getTasks(user_id, req.query);
    sendSuccessResponse(res, tasks, "Tasks retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /tasks/:taskId/complete
 * @desc    Mark a task as completed
 */
export const completeTaskHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { task_id } = req.params;
    const task = await completeTask(task_id);
    sendSuccessResponse(res, task, "Task completed successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /tasks/:taskId/postpone
 * @desc    Postpone a task's next maintenance date.
 */
export const postponeTaskHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { task_id } = req.params;
    const { days } = req.body;
    const task = await postponeTask(task_id, days);
    sendSuccessResponse(res, task, `Task postponed by ${days} days`);
  } catch (error) {
    next(error);
  }
};
