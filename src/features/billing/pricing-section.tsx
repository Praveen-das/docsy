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

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {heading}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{subheading}</p>
      </div>

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
