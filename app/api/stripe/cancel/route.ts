import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cancelSubscription } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/stripe/cancel
 *
 * Sets cancel_at_period_end = true on the user's active subscription.
 * The subscription remains active until the billing period ends, then
 * Stripe fires customer.subscription.deleted → workflow downgrades to Free.
 *
 * Returns the updated cancelAt timestamp so the UI can update inline
 * without a page reload.
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cancelAt } = await cancelSubscription(userId);

    logger.info("stripe.cancel.success", { userId, cancelAt });

    return NextResponse.json({
      success: true,
      cancelAt: cancelAt?.toISOString() ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("stripe.cancel.failed", { userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
