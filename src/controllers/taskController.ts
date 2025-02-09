import { Request, Response } from "express";
import { Task } from "../models/Task";
import { Product } from "../models/Product";
import mongoose from "mongoose";

/**
 * @route   POST /tasks/:product_id
 * @desc    Create a new maintenance task for a specific product
 * @access  Public
 */
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { product_id } = req.params;
    const { taskName, description, lastMaintenance, frequency } = req.body;

    // Check if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Calculate next maintenance date
    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + frequency);

    // Create new task
    const newTask = new Task({
      product_id,
      taskName,
      description,
      lastMaintenance,
      frequency,
      nextMaintenance,
    });

    await newTask.save();

    // Add task to the product's task list
    product.taskIds.push(newTask._id as mongoose.Types.ObjectId);
    await product.save();

    res
      .status(201)
      .json({ message: "Task added successfully", product, task: newTask });
  } catch (error) {
    res.status(500).json({
      error: "Error creating task",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   GET /tasks
 * @desc    Fetch all maintenance tasks
 * @access  Public
 */
export const getAllTasks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching tasks",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   GET /tasks/:taskId
 * @desc    Fetch a specific task by its ID
 * @access  Public
 */
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching task",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   PUT /tasks/:taskId
 * @desc    Update an existing task
 * @access  Public
 */
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });

    if (!updatedTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      error: "Error updating task",
      details: (error as Error).message,
    });
  }
};

/**
 * @route   DELETE /tasks/:taskId
 * @desc    Delete a task and remove its reference from associated products
 * @access  Public
 */
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;

    // Delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Remove the task from any products that referenced it
    await Product.updateMany(
      { taskIds: taskId },
      { $pull: { taskIds: taskId } }
    );

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting task",
      details: (error as Error).message,
    });
  }
};
