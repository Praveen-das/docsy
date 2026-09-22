/**
 * Stripe plan definitions — single source of truth for plan limits and Price IDs.
 *
 * Price IDs come from environment variables so they work across test/live without
 * code changes. Create the products in the Stripe Dashboard or via CLI, then
 * copy the price_... IDs into your .env.
 */

export type PlanId = "free" | "pro";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number | null; // null = free
  stripePriceId: string | null;
  dailyQueryLimit: number;
  maxDocuments: number | null; // null = unlimited
  features: string[];
  highlighted: boolean;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "For individuals exploring document AI",
    monthlyPrice: null,
    stripePriceId: null,
    dailyQueryLimit: 25,
    maxDocuments: 5,
    features: [
      "25 AI queries per day",
      "Up to 5 documents",
      "Page-level citations",
      "Multi-document chat",
      "Standard processing speed",
    ],
    highlighted: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For professionals and teams doing serious document work",
    monthlyPrice: 19,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    dailyQueryLimit: 200,
    maxDocuments: 200,
    features: [
      "200 AI queries per day",
      "Up to 200 documents",
      "Page-level citations",
      "Multi-document chat",
      "Priority processing",
      "Advanced analytics",
    ],
    highlighted: true,
  },
};

export function getPlan(planId: PlanId): PlanDefinition {
  return PLANS[planId];
}

export function getDailyQueryLimit(planId: PlanId): number {
  return PLANS[planId].dailyQueryLimit;
}
