import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  test,
  beforeEach,
} from "@jest/globals";

import { checkTasks } from "../../../src/services/taskCron";
import { addDays, subDays } from "date-fns";
import { Task } from "../../../src/models/Task";
import {
  createTestProduct,
  createTestTask,
  createTestUser,
} from "../../testUtils";

// Mock email sending
jest.mock("../../../src/services/emailService", () => ({
  sendTaskStatusEmail: jest.fn(),
}));

describe("Task Scheduler", () => {
  let user: any;
  let product: any;

  beforeAll(async () => {
    // Create a test user and product
    user = await createTestUser(`test${Date.now()}@example.com`);
    product = await createTestProduct(user._id);
  });

  beforeEach(async () => {
    await Task.deleteMany(); // Clean database before each test
  });

  test("Should NOT change 'completed' task status", async () => {
    const task = await createTestTask(user._id, product._id, {
      nextMaintenance: addDays(new Date(), 3),
      status: "completed",
    });

    await checkTasks();
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask?.status).toBe("completed"); // Should remain completed
  });

  test("Should NOT change status if already 'overdue'", async () => {
    const task = await createTestTask(user._id, product._id, {
      nextMaintenance: subDays(new Date(), 5), // 5 days late
      status: "overdue",
    });

    await checkTasks();
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask?.status).toBe("overdue"); // Should remain overdue
  });

  test("Should update 'maintenance' task to 'overdue' if nextMaintenance is today", async () => {
    const task = await createTestTask(user._id, product._id, {
      nextMaintenance: new Date(), // Today
      status: "maintenance",
    });

    await checkTasks();
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask?.status).toBe("overdue"); // Should now be overdue
  });
});
