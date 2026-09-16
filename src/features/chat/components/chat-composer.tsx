"use client";

import React, { useState } from "react";
import { Send, Paperclip, ChevronDown } from "lucide-react";
import { DocsyIcon } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

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
  const [model, setModel] = useState("Docsy AI");
  const [mode, setMode] = useState("Standard");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

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
    <form onSubmit={handleSubmit} className="w-full px-4 sm:px-6 pb-6 pt-2">
      {/* Floating Pill-Card matching Image 2 */}
      <div className="mx-auto w-full max-w-3xl relative flex flex-col rounded-3xl border border-indigo-500/25 bg-[#0f111a]/95 shadow-[0_0_35px_rgba(99,102,241,0.15)] backdrop-blur-2xl transition-all focus-within:border-indigo-500/50 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.22)] p-3 sm:p-3.5">
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this document..."
          rows={2}
          className="w-full resize-none border-0 bg-transparent px-2 py-1 text-sm text-white placeholder:text-zinc-500 focus:outline-none leading-relaxed"
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          {/* Left: Attachment + Model Pill + Mode Pill */}
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Attach document or citation"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Model Selector Pill matching Image 2: [D logo] Docsy AI ▾ */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/8 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
              >
                <DocsyIcon className="h-3.5 w-3.5" />
                <span>{model}</span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {modelMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setModelMenuOpen(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-36 rounded-xl border border-white/10 bg-[#12141e] p-1.5 shadow-xl shadow-black/40 backdrop-blur-xl">
                    {["Docsy AI", "Docsy Pro", "Fast Scan"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setModel(m);
                          setModelMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                          model === m
                            ? "bg-indigo-950/60 text-indigo-300 font-semibold"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mode Selector Pill matching Image 2: Standard ▾ */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModeMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/8 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
              >
                <span>{mode}</span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {modeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setModeMenuOpen(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-36 rounded-xl border border-white/10 bg-[#12141e] p-1.5 shadow-xl shadow-black/40 backdrop-blur-xl">
                    {["Standard", "Deep Analysis", "Concise"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMode(m);
                          setModeMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                          mode === m
                            ? "bg-indigo-950/60 text-indigo-300 font-semibold"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Hint + Radiant Gradient Send Button */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-zinc-500 font-sans select-none">
              Press <kbd className="font-sans px-1 rounded bg-white/5 text-zinc-400">Enter</kbd> to send
            </span>

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/10"
              title="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
