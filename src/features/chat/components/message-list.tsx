"use client";

import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "@/types";
import { EmptyChatState } from "./empty-chat-state";
import { ChatMessageItem } from "./chat-message-item";

export interface MessageListProps {
  messages: Message[];
  isLoadingMessages?: boolean;
  isAiTyping?: boolean;
  onSelectStarterQuestion?: (question: string) => void;
}

export function MessageList({
  messages,
  isLoadingMessages = false,
  isAiTyping = false,
  onSelectStarterQuestion,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter out any empty placeholder assistant messages so an empty bubble is never rendered
  const displayMessages = messages.filter(
    (message) => message.role !== "assistant" || message.content.trim().length > 0
  );

  // Auto-scroll to bottom on new message or AI typing state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isAiTyping]);

  // Loading spinner while messages are being fetched
  if (isLoadingMessages && displayMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400 dark:text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {displayMessages.length === 0 ? (
        <EmptyChatState onSelectQuestion={onSelectStarterQuestion} />
      ) : (
        displayMessages.map((message) => <ChatMessageItem key={message.id} message={message} />)
      )}

      {/* Typing Indicator — shown when server signals AI is generating */}
      {isAiTyping && (
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
