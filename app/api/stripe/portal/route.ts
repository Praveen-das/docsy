import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCustomerPortalSession } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal Session for managing subscriptions,
 * saved payment methods, billing addresses, and invoices.
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await createCustomerPortalSession(userId);
    logger.info("stripe.portal.created", { userId });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to open customer portal";
    logger.error("stripe.portal.failed", { userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
