import { Router } from "express";
import {
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  completeTaskHandler,
  postponeTaskHandler,
  getTasksHandler,
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

router.post("/:product_id", createTaskHandler);
router.get("/", getTasksHandler);
router.put("/:taskId", updateTaskHandler);
router.delete("/:taskId", deleteTaskHandler);

router.patch("/:taskId/complete", completeTaskHandler);
router.patch("/:taskId/postpone", postponeTaskHandler);

export default router;
