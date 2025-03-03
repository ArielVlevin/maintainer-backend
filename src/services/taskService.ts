import { NextFunction } from "express";
import { Task } from "../models/Task";
import { addTimeToDate, calculateMaintenanceWindow } from "../utils/dateUtils";
import { findProductById } from "./productService";
import { DBError } from "../utils/CustomError";
import { id, isValidId } from "../types/MongoDB";
import { updateData, updateEntity } from "../utils/updateData";
import { TaskQueryParams } from "../types/QueryParams";

export const findTaskById = async (task_id: string | id) => {
  if (!isValidId(task_id)) throw new DBError("Invalid Task ID");

  const task = await Task.findById(task_id);
  if (!task) throw new DBError("Task not found");

  return task;
};

export const findTask = async (
  task_id: id,
  user_id: id,
  next: NextFunction
) => {
  try {
    const task = await findTaskById(task_id);
    if (task.user_id !== user_id) throw new Error("Unauthorized");
    return task;
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new task for a given product.
 * @param userId - The ID of the user creating the task.
 * @param productId - The ID of the product to associate the task with.
 * @param taskData - The details of the new task.
 * @returns The newly created task.
 */
export const createTask = async (
  user_id: id,
  product_id: id | string,
  taskData: any
) => {
  const product = await findProductById(product_id);

  if (!taskData.taskName || taskData.isRecurring === undefined)
    throw new DBError("Missing required fields");

  //להוסיף לטסק דאטא את המערך החדש ולמחוק את הנקסט

  let lastMaintenance: Date | undefined = undefined;
  if (taskData.isRecurring && taskData.lastMaintenance)
    lastMaintenance = new Date(taskData.lastMaintenance);

  let frequency: number | undefined = undefined;
  if (taskData.isRecurring && taskData.frequency)
    frequency = taskData.frequency;

  const nextMaintenance: Date = new Date(
    taskData.maintenanceWindowDates.startDate
  );

  const newTask = new Task({
    product_id,
    user_id,
    taskName: taskData.taskName,
    description: taskData.description,
    lastMaintenance,
    frequency: taskData.frequency,
    isRecurring: taskData.isRecurring,
    maintenanceWindowDays: taskData.maintenanceWindowDays,
    nextMaintenance,
  });

  await newTask.save();

  product.tasks.push(newTask._id);
  await product.save();

  return { product, task: newTask };
};

/**
 * Updates an existing task.
 * @param taskId - The ID of the task to update.
 * @param updatedData - The updated task data.
 * @returns The updated task.
 */
export const updateTask = async (task_id: id | string, updatedData: any) => {
  return updateEntity(findTaskById, task_id, updatedData);
};

/**
 * Deletes a task and removes its reference from the associated product.
 * @param taskId - The ID of the task to delete.
 * @returns A success message.
 */
export const deleteTask = async (task_id: string | id) => {
  if (!isValidId(task_id)) throw new DBError("Invalid Task ID");

  const task = await Task.findById(task_id);
  if (!task) throw new DBError("Task not found");

  await task.deleteOne();

  // Remove the task reference from the associated product
  await Task.updateMany(
    { product_id: task.product_id },
    { $pull: { tasks: task_id } }
  );

  return { message: "Task deleted successfully" };
};

/**
 * Fetch tasks based on filtering options.
 * @param user_id - The authenticated user ID.
 * @param filters - The query filters.
 * @returns The list of tasks matching the filters.
 */
export const getTasks = async (
  user_id: id | string,
  filters: TaskQueryParams
) => {
  const { task_id, product_id, page = 1, limit = 10, status, search } = filters;

  const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

  // Fetch a single task if taskId is provided
  if (task_id) {
    if (!isValidId(task_id)) throw new DBError("Invalid Task ID");

    const task = await Task.findOne({
      _id: task_id,
      user_id,
    }).populate("product_id", "name category");

    if (!task) throw new DBError("Task not found");

    return {
      success: true,
      items: [task],
      total: 1,
      page: 1,
      totalPages: 1,
    };
  }

  // Apply filters for task search
  const query: any = {};
  query.user_id = user_id;
  if (product_id) query.product_id = product_id;
  if (status) query.status = status;
  if (search) query.taskName = { $regex: search, $options: "i" };

  console.log("Query: ", query);

  const tasks = await Task.find(query)
    .sort({ nextMaintenance: 1 }) // Sort by next maintenance date
    .skip(skip)
    .limit(parseInt(String(limit)))
    .populate("product_id", "name category");

  const total = await Task.countDocuments(query);

  return {
    success: true,
    items: tasks,
    total,
    page: parseInt(String(page)),
    totalPages: Math.ceil(total / parseInt(String(limit))),
  };
};

/**
 * Marks a task as completed and updates maintenance dates.
 * @param taskId - The ID of the task to complete.
 * @returns The updated task.
 */
export const completeTask = async (task_id: string | id) => {
  if (!isValidId(task_id)) throw new DBError("Invalid Task ID");

  const task = await findTaskById(task_id);

  task.status = "completed";
  task.lastMaintenance = new Date();

  if (task.isRecurring) {
    task.maintenanceWindowDates = calculateMaintenanceWindow(task);
    task.nextMaintenance = task.maintenanceWindowDates?.startDate;
  } else task.nextMaintenance = undefined;

  await task.save();
  return task;
};

/**
 * Postpones a task by a given number of days.
 * @param taskId - The ID of the task to postpone.
 * @param days - The number of days to postpone.
 * @returns The updated task.
 */
export const postponeTask = async (task_id: id | string, days: number) => {
  if (!isValidId(task_id)) throw new DBError("Invalid Task ID");

  const task = await Task.findById(task_id);
  if (!task) throw new DBError("Task not found");
  if (!task.nextMaintenance)
    throw new DBError("Next maintenance date is not set");

  task.nextMaintenance = addTimeToDate(task.nextMaintenance, days);
  await task.save();

  return task;
};
