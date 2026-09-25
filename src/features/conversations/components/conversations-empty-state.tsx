import React from "react";
import { MessageSquare } from "lucide-react";

export interface ConversationsEmptyStateProps {
  searchQuery?: string;
}

export function ConversationsEmptyState({ searchQuery }: ConversationsEmptyStateProps) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/[0.07] bg-[#0c1017]/40 p-12 text-center select-none backdrop-blur-xs">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-[#727f9d] mb-3 bg-white/[0.03] border border-white/[0.05]">
        <MessageSquare className="h-5 w-5 stroke-[1.8]" />
      </div>
      <h4 className="text-[14px] font-semibold text-[#f1f3f9]">No conversations found</h4>
      <p className="text-[12px] text-[#818ea8] mt-1 max-w-sm mx-auto">
        {searchQuery
          ? `No matching conversations for "${searchQuery}".`
          : "No conversations match the selected filter."}
      </p>
    </div>
  );
}
