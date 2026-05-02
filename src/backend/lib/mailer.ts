import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM    = process.env.SMTP_FROM ?? "HighFin <noreply@highfin.app>";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:   process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    // Dev fallback — log to stdout so the developer can click the link
    console.log(`\n[DEV] HighFin verification email`);
    console.log(`[DEV]   To:   ${to}`);
    console.log(`[DEV]   Link: ${link}\n`);
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your HighFin email",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#065f46">Welcome to HighFin, ${name}!</h2>
        <p>Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${link}"
           style="display:inline-block;margin:16px 0;padding:12px 28px;background:#10b981;color:white;border-radius:8px;text-decoration:none;font-weight:bold">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">
          If you didn't create a HighFin account you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Welcome to HighFin, ${name}!\n\nVerify your email:\n${link}\n\nThis link expires in 24 hours.`,
  });
}
