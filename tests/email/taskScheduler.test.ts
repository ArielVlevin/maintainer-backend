import { Task } from "../../src/models/Task";
import { addDays } from "date-fns";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { sendEmail } from "../../src/services/emailServices";

import { scheduleTaskNotifications } from "../../src/services/scheduleTaskNotifications";

// Mock dependencies
jest.mock("../../src/models/Task");
jest.mock("../../src/models/Product");
jest.mock("../../src/models/User");
jest.mock("../../src/services/emailServices", () => ({
  sendEmail: jest.fn(), // Mocking sendEmail
}));

describe("🕒 Task Scheduler Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("✅ Should send an email notification for an upcoming task", async () => {
    // Mocked user and product
    const mockUser = {
      _id: "user123",
      email: "user@example.com",
      name: "John Doe",
    };
    const mockProduct = {
      _id: "product123",
      name: "Air Filter",
      notificationPreferences: [1, 0],
    };

    // Mocked task scheduled for tomorrow
    const mockTask = {
      _id: "task123",
      taskName: "Replace Air Filter",
      nextMaintenance: addDays(new Date(), 1),
      product_id: mockProduct,
      user_id: mockUser,
    };

    // Mock Task.find() to return the mock task
    (Task.find as jest.MockedFunction<typeof Task.find>).mockResolvedValue([
      mockTask,
    ]);

    // Run the scheduler manually
    await scheduleTaskNotifications();

    // Ensure email function is called
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      mockUser.email,
      expect.stringContaining("Reminder"), // Subject should contain "Reminder"
      expect.stringContaining("Replace Air Filter") // Email body should mention the task
    );
  });

  it("✅ Should not send an email if no tasks are due", async () => {
    (Task.find as jest.MockedFunction<typeof Task.find>).mockResolvedValue([]);
    await scheduleTaskNotifications();

    expect(sendEmail).not.toHaveBeenCalled(); // No email should be sent
  });

  it("✅ Should handle errors gracefully", async () => {
    (Task.find as jest.MockedFunction<typeof Task.find>).mockRejectedValue(
      new Error("Database error")
    );
    await expect(scheduleTaskNotifications()).resolves.not.toThrow();

    // Error should be logged
    expect(console.error).toHaveBeenCalled();
  });
});
