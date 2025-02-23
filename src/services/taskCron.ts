import cron from "node-cron";
import { Task } from "../models/Task";

/**
 * Schedules a cron job to reset completed tasks every night at midnight.
 */
export const scheduleTaskResetJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("⏳ Running scheduled task reset job...");
    await resetCompletedTasks();
  });

  console.log("⏳ Task reset job scheduled to run every round hour.");
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
    console.error("❌ Error resetting tasks:", error);
  }
};
