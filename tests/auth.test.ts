import request from "supertest";
import app from "../src/app";
import { User } from "../src/models/User";

describe("Auth API", () => {
  beforeEach(async () => {
    // ✅ מנקה את כל המשתמשים מהמסד הווירטואלי לפני יצירת משתמש חדש
    await User.deleteMany({});

    // יצירת משתמש דמה למסד הנתונים הווירטואלי
    await User.create({
      name: "Test User",
      email: "test@example.com",
    });
  });

  it("should return 404 when logging in with non-existing user", async () => {
    const res = await request(app)
      .post("/api/auth/verifyUser")
      .send({ email: "wrong@example.com", name: "wrong" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 200 and a token when logging in with valid user", async () => {
    const res = await request(app)
      .post("/api/auth/verifyUser")
      .send({ email: "test@example.com", name: "Test User" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
