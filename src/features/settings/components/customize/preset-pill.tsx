"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresetPillProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function PresetPill({ label, isSelected, onClick }: PresetPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer select-none",
        "active:scale-[0.98]",
        isSelected
          ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40"
          : "border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] hover:border-white/15",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "grid transition-all duration-150 ease-out",
          isSelected ? "grid-cols-[1fr] opacity-100 ml-0.5" : "grid-cols-[0fr] opacity-0 ml-0",
        )}
      >
        <span className="overflow-hidden flex items-center">
          <Check className="h-3 w-3 stroke-[2.5]" />
        </span>
      </span>
    </button>
  );
}
