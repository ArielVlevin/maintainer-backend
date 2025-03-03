import { isBefore, isAfter, addDays } from "date-fns";
import { Document } from "mongoose";
import { ITask, TaskStatus } from "../models/Task";

/**
 * Determines the correct status for a maintenance task based on nextMaintenance date.
 *
 * @param task - The task document
 * @returns The calculated task status
 */
export function determineTaskStatus(task: ITask): TaskStatus {
  const today = new Date();

  if (task.status === "completed") return "completed";

  // If next maintenance is more than 7 days away → Healthy
  if (task.nextMaintenance && isAfter(task.nextMaintenance, addDays(today, 7)))
    return "healthy";

  // If task is within 7 days before next maintenance → Set to "maintenance"
  if (task.nextMaintenance && isAfter(task.nextMaintenance, today))
    return "maintenance";

  // If task is overdue → Set to "overdue"
  if (task.nextMaintenance && isBefore(task.nextMaintenance, today))
    return "overdue";

  return "healthy";
}
