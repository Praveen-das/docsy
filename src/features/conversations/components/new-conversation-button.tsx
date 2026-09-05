"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NewConversationButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export function NewConversationButton({
  isCollapsed,
  onClick,
}: NewConversationButtonProps) {
  return (
    <div className="px-3.5 mt-4 pb-1">
      <Button
        variant="primary"
        size="md"
        onClick={onClick}
        title="Create a new conversation for this document"
        className={cn(
          "w-full h-10 p-0 flex items-center overflow-hidden tracking-[-0.01em]",
          "rounded-[10px] shadow-sm",
          "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950",
          "dark:bg-[#1d1d24] dark:text-white dark:hover:bg-[#27272f] dark:active:bg-[#18181e]",
          "dark:ring-1 dark:ring-white/[0.08]"
        )}
      >
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <Plus className="h-4 w-4 shrink-0" />
        </div>

        {!isCollapsed && (
          <span className="pr-3.5 font-semibold text-sm truncate">
            + New Conversation
          </span>
        )}
      </Button>
    </div>
  );
}
