import {
  sendEmail,
  sendEmailWithTemplate,
  sendVerificationEmail,
} from "../../src/services/emailService";
import sgMail from "@sendgrid/mail";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202, body: "Accepted" }]), // מדמה הצלחה
}));

describe("🧪 Email Service Tests", () => {
  const testEmail = "test@example.com";

  it("✅ Should send a basic email", async () => {
    await sendEmail(testEmail, "Test Subject", "This is a test email.");
    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(sgMail.send).toHaveBeenCalledWith({
      to: testEmail,
      from: process.env.SENDGRID_SENDER!,
      subject: "Test Subject",
      text: "This is a test email.",
    });
  });

  it("✅ Should send an email with a template", async () => {
    const templateData = {
      subject: "Reminder: Maintenance Due",
      userName: "John Doe",
      productName: "Coffee Machine",
      careInstructions: "Clean the filter every 2 weeks",
      productImageUrl: "https://example.com/image.jpg",
    };

    await sendEmailWithTemplate({
      to: testEmail,
      template_id: "care",
      dynamicData: templateData,
    });

    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testEmail,
        from: process.env.SENDGRID_SENDER!,
        subject: "Reminder: Maintenance Due",
        templateId: process.env.SENDGRID_TEMPLATE_CARE!,
        dynamicTemplateData: templateData,
      })
    );
  });

  it("✅ Should send a verification email", async () => {
    const testToken = "test_token";
    const expectedVerificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${testToken}`;

    await sendVerificationEmail(testEmail, testToken);

    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: testEmail,
        from: process.env.SENDGRID_SENDER!,
        subject: "Verify Your Email",
        text: `Click the link to verify your email: ${expectedVerificationUrl}`,
        html: `<p>Click <a href="${expectedVerificationUrl}">here</a> to verify your email.</p>`,
      })
    );
  });
});
