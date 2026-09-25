"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NewConversationButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
  className?: string;
}

export function NewConversationButton({ isCollapsed, onClick, className }: NewConversationButtonProps) {
  return (
    <div className={cn("px-2.5 mt-3 pb-2", className)}>
      <Button
        type="submit"
        variant="gradient"
        size="md"
        onClick={onClick}
        title={isCollapsed ? "New conversation" : undefined}
        className="w-full"
      >
        <Plus className="h-4 w-4 text-indigo-300 group-hover:text-white transition-colors shrink-0" />
        {!isCollapsed && <span className="truncate font-semibold tracking-[-0.01em]">New conversation</span>}
      </Button>
    </div>
  );
}
