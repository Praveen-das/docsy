"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NewConversationButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
  className?: string;
}

export function NewConversationButton({
  isCollapsed,
  onClick,
  className,
}: NewConversationButtonProps) {
  return (
    <div className={cn("px-3 mt-3 pb-2", className)}>
      <button
        type="button"
        onClick={onClick}
        title={isCollapsed ? "New conversation" : undefined}
        className={cn(
          "group relative flex h-10 w-full items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none",
          "border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-indigo-950/80 text-white",
          "shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] active:scale-[0.98]",
          isCollapsed ? "px-0" : "px-3 gap-2"
        )}
      >
        <Plus className="h-4 w-4 text-indigo-300 group-hover:text-white transition-colors shrink-0" />
        {!isCollapsed && (
          <span className="truncate font-semibold tracking-[-0.01em]">
            New conversation
          </span>
        )}
      </button>
    </div>
  );
}
