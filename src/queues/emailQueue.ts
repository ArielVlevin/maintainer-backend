import { Queue, Worker } from "bullmq";
import logger from "../utils/logger";
import { sendEmail } from "../services/emailService";

// ✅ Redis connection for queue
const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

// ✅ Define the email queue
export const emailQueue = new Queue("emailQueue", { connection });

/**
 * Adds an email job to the queue.
 * @param to - Recipient email.
 * @param subject - Email subject.
 * @param html - HTML content.
 * @returns Job instance.
 */
export const addEmailToQueue = async (
  to: string,
  text: string,
  subject: string,
  html: string
) => {
  try {
    await emailQueue.add("sendEmail", { to, subject, text, html });
    logger.info(`📩 Email queued for ${to}`);
  } catch (error) {
    logger.error("❌ Error adding email to queue:", error);
  }
};

// ✅ Worker to process email jobs
new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, text, html } = job.data;
    try {
      await sendEmail(to, subject, text, html); // ✅ Uses your existing email system
      logger.info(`✅ Email sent to ${to}`);
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, error);
    }
  },
  { connection }
);

logger.info("🚀 Email queue is running...");
