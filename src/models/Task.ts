import mongoose, { Schema, Model } from "mongoose";
import { ITask } from "../types";

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
});

/**
 * Task Model - Exported for use in controllers and database interactions
 */
export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
