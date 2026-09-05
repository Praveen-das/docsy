"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { currentUser } from "@/lib/mock-data";
import {
  User,
  Sparkles,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const [referenceDepth, setReferenceDepth] = useState(5);
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const dailyQueriesUsed = currentUser.dailyQueriesUsed;
  const dailyQueriesLimit = currentUser.dailyQueriesLimit;
  const dailyQueriesPercent = Math.round((dailyQueriesUsed / dailyQueriesLimit) * 100);
  const dailyQueriesRemainingPercent = Math.max(0, 100 - dailyQueriesPercent);

  const themeOptions = [
    {
      id: "light" as const,
      label: "Light",
      description: "Clean white & gray foundation for daytime clarity",
      icon: Sun,
    },
    {
      id: "dark" as const,
      label: "Dark",
      description: "Grok-inspired deep black aesthetic with high contrast",
      icon: Moon,
    },
    {
      id: "system" as const,
      label: "System",
      description: "Automatically matches your operating system preference",
      icon: Monitor,
    },
  ];

  return (
    <AppLayout title="Account Settings">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Account & App Preferences
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your visual appearance, account details, daily query quota, and reading preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-4 dark:border-white/10 dark:bg-[#141418]">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 font-semibold text-base dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20">
              AC
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-500 dark:text-zinc-400 block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                readOnly
                value={currentUser.name}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 focus:outline-none dark:border-white/10 dark:bg-[#1c1c22] dark:text-zinc-200"
              />
            </div>
            <div>
              <label className="text-zinc-500 dark:text-zinc-400 block mb-1 font-medium">Email Address</label>
              <input
                type="email"
                readOnly
                value={currentUser.email}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 focus:outline-none dark:border-white/10 dark:bg-[#1c1c22] dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Daily Query Quota */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-4 dark:border-white/10 dark:bg-[#141418]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-white/5">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0071e3]" />
                <span>Daily Query Quota</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Your daily allowance for asking questions and analyzing documents.
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-600/10 dark:border-blue-500/20 px-2.5 py-1 rounded-full">
                {dailyQueriesRemainingPercent}% remaining
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/60 p-4 dark:border-white/5 dark:bg-[#101014]/60">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Daily Queries</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">{dailyQueriesPercent}% used</span>
            </div>

            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#0071e3] rounded-full transition-all duration-300"
                style={{ width: `${dailyQueriesPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
              <span>{dailyQueriesRemainingPercent}% remaining</span>
              <span>Resets daily at midnight UTC</span>
            </div>
          </div>
        </div>

        {/* Answering Preferences */}
        <form
          onSubmit={handleSaveConfig}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-6 dark:border-white/10 dark:bg-[#141418]"
        >
          <div className="border-b border-zinc-100 pb-4 dark:border-white/5">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#0071e3]" />
              <span>Answering Preferences</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Customize how thoroughly your documents are reviewed when answering questions.
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Reference Depth */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200">Source Reference Depth</label>
                <span className="font-bold text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-600/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                  {referenceDepth} passages
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={referenceDepth}
                onChange={(e) => setReferenceDepth(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500">
                Higher depth checks more pages across the document to provide thorough, multi-page answers.
              </p>
            </div>

            {/* Direct Excerpt Inclusion */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="includeQuotes"
                checked={includeQuotes}
                onChange={(e) => setIncludeQuotes(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-700 dark:bg-[#1c1c22]"
              />
              <label htmlFor="includeQuotes" className="text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <span className="font-semibold block">Show exact source excerpts</span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  Hovering over a page citation will preview the exact sentence from your file.
                </span>
              </label>
            </div>

            {/* Privacy notice */}
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3.5 text-[11px] text-zinc-600 border border-zinc-200 dark:bg-[#101014] dark:text-zinc-400 dark:border-white/5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">Private & Isolated:</span> Your
                documents and conversations belong strictly to you. Your files are never public and are never shared
                with other users or used to train general public systems.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-4">
            {savedNotice ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Preferences updated successfully
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Preferences apply to all new questions.</span>
            )}

            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>

        {/* Appearance & Theme Section */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-5 dark:border-white/10 dark:bg-[#141418]">
          <div className="border-b border-zinc-100 pb-4 dark:border-white/5">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#0071e3]" />
              <span>Appearance & Theme</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Choose your interface color scheme or let Docsy follow your device settings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={cn(
                    "flex flex-col items-start text-left p-4 rounded-xl border transition-all cursor-pointer relative",
                    isSelected
                      ? "border-[#0071e3] bg-blue-50/50 shadow-xs ring-1 ring-[#0071e3]/30 dark:border-[#0071e3] dark:bg-[#0071e3]/10"
                      : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-[#18181f] dark:hover:border-white/20 dark:hover:bg-[#1e1e26]",
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isSelected
                          ? "bg-[#0071e3] text-white"
                          : "bg-white text-zinc-600 border border-zinc-200 dark:bg-[#24242d] dark:text-zinc-400 dark:border-white/10",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071e3] text-white text-[10px]">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{opt.label}</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 flex items-center justify-between dark:border-rose-500/20 dark:bg-rose-500/5">
          <div>
            <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400">Sign Out</h4>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              End your current session and return to the sign in page.
            </p>
          </div>
          <Link href="/login">
            <Button variant="destructive" size="sm">
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
