import path from "path";
import nodemailer from "nodemailer";

// Embedded via cid so the logo renders in the email itself (recipients'
// mail clients can't reach a localhost dev URL, and this works the same
// once the site has a real public URL too).
const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo-main.png");

// Gmail SMTP via an App Password (see .env.example) — free, well under
// Gmail's daily sending limit for this tool's volume (admin setup/reset
// links only). Falls back to no-op (logs instead of sending) if unset, so
// local dev without email configured doesn't crash.
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  includeLogo = false,
}: {
  to: string;
  subject: string;
  html: string;
  includeLogo?: boolean;
}) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME ?? "JCI Phnom Penh";
  const user = process.env.GMAIL_USER;

  if (!transporter || !user) {
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipped sending "${subject}" to ${to}`);
    return;
  }

  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    html,
    attachments: includeLogo
      ? [{ filename: "logo-main.png", path: LOGO_PATH, cid: "jci-logo" }]
      : undefined,
  });
}
