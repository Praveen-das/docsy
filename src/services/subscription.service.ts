import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserById } from "@/services/user.service";
import { getDailyQueryLimit, type PlanId } from "@/lib/stripe-plans";
import { logger } from "@/lib/logger";

import type { SubscriptionRecord } from "@/db/schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Customer management
// ---------------------------------------------------------------------------

/**
 * Get or create a Stripe Customer for a given Clerk user ID.
 * Stores the customer ID in the subscriptions table for future lookups.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const sub = await getSubscriptionByUserId(userId);

  if (sub?.stripeCustomerId) {
    return sub.stripeCustomerId;
  }

  const user = await getUserById(userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { clerkUserId: userId },
  });

  await db
    .insert(subscriptions)
    .values({
      userId,
      stripeCustomerId: customer.id,
      plan: "free",
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { stripeCustomerId: customer.id, updatedAt: new Date() },
    });

  logger.info("subscription.customer_created", { userId, customerId: customer.id });
  return customer.id;
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout Session for a subscription upgrade.
 * Returns the hosted Checkout URL to redirect the user to.
 *
 * Per Stripe best-practices:
 * - No `payment_method_types` (dynamic payment methods)
 * - Uses `integration_identifier` for Dashboard tracking
 */
export async function createCheckoutSession(userId: string, priceId: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/billing?checkout=success`,
    cancel_url: `${APP_URL}/billing?checkout=cancelled`,
    integration_identifier: `docsy-upgrade-jkqxmlpt`,
    subscription_data: {
      metadata: { clerkUserId: userId },
    },
    metadata: { clerkUserId: userId },
  });

  if (!session.url) throw new Error("Stripe Checkout session URL is missing");

  logger.info("subscription.checkout_created", { userId, sessionId: session.id });
  return session.url;
}

// ---------------------------------------------------------------------------
// Cancellation & Reactivation
// ---------------------------------------------------------------------------

/**
 * Cancel the user's active subscription at the end of the current period.
 * The user retains Pro access until `cancelAt`.
 */
export async function cancelSubscription(userId: string): Promise<{ cancelAt: Date | null }> {
  const sub = await getSubscriptionByUserId(userId);
  if (!sub?.stripeSubscriptionId) {
    throw new Error("No active subscription found for this user");
  }

  const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const cancelAt = updated.cancel_at ? new Date(updated.cancel_at * 1000) : null;

  await db
    .update(subscriptions)
    .set({ planCancelAt: cancelAt, updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));

  logger.info("subscription.cancel_scheduled", { userId, cancelAt });
  return { cancelAt };
}

/**
 * Reactivate a subscription that is pending cancellation (cancel_at_period_end = true).
 * Removes the cancellation flag so the subscription auto-renews.
 */
export async function reactivateSubscription(userId: string): Promise<void> {
  const sub = await getSubscriptionByUserId(userId);
  if (!sub?.stripeSubscriptionId) {
    throw new Error("No subscription found for this user");
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await db
    .update(subscriptions)
    .set({ planCancelAt: null, updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));

  logger.info("subscription.reactivated", { userId });
}

// ---------------------------------------------------------------------------
// Sync (called from workflow steps)
// ---------------------------------------------------------------------------

/**
 * Upsert a Stripe Customer ID into the subscriptions table.
 */
export async function upsertCustomerId(userId: string, customerId: string): Promise<void> {
  await db
    .insert(subscriptions)
    .values({ userId, stripeCustomerId: customerId, plan: "free" })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { stripeCustomerId: customerId, updatedAt: new Date() },
    });
}

/**
 * Sync a Stripe Subscription object into the DB.
 * Resolves plan from price metadata, updates period end and cancel_at.
 */
export async function syncSubscriptionToDB(stripeSubscriptionId: string): Promise<{
  userId: string;
  plan: PlanId;
  periodEnd: Date | null;
  cancelAt: Date | null;
}> {
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
    expand: ["items.data.price"],
  });

  // Resolve clerkUserId from metadata (set during Checkout)
  const userId = (stripeSub.metadata?.clerkUserId as string | undefined) ?? "";
  if (!userId) throw new Error(`No clerkUserId in subscription metadata: ${stripeSubscriptionId}`);

  const priceId = stripeSub.items.data[0]?.price?.id ?? null;

  // Derive plan from price ID
  const plan: PlanId = priceId === process.env.STRIPE_PRO_PRICE_ID ? "pro" : "free";

  // The Stripe Subscription object carries these fields at runtime.
  // Cast through unknown to handle the strict SDK types for the latest API version.
  const subAny = stripeSub as unknown as {
    current_period_end?: number;
    cancel_at?: number | null;
    status: string;
  };

  const periodEnd = subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : null;

  const cancelAt = subAny.cancel_at ? new Date(subAny.cancel_at * 1000) : null;

  // If the subscription is deleted/expired, downgrade to free
  const effectivePlan: PlanId = stripeSub.status === "active" || stripeSub.status === "trialing" ? plan : "free";

  await db
    .insert(subscriptions)
    .values({
      userId,
      stripeSubscriptionId,
      stripePriceId: priceId,
      plan: effectivePlan,
      planPeriodEnd: periodEnd,
      planCancelAt: cancelAt,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeSubscriptionId,
        stripePriceId: priceId,
        plan: effectivePlan,
        planPeriodEnd: periodEnd,
        planCancelAt: cancelAt,
        updatedAt: new Date(),
      },
    });

  logger.info("subscription.synced", { userId, plan: effectivePlan, stripeSubscriptionId });
  return { userId, plan: effectivePlan, periodEnd, cancelAt };
}

// ---------------------------------------------------------------------------
// Quota helpers (called from workflow)
// ---------------------------------------------------------------------------

/**
 * Update the daily query limit in the users table to match the plan.
 */
export async function updateUserQuotaForPlan(userId: string, plan: PlanId): Promise<void> {
  const newLimit = getDailyQueryLimit(plan);

  const { users } = await import("@/db/schema");
  await db.update(users).set({ dailyQueriesLimit: newLimit, updatedAt: new Date() }).where(eq(users.id, userId));

  logger.info("subscription.quota_updated", { userId, plan, newLimit });
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

export async function getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null> {
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

  return result[0] ?? null;
}

export async function getSubscriptionByCustomerId(customerId: string): Promise<SubscriptionRecord | null> {
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, customerId)).limit(1);

  return result[0] ?? null;
}
