"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { useSubscription } from "@/features/billing/use-subscription";
import { PricingSection } from "@/features/billing/pricing-section";
import { FeatureComparisonTable } from "@/features/billing/feature-comparison-table";
import { BillingFaq } from "@/features/billing/billing-faq";

/**
 * /pricing — Dedicated plans, pricing comparison, and feature breakdown page.
 */
export default function PricingPage() {
  const { data: subscription, isLoading: isSubLoading } = useSubscription();
  const isPro = subscription?.plan === "pro";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div className="space-y-1">
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Billing & Quotas</span>
          </Link>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Subscription Plans
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Choose the right plan for your document analysis needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-200">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span>Current: {isPro ? "Pro Plan" : "Free Tier"}</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div id="pricing-plans-section">
        {isSubLoading ? (
          <div className="h-80 animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
        ) : (
          <PricingSection
            currentPlan={subscription?.plan ?? "free"}
            heading={isPro ? "Your Active Plan" : "Upgrade to Pro"}
            subheading={
              isPro
                ? "You're currently enjoying unlimited AI capabilities on the Pro plan."
                : "Level up your document intelligence with unlimited access, 200 daily queries, and priority processing."
            }
          />
        )}
      </div>

      {/* Feature Comparison Matrix */}
      <FeatureComparisonTable />

      {/* Billing FAQ */}
      <BillingFaq />
    </div>
  );
}
