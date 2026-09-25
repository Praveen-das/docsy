"use client";

import React from "react";
import { Check, Minus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonRow {
  feature: string;
  category?: string;
  free: string | boolean;
  pro: string | boolean;
  highlight?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Daily AI Queries",
    free: "25 queries / day",
    pro: "200 queries / day",
    highlight: true,
  },
  {
    feature: "Document Library Size",
    free: "Up to 5 documents",
    pro: "Up to 200 documents",
    highlight: true,
  },
  {
    feature: "Total Storage Allowance",
    free: "50 MB",
    pro: "2 GB",
    highlight: true,
  },
  {
    feature: "Max File Upload Size",
    free: "10 MB / file",
    pro: "50 MB / file",
  },
  {
    feature: "Vector Search & Indexing",
    free: "Standard queue",
    pro: "Priority high-speed pipeline",
    highlight: true,
  },
  {
    feature: "Page-Level Citations",
    free: true,
    pro: true,
  },
  {
    feature: "Multi-Document Synthesis",
    free: true,
    pro: true,
  },
  {
    feature: "Interactive PDF Viewer Anchoring",
    free: true,
    pro: true,
  },
  {
    feature: "Support Level",
    free: "Community discord",
    pro: "Priority email & ticketing",
  },
];

export function FeatureComparisonTable() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-5 sm:p-6 shadow-xl shadow-black/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Plan Features Comparison</h3>
          <p className="text-[12px] text-zinc-400">
            Everything included in Free vs what unlocks when you level up to Pro.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-zinc-400">
              <th className="py-3 pr-4 font-medium">Capability</th>
              <th className="py-3 px-4 font-medium w-1/3">Free Tier</th>
              <th className="py-3 pl-4 font-semibold text-indigo-300 w-1/3">
                <span className="inline-flex items-center gap-1.5">
                  <span>Pro Plan</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                    Recommended
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {COMPARISON_ROWS.map((row) => (
              <tr
                key={row.feature}
                className={cn(
                  "transition-colors hover:bg-white/[0.02]",
                  row.highlight && "bg-white/[0.01]"
                )}
              >
                <td className="py-3 pr-4 font-medium text-zinc-300">
                  {row.feature}
                </td>

                {/* Free */}
                <td className="py-3 px-4 text-zinc-400">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Minus className="h-4 w-4 text-zinc-600" />
                    )
                  ) : (
                    <span>{row.free}</span>
                  )}
                </td>

                {/* Pro */}
                <td className="py-3 pl-4 font-medium text-zinc-100">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? (
                      <Check className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Minus className="h-4 w-4 text-zinc-600" />
                    )
                  ) : (
                    <span className={cn(row.highlight && "text-indigo-300 font-semibold")}>
                      {row.pro}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
