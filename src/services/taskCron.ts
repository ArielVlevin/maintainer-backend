import cron from "node-cron";
import { isBefore, isAfter, addDays } from "date-fns";

import { ITask, Task } from "../models/Task";
import logger from "../utils/logger";
import { sendTaskStatusEmail } from "./emailService";
import { IProduct } from "../models/Product";
import { IUser } from "../models/User";

import { determineTaskStatus } from "../utils/taskStatus";

/**
 * Schedules a cron job to reset completed tasks every night at midnight.
 */
export const scheduleTaskResetJob = () => {
  cron.schedule("0 * * * *", async () => {
    logger.info("⏳ Running scheduled task reset job...");
    await resetCompletedTasks();

    await checkTasks();
  });

  logger.info("⏳ Task status update job scheduled to run every round hour.");
};

/**
 * Check for overdue tasks and reset their status to "pending".
 */
export const resetCompletedTasks = async () => {
  try {
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    const result = await Task.updateMany(
      {
        status: "completed",
        lastMaintenance: { $lte: twelveHoursAgo },
        isRecurring: true,
      },
      { $set: { status: "healthy" } }
    );
    logger.info(
      `🔄 Reset ${result.modifiedCount} completed tasks to inactive.`
    );
  } catch (error) {
    logger.error("❌ Error resetting tasks:", error);
  }
};
/**
 * Checks tasks and updates their status if needed.
 */
export const checkTasks = async () => {
  try {
    const today = new Date();

    // Fetch tasks with populated product & user data
    const tasks = await Task.find({
      status: { $in: ["healthy", "maintenance"] },
    })
      .populate<{ product_id: IProduct }>("product_id")
      .populate<{ user_id: IUser }>("user_id");

    for (const task of tasks) {
      const product = task.product_id;
      const user = task.user_id;

      if (!product || !user) {
        logger.warn(
          `⚠️ Skipping task "${task.taskName}" - Missing user or product reference.`
        );
        continue;
      }
      // Call function to update task status
      const updatedStatus = determineTaskStatus(task as unknown as ITask);

      if (updatedStatus !== task.status)
        await updateTaskStatus(task, updatedStatus, user, product);
    }
  } catch (error) {
    logger.error("❌ Error processing tasks:", error);
  }
};

/**
 * Updates a task's status and sends an email notification.
 *
 * @param task - The task to update
 * @param newStatus - The new status to assign
 * @param user - The user associated with the task
 * @param product - The product associated with the task
 */
const updateTaskStatus = async (
  task: any,
  newStatus: string,
  user: IUser,
  product: IProduct
) => {
  task.status = newStatus;
  await task.save();
  await sendTaskStatusEmail(user, product, task);

  logger.info(
    `🔔 Task "${
      task.taskName
    }" updated to ${newStatus.toUpperCase()} and notification sent.`
  );
};
