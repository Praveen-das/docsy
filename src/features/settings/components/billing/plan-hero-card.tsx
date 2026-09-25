"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubscriptionData } from "@/features/billing/use-subscription";
import { PLANS } from "@/lib/stripe-plans";

interface PlanHeroCardProps {
  subscription?: SubscriptionData;
  onClose?: () => void;
}

export function PlanHeroCard({ subscription, onClose }: PlanHeroCardProps) {
  const isPro = subscription?.plan === "pro";
  const planDef = isPro ? PLANS.pro : PLANS.free;

  const renewalDate = subscription?.planPeriodEnd
    ? new Date(subscription.planPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isCanceling = Boolean(subscription?.planCancelAt);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4.5 transition-all",
        isPro
          ? "border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-[#0c1017] to-purple-950/20 shadow-[0_0_24px_rgba(99,102,241,0.12)]"
          : "border-white/[0.08] bg-white/[0.02]"
      )}
    >
      {/* Subtle background glow effect for Pro */}
      {isPro && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/15 blur-2xl"
        />
      )}

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Plan details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-white tracking-tight">
              {planDef.name} Plan
            </span>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                isPro
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                  : "bg-white/10 text-zinc-400 border border-white/10"
              )}
            >
              {isPro ? "PRO" : "FREE TIER"}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-white">
              {isPro ? "$19" : "$0"}
            </span>
            <span className="text-xs text-zinc-400 font-normal">/ month</span>
          </div>

          {/* Status info */}
          <div className="pt-0.5 text-[11.5px] text-zinc-400 flex items-center gap-1.5">
            {isPro ? (
              isCanceling ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-300">
                    Cancels at end of billing cycle ({renewalDate})
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Active subscription {renewalDate ? `• Renews on ${renewalDate}` : ""}
                  </span>
                </>
              )
            ) : (
              <span>Complimentary access with core document features.</span>
            )}
          </div>
        </div>

        {/* Right: Primary action */}
        <div className="shrink-0 flex items-center sm:self-center">
          <Link href="/billing" onClick={onClose} className="w-full sm:w-auto">
            {isPro ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto rounded-xl gap-1.5 text-xs font-medium border-white/15 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <span>Manage Subscription</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="accent"
                size="sm"
                className="w-full sm:w-auto rounded-xl gap-2 text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Upgrade to Pro</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
