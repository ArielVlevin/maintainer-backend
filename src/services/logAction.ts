import mongoose from "mongoose";
import { Log } from "../models/Log";

/**
 * Logs an action performed by a user.
 *
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} actionType - The type of action performed (CREATE, UPDATE, DELETE, COMPLETE, etc.).
 * @param {string} entityType - The type of entity being modified (PRODUCT, TASK, USER, etc.).
 * @param {string} entityId - The ID of the entity affected by the action.
 * @param {string} details - A description of the action performed.
 */
export const logAction = async (
  userId: string | mongoose.Types.ObjectId,
  actionType: string,
  entityType: string,
  entityId: string | mongoose.Types.ObjectId,
  details: string
) => {
  try {
    if (!userId || !actionType || !entityType || !entityId || !details) {
      console.error(
        "❌ logAction called with missing parameters:",
        userId,
        actionType,
        entityType,
        entityId,
        details
      );
      return;
    }

    console.log("✅ Saving log:", {
      userId,
      actionType,
      entityType,
      entityId,
      details,
    });

    await Log.create({
      user_id: userId,
      actionType,
      entityType,
      entityId,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("❌ Error saving log:", error);
  }
};
