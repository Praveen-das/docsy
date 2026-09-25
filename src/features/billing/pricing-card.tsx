"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanDefinition } from "@/lib/stripe-plans";

interface PricingCardProps {
  plan: PlanDefinition;
  isCurrentPlan: boolean;
  onUpgrade: () => void;
  isLoading?: boolean;
}

/**
 * A single pricing plan card.
 * Highlighted (Pro) variant uses an accent border and glow effect.
 */
export function PricingCard({ plan, isCurrentPlan, onUpgrade, isLoading }: PricingCardProps) {
  const isFree = plan.monthlyPrice === null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 sm:p-7 flex flex-col gap-5 transition-all duration-200",
        plan.highlighted
          ? "border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 via-[#0c1017] to-[#08090d] shadow-xl shadow-indigo-950/30"
          : "border-white/[0.08] bg-[#0c1017]"
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-3 py-1 text-[11px] font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-white/15">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">
          {plan.name}
        </h3>
        <p
          className={cn(
            "text-xs leading-relaxed",
            plan.highlighted ? "text-indigo-200/70" : "text-zinc-400"
          )}
        >
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        {isFree ? (
          <span className="text-3xl font-extrabold text-white">
            Free
          </span>
        ) : (
          <>
            <span className="text-3xl font-extrabold text-white">
              ${plan.monthlyPrice}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                plan.highlighted ? "text-indigo-200/60" : "text-zinc-400"
              )}
            >
              / month
            </span>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-xs">
            <Check
              className={cn(
                "h-3.5 w-3.5 shrink-0 mt-0.5",
                plan.highlighted
                  ? "text-indigo-400"
                  : "text-emerald-400"
              )}
            />
            <span
              className={cn(
                plan.highlighted ? "text-indigo-100/90" : "text-zinc-300"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <div
          className={cn(
            "w-full rounded-xl border py-2.5 text-center text-xs font-semibold",
            plan.highlighted
              ? "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
              : "border-white/10 bg-white/[0.04] text-zinc-300"
          )}
        >
          Current Plan
        </div>
      ) : (
        <Button
          variant={plan.highlighted ? "accent" : "outline"}
          size="sm"
          className="w-full active:scale-[0.98] transition-transform"
          onClick={onUpgrade}
          disabled={isLoading || isFree}
          id={`upgrade-to-${plan.id}-btn`}
        >
          {isLoading ? "Redirecting…" : isFree ? "Free Forever" : `Upgrade to ${plan.name}`}
        </Button>
      )}
    </div>
  );
}
