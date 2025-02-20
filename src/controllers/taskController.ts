import { NextFunction, Request, Response } from "express";
import { Task } from "../models/Task";
import { Product } from "../models/Product";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * @route   POST /tasks/:product_id
 * @desc    Create a new maintenance task for a specific product
 * @access  Public
 */
export const createTask = async (
  req: AuthRequest,
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

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    // Calculate next maintenance date
    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + frequency);

    // Create new task
    const newTask = new Task({
      product_id,
      user_id: req.user._id,
      taskName,
      description,
      lastMaintenance,
      frequency,
      nextMaintenance,
    });

    await newTask.save();

    // Add task to the product's task list
    product.tasks.push(newTask._id as mongoose.Types.ObjectId);
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
 * Fetch tasks for the authenticated user with pagination, filtering, and task lookup by ID.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new Error("Unauthorized: User not found");
    console.log("adfs");
    const userId = req.user._id;
    const {
      taskId,
      productId,
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // ✅ אם נשלח `taskId` - נחפש את המשימה הספציפית
    if (taskId) {
      if (!mongoose.isValidObjectId(taskId)) throw new Error("Invalid Task ID");

      const task = await Task.findOne({
        _id: taskId,
        user_id: userId,
      }).populate("product_id", "name category");
      if (!task) throw new Error("Task not found");
      console.log("tasks", task);

      res.status(200).json({ success: true, data: task });
      return;
    }

    // ✅ אם לא - נשלוף לפי מסננים
    const filter: any = { user_id: userId };
    if (productId) filter.product_id = productId;
    if (status) filter.status = status;
    if (search) {
      filter.taskName = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(filter)
      .sort({ nextMaintenance: 1 }) // Upcoming tasks first
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate("product_id", "name category");

    const total = await Task.countDocuments(filter);

    console.log("tasks", tasks);
    res.status(200).json({
      success: true,
      items: tasks,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
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

/**
 * @route   GET /tasks/:taskId
 * @desc    Fetch a specific task by its ID
 * @access  Public
 
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
 * @route   GET /tasks
 * @desc    Fetch all maintenance tasks for the logged-in user
 * @access  Private (Requires Authentication)
 
export const getUserTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return;
    }

    const userId = req.user._id;

    // ✅ Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // ✅ Fetch tasks for the user with sorting & pagination
    const tasks = await Task.find({ user_id: userId })
      .sort({ nextMaintenance: 1 }) // Sort by next maintenance date
      .skip(skip)
      .limit(limit);

    // ✅ Total task count for pagination info
    const total = await Task.countDocuments({ user_id: userId });

    res.status(200).json({
      tasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Error fetching user tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }

};


*/
