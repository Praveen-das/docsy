"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Zap } from "lucide-react";
import { useSubscription } from "@/features/billing/use-subscription";
import { PricingSection } from "@/features/billing/pricing-section";
import { SubscriptionStatus } from "@/features/billing/subscription-status";
import { UsageGauge } from "@/features/billing/usage-gauge";

/**
 * /billing — Subscription management and plan comparison page.
 *
 * Shows different UI depending on the user's current plan:
 * - Free: pricing cards + upgrade CTA
 * - Pro (active): status card + cancel option
 * - Pro (canceling): status card + reactivate option
 */
export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const isPro = subscription?.plan === "pro";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Billing & Subscription
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage your plan, view usage, and control your subscription.
        </p>
      </div>

      {/* Checkout success / cancel banners */}
      {checkoutResult === "success" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="font-semibold">Upgrade successful!</span> Your Pro subscription is
            active. It may take a moment for your quota to update.
          </div>
        </div>
      )}
      {checkoutResult === "cancelled" && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-white/5 dark:bg-white/5 dark:text-zinc-400">
          <CreditCard className="h-4 w-4 shrink-0" />
          Checkout was cancelled. Your plan was not changed.
        </div>
      )}

      {/* Usage card — always visible */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-4 dark:border-white/5 dark:bg-[#121216]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Daily Usage</h3>
          </div>
          {isLoading ? (
            <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-white/5 dark:bg-white/5 dark:text-zinc-300">
              {isPro ? "Pro" : "Free"} Plan
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-1.5 w-full animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ) : (
          <UsageGauge
            used={subscription?.dailyQueriesUsed ?? 0}
            limit={subscription?.dailyQueriesLimit ?? 25}
          />
        )}
      </div>

      {/* Pro status + cancel/reactivate — only for Pro users */}
      {!isLoading && isPro && subscription && (
        <SubscriptionStatus subscription={subscription} />
      )}

      {/* Pricing section — show always for Free, show comparison for Pro */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xs dark:border-white/5 dark:bg-[#121216]">
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <PricingSection
            currentPlan={subscription?.plan ?? "free"}
            heading={isPro ? "Your Current Plan" : "Upgrade to Pro"}
            subheading={
              isPro
                ? "You're on the Pro plan. Compare features below."
                : "Unlock unlimited documents, 200 queries/day, and priority processing."
            }
          />
        )}
      </div>
    </div>
  );
}
