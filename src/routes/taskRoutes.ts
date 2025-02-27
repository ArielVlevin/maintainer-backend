import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  postponeTask,
  getTasks,
} from "../controllers/taskController";
import {
  ensureEmailVerified,
  verifyToken,
} from "../middlewares/authMiddleware";

const router = Router();

router.use(verifyToken);
router.use(ensureEmailVerified);

/**
 * Express router for handling task-related operations.
 */

/**
 * @route POST /tasks/:product_id
 * @description Creates a new task for a specific product.
 * @param {string} product_id - The ID of the product to which the task belongs.
 * @access Public
 */
router.post("/:product_id", createTask);

/**
 * @route GET /tasks
 * @description Retrieves all user tasks by req.
 * @access Public
 */
router.get("/", getTasks);

/**
 * @route PUT /tasks/:taskId
 * @description Updates a task by its ID.
 * @param {string} taskId - The ID of the task to update.
 * @access Public
 */
router.put("/:taskId", updateTask);

/**
 * @route DELETE /tasks/:taskId
 * @description Deletes a task by its ID.
 * @param {string} taskId - The ID of the task to delete.
 * @access Public
 */
router.delete("/:taskId", deleteTask);
// ✅ Route to mark a task as completed
router.patch("/:taskId/complete", completeTask);

// ✅ Route to postpone a task
router.patch("/:taskId/postpone", postponeTask);

export default router;
