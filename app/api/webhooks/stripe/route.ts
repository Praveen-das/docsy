import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { getWorkflowClient } from "@/lib/workflow";
import { getSubscriptionByCustomerId } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/webhooks/stripe
 *
 * Unauthenticated endpoint — verified via Stripe-Signature header.
 * Does minimal work: validate signature → extract payload → trigger the
 * durable `provision-subscription` Upstash Workflow → return 200 immediately.
 *
 * Heavy lifting (DB writes, quota updates) happens in the workflow with retries.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  console.log("webhook request receiverd");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error("stripe.webhook.missing_secret", {});
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("stripe.webhook.signature_failed", { error: message });
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  logger.info("stripe.webhook.received", { type: event.type, id: event.id });

  const HANDLED_EVENTS = new Set([
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
  ]);

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, skipped: true });
  }

  // Extract the minimum identifiers needed to dispatch the workflow.
  // Full subscription data is fetched inside the workflow steps via Stripe API.
  let customerId: string | null = null;
  let subscriptionId: string | null = null;
  let clerkUserId: string | null = null;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        customer?: string | null;
        subscription?: string | null;
        metadata?: Record<string, string> | null;
      };
      customerId = typeof session.customer === "string" ? session.customer : null;
      subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
      clerkUserId = session.metadata?.clerkUserId ?? null;
    } else if (event.type === "invoice.paid") {
      const invoice = event.data.object as { customer?: string | null; subscription?: string | null };
      customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
    } else {
      // customer.subscription.updated / deleted
      const sub = event.data.object as {
        id: string;
        customer?: string | null;
        metadata?: Record<string, string> | null;
      };
      subscriptionId = sub.id;
      customerId = typeof sub.customer === "string" ? sub.customer : null;
      clerkUserId = sub.metadata?.clerkUserId ?? null;
    }

    // If clerkUserId wasn't in metadata, look it up from our DB via customerId
    if (!clerkUserId && customerId) {
      const dbSub = await getSubscriptionByCustomerId(customerId);
      clerkUserId = dbSub?.userId ?? null;
    }

    if (!clerkUserId || !customerId) {
      logger.error("stripe.webhook.missing_ids", { eventType: event.type, customerId, clerkUserId });
      // Return 200 so Stripe doesn't retry — we can't recover without IDs
      return NextResponse.json({ received: true, skipped: true });
    }

    console.log("triggering workflow");
    // Dispatch the durable workflow — returns immediately, retries handled by QStash
    const client = getWorkflowClient();
    const { workflowRunId } = await client.trigger({
      url: `${APP_URL}/api/workflows/provision-subscription`,
      body: {
        eventType: event.type,
        customerId,
        subscriptionId,
        clerkUserId,
      },
    });

    logger.info("stripe.webhook.workflow_triggered", {
      eventType: event.type,
      customerId,
      clerkUserId,
      workflowRunId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("stripe.webhook.dispatch_failed", { error: message, eventType: event.type });
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: "Workflow dispatch failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
