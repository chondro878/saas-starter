import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  cardCredits: integer('card_credits').notNull().default(0),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// Recipients table - people who will receive cards
export const recipients = pgTable('recipients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  relationship: varchar('relationship', { length: 50 }).notNull(), // Romantic, Family, Friend, etc.
  street: varchar('street', { length: 255 }).notNull(),
  apartment: varchar('apartment', { length: 100 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zip: varchar('zip', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('United States'),
  addressStatus: varchar('address_status', { length: 20 }).notNull().default('pending'),
  addressNotes: text('address_notes'),
  addressVerifiedAt: timestamp('address_verified_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Occasions table - dates to remember for each recipient
export const occasions = pgTable('occasions', {
  id: serial('id').primaryKey(),
  recipientId: integer('recipient_id')
    .notNull()
    .references(() => recipients.id),
  occasionType: varchar('occasion_type', { length: 50 }).notNull(), // Birthday, Anniversary, etc.
  occasionDate: timestamp('occasion_date').notNull(), // The actual date
  notes: text('notes'), // Special notes for this occasion
  createdAt: timestamp('created_at').notNull().defaultNow(),
  
  // Just Because fields
  isJustBecause: boolean('is_just_because').notNull().default(false),
  computedSendDate: timestamp('computed_send_date'), // Hidden random date for Just Because
  cardVariation: varchar('card_variation', { length: 50 }), // thinking_of_you, romantic, recognition
  lastSentYear: integer('last_sent_year'), // Track annual recurrence
});

// User addresses table - for return addresses and shipping
export const userAddresses = pgTable('user_addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  isDefault: integer('is_default').notNull().default(0), // 1 = default, 0 = not default
  street: varchar('street', { length: 255 }).notNull(),
  apartment: varchar('apartment', { length: 100 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zip: varchar('zip', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('United States'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const recipientsRelations = relations(recipients, ({ one, many }) => ({
  user: one(users, {
    fields: [recipients.userId],
    references: [users.id],
  }),
  occasions: many(occasions),
}));

export const occasionsRelations = relations(occasions, ({ one }) => ({
  recipient: one(recipients, {
    fields: [occasions.recipientId],
    references: [recipients.id],
  }),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
}));

// Type exports
export type Recipient = typeof recipients.$inferSelect;
export type NewRecipient = typeof recipients.$inferInsert;
export type Occasion = typeof occasions.$inferSelect;
export type NewOccasion = typeof occasions.$inferInsert;
export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;

export type RecipientWithOccasions = Recipient & {
  occasions: Occasion[];
};

// Orders table - tracks cards to be printed and sent
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  recipientId: integer('recipient_id')
    .references(() => recipients.id),
  occasionId: integer('occasion_id')
    .references(() => occasions.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  
  // Card type: subscription, bulk, or individual
  cardType: varchar('card_type', { length: 20 }).notNull().default('subscription'),
  // subscription = included in user's plan
  // bulk = from bulk holiday pack purchase
  // individual = extra card purchased individually
  
  // Key dates
  occasionDate: timestamp('occasion_date').notNull(), // The actual birthday/anniversary/holiday
  printDate: timestamp('print_date'), // When you printed the labels
  mailDate: timestamp('mail_date'), // When you marked as mailed
  
  // Status tracking
  status: varchar('status', { length: 20 }).notNull().default('pending'), 
  // pending = needs to be printed today
  // printed = you printed but haven't mailed yet
  // mailed = you've sent it
  // cancelled = user cancelled/deleted recipient
  
  // Recipient address (snapshot at time of order creation)
  recipientFirstName: varchar('recipient_first_name', { length: 100 }).notNull(),
  recipientLastName: varchar('recipient_last_name', { length: 100 }).notNull(),
  recipientStreet: varchar('recipient_street', { length: 255 }).notNull(),
  recipientApartment: varchar('recipient_apartment', { length: 100 }),
  recipientCity: varchar('recipient_city', { length: 100 }).notNull(),
  recipientState: varchar('recipient_state', { length: 50 }).notNull(),
  recipientZip: varchar('recipient_zip', { length: 20 }).notNull(),
  
  // Return address (from user's default address)
  returnName: varchar('return_name', { length: 200 }).notNull(), // Customer's name
  returnStreet: varchar('return_street', { length: 255 }).notNull(),
  returnApartment: varchar('return_apartment', { length: 100 }),
  returnCity: varchar('return_city', { length: 100 }).notNull(),
  returnState: varchar('return_state', { length: 50 }).notNull(),
  returnZip: varchar('return_zip', { length: 20 }).notNull(),
  
  // Occasion details
  occasionType: varchar('occasion_type', { length: 50 }).notNull(), // Birthday, Anniversary, etc.
  occasionNotes: text('occasion_notes'), // Any notes from the occasion
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  recipient: one(recipients, {
    fields: [orders.recipientId],
    references: [recipients.id],
  }),
  occasion: one(occasions, {
    fields: [orders.occasionId],
    references: [occasions.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [orders.teamId],
    references: [teams.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
