"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";

export interface ChatComposerProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function ChatComposer({
  inputText,
  onInputChange,
  onSubmit,
  isLoading = false,
}: ChatComposerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6">
      <div className="relative flex flex-col rounded-xl border border-zinc-200 bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 dark:border-white/10 dark:bg-[#141418] dark:focus-within:border-blue-500/60 transition-all">
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the document... (Press Enter to send, Shift+Enter for newline)"
          rows={2}
          className="w-full resize-none border-0 bg-transparent p-3 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2 bg-zinc-50/50 rounded-b-xl dark:border-white/5 dark:bg-[#101014]/60">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span>Grounded in document pages</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              ⌘ + Enter to send
            </span>
            <Button
              type="submit"
              size="sm"
              variant="accent"
              disabled={!inputText.trim() || isLoading}
              className="h-7 px-3 text-xs"
            >
              <span>Ask</span>
              <Send className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
