"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Zap, Shield, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/features/billing/use-subscription";
import BottomGlow from "@/components/ui/BottomGlow";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

/**
 * /pricing — Standalone, focused plans display with zero headers and zero sidebars.
 */
export default function PricingPage() {
  const { data: subscription, isLoading: isSubLoading } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const isPro = subscription?.plan === "pro";

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setIsUpgrading(false);
      }
    } catch {
      setIsUpgrading(false);
    }
  };

  const handleManage = async () => {
    setIsOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setIsOpeningPortal(false);
      }
    } catch {
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-[#f4f4f5] relative flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-200">
      {/* Ambient Horizon Glow */}
      <BottomGlow className="opacity-30 pointer-events-none" />

      {/* Top minimal navigation: Logo + Close exit button */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Logo size="sm" />
        </Link>
        <Link
          href="/dashboard"
          title="Back to Docsy"
          aria-label="Close pricing"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
        >
          <X className="h-4 w-4" />
        </Link>
      </header>

      {/* Main Dedicated Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto w-full space-y-8 sm:space-y-10">
        {/* Title & Tagline */}
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Choose your plan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Scale your document intelligence with higher query quotas, expanded storage, and priority RAG pipelines.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mx-auto items-stretch">
          {/* Free Tier Card */}
          <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c1017]/80 p-6 sm:p-8 backdrop-blur-xl transition-all hover:border-white/[0.14]">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-zinc-400">
                    {!isSubLoading && !isPro ? "Current Plan" : "Free Tier"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Free</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Essential AI document analysis for students, individual researchers, and exploratory work.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-extrabold tracking-tight text-white">$0</span>
                <span className="text-xs text-zinc-400 font-normal">/ month</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Included Features</p>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>25 AI queries per day</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Up to 5 documents</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>50 MB document storage</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Page-level citations & sources</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Multi-document chat</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Standard processing speed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action */}
            <div className="pt-8">
              {!isSubLoading && !isPro ? (
                <Button variant="outline" disabled className="w-full text-xs font-semibold py-2.5">
                  Current Plan
                </Button>
              ) : (
                <Button variant="secondary" disabled className="w-full text-xs font-semibold py-2.5">
                  Included in Account
                </Button>
              )}
            </div>
          </div>

          {/* Pro Plan Card */}
          <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-indigo-500/35 bg-gradient-to-b from-indigo-950/40 via-[#0c1017] to-purple-950/25 p-6 sm:p-8 shadow-[0_0_40px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden transition-all hover:border-indigo-500/50">
            {/* Ambient Radial Spotlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"
            />

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
                    <Sparkles className="h-3 w-3 fill-current" />
                    <span>Recommended</span>
                  </span>
                  {!isSubLoading && isPro && (
                    <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Pro</h2>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  High-throughput intelligence for technical papers, corporate reports, and complex libraries.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-4xl font-extrabold tracking-tight text-white">$19</span>
                <span className="text-xs text-zinc-400 font-normal">/ month</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Everything in Free, plus:
                </p>
                <ul className="space-y-3 text-xs text-zinc-200">
                  <li className="flex items-center gap-2.5 font-medium">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>200 AI queries per day (8x allowance)</span>
                  </li>
                  <li className="flex items-center gap-2.5 font-medium">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Up to 200 documents capacity</span>
                  </li>
                  <li className="flex items-center gap-2.5 font-medium">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>2 GB high-speed document storage</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Priority RAG neural pipeline</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Instant vector embedding indexing</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>Priority email support & dedicated queue</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action */}
            <div className="relative z-10 pt-8">
              {!isSubLoading && isPro ? (
                <Button
                  variant="outline"
                  onClick={handleManage}
                  isLoading={isOpeningPortal}
                  className="w-full gap-2 text-xs font-semibold py-2.5 border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/10"
                >
                  <Shield className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Manage Subscription</span>
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={handleUpgrade}
                  isLoading={isUpgrading}
                  className="w-full gap-2 text-xs font-semibold py-2.5 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Upgrade to Pro ($19/mo)</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-6 text-center text-[11px] text-zinc-500">
        <span>Secure payment processing powered by Stripe • Cancel anytime</span>
      </footer>
    </div>
  );
}
