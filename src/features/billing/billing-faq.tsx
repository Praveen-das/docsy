"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Can I cancel my Pro subscription at any time?",
    answer:
      "Yes, absolutely. You can cancel your subscription at any time with one click. When you cancel, you retain full Pro access until the end of your current billing cycle. You will never be billed again unless you choose to reactivate.",
  },
  {
    question: "What happens to my uploaded documents if I downgrade to Free?",
    answer:
      "All your existing documents and vector embeddings remain completely safe, indexed, and searchable. If your total documents exceed the Free tier limit (5 documents), you won't lose any documents, but you will need to delete older documents before uploading new ones.",
  },
  {
    question: "When and how do my daily queries reset?",
    answer:
      "Daily query quotas reset automatically every day at 00:00 UTC (midnight). Any unused daily queries do not roll over to subsequent days.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), as well as Apple Pay and Google Pay through our secure PCI-DSS Level 1 certified payment partner, Stripe.",
  },
  {
    question: "Can I get an official tax invoice or receipt for business expenses?",
    answer:
      "Yes! Official PDF tax invoices and receipts are generated automatically for every charge. You can download them directly from the 'Invoices & Receipts' section on this page at any time.",
  },
  {
    question: "Are there any hidden fees or automatic price changes?",
    answer:
      "No hidden fees. Pro is a flat $19/month. Any applicable local sales tax or VAT is calculated transparently before checkout based on your country of residence.",
  },
];

export function BillingFaq() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-5 sm:p-6 shadow-xl shadow-black/20 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Billing & Quota FAQ</h3>
          <p className="text-[12px] text-zinc-400">
            Answers to common questions regarding plans, payments, and cancellations.
          </p>
        </div>
      </div>

      {/* Accordion */}
      <div className="divide-y divide-white/[0.04]">
        {FAQS.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div key={faq.question} className="py-3 first:pt-1 last:pb-1">
              <button
                type="button"
                onClick={() => toggleIndex(index)}
                className="flex w-full items-center justify-between gap-4 text-left text-xs sm:text-[13px] font-medium text-zinc-200 hover:text-white transition-colors py-1 group"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 group-hover:text-zinc-300",
                    isOpen && "rotate-180 text-indigo-400"
                  )}
                />
              </button>

              {isOpen && (
                <div className="pt-2 pb-1 text-xs text-zinc-400 leading-relaxed max-w-2xl animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
