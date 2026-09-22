import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const planEnum = pgEnum("plan", ["free", "pro"]);

/**
 * Stripe subscription metadata joined to the users table.
 * Kept in a separate file so the core users table remains minimal.
 *
 * Populated exclusively via the provision-subscription Upstash Workflow
 * triggered by Stripe webhooks.
 */
export const subscriptions = pgTable("subscriptions", {
  /** FK → users.id (Clerk user ID) */
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),

  plan: planEnum("plan").notNull().default("free"),

  /** ISO timestamp — when the current billing period ends */
  planPeriodEnd: timestamp("plan_period_end", { withTimezone: true }),

  /** Set when user requests cancellation — null means auto-renewing */
  planCancelAt: timestamp("plan_cancel_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SubscriptionRecord = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
