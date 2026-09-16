"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  options: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "segmented" | "line";
  size?: "sm" | "md";
  className?: string;
}

export function Tabs({
  options,
  activeId,
  onChange,
  variant = "segmented",
  size = "sm",
  className,
}: TabsProps) {
  // Editorial Underline Navigation
  if (variant === "line") {
    return (
      <div
        className={cn(
          "flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800/80 select-none",
          className
        )}
      >
        {options.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative pb-2.5 text-xs sm:text-sm font-medium transition-colors duration-100 cursor-pointer flex items-center gap-2 select-none active:scale-[0.98] tracking-[-0.01em]",
                isActive
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-500/20 dark:text-blue-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#0071e3] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Canonical macOS Segmented Control with dual-theme depth
  const activeIndex = options.findIndex((opt) => opt.id === activeId);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-zinc-100 border border-zinc-200 p-0.5 select-none dark:bg-[#121216] dark:border-white/5",
        size === "sm" ? "h-8" : "h-9",
        className
      )}
    >
      {options.map((tab, index) => {
        const isActive = tab.id === activeId;
        const isSeparatorHidden =
          index === activeIndex || index - 1 === activeIndex;

        return (
          <React.Fragment key={tab.id}>
            {/* Signature Hairline Segment Separator */}
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "w-px h-3 bg-zinc-300/80 dark:bg-white/10 my-auto shrink-0 mx-0.5 transition-opacity duration-150",
                  isSeparatorHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              />
            )}

            <button
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 px-2.5 rounded-md text-xs font-medium transition-all duration-100 ease-out cursor-pointer select-none active:scale-[0.98] tracking-[-0.01em] h-full",
                isActive
                  ? "bg-white text-zinc-900 shadow-2xs dark:bg-white/10 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/5"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>

              {/* Discreet Badge Counter */}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-full leading-none",
                    isActive
                      ? "bg-zinc-200/80 text-zinc-900 font-medium dark:bg-white/15 dark:text-white"
                      : "bg-zinc-200/40 text-zinc-500 dark:bg-white/5 dark:text-zinc-500"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
