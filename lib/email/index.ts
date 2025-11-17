import { resend, EMAIL_CONFIG } from './config';
import { render } from '@react-email/components';
import { WelcomeEmail } from './templates/welcome';
import { OrderCreatedEmail } from './templates/order-created';
import { SubscriptionStartedEmail } from './templates/subscription-started';
import { CardReminderEmail } from './templates/card-reminder';
import { CardCreditPurchasedEmail } from './templates/card-credit-purchased';
import { MissingAddressEmail } from './templates/missing-address';
import {
  WelcomeEmailProps,
  OrderCreatedEmailProps,
  SubscriptionStartedEmailProps,
  CardReminderEmailProps,
  CardCreditPurchasedEmailProps,
  MissingAddressEmailProps,
} from './types';

// Helper function to send emails
async function sendEmail(to: string, subject: string, react: React.ReactElement) {
  try {
    const html = await render(react);
    
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', { to, subject, id: data?.id });
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Welcome email when user signs up
export async function sendWelcomeEmail(props: WelcomeEmailProps) {
  return sendEmail(
    props.user.email,
    'Welcome to Avoid the Rain! 🎉',
    WelcomeEmail(props)
  );
}

// Order created notification
export async function sendOrderCreatedEmail(props: OrderCreatedEmailProps) {
  return sendEmail(
    props.user.email,
    `Your ${props.order.occasionType} card for ${props.order.recipientFirstName} is being prepared! 💌`,
    OrderCreatedEmail(props)
  );
}

// Subscription started
export async function sendSubscriptionStartedEmail(props: SubscriptionStartedEmailProps) {
  return sendEmail(
    props.user.email,
    `Welcome to ${props.planName}! 🎉`,
    SubscriptionStartedEmail(props)
  );
}

// Card reminder (3 days before occasion)
export async function sendCardReminderEmail(props: CardReminderEmailProps) {
  return sendEmail(
    props.user.email,
    `⏰ Reminder: ${props.order.recipientFirstName}'s ${props.order.occasionType} is in ${props.daysUntilOccasion} days!`,
    CardReminderEmail(props)
  );
}

// Card credit purchased
export async function sendCardCreditPurchasedEmail(props: CardCreditPurchasedEmailProps) {
  return sendEmail(
    props.user.email,
    'Thank you for your purchase! 🎉',
    CardCreditPurchasedEmail(props)
  );
}

// Missing address warning
export async function sendMissingAddressEmail(props: MissingAddressEmailProps) {
  return sendEmail(
    props.user.email,
    '⚠️ Action Required: Add your card delivery address',
    MissingAddressEmail(props)
  );
}

// Export all email functions
export {
  WelcomeEmail,
  OrderCreatedEmail,
  SubscriptionStartedEmail,
  CardReminderEmail,
  CardCreditPurchasedEmail,
  MissingAddressEmail,
};

