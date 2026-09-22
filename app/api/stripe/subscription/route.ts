import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscriptionByUserId } from "@/services/subscription.service";
import { getUserProfile } from "@/services/user.service";

/**
 * GET /api/stripe/subscription
 *
 * Returns the current user's subscription state and quota info.
 * Used by the billing page and the use-subscription hook.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [sub, profile] = await Promise.all([
    getSubscriptionByUserId(userId),
    getUserProfile(userId),
  ]);

  return NextResponse.json({
    plan: sub?.plan ?? "free",
    stripeSubscriptionId: sub?.stripeSubscriptionId ?? null,
    planPeriodEnd: sub?.planPeriodEnd?.toISOString() ?? null,
    planCancelAt: sub?.planCancelAt?.toISOString() ?? null,
    dailyQueriesUsed: profile?.dailyQueriesUsed ?? 0,
    dailyQueriesLimit: profile?.dailyQueriesLimit ?? 25,
  });
}
