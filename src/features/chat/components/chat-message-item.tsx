"use client";

import React, { useState } from "react";
import { Message, Citation } from "@/types";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { CitationList } from "./citation-list";
import { formatTime } from "@/lib/format-time";

export interface ChatMessageItemProps {
  message: Message;
  activeCitation?: Citation | null;
  onSelectCitation?: (citation: Citation) => void;
}

export function ChatMessageItem({
  message,
  activeCitation,
  onSelectCitation,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 text-sm group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col max-w-[92%] sm:max-w-[84%]",
          isUser ? "items-end" : "items-start w-full"
        )}
      >
        {isUser ? (
          /* User Message Bubble */
          <div className="rounded-2xl rounded-tr-xs bg-zinc-900 text-white dark:bg-[#24242d] px-4 py-2.5 shadow-2xs leading-relaxed text-[13px] font-medium border border-zinc-800 dark:border-white/10">
            {message.content}
          </div>
        ) : (
          /* Assistant Editorial Card */
          <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-3 dark:border-white/10 dark:bg-[#121215]">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[10px] font-bold">
                  D
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  Docsy Assistant
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                <span>{formatTime(message.createdAt)}</span>
                <button
                  onClick={handleCopy}
                  className="rounded p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 dark:hover:bg-white/5 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Copy answer"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="text-[13px] text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-normal">
              {message.content}
            </div>

            {/* Sources & Citations Shelf */}
            <CitationList
              citations={message.sources || []}
              activeCitation={activeCitation}
              onSelectCitation={onSelectCitation}
            />
          </div>
        )}

        {isUser && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
