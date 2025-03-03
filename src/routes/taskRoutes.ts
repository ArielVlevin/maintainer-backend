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
import { requestLogger } from "../middlewares/requestLogger";

const router = Router();

router.use(verifyToken);
router.use(ensureEmailVerified);

// todo:repair:router.use(requestLogger);

/**
 * Express router for handling task-related operations.
 */

router.post("/:product_id", createTaskHandler);
router.get("/", getTasksHandler);
router.put("/:task_id", updateTaskHandler);
router.delete("/:task_id", deleteTaskHandler);

router.patch("/:task_id/complete", completeTaskHandler);
router.patch("/:task_id/postpone", postponeTaskHandler);

export default router;
