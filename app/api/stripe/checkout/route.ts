import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/services/subscription.service";
import { PLANS } from "@/lib/stripe-plans";
import { logger } from "@/lib/logger";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for a Pro subscription upgrade.
 * Returns { url } — the client redirects to the Stripe-hosted Checkout page.
 */
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = PLANS.pro.stripePriceId;

  if (!priceId) {
    logger.error("stripe.checkout.missing_price_id", { userId });
    return NextResponse.json(
      { error: "Pro plan price ID not configured. Set STRIPE_PRO_PRICE_ID in .env." },
      { status: 500 },
    );
  }

  try {
    const url = await createCheckoutSession(userId, priceId);
    logger.info("stripe.checkout.session_created", { userId });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("stripe.checkout.failed", { userId, error: message });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
