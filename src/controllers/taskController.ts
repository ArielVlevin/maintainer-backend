import { NextFunction, Response } from "express";
import { AuthRequest } from "../models/AuthRequest";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  completeTask,
  postponeTask,
} from "../services/taskService";
import { validateUserAuth } from "../utils/validationUtils";

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
    res.status(201).json({
      message: "Task added successfully",
      product: result.product,
      task: result.task,
    });
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
    const { taskId } = req.params;
    const updatedTask = await updateTask(taskId, req.body);
    res.json(updatedTask);
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
    const { taskId } = req.params;
    const result = await deleteTask(taskId);
    res.json(result);
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
    res.status(200).json(tasks);
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
    const { taskId } = req.params;
    const task = await completeTask(taskId);
    res.json({ success: true, message: "Task completed successfully", task });
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
    const { taskId } = req.params;
    const { days } = req.body;
    const task = await postponeTask(taskId, days);
    res.json({
      success: true,
      message: `Task postponed by ${days} days`,
      task,
    });
  } catch (error) {
    next(error);
  }
};
