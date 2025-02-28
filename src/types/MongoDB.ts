import { Types } from "mongoose";
import logger from "../utils/logger";

export type id = Types.ObjectId;

export const isValidId = (id: string | Types.ObjectId): boolean => {
  logger.info("\n\nid: ", id, "\n\n");
  return Types.ObjectId.isValid(id);
};
