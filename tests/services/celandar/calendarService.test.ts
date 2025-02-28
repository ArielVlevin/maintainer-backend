import { createUserIfNotExists } from "../../../src/services/authService";
import { createProduct } from "../../../src/services/productService";
import {
  getProductTasksForCalendar,
  getUserTasksForCalendar,
} from "../../../src/services/calendarService";

import { createTask } from "../../../src/services/taskService";
import { id } from "../../../src/types/MongoDB";

describe("🧪 Calendar Service Tests", () => {
  let user_id: id;
  let product_id: id;
  let task_id: id;

  beforeAll(async () => {
    const user = await createUserIfNotExists("test1@example.com", "Test User");
    user_id = user._id;

    const product = await createProduct(user_id, {
      name: "Test Product1",
      category: "Electronics",
      manufacturer: "TechBrand",
      model: "X100",
      tags: ["tag1", "tag2"],
      purchaseDate: new Date(),
    });

    product_id = product._id;

    const result = await createTask(user_id, product_id, {
      taskName: "Test Task",
      description: "Test Description",
      lastMaintenance: new Date(),
      frequency: 30,
    });

    task_id = result.task._id;
  });

  it("✅ Should fetch user tasks for calendar", async () => {
    const events = await getUserTasksForCalendar(user_id);
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });

  it("✅ Should fetch product tasks for calendar", async () => {
    const events = await getProductTasksForCalendar(product_id);
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });
});
