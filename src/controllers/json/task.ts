import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { IProduct, ITask } from "../types";

const jsonFilePath = path.join(__dirname, "../data/sample_data.json");

const loadJsonData = () => {
  if (fs.existsSync(jsonFilePath)) {
    return JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  }
  return { users: [], products: [], tasks: [] };
};

const saveJsonData = (data: any) => {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 4), "utf-8");
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { product_id } = req.params;
    const { taskName, description, lastMaintenance, frequency } = req.body;

    const data = loadJsonData();
    const product = data.products.find((p: IProduct) => p._id === product_id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + frequency);

    const newTask = {
      _id: Date.now().toString(),
      product_id,
      taskName,
      description,
      lastMaintenance,
      frequency,
      nextMaintenance,
    };
    data.tasks.push(newTask);
    product.taskIds.push(newTask._id);
    saveJsonData(data);

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    res.status(500).json({
      error: "Error creating task",
      details: (error as Error).message,
    });
  }
};

export const getAllTasks = async (_req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    res.json(data.tasks);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching tasks",
      details: (error as Error).message,
    });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    const task = data.tasks.find((t: ITask) => t._id === req.params.taskId);
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

export const updateTask = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    const taskIndex = data.tasks.findIndex(
      (t: ITask) => t._id === req.params.taskId
    );
    if (taskIndex === -1) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...req.body };
    saveJsonData(data);
    res.json(data.tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({
      error: "Error updating task",
      details: (error as Error).message,
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    const taskId = req.params.taskId;
    data.tasks = data.tasks.filter((t: ITask) => t._id !== taskId);
    data.products.forEach((product: IProduct) => {
      product.taskIds = product.taskIds.filter((id) => String(id) !== taskId);
    });
    saveJsonData(data);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting task",
      details: (error as Error).message,
    });
  }
};
