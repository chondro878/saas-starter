import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'Avoid the Rain <onboarding@avoidtherain.com>';

export const EMAIL_CONFIG = {
  from: EMAIL_FROM,
  replyTo: 'hello@avoidtherain.com',
};

