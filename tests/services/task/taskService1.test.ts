import { createUserIfNotExists } from "../../../src/services/authService";
import { createProduct } from "../../../src/services/productService";
import {
  createTask,
  findTaskById,
  updateTask,
  deleteTask,
  completeTask,
} from "../../../src/services/taskService";
import { id } from "../../../src/types/MongoDB";

describe("🛠 Task Service Tests", () => {
  let task_id: id;
  let user_id: id;
  let product_id: id;

  beforeAll(async () => {
    const user = await createUserIfNotExists("test2@example.com", "Test User");
    user_id = user._id;

    const product = await createProduct(user_id, {
      name: "Test Product2",
      category: "Test Category",
      manufacturer: "Test Manufacturer",
      model: "T123",
      tags: ["tag1", "tag2"],
      purchaseDate: new Date(),
    });
    product_id = product._id;
  });

  it("✅ Should create a new task", async () => {
    const result = await createTask(user_id, product_id, {
      taskName: "Test Task",
      description: "Task Description",
      lastMaintenance: new Date(),
      frequency: 30,
    });

    expect(result.task).toBeDefined();
    expect(result.task.taskName).toBe("Test Task");
    task_id = result.task._id;
  });

  it("✅ Should find task by ID", async () => {
    const task = await findTaskById(task_id);
    expect(task).toBeDefined();
    expect(task.taskName).toBe("Test Task");
  });

  it("✅ Should update task details", async () => {
    const updatedTask = await updateTask(task_id, { taskName: "Updated Task" });
    expect(updatedTask).toBeDefined();
    expect(updatedTask.taskName).toBe("Updated Task");
  });

  it("✅ Should complete a task", async () => {
    const completedTask = await completeTask(task_id);
    expect(completedTask.status).toBe("completed");
  });

  it("✅ Should delete task", async () => {
    const result = await deleteTask(task_id);
    expect(result.message).toBe("Task deleted successfully");
  });
});
