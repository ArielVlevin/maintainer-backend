import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { validateUserAuth } from "../utils/validationUtils";
import {
  createUserIfNotExists,
  updateUserById,
  findUserById,
  sendVerification,
  verifyEmailToken,
} from "../services/authService";
import { sendSuccessResponse } from "../services/apiResponse";

export const verifyUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name } = req.body;
    const user = await createUserIfNotExists(email, name);

    sendSuccessResponse(res, user, "User verified successfully");
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const { name, email } = req.body;
    const updatedUser = await updateUserById(user_id, name, email);

    sendSuccessResponse(res, updatedUser, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

export const getUserByIdHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    const user = await findUserById(user_id);

    sendSuccessResponse(res, user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const sendVerificationEmailHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = validateUserAuth(req);
    await sendVerification(user_id);

    sendSuccessResponse(res, null, "Verification email sent.");
  } catch (error) {
    next(error);
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    const result = await verifyEmailToken(token);

    sendSuccessResponse(res, result, "Email verification processed.");
  } catch (error) {
    next(error);
  }
};
