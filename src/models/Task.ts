/**
 * @interface ITask
 * @description Represents a maintenance task for a product.
 */

import { determineTaskStatus } from "../utils/taskStatus";

export type TaskStatus = "maintenance" | "completed" | "overdue" | "healthy";

export interface ITask extends Document {
  _id: id;
  product_id: id;
  user_id: id;

  taskName: string; // Name of the maintenance task
  description?: string; // Optional: Task description
  status: TaskStatus;

  lastMaintenance?: Date;
  isRecurring: boolean;
  frequency?: number;
  nextMaintenance?: Date;
  maintenanceWindowDays?: number;
  maintenanceWindowDates?: {
    startDate: Date;
    endDate: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

import mongoose, { Schema, Model } from "mongoose";
import { id } from "../types/MongoDB";

const TaskSchema = new Schema<ITask>(
  {
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

    status: {
      type: String,
      enum: ["maintenance", "completed", "overdue", "healthy"],
      default: "healthy",
    },

    lastMaintenance: { type: Date },
    isRecurring: { type: Boolean, required: true },
    frequency: { type: Number },
    nextMaintenance: { type: Date },

    maintenanceWindowDates: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    maintenanceWindowDays: { type: Number },
  },
  { timestamps: true }
);

/** Pre-Save Hook */
TaskSchema.pre("save", function (next) {
  this.status = determineTaskStatus(this);
  next();
});

/** Indexes */
TaskSchema.index({ user_id: 1 });
TaskSchema.index({ nextMaintenance: 1 });

export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
