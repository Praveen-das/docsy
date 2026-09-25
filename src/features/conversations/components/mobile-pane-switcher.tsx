"use client";

import React, { Suspense } from "react";
import { MessageSquare, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useConversations } from "../hooks/use-conversations";

export interface MobilePaneSwitcherProps {
  activeTab: "conversation" | "pdf";
  conversationCount?: number;
  documentId?: string | null;
  onTabChange: (tab: "conversation" | "pdf") => void;
}

function MobilePaneSwitcherInner({
  activeTab,
  conversationCount: propCount,
  documentId: propDocId,
  onTabChange,
}: MobilePaneSwitcherProps) {
  const searchParams = useSearchParams();
  const { conversations } = useConversations();
  const docId = propDocId !== undefined ? propDocId : searchParams.get("doc");

  const count =
    propCount ??
    (docId
      ? conversations.filter((c) => c.documentIds.includes(docId)).length
      : 0);

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

export function MobilePaneSwitcher(props: MobilePaneSwitcherProps) {
  return (
    <Suspense fallback={null}>
      <MobilePaneSwitcherInner {...props} />
    </Suspense>
  );
}
