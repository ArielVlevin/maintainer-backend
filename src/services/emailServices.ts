import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Sends a basic email using SendGrid.
 *
 * @param to - Recipient email address.
 * @param subject - Subject of the email.
 * @param text - Plain text content of the email.
 *
 * @example
 * sendEmail("user@example.com", "Welcome!", "Thank you for signing up!");
 */
export async function sendEmail(to: string, subject: string, text: string) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      text,
    });
    console.log("✅ Email sent!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

/**
 * Interface for sending templated emails.
 */
interface SendEmailWithTemplateProps {
  to: string; // Recipient email address
  template_id: "register" | "care"; // Template identifier
  dynamicData: Record<string, any>; // Dynamic data to inject into the email template
  from?: string; // Sender email address (optional, defaults to `SENDGRID_SENDER`)
}

/**
 * Sends an email using a predefined SendGrid template.
 *
 * @param to - Recipient email address.
 * @param template_id - The ID of the email template to use ("register" or "care").
 * @param dynamicData - An object containing dynamic template data.
 * @param from - Sender email address (optional, defaults to the configured sender).
 *
 * @example
 * sendEmailWithTemplate({
 *   to: "user@example.com",
 *   template_id: "care",
 *   dynamicData: {
 *     subject: "Reminder: Take care of your product!",
 *     userName: "John Doe",
 *     productName: "Coffee Machine",
 *     careInstructions: "Clean the filter every 2 weeks",
 *     productImageUrl: "https://example.com/image.jpg"
 *   }
 * });
 */
export async function sendEmailWithTemplate({
  to,
  template_id,
  dynamicData,
  from = process.env.SENDGRID_SENDER!,
}: SendEmailWithTemplateProps) {
  try {
    const msg = {
      to,
      from,
      subject: dynamicData.subject,
      templateId:
        template_id === "care"
          ? process.env.SENDGRID_TEMPLATE_CARE!
          : process.env.SENDGRID_TEMPLATE_REGISTER!,
      dynamicTemplateData: dynamicData, // Data to inject into the template
    };
    console.log("📧 Sending email with:", msg);

    await sgMail.send(msg);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

/**
 * Sends an email verification link using SendGrid.
 *
 * @param {string} to - Recipient email address.
 * @param {string} token - Unique verification token.
 */
export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  const msg = {
    to,
    from: process.env.SENDGRID_SENDER!,
    subject: "Verify Your Email",
    text: `Click the link to verify your email: ${verificationUrl}`,
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Verification email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email.");
  }
}
