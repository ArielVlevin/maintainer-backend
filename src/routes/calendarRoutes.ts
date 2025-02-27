import express from "express";
import {
  ensureEmailVerified,
  verifyToken,
} from "../middlewares/authMiddleware";
import {
  getProductTasksCalendar,
  getUserTasksCalendar,
} from "../controllers/calendarController";

const router = express.Router();

router.use(verifyToken);
router.use(ensureEmailVerified);

router.get("/user", getUserTasksCalendar);
router.get("/product/:productId", getProductTasksCalendar);

export default router;
