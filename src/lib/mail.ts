import nodemailer from "nodemailer";

export type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  locale?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    user,
    pass,
    from: process.env.SMTP_FROM || user,
    to: process.env.CONTACT_TO_EMAIL || user,
  };
}

export function isMailConfigured() {
  return mailConfig() !== null;
}

export async function sendContactEmail(data: ContactMessage) {
  const config = mailConfig();
  if (!config) {
    throw new Error("SMTP is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  const service = data.service || "Not specified";
  const phone = data.phone || "Not provided";
  const locale = data.locale || "en";

  const text = [
    "New inquiry from the website contact form.",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${phone}`,
    `Service: ${service}`,
    `Language: ${locale}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  const html = `
    <p>New inquiry from the website contact form.</p>
    <table cellpadding="6" cellspacing="0" style="font-family:sans-serif;font-size:14px">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(data.email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
      <tr><td><strong>Service</strong></td><td>${escapeHtml(service)}</td></tr>
      <tr><td><strong>Language</strong></td><td>${escapeHtml(locale)}</td></tr>
    </table>
    <p><strong>Message</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
  `;

  await transporter.sendMail({
    from: `"Global Untold Story website" <${config.from}>`,
    to: config.to,
    replyTo: `${data.name} <${data.email}>`,
    subject: `New project inquiry — ${service}`,
    text,
    html,
  });
}
