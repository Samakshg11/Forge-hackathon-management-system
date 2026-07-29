import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    // Development: log emails to console instead of sending
    console.warn('⚠️  SMTP not configured — emails will be logged to console');
    transporter = {
      sendMail: async (opts) => {
        console.log('\n📧  [EMAIL STUB]', {
          to: opts.to,
          subject: opts.subject,
          text: opts.text || '(html only)',
        });
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  return transporter;
}

/**
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't throw — email failure should never crash a request
  }
}
