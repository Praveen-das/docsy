"use client";

import React, { useRef, useEffect } from "react";
import { Message, Citation } from "@/types";
import { EmptyChatState } from "./empty-chat-state";
import { ChatMessageItem } from "./chat-message-item";

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  // Optional overrides for standalone use
  activeCitation?: Citation | null;
  onSelectCitation?: (citation: Citation) => void;
  onSelectStarterQuestion?: (question: string) => void;
}

export function MessageList({
  messages,
  isLoading = false,
  activeCitation,
  onSelectCitation,
  onSelectStarterQuestion,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.length === 0 ? (
        <EmptyChatState onSelectQuestion={onSelectStarterQuestion} />
      ) : (
        messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            activeCitation={activeCitation}
            onSelectCitation={onSelectCitation}
          />
        ))
      )}

      {/* Quiet Research Disclosure when Loading */}
      {isLoading && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs space-y-2 dark:border-white/10 dark:bg-[#141418]">
          <div className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Scanning document text & cross-verifying page citations...</span>
          </div>
          <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
