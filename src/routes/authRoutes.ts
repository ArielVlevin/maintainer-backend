import express from "express";
import {
  verifyUser,
  getUserById,
  sendVerificationEmailHandler,
  verifyEmailHandler,
  updateUser,
} from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";
import { apiLimiter } from "../middlewares/apiLimiter";

const router = express.Router();

router.use(apiLimiter);

router.post("/verify-user", verifyUser);

router.post("/update-user", verifyToken, updateUser);

router.get("/:userId", verifyToken, getUserById);

router.post(
  "/send-verification-email",
  verifyToken,
  sendVerificationEmailHandler
);
router.post("/verify-email", verifyEmailHandler);

export default router;
