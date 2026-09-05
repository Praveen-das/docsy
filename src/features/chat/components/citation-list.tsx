"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { Citation } from "@/types";
import { CitationPill } from "../citation-pill";
import { useChatContext } from "../context/chat-context";

export interface CitationListProps {
  citations: Citation[];
  activeCitation?: Citation | null;
  onSelectCitation?: (citation: Citation) => void;
}

export function CitationList({
  citations,
  activeCitation: propActiveCitation,
  onSelectCitation: propOnSelectCitation,
}: CitationListProps) {
  const context = useChatContext();

  const activeCitation =
    propActiveCitation !== undefined
      ? propActiveCitation
      : context.activeCitation;
  const onSelectCitation = propOnSelectCitation || context.onSelectCitation;

  if (!citations || citations.length === 0) return null;

  return (
    <div className="border-t border-zinc-100 dark:border-white/5 pt-2.5">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
        <Bookmark className="h-3 w-3 text-amber-500" />
        <span>Cited Passages in Document:</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {citations.map((cit, idx) => (
          <CitationPill
            key={idx}
            citation={cit}
            onClick={onSelectCitation}
            isActive={
              activeCitation?.page === cit.page &&
              activeCitation?.documentId === cit.documentId
            }
          />
        ))}
      </div>
    </div>
  );
}
