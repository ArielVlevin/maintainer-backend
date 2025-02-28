import cron from "node-cron";
import { Task } from "../models/Task";
import logger from "../utils/logger";

/**
 * Schedules a cron job to reset completed tasks every night at midnight.
 */
export const scheduleTaskResetJob = () => {
  cron.schedule("0 * * * *", async () => {
    logger.info("⏳ Running scheduled task reset job...");
    await resetCompletedTasks();
  });

  logger.info("⏳ Task reset job scheduled to run every round hour.");
};

/**
 * Check for overdue tasks and reset their status to "pending".
 */
export const resetCompletedTasks = async () => {
  try {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    const result = await Task.updateMany(
      { status: "completed", lastMaintenance: { $lte: twelveHoursAgo } },
      { $set: { status: "inactive" } }
    );
  } catch (error) {
    logger.error("❌ Error resetting tasks:", error);
  }
};
