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

  test("Should update 'healthy' tasks to 'maintenance' if within 7 days", async () => {
    const task = await createTestTask(user._id, product._id, {
      nextMaintenance: addDays(new Date(), 6), // 6 days ahead
      status: "healthy",
    });

    await checkTasks();
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask?.status).toBe("maintenance");
  });

  test("Should update 'maintenance' tasks to 'overdue' if past due date", async () => {
    const task = await createTestTask(user._id, product._id, {
      nextMaintenance: subDays(new Date(), 1), // 1 day late
      status: "maintenance",
    });

    await checkTasks();
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask?.status).toBe("overdue");
  });

  test("Should NOT change tasks that are still far away", async () => {
    const task = await createTestTask(user._id, product._id, {
      nextMaintenance: addDays(new Date(), 10), // 10 days ahead
      status: "healthy",
    });

    await checkTasks();
    const updatedTask = await Task.findById(task._id);
    expect(updatedTask?.status).toBe("healthy"); // Should remain the same
  });
});
