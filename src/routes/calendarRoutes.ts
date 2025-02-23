import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
  getProductTasksCalendar,
  getUserTasksCalendar,
} from "../controllers/calendarController";

const router = express.Router();

router.get("/user", verifyToken, getUserTasksCalendar);
router.get("/product/:productId", verifyToken, getProductTasksCalendar);

export default router;
