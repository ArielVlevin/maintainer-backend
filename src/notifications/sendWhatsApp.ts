import dotenv from "dotenv";
import twilio from "twilio";

// Load environment variables from the .env file
dotenv.config();

// Initialize Twilio client with credentials from environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends a WhatsApp message using Twilio.
 *
 * @param to - The recipient's phone number in E.164 format prefixed with "whatsapp:", e.g., "whatsapp:+1234567890".
 * @param messageBody - The message content to send.
 * @returns A Promise that resolves when the message is sent successfully.
 *
 * @example
 * sendWhatsAppMessage("whatsapp:+7555555555", "🚀 Hello from Twilio & TypeScript!");
 */
export async function sendWhatsAppMessage(
  to: string,
  messageBody: string
): Promise<void> {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER, // Twilio WhatsApp sender number
      to: to, // Recipient number with "whatsapp:" prefix
      body: messageBody, // Message content
    });

    console.log(
      "✅ WhatsApp message sent successfully! Message SID:",
      message.sid
    );
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
  }
}

// 📌 Example usage: Sending a test message via WhatsApp
sendWhatsAppMessage(
  process.env.MY_NUMBER!,
  "🚀 Message from Twilio with TypeScript!"
);
