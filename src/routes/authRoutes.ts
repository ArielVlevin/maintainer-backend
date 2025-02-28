import express from "express";
import {
  verifyUserHandler,
  getUserByIdHandler,
  sendVerificationEmailHandler,
  verifyEmailHandler,
  updateUserHandler,
} from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";
import { apiLimiter } from "../middlewares/apiLimiter";

const router = express.Router();

router.use(apiLimiter);

router.post("/verify-user", verifyUserHandler);

router.post("/update-user", verifyToken, updateUserHandler);

router.get("/:userId", verifyToken, getUserByIdHandler);

router.post(
  "/send-verification-email",
  verifyToken,
  sendVerificationEmailHandler
);
router.post("/verify-email", verifyEmailHandler);

export default router;
