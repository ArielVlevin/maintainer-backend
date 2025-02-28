/**
 * @interface ITask
 * @description Represents a maintenance task for a product.
 */
export interface ITask extends Document {
  _id: id;
  product_id: id;
  user_id: id;
  taskName: string; // Name of the maintenance task
  description?: string; // Optional: Task description
  lastMaintenance: Date; // Last maintenance date
  frequency: number; // Frequency of maintenance in days
  nextMaintenance: Date; // Next scheduled maintenance date
  status: "pending" | "completed" | "overdue" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

import mongoose, { Schema, Model } from "mongoose";
import { id } from "../types/MongoDB";

const TaskSchema = new Schema<ITask>({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  taskName: { type: String, required: true },
  description: { type: String },
  lastMaintenance: { type: Date, required: true },
  frequency: { type: Number, required: true },
  nextMaintenance: { type: Date, required: true },

  status: {
    type: String,
    enum: ["pending", "completed", "overdue", "inactive"],
    default: "inactive",
  },
});

/**
 * Middleware to update the `status` field before saving a task.
 * This ensures that the task has the correct status based on its
 * maintenance schedule and last maintenance date.
 *
 * Status Logic:
 * - `"pending"`: Newly created tasks or tasks awaiting the next maintenance.
 * - `"completed"`: Tasks that have been recently maintained.
 * - `"overdue"`: Tasks where `nextMaintenance` has passed the current date.
 * - `"inactive"`: Tasks where the next maintenance is far in the future (30+ days).
 *
 * @example
 * TaskSchema.pre("save", function (next) {
 *   // Task status updates automatically based on date conditions.
 * });
 */
TaskSchema.pre("save", function (next) {
  const today = new Date();

  if (this.status === "completed") return next();

  // ✅ If no `lastMaintenance`, the task is new or hasn't been completed yet
  if (!this.lastMaintenance) {
    this.status = "pending";
  }
  // ✅ If `nextMaintenance` has passed, the task is overdue
  else if (this.nextMaintenance && this.nextMaintenance < today) {
    this.status = "overdue";
  }
  // ✅ If `nextMaintenance` is more than 30 days away, the task is inactive
  else if (
    this.nextMaintenance > new Date(today.setDate(today.getDate() + 30))
  ) {
    this.status = "inactive";
  }
  // ✅ If `lastMaintenance` exists but next maintenance is still upcoming, task is pending
  else {
    this.status = "pending";
  }

  next();
});

TaskSchema.index({ user_id: 1 });
TaskSchema.index({ nextMaintenance: 1 });

export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
