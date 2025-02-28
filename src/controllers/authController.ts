import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../models/AuthRequest";
import { validateUserAuth } from "../utils/validationUtils";
import {
  createUserIfNotExists,
  updateUserById,
  findUserById,
  sendVerificationEmail,
  verifyEmailToken,
} from "../services/userService";

export const verifyUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name } = req.body;
    const user = await createUserIfNotExists(email, name);
    res.status(200).json({ user });
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

    res.status(200).json({ success: true, user: updatedUser });
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

    res.status(200).json(user);
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
    await sendVerificationEmail(user_id);
    res
      .status(200)
      .json({ success: true, message: "Verification email sent." });
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
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
