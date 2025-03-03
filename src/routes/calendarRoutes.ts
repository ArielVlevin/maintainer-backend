import express from "express";
import {
  ensureEmailVerified,
  verifyToken,
} from "../middlewares/authMiddleware";
import {
  getProductTasksCalendar,
  getUserTasksCalendar,
} from "../controllers/calendarController";
import { requestLogger } from "../middlewares/requestLogger";

const router = express.Router();

router.use(verifyToken);
router.use(ensureEmailVerified);

// todo:repair: router.use(requestLogger);

router.get("/user", getUserTasksCalendar);
router.get("/product/:product_id", getProductTasksCalendar);

export default router;
