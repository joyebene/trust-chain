
import { BrevoClient } from "@getbrevo/brevo";

const apiKey = process.env.BREVO_API_KEY;

const brevo = apiKey
  ? new BrevoClient({ apiKey })
  : null;

export async function sendMail(
  to: string,
  subject: string,
  html: string
) {
  if (!brevo) {
    console.warn(
      "Brevo is not configured. Email skipped:",
      subject
    );
    return false;
  }

  if (!to || !to.trim()) {
    console.warn("Email recipient is missing.");
    return false;
  }

  try {
    const result =
      await brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.MAIL_FROM_NAME || "Investment Platform",
          email: process.env.MAIL_FROM!,
        },
        to: [
          {
            email: to.trim(),
          },
        ],
        subject,
        htmlContent: html,
      });

    console.log("Brevo accepted email:", {
      recipient: to.trim(),
      subject,
      messageId: result.messageId,
    });

    return true;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw error;
  }
}
