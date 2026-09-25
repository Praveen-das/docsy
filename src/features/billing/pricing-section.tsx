"use client";

import { useState } from "react";
import { PLANS } from "@/lib/stripe-plans";
import { PricingCard } from "./pricing-card";
import type { PlanId } from "@/lib/stripe-plans";

interface PricingSectionProps {
  currentPlan?: PlanId;
  /** Heading to show above the cards */
  heading?: string;
  subheading?: string;
}

/**
 * Two-column pricing section — Free vs Pro.
 * Used on the landing page and the billing page.
 */
export function PricingSection({
  currentPlan = "free",
  heading = "Simple, Transparent Pricing",
  subheading = "Start free. Upgrade when you need more power.",
}: PricingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error ?? "Failed to create checkout session");
        setIsLoading(false);
      }
    } catch {
      setCheckoutError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {heading}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">{subheading}</p>
      </div>

      {checkoutError && (
        <div className="max-w-md mx-auto p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/20 rounded-xl text-center">
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {(["free", "pro"] as PlanId[]).map((planId) => (
          <PricingCard
            key={planId}
            plan={PLANS[planId]}
            isCurrentPlan={currentPlan === planId}
            onUpgrade={handleUpgrade}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
