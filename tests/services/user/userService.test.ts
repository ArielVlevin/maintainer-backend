import {
  createUserIfNotExists,
  findUserById,
  updateUserById,
  sendVerification,
  verifyEmailToken,
} from "../../../src/services/authService";
import { id } from "../../../src/types/MongoDB";

describe("🧪 User Service Tests", () => {
  let user_id: id;
  let token: string;

  it("✅ Should create a new user", async () => {
    const user = await createUserIfNotExists("test3@example.com", "Test User");
    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
    user_id = user._id;
  });

  it("✅ Should find user by ID", async () => {
    const user = await findUserById(user_id);
    expect(user).toBeDefined();
    expect(user?.email).toBe("test@example.com");
  });

  it("✅ Should update user details", async () => {
    const updatedUser = await updateUserById(
      user_id,
      "New Name",
      "new@example.com"
    );
    expect(updatedUser).toBeDefined();
    expect(updatedUser.name).toBe("New Name");
    expect(updatedUser.email).toBe("new@example.com");
  });

  it("✅ Should send verification email", async () => {
    token = await sendVerification(user_id);
  });

  it("✅ Should verify email using token", async () => {
    const result = await verifyEmailToken(token);
    expect(result.success).toBe(true);
  });
});
