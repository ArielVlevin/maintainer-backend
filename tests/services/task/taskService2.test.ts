import { ITask, Task } from "../../../src/models/Task";
import { createUserIfNotExists } from "../../../src/services/authService";
import { createProduct } from "../../../src/services/productService";
import {
  createTask,
  findTaskById,
  updateTask,
  deleteTask,
  completeTask,
  postponeTask,
} from "../../../src/services/taskService";
import { id } from "../../../src/types/MongoDB";
import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

describe("🛠️ Task Service Tests", () => {
  let user_id: id;
  let task_id: id;
  let product_id: id;

  beforeAll(async () => {
    const userEmail = `test${Date.now()}@example.com`;
    const user = await createUserIfNotExists(userEmail, "Test User");
    user_id = user._id;

    const product = await createProduct(user_id, {
      name: "Test Product",
      category: "Electronics",
      manufacturer: "TestBrand",
      model: "T123",
      tags: ["test", "electronics"],
      purchaseDate: new Date(),
      tasks: [],
      iconUrl: "https://example.com/icon.png",
    });

    product_id = product._id;
  });

  it("✅ Should create a new task", async () => {
    const taskData = new Task({
      taskName: "Test Task",
      description: "This is a test task",
      lastMaintenance: new Date(),
      frequency: 30,
      nextMaintenance: new Date(),
      product_id,
      status: "pending",
    });

    const task = await createTask(user_id, product_id, taskData);
    expect(task.task).toBeDefined();
    expect(task.task.taskName).toBe("Test Task");
    task_id = task.task._id;
  });

  it("✅ Should find task by ID", async () => {
    const task = await findTaskById(task_id);
    expect(task).toBeDefined();
    expect(task?.taskName).toBe("Test Task");
  });

  it("✅ Should update task details", async () => {
    const updatedTask = await updateTask(task_id, { taskName: "Updated Task" });
    expect(updatedTask).toBeDefined();
    expect(updatedTask.taskName).toBe("Updated Task");
  });

  it("✅ Should mark task as completed", async () => {
    const completedTask = await completeTask(task_id);
    expect(completedTask).toBeDefined();
    expect(completedTask.status).toBe("completed");
  });

  it("✅ Should postpone task", async () => {
    const postponedTask = await postponeTask(task_id, 7);
    expect(postponedTask).toBeDefined();
  });

  it("✅ Should delete a task", async () => {
    const result = await deleteTask(task_id);
    expect(result).toBeDefined();
    expect(result.message).toBe("Task deleted successfully");
  });
});
