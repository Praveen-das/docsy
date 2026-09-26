"use client";

import React, { useState } from "react";
import { ArrowUp, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/features/offline/hooks/use-network-status";

export interface ChatComposerProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function ChatComposer({ inputText, onInputChange, onSubmit, isLoading = false }: ChatComposerProps) {
  const [model] = useState("Docsy AI");
  const { isOffline } = useNetworkStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isOffline) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-4 sm:px-6 pb-6 pt-2">
      {/* Floating Pill-Card */}
      <div className="composer-glow mx-auto w-full max-w-2xl relative flex flex-col rounded-3xl transform-gpu transition-[border-color,box-shadow] duration-200 bg-(--surface-card) p-3 sm:p-3.5">
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isOffline}
          placeholder={
            isOffline
              ? "You are offline. Connect to the internet to ask AI questions..."
              : "Ask anything about this document..."
          }
          rows={2}
          className="w-full resize-none border-0 bg-transparent px-2 py-1 text-sm text-[#f1f5f9] placeholder:text-[#6b7794] focus:outline-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
          {isOffline ? (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium select-none">
              <WifiOff className="h-3 w-3" />
              <span>Offline (Read-only transcripts)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#6b7794] select-none">
              <svg
                className="h-3 w-3 text-indigo-400/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              <span>{model}</span>
            </div>
          )}

          {/* Right: Hint + Send Button */}
          <div className="flex items-center gap-3">
            {!isOffline && (
              <span className="hidden sm:inline text-[11px] text-[#818ea8] font-sans select-none">
                Press <kbd className="font-sans px-1 rounded bg-white/5 text-[#818ea8]">Enter</kbd> to send
              </span>
            )}

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading || isOffline}
              className="send-btn disabled:opacity-40 disabled:cursor-not-allowed"
              title={isOffline ? "Cannot send questions while offline" : "Send question"}
            >
              {isLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
