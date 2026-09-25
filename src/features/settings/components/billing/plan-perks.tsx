"use client";

import React from "react";
import { Check, Sparkles, Database, Shield, Zap } from "lucide-react";

interface PlanPerksProps {
  isPro: boolean;
}

const PRO_PERKS = [
  {
    icon: Zap,
    title: "200 AI Queries / Day",
    description: "8x daily allowance for heavy research and exploration.",
  },
  {
    icon: Database,
    title: "200 Documents Capacity",
    description: "Expanded storage with chunked vector embeddings.",
  },
  {
    icon: Sparkles,
    title: "Priority RAG Retrieval",
    description: "Faster query responses and higher neural synthesis depth.",
  },
  {
    icon: Shield,
    title: "Enterprise Protection",
    description: "Strict isolation, encrypted storage, and priority support.",
  },
];

export function PlanPerks({ isPro }: PlanPerksProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          {isPro ? "Your Pro Plan Features" : "Included with Docsy Pro"}
        </h4>
        <span className="text-[11px] text-indigo-400 font-medium">
          {isPro ? "All features unlocked" : "Upgrade anytime"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRO_PERKS.map((perk) => {
          const Icon = perk.icon;
          return (
            <div
              key={perk.title}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.015]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                {isPro ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-medium text-zinc-200 block truncate">
                  {perk.title}
                </span>
                <span className="text-[11px] text-zinc-500 block leading-snug">
                  {perk.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
