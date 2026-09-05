"use client";

import React from "react";
import { MessageSquare, FileText } from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";

export interface MobilePaneSwitcherProps {
  activeTab: "conversation" | "pdf";
  conversationCount?: number;
  onTabChange: (tab: "conversation" | "pdf") => void;
}

export function MobilePaneSwitcher({
  activeTab,
  conversationCount: propCount,
  onTabChange,
}: MobilePaneSwitcherProps) {
  const conversations = useConversationStore((state) => state.conversations);
  const activeDocumentId =
    useConversationStore((state) => state.activeDocumentId) || "doc-1";

  const count =
    propCount ??
    conversations.filter((c) => c.documentIds.includes(activeDocumentId)).length;

  return (
    <div className="flex border-b border-zinc-200 bg-white dark:border-white/5 dark:bg-[#0e0e12] lg:hidden">
      <button
        onClick={() => onTabChange("conversation")}
        className={`flex-1 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
          activeTab === "conversation"
            ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/60 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-600/10"
            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Conversation ({count})</span>
      </button>
      <button
        onClick={() => onTabChange("pdf")}
        className={`flex-1 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
          activeTab === "pdf"
            ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/60 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-600/10"
            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>Document Reader</span>
      </button>
    </div>
  );
}
