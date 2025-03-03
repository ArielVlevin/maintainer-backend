import {
  getVerificationEmail,
  deleteVerificationToken,
} from "../../src/config/redis";
import { User } from "../../src/models/User";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { verifyEmailToken } from "../../src/services/authService";

jest.mock("../../src/config/redis", () => ({
  getVerificationEmail: jest.fn(),
  deleteVerificationToken: jest.fn(),
}));

jest.mock("../../src/models/User", () => ({
  findOne: jest.fn(),
}));

describe("🧪 Email Token Verification", () => {
  const testEmail = "test@example.com";
  const testToken = "test_token";

  it("✅ Should verify a valid email token", async () => {
    (
      getVerificationEmail as jest.MockedFunction<typeof getVerificationEmail>
    ).mockResolvedValue(testEmail);
    (
      User.findOne as jest.MockedFunction<typeof User.findOne>
    ).mockResolvedValue({
      email: testEmail,
      save: jest.fn(),
    } as any);
    const result = await verifyEmailToken(testToken);

    expect(getVerificationEmail).toHaveBeenCalledWith(testToken);
    expect(deleteVerificationToken).toHaveBeenCalledWith(testToken);
    expect(result.success).toBe(true);
  });

  it("❌ Should return an error for an invalid token", async () => {
    (
      getVerificationEmail as jest.MockedFunction<typeof getVerificationEmail>
    ).mockResolvedValue(null);
    const result = await verifyEmailToken(testToken);

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Token expired or invalid. Please request a new verification email."
    );
  });
});
