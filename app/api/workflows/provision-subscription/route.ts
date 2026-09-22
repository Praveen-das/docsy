import { serve } from "@upstash/workflow/nextjs";
import {
  upsertCustomerId,
  syncSubscriptionToDB,
  updateUserQuotaForPlan,
} from "@/services/subscription.service";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * Payload forwarded by the Stripe webhook handler.
 * We pass only what's needed — full event reconstruction happens
 * inside the workflow so steps remain idempotent.
 */
type ProvisionPayload = {
  /** Stripe event type e.g. "checkout.session.completed" */
  eventType: string;
  /** Stripe Customer ID */
  customerId: string;
  /** Stripe Subscription ID (may be null for deleted events) */
  subscriptionId: string | null;
  /** Clerk user ID from Stripe metadata */
  clerkUserId: string;
};

/**
 * POST /api/workflows/provision-subscription
 *
 * Durable Upstash Workflow for provisioning a Stripe subscription.
 * Each step is checkpointed — retries after a partial failure restart
 * from the failed step, never from the beginning.
 *
 * Triggered by the Stripe webhook handler with a validated event payload.
 */
export const { POST } = serve<ProvisionPayload>(
  async (context) => {
    const { eventType, customerId, subscriptionId, clerkUserId } = context.requestPayload;

    // -----------------------------------------------------------------------
    // Step 1: Validate event — ensure we have the minimum required identifiers
    // -----------------------------------------------------------------------
    await context.run("validate-event", async () => {
      if (!clerkUserId) {
        throw new Error(`Missing clerkUserId in payload for event: ${eventType}`);
      }
      if (!customerId) {
        throw new Error(`Missing customerId in payload for event: ${eventType}`);
      }

      logger.info("provision.validate_event", { eventType, clerkUserId, customerId, subscriptionId });
    });

    // -----------------------------------------------------------------------
    // Step 2: Sync customer — upsert the Stripe customer ID into our DB
    // -----------------------------------------------------------------------
    await context.run("sync-customer", async () => {
      await upsertCustomerId(clerkUserId, customerId);
      logger.info("provision.sync_customer", { clerkUserId, customerId });
    });

    // -----------------------------------------------------------------------
    // Step 3: Sync subscription — fetch from Stripe, write plan + period end
    // Skipped for deleted events where subscriptionId would be null
    // -----------------------------------------------------------------------
    const syncResult = await context.run("sync-subscription", async () => {
      if (!subscriptionId) {
        // Subscription deleted → downgrade to free
        const { subscriptions } = await import("@/db/schema");
        await db
          .update(subscriptions)
          .set({
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            planPeriodEnd: null,
            planCancelAt: null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, clerkUserId));

        logger.info("provision.sync_subscription_deleted", { clerkUserId });
        return { userId: clerkUserId, plan: "free" as const, periodEnd: null, cancelAt: null };
      }

      return await syncSubscriptionToDB(subscriptionId);
    });

    // -----------------------------------------------------------------------
    // Step 4: Update quota — set dailyQueriesLimit based on new plan
    // -----------------------------------------------------------------------
    await context.run("update-quota", async () => {
      await updateUserQuotaForPlan(syncResult.userId, syncResult.plan);
      logger.info("provision.update_quota", {
        userId: syncResult.userId,
        plan: syncResult.plan,
      });
    });

    // -----------------------------------------------------------------------
    // Step 5: Reset usage — zero out dailyQueriesUsed on invoice.paid events
    // (billing cycle renews → fresh slate for the day)
    // -----------------------------------------------------------------------
    await context.run("reset-usage", async () => {
      if (eventType !== "invoice.paid") return;

      await db
        .update(users)
        .set({ dailyQueriesUsed: 0, updatedAt: new Date() })
        .where(eq(users.id, syncResult.userId));

      logger.info("provision.reset_usage", { userId: syncResult.userId });
    });
  },
  {
    failureFunction: async ({ context, failStatus, failResponse }) => {
      const payload = context.requestPayload;
      const errorMessage = failResponse ?? `Workflow failed with status ${failStatus}`;

      logger.error("provision.workflow_failed", {
        eventType: payload?.eventType,
        clerkUserId: payload?.clerkUserId,
        subscriptionId: payload?.subscriptionId,
        error: String(errorMessage),
      });
    },
  },
);
