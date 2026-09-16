"use client";

import React from "react";
import { DocsyIcon } from "@/components/ui/logo";
import { suggestedQuestions } from "@/lib/mock-data";
import { useChatContext } from "../context/chat-context";

export interface EmptyChatStateProps {
  onSelectQuestion?: (question: string) => void;
}

export function EmptyChatState({
  onSelectQuestion: propOnSelectQuestion,
}: EmptyChatStateProps) {
  const context = useChatContext();
  const onSelectQuestion =
    propOnSelectQuestion || context.onSelectStarterQuestion;

  const starterQuestions = [
    "Can you summarize the key findings from this document?",
    "What are the core principles and architectural patterns described?",
    "Provide a comparison matrix of the data layers and caching solutions.",
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6 text-zinc-400 select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] mb-3 border border-white/10 shadow-inner">
        <DocsyIcon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-white font-sans">
        Chat with this Document
      </h3>
      <p className="max-w-sm text-xs text-zinc-400 mt-1 leading-relaxed">
        Ask questions, extract key takeaways, or review page-accurate citations.
      </p>

      {/* Suggested Starter Questions matching Image 2 */}
      <div className="mt-6 w-full max-w-md space-y-2 text-left">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
          SUGGESTED QUESTIONS
        </p>
        {starterQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelectQuestion?.(q)}
            className="w-full text-left rounded-xl border border-white/[0.06] bg-[#0e1018] p-3 text-xs text-zinc-300 hover:border-indigo-500/40 hover:bg-[#121422] hover:text-white transition-all cursor-pointer shadow-sm group"
          >
            <span className="font-medium text-[12.5px]">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
