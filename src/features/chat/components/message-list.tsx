"use client";

import React, { useRef, useEffect } from "react";
import { Message } from "@/types";
import { EmptyChatState } from "./empty-chat-state";
import { ChatMessageItem } from "./chat-message-item";

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onSelectStarterQuestion?: (question: string) => void;
}

export function MessageList({ messages, isLoading = false, onSelectStarterQuestion }: MessageListProps) {
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
        messages.map((message) => <ChatMessageItem key={message.id} message={message} />)
      )}

      {/* Typing Indicator Chat Bubble with Jumping Dots */}
      {isLoading && (
        <div className="flex items-center gap-2.5 text-sm justify-start">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[10px] font-bold shrink-0 shadow-2xs">
            D
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-zinc-200 bg-white px-3.5 py-2.5 shadow-2xs dark:border-white/10 dark:bg-[#121215]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce"
              style={{ animationDelay: "-0.32s", animationDuration: "1s" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce"
              style={{ animationDelay: "-0.16s", animationDuration: "1s" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce"
              style={{ animationDuration: "1s" }}
            />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
