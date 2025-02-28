import { IUser } from "../models/User";
import { Request } from "express";

/**
 * @interface AuthRequest
 * @description Extends Express Request to include authenticated user data.
 */
export interface AuthRequest extends Request {
  user?: IUser;
}
