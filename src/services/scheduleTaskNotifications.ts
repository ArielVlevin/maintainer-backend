import cron from "node-cron";
import { format, addDays, isBefore, isEqual } from "date-fns";
import { Task } from "../models/Task";
import { Product } from "../models/Product";
import { User } from "../models/User";
import logger from "../utils/logger";
import { addEmailToQueue } from "../queues/emailQueue";
import { sendTaskStatusEmail } from "./emailService";

/**
 * Runs every day at midnight to check for upcoming maintenance tasks.
 */
export const scheduleTaskNotifications = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      logger.info("🔔 Running task notification scheduler...");

      const today = new Date();
      const tasks = await Task.find()
        .populate("product_id")
        .populate("user_id");

      for (const task of tasks) {
        const product = task.product_id as any;
        const user = task.user_id as any;
        if (!product || !user) continue;

        const preferences = product.notificationPreferences || [1, 0];

        for (const daysBefore of preferences) {
          const notificationDate = addDays(task.nextMaintenance!!, -daysBefore);
          if (
            isEqual(today, notificationDate) ||
            isBefore(today, notificationDate)
          )
            await sendTaskStatusEmail(user, product, task);
        }
      }
    } catch (error) {
      logger.error("❌ Error in task notification scheduler:", error);
      throw error;
    }
  });
};
