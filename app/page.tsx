"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  FileCheck2,
  MessageSquare,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoQuery {
  question: string;
  page: number;
  highlightText: string;
  answerLead: string;
  bulletPoints: string[];
}

const DEMO_QUERIES: DemoQuery[] = [
  {
    question: "What drove the automotive margin improvements in Q4?",
    page: 12,
    highlightText:
      "Reductions in per-vehicle cost reached $35,100, driven by raw material savings in battery cells and manufacturing throughput.",
    answerLead:
      "According to page 12 of the filing, automotive margins improved to 17.8% based on two specific operational factors:",
    bulletPoints: [
      "Per-vehicle cost dropped to an all-time low of $35,100.",
      "Raw material deflation in battery cells yielded 70 bps sequential improvement.",
    ],
  },
  {
    question: "What are the 2026 capital expenditure & compute projections?",
    page: 14,
    highlightText:
      "Tesla projects 2026 capital expenditures to be between $10.5B and $11.5B, focused on scaling autonomous compute clusters and energy storage factories.",
    answerLead:
      "As detailed on page 14 under Capital Allocation Guidance, spending targets are specified as:",
    bulletPoints: [
      "Capital expenditures planned between $10.5B and $11.5B.",
      "Dedicated compute cluster expansion in Austin and energy production in Lathrop.",
    ],
  },
];

export default function LandingPage() {
  const [activeQueryIdx, setActiveQueryIdx] = useState(0);
  const [spotlightPulse, setSpotlightPulse] = useState(false);

  const activeQuery = DEMO_QUERIES[activeQueryIdx];

  const handleSelectQuery = (idx: number) => {
    setActiveQueryIdx(idx);
    setSpotlightPulse(true);
    setTimeout(() => setSpotlightPulse(false), 2400);
  };

  const handleCitationClick = () => {
    setSpotlightPulse(true);
    setTimeout(() => setSpotlightPulse(false), 2400);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#08080a] dark:text-[#f4f4f5] flex flex-col selection:bg-blue-600 selection:text-white transition-colors">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-white/5 dark:bg-[#0e0e12]/90">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center focus-visible:outline-none" title="Docsy AI Home">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Benefits
            </a>
            <a href="#use-cases" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Who It&apos;s For
            </a>
            <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Dashboard
              </Button>
            </Link>
            <Link href="/conversation">
              <Button variant="accent" size="sm" className="text-xs">
                <span>Start Conversation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Product Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3.5 py-1 text-xs font-semibold text-zinc-700 shadow-2xs dark:border-white/10 dark:bg-[#141418] dark:text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Document Intelligence & Page Verification</span>
          </div>

          <h1 className="max-w-4xl mx-auto text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.12]">
            Stop skimming 100-page documents.{" "}
            <span className="text-[#0071e3] dark:text-blue-400 underline decoration-blue-500/40 underline-offset-8">
              Verify answers with page proof.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Docsy analyzes complex PDFs, financial reports, and technical agreements—giving you clear answers where every statement is grounded in clickable, page-level citations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/conversation">
              <Button size="lg" variant="accent" className="w-full sm:w-auto">
                <MessageSquare className="h-4 w-4" />
                <span>Try Interactive Conversation</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <FileText className="h-4 w-4" />
                <span>Open Dashboard</span>
              </Button>
            </Link>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Direct page citations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Zero guesswork
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Confidential & private
            </span>
          </div>

          {/* Interactive Split-Screen Live Demo */}
          <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-2 sm:p-3 shadow-2xl max-w-5xl mx-auto text-left dark:border-white/10 dark:bg-[#121216]">
            {/* Top Interactive Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-2.5 border-b border-zinc-100 bg-zinc-50/80 rounded-t-xl text-xs dark:border-white/5 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Interactive Preview:
                </span>
                <div className="flex items-center gap-1.5">
                  {DEMO_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuery(idx)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                        activeQueryIdx === idx
                          ? "bg-zinc-900 text-white border border-zinc-800 shadow-xs font-semibold dark:bg-[#24242b] dark:border-white/10"
                          : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-[#141418] dark:text-zinc-400 dark:border-white/10 dark:hover:bg-[#1a1a22] dark:hover:text-zinc-200"
                      )}
                    >
                      Question {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-900 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
                <Bookmark className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Click citation tags below to spotlight text</span>
              </div>
            </div>

            {/* Split Screen Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[360px] bg-zinc-50 dark:bg-[#09090b] text-xs">
              {/* Left Document View */}
              <div className="border-r border-zinc-200 bg-white p-5 sm:p-6 flex flex-col justify-between dark:border-white/5 dark:bg-[#121216]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Tesla_Q4_2025_Financial_Report.pdf
                    </span>
                    <span className="font-mono text-zinc-600 bg-zinc-100 dark:text-zinc-300 dark:bg-[#1c1c22] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/5">
                      Page {activeQuery.page} of 28
                    </span>
                  </div>

                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Operating Highlights & Financial Breakdown
                  </h4>

                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-serif text-[12px]">
                    During the fourth quarter of 2025, vehicle production and energy deployment trends continued to stabilize following automated line improvements across our primary facilities...
                  </p>

                  {/* Spotlight Citation Box */}
                  <div
                    className={cn(
                      "rounded-lg p-3.5 border transition-all duration-300",
                      spotlightPulse
                        ? "citation-target-active bg-amber-50 border-amber-400 shadow-md dark:bg-amber-950/40 dark:border-amber-500/40"
                        : "bg-amber-50/60 border-amber-200 text-zinc-800 dark:bg-amber-950/20 dark:border-amber-500/20 dark:text-zinc-200"
                    )}
                  >
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px] flex items-center gap-1">
                      <Bookmark className="h-3 w-3 text-amber-600 dark:text-amber-500" />
                      Cited In Answer (Page {activeQuery.page}):
                    </span>
                    <p className="text-[11.5px] text-zinc-800 dark:text-zinc-200 italic mt-1 font-serif leading-relaxed">
                      &ldquo;{activeQuery.highlightText}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                  <span>Document Workspace</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" /> Page verified
                  </span>
                </div>
              </div>

              {/* Right Conversation Stream */}
              <div className="bg-zinc-50 p-5 sm:p-6 flex flex-col justify-between dark:bg-[#141418]">
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-xs bg-zinc-900 text-white px-3.5 py-2.5 text-xs max-w-[85%] shadow-2xs font-medium border border-zinc-800 dark:bg-[#24242d] dark:border-white/10">
                      {activeQuery.question}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-3.5 space-y-2 text-xs text-zinc-800 dark:border-white/10 dark:bg-[#121216] dark:text-zinc-200">
                    <p className="leading-relaxed">
                      {activeQuery.answerLead}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                      {activeQuery.bulletPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>

                    {/* Interactive Citation Pill */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        Sources:
                      </span>
                      <button
                        onClick={handleCitationClick}
                        className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-900 px-2.5 py-1 text-[11px] font-semibold border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-900/40"
                      >
                        <Bookmark className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span>Page {activeQuery.page}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-white/5 pt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Answers generated strictly from your uploaded files</span>
                  <Link
                    href="/conversation"
                    className="text-[#0071e3] dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Open full workspace</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference Section */}
      <section id="how-it-works" className="py-16 bg-zinc-50 border-y border-zinc-200 dark:bg-[#0e0e12] dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Why Traditional Reading Slows You Down
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Manual keyword search takes hours, and generic chat tools hallucinate numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8 space-y-4 dark:border-rose-500/20 dark:bg-rose-500/5">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                The Old Way
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Manual Searching & Unverifiable AI
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">✕</span>
                  <span>Endless Ctrl+F searches across multiple lengthy PDF documents.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">✕</span>
                  <span>Generic chatbots invent quotes, financial numbers, and dates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">✕</span>
                  <span>No way to know which page or paragraph an answer was pulled from.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs dark:border-white/10 dark:bg-[#141418]">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20">
                The Docsy AI Way
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Verified Answers with Direct Page Citations
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ask in natural language and get clear, structured answers in seconds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Every claim includes a clickable citation tag linking directly to the page.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>The built-in document reader highlights the exact sentence for instant proof.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section id="benefits" className="py-20 bg-white dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Built for Fast, Accurate Document Work
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Designed for financial analysts, legal teams, researchers, and operators who require verifiable evidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-2xs space-y-3.5 hover:border-zinc-300 transition-colors dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                <Bookmark className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Clickable Page Citations
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Click any citation tag in your conversation and watch the document reader navigate to that page with the referenced paragraph highlighted.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-2xs space-y-3.5 hover:border-zinc-300 transition-colors dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Multi-Document Analysis
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Query across several files simultaneously to compare quarterly earnings, verify contract clauses, or synthesize related papers.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-2xs space-y-3.5 hover:border-zinc-300 transition-colors dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Confidential & Isolated
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your documents stay strictly within your private account. Files are confidential, isolated, and never used to train public tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-16 bg-zinc-50 border-y border-zinc-200 dark:bg-[#0e0e12] dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Designed for High-Stakes Work
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Helping teams move faster with complete confidence in their sources.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-2.5 dark:border-white/10 dark:bg-[#141418]">
              <span className="text-xs font-semibold text-[#0071e3] dark:text-blue-400 uppercase tracking-wider">
                Finance & Strategy
              </span>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Earnings & Annual Filings
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Locate expenditure figures, review margin breakdowns, and compare quarterly remarks without manual page hunting.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-2.5 dark:border-white/10 dark:bg-[#141418]">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Legal & Operations
              </span>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Contracts & Policy Documents
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Identify indemnification clauses, renewal deadlines, and governance obligations with immediate page verification.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-2.5 dark:border-white/10 dark:bg-[#141418]">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Research & Technical
              </span>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Studies & Whitepapers
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Review experimental methods, check statistical citations, and extract key findings across scientific literature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white dark:bg-[#09090b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Answers to common questions about Docsy AI.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 space-y-1.5 shadow-2xs dark:border-white/10 dark:bg-[#141418]">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                How accurate are the answers?
              </h4>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Docsy AI answers strictly using the text from your uploaded document. If an answer cannot be found in your file, it clearly lets you know instead of guessing or inventing information.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 space-y-1.5 shadow-2xs dark:border-white/10 dark:bg-[#141418]">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                How do page citations work?
              </h4>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Every generated answer includes small source tags with page numbers. Clicking any tag opens the built-in reader right to that page and highlights the exact paragraph referenced.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 space-y-1.5 shadow-2xs dark:border-white/10 dark:bg-[#141418]">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Are my documents kept private?
              </h4>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Yes, completely. Your uploaded files are tied exclusively to your private account and cannot be accessed by anyone else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-zinc-900 text-white dark:bg-[#0e0e12] border-t border-zinc-200 dark:border-white/5 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white dark:text-zinc-100">
            Ready to spend less time reading and more time acting?
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-zinc-300 dark:text-zinc-400 leading-relaxed">
            Upload your first document in seconds and get verified answers with clear page citations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/conversation">
              <Button size="lg" variant="accent" className="w-full sm:w-auto">
                <span>Start a Conversation</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-0 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15">
                <span>Open Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-10 text-xs text-zinc-500 dark:border-white/5 dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Logo size="sm" />
              <span className="text-zinc-300 dark:text-zinc-600">—</span>
              <span>Document Intelligence</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/conversations" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                Conversations
              </Link>
              <Link href="/documents" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                Documents
              </Link>
              <Link href="/settings" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                Settings
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-600 gap-2">
            <p>© {new Date().getFullYear()} Docsy AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-zinc-700 dark:hover:text-zinc-400">Privacy & Confidentiality</span>
              <span className="hover:text-zinc-700 dark:hover:text-zinc-400">Terms of Use</span>
              <span className="hover:text-zinc-700 dark:hover:text-zinc-400">Security Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
