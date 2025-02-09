import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

/**
 * Express router for handling task-related operations.
 */

/**
 * @route POST /tasks/:product_id
 * @description Creates a new task for a specific product.
 * @param {string} product_id - The ID of the product to which the task belongs.
 * @access Public
 */
router.post("/:product_id", verifyToken, createTask);

/**
 * @route GET /tasks
 * @description Retrieves all tasks in the system.
 * @access Public
 */
router.get("/", verifyToken, getAllTasks);

/**
 * @route GET /tasks/:taskId
 * @description Retrieves a specific task by its ID.
 * @param {string} taskId - The ID of the task to retrieve.
 * @access Public
 */
router.get("/:taskId", verifyToken, getTaskById);

/**
 * @route PUT /tasks/:taskId
 * @description Updates a task by its ID.
 * @param {string} taskId - The ID of the task to update.
 * @access Public
 */
router.put("/:taskId", verifyToken, updateTask);

/**
 * @route DELETE /tasks/:taskId
 * @description Deletes a task by its ID.
 * @param {string} taskId - The ID of the task to delete.
 * @access Public
 */
router.delete("/:taskId", verifyToken, deleteTask);

export default router;
