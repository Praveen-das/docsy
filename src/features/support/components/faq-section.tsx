"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ThumbsUp, ThumbsDown, MessageCircleQuestion, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { FAQ_DATA } from "@/features/support/types";

type CategoryTab = "all" | "processing" | "ai" | "billing" | "security" | "limits";

const CATEGORIES: { id: CategoryTab; label: string }[] = [
  { id: "all", label: "All Questions" },
  { id: "processing", label: "Document Processing & OCR" },
  { id: "ai", label: "AI & Citations" },
  { id: "billing", label: "Billing & Plans" },
  { id: "security", label: "Privacy & Security" },
  { id: "limits", label: "Limits & Storage" },
];

export function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down">>({});

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      // Category match
      const categoryMatch =
        activeCategory === "all" ||
        item.category === activeCategory ||
        (activeCategory === "processing" && item.category === "limits");

      // Search match
      if (!searchQuery.trim()) return categoryMatch;

      const q = searchQuery.toLowerCase();
      const questionMatch = item.question.toLowerCase().includes(q);
      const answerMatch = item.answer.toLowerCase().includes(q);
      const tagsMatch = item.tags.some((tag) => tag.toLowerCase().includes(q));

      return (questionMatch || answerMatch || tagsMatch) && (activeCategory === "all" || categoryMatch);
    });
  }, [searchQuery, activeCategory]);

  const handleVote = (id: string, type: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    setUserVotes((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type,
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-6">
      {/* Top Toolbar: Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Category Filter Tabs */}
        <div className="overflow-x-auto no-scrollbar py-0.5">
          <FilterTabs<CategoryTab> options={CATEGORIES} activeTab={activeCategory} onTabChange={setActiveCategory} />
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#727f9d] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className={cn(
              "w-full h-9 pl-9 pr-8 rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-[13px] text-[#f1f3f9] placeholder-[#5c6882]",
              "focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors",
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#727f9d] hover:text-[#f1f3f9] rounded-md transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FAQ Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-white/[0.07] bg-[#0c1017]/40 p-10 text-center select-none backdrop-blur-xs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-[#727f9d] mb-2">
            <MessageCircleQuestion className="h-5 w-5 stroke-[1.8]" />
          </div>
          <h4 className="text-[13.5px] font-semibold text-[#f1f3f9]">No questions found</h4>
          <p className="text-[12px] text-[#818ea8] mt-1 max-w-sm mx-auto">
            No matching questions for &ldquo;{searchQuery}&rdquo;. Try another term or choose another category.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const userVote = userVotes[faq.id];
            const upCount = faq.helpfulCount + (userVote === "up" ? 1 : 0);
            const downCount = faq.unhelpfulCount + (userVote === "down" ? 1 : 0);

            return (
              <div
                key={faq.id}
                className={cn(
                  "rounded-[22px] border border-white/[0.07] bg-(--tile-bg) transition-all duration-200 overflow-hidden",
                  "hover:border-indigo-400/35 hover:bg-[#10141f]",
                  isExpanded && "border-indigo-400/40 bg-[#10141f] shadow-lg shadow-black/40",
                )}
              >
                {/* Question Header Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer select-none active:scale-[0.99] transition-transform"
                >
                  <span className="text-[13.5px] font-medium text-[#f1f3f9] leading-snug">{faq.question}</span>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-lg flex items-center justify-center bg-white/[0.04] text-[#727f9d] transition-transform duration-200",
                        isExpanded && "rotate-180 text-white bg-white/[0.08]",
                      )}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>

                {/* Expandable Answer Body */}
                {isExpanded && (
                  <div className="px-5 pb-4.5 pt-0.5 space-y-3.5 border-t border-white/[0.05] animate-in fade-in duration-150">
                    <p className="text-[13px] text-[#818ea8] leading-relaxed pt-2.5">{faq.answer}</p>

                    {/* Tags and Helpful feedback action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[11px] font-medium text-[#727f9d] border border-white/[0.05]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Was this helpful voting */}
                      <div className="flex items-center gap-2 text-xs text-[#727f9d]">
                        <span className="text-[11px]">Helpful?</span>
                        <button
                          type="button"
                          onClick={(e) => handleVote(faq.id, "up", e)}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer",
                            userVote === "up"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-medium"
                              : "border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.07] text-[#818ea8] hover:text-[#f1f3f9]",
                          )}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{upCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleVote(faq.id, "down", e)}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer",
                            userVote === "down"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-300 font-medium"
                              : "border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.07] text-[#818ea8] hover:text-[#f1f3f9]",
                          )}
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>{downCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
