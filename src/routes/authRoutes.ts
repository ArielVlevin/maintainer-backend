import express from "express";
import { verifyUser } from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   POST /api/auth/verify-user
 * @desc    Verifies the authenticated user and updates missing profile fields if necessary.
 * @access  Public (called after OAuth sign-in)
 *
 * This route is triggered after a user logs in with an OAuth provider (Google, Apple, etc.).
 * It checks if the user exists in the database and ensures required fields are set correctly.
 */
router.post("/verify-user", verifyUser);

export default router;
