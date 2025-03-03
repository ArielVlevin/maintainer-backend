import request from "supertest";
import app from "../../src/app";
import { connectDB, disconnectDB } from "../../src/config/db";
import { User } from "../../src/models/User";
import { Product } from "../../src/models/Product";
import { Task } from "../../src/models/Task";

import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

describe("🧪 API Integration Tests", () => {
  let token: string;
  let user_id: string;
  let product_id: string;
  let task_id: string;

  beforeAll(async () => {
    // יצירת משתמש לבדיקה
    const userResponse = await request(app).post("/api/auth/verify-user").send({
      email: "test@example.com",
      name: "Test User",
    });

    token = userResponse.body.data.token;
    user_id = userResponse.body.data._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Task.deleteMany({});
  });

  describe("🔹 Authentication", () => {
    it("✅ Should verify user", async () => {
      const res = await request(app)
        .post("/api/auth/verify-user")
        .send({ email: "test@example.com", name: "Test User" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("test@example.com");
    });
  });

  describe("🔹 Product API", () => {
    it("✅ Should create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Product",
          category: "Electronics",
          purchaseDate: new Date(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      product_id = res.body.data._id;
    });

    it("✅ Should fetch products", async () => {
      const res = await request(app)
        .get("/api/products")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it("✅ Should delete a product", async () => {
      const res = await request(app)
        .delete(`/api/products/${product_id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("🔹 Task API", () => {
    it("✅ Should create a task", async () => {
      const res = await request(app)
        .post(`/api/tasks/${product_id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          taskName: "Clean Filter",
          frequency: 30,
          lastMaintenance: new Date(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      task_id = res.body.task._id;
    });

    it("✅ Should mark a task as completed", async () => {
      const res = await request(app)
        .put(`/api/tasks/${task_id}/complete`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("✅ Should delete a task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task_id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
