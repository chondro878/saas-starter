import { User, Order, Team } from '@/lib/db/schema';

export interface WelcomeEmailProps {
  user: User;
}

export interface SubscriptionStartedEmailProps {
  user: User;
  planName: string;
  cardLimit: number;
}

export interface SubscriptionChangedEmailProps {
  user: User;
  oldPlanName: string;
  newPlanName: string;
  newCardLimit: number;
}

export interface SubscriptionCancelledEmailProps {
  user: User;
  planName: string;
  cancellationDate: string;
}

export interface PaymentFailedEmailProps {
  user: User;
  planName: string;
  retryDate: string;
}

export interface OrderCreatedEmailProps {
  user: User;
  order: Order;
  occasionDate: string;
  daysUntilOccasion: number;
}

export interface CardReminderEmailProps {
  user: User;
  order: Order;
  occasionDate: string;
  daysUntilOccasion: number;
}

export interface CardCreditPurchasedEmailProps {
  user: User;
  creditsAdded: number;
  totalCredits: number;
}

export interface MissingAddressEmailProps {
  user: User;
  recipientName: string;
  occasionType: string;
  occasionDate: string;
}

export interface FirstRecipientEmailProps {
  user: User;
  recipientName: string;
}

