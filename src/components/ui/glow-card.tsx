"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { bindGlowHandlers } from "@/lib/interactive-glow";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hasHoverEffect?: boolean;
}

/**
 * Reusable card container matching Docsy Design System:
 * Features dynamic mouse spotlight glow (`active-card-glow`), specular border highlight,
 * obsidian surface card styling, and subtle drop shadow.
 */
export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className, hasHoverEffect = true, onMouseEnter, onMouseMove, onMouseLeave, ...props }, ref) => {
    const glowHandlers = bindGlowHandlers({ onMouseEnter, onMouseMove, onMouseLeave });

    return (
      <div
        ref={ref}
        {...glowHandlers}
        className={cn(
          "group relative isolate flex items-center justify-between rounded-[22px] border border-white/[0.07] bg-(--surface-card) px-5 py-4",
          hasHoverEffect && "hover:active-card-glow",
          "interactive-tile",
          "transition-[border-color,background-color,box-shadow] duration-200 cursor-pointer shadow-lg shadow-black/30",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlowCard.displayName = "GlowCard";
