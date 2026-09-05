"use client";

import React from "react";
import { Sparkles } from "lucide-react";
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

  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6 text-zinc-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 shadow-2xs">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Start Document Conversation
      </h3>
      <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
        Ask questions across your uploaded documents. Every answer is grounded
        with page citations you can verify in the viewer.
      </p>

      {/* Suggested Starter Questions */}
      <div className="mt-6 w-full max-w-md space-y-2 text-left">
        <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Starter Inquiries
        </p>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelectQuestion?.(q)}
            className="w-full text-left rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 hover:border-blue-500/40 hover:bg-blue-50/50 hover:text-blue-900 dark:border-white/10 dark:bg-[#141418] dark:text-zinc-300 dark:hover:bg-blue-950/20 dark:hover:text-zinc-100 transition-all cursor-pointer shadow-2xs group"
          >
            <span className="font-medium">&ldquo;{q}&rdquo;</span>
          </button>
        ))}
      </div>
    </div>
  );
}
