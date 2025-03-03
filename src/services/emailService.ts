import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import logger from "../utils/logger";
import { addEmailToQueue } from "../queues/emailQueue";
import { ValidationError } from "../utils/CustomError";
import { format } from "date-fns";
import { IUser } from "../models/User";
import { IProduct } from "../models/Product";
import { ITask } from "../models/Task";

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
export async function ___sendEmail(to: string, subject: string, text: string) {
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
 * Sends an email using SendGrid.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The email subject.
 * @param {string} text - The plain text version of the email.
 * @param {string} html - The HTML version of the email.
 * @throws {Error} If the email fails to send.
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<void> {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER!,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    logger.info(`📧 Email sent successfully to: ${to}`);
  } catch (error) {
    logger.error("❌ Error sending email:", error);
    throw new Error("Failed to send email.");
  }
}

/**
 * Sends an email verification link using SendGrid.
 *
 * @param {string} to - Recipient email address.
 * @param {string} token - Unique verification token.
 */
export async function sendVerificationEmail(to: string, token: string) {
  if (!to) throw new ValidationError("Recipient email is required.");
  if (!token) throw new ValidationError("Verification token is missing.");

  const FRONTEND_URL = process.env.FRONTEND_URL;
  if (!FRONTEND_URL)
    throw new ValidationError(
      "FRONTEND_URL is not set in environment variables."
    );

  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;
  const subject = "Verify Your Email";
  const text = `Click the link to verify your email: ${verificationUrl}`;
  const html = `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`;

  try {
    addEmailToQueue(to, text, subject, html);
    logger.info(`📧 Verification email sent to ${to}`);
  } catch (error) {
    logger.error("❌ Error sending verification email:", error);
    throw new ValidationError("Failed to send verification email.");
  }
}

/**
 * Sends an email notification about a maintenance task for a product.
 *
 * @param user - The user who owns the product
 * @param product - The product that requires maintenance
 * @param task - The maintenance task
 */
export async function sendTaskStatusEmail(
  user: IUser,
  product: IProduct,
  task: ITask
) {
  try {
    const formattedDate = format(task.nextMaintenance!!, "PPP");
    const subject = `Reminder: ${task.taskName} Maintenance`;

    const textMessage = `Hello ${user.name},

Your maintenance task "${task.taskName}" for "${product.name}" is scheduled for ${formattedDate}.

Best,
Maintenance Tracker`;

    const htmlMessage = `
      <p>Hello ${user.name},</p>
      <p>Your maintenance task "<strong>${task.taskName}</strong>" for "<strong>${product.name}</strong>" is scheduled for <strong>${formattedDate}</strong>.</p>
      <p>Best,<br/>Maintenance Tracker</p>
    `;

    logger.info(
      `📧 Queueing email for ${user.email} about task: ${task.taskName}`
    );
    await addEmailToQueue(user.email, subject, textMessage, htmlMessage);

    logger.info(`✅ Email successfully queued for ${user.email}`);
  } catch (error) {
    logger.error(
      `❌ Error sending task reminder email to ${user.email}:`,
      error
    );
  }
}
