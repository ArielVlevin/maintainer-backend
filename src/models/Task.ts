/**
 * @interface ITask
 * @description Represents a maintenance task for a product.
 */
export interface ITask extends Document {
  _id?: mongoose.Types.ObjectId | string; // Unique identifier

  product_id: mongoose.Types.ObjectId | string; // Reference to the product

  user_id: mongoose.Types.ObjectId | string;

  taskName: string; // Name of the maintenance task
  description?: string; // Optional: Task description
  lastMaintenance: Date; // Last maintenance date
  frequency: number; // Frequency of maintenance in days
  nextMaintenance: Date; // Next scheduled maintenance date
  status: "pending" | "completed" | "overdue" | "inactive";
}

import mongoose, { Schema, Model } from "mongoose";
import { logAction } from "../lib/logAction";

/**
 * Task Schema - Defines the structure of the maintenance task document in MongoDB.
 *
 * Each task is associated with a product and represents a scheduled maintenance operation.
 * The schema includes details such as task name, description, last performed maintenance,
 * frequency of repetition, and the next scheduled maintenance date.
 */
const TaskSchema = new Schema<ITask>({
  /**
   * Reference to the product associated with this maintenance task
   * (Required - Each task must be linked to a product)
   */
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

  /**
   * Name of the maintenance task (Required)
   */
  taskName: { type: String, required: true },

  /**
   * Description of the task (Optional)
   */
  description: { type: String },

  /**
   * Date when the last maintenance was performed (Required)
   */
  lastMaintenance: { type: Date, required: true },

  /**
   * Frequency of maintenance in days (Required)
   * Defines how often the task should be performed.
   */
  frequency: { type: Number, required: true },

  /**
   * Date when the next maintenance is scheduled (Required)
   */
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

/**
 * Automatically logs task creation and updates.
 */
TaskSchema.post("save", async function (doc) {
  await logAction(
    doc.user_id as string,
    "UPDATE",
    "TASK",
    doc._id as string,
    `Task "${doc.taskName}" was updated or created`
  );
});

/**
 * Automatically logs task deletion.
 */
TaskSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await logAction(
      doc.user_id,
      "DELETE",
      "TASK",
      doc._id,
      `Task "${doc.taskName}" was deleted`
    );
  }
});

/**
 * Task Model - Exported for use in controllers and database interactions
 */
export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
