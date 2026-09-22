"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FilterTabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  variant?: "default" | "warning" | "danger";
}

export interface FilterTabsProps<T extends string = string> {
  options: FilterTabOption<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
}

export function FilterTabs<T extends string = string>({
  options,
  activeTab,
  onTabChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center h-9 rounded-xl bg-[#0c1017]/90 border border-white/[0.08] p-1 shadow-inner backdrop-blur-md",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = activeTab === option.id;

        // Custom style mapping based on tab variant
        const activeStyles =
          option.variant === "warning"
            ? "bg-amber-500/20 text-amber-300 shadow-xs border-amber-500/30"
            : option.variant === "danger"
              ? "bg-rose-500/20 text-rose-300 shadow-xs border-rose-500/30"
              : "bg-[#6366f11a] text-white shadow-xs border-white/10";

        const inactiveStyles =
          option.variant === "warning"
            ? "text-amber-400/80 hover:text-amber-300 border-transparent hover:border-white/5"
            : option.variant === "danger"
              ? "text-rose-400/80 hover:text-rose-300 border-transparent hover:border-white/5"
              : "text-[#818ea8] hover:text-white border-transparent hover:border-white/5";

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(option.id)}
            className={cn(
              "h-7 px-3 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0 select-none",
              isActive ? activeStyles : inactiveStyles,
            )}
          >
            {option.icon}
            <span>{option.label}</span>
            {option.count !== undefined && <span className="text-[10px] opacity-75 font-mono">({option.count})</span>}
          </button>
        );
      })}
    </div>
  );
}
