import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { reactivateSubscription } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/stripe/reactivate
 *
 * Removes cancel_at_period_end from the user's subscription so it
 * auto-renews instead of expiring. Only valid for subscriptions that
 * are still active but pending cancellation.
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await reactivateSubscription(userId);
    logger.info("stripe.reactivate.success", { userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("stripe.reactivate.failed", { userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
