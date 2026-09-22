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
          ? "border-blue-500/40 bg-gradient-to-b from-blue-950/30 to-[#121216] shadow-lg shadow-blue-900/20 dark:border-blue-500/30"
          : "border-zinc-200 bg-white dark:border-white/8 dark:bg-[#121216]",
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h3
          className={cn(
            "text-base font-bold",
            plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100",
          )}
        >
          {plan.name}
        </h3>
        <p
          className={cn(
            "text-xs leading-relaxed",
            plan.highlighted ? "text-blue-200/70" : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        {isFree ? (
          <span
            className={cn(
              "text-3xl font-extrabold",
              plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100",
            )}
          >
            Free
          </span>
        ) : (
          <>
            <span
              className={cn(
                "text-3xl font-extrabold",
                plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100",
              )}
            >
              ${plan.monthlyPrice}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                plan.highlighted ? "text-blue-200/60" : "text-zinc-400 dark:text-zinc-500",
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
                  ? "text-blue-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            />
            <span
              className={cn(
                plan.highlighted ? "text-blue-100/80" : "text-zinc-600 dark:text-zinc-400",
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
            "w-full rounded-lg border py-2 text-center text-xs font-semibold",
            plan.highlighted
              ? "border-blue-500/30 bg-blue-900/30 text-blue-300"
              : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/5 dark:bg-white/5 dark:text-zinc-400",
          )}
        >
          Current Plan
        </div>
      ) : (
        <Button
          variant={plan.highlighted ? "accent" : "outline"}
          size="sm"
          className="w-full"
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
