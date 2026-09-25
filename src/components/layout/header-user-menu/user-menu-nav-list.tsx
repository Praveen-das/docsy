"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "./types";

export interface UserMenuNavListProps {
  items: MenuItem[];
  onSelect: () => void;
  className?: string;
}

/**
 * Reusable list of navigation items for User Menu matching desktop dropdown design.
 * Handles link navigation, icons, chevrons, and touch target heights.
 */
export function UserMenuNavList({
  items,
  onSelect,
  className,
}: UserMenuNavListProps) {
  return (
    <div className={cn("space-y-0.5 relative z-10", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onSelect}
            className="group flex min-h-[42px] sm:min-h-0 items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-[#8f9bb3] transition-colors duration-150 hover:bg-(--card-spotlight-low) hover:text-[#f8fafc] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <Icon className="h-[18px] w-[18px] text-[#828ea7] group-hover:text-[#c7d2fe] stroke-[1.85] transition-colors" />
              <span className="tracking-normal">{item.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#4a5268] group-hover:text-[#94a3b8] transition-colors stroke-[2]" />
          </Link>
        );
      })}
    </div>
  );
}
