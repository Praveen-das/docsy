"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { bindGlowHandlers } from "@/lib/interactive-glow";

export interface GlowRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable horizontal conversation/list row container matching Docsy Design System:
 * Features dynamic mouse spotlight glow (`active-row-glow`), hairline borders,
 * tactile interaction, and smooth transition.
 */
export const GlowRow = React.forwardRef<HTMLDivElement, GlowRowProps>(
  ({ children, className, onMouseEnter, onMouseMove, onMouseLeave, ...props }, ref) => {
    const glowHandlers = bindGlowHandlers({ onMouseEnter, onMouseMove, onMouseLeave });

    return (
      <div
        ref={ref}
        {...glowHandlers}
        className={cn(
          "group relative flex items-center justify-between gap-4 rounded-2xl p-2.5 transition-[border-color,background-color] duration-200 cursor-pointer",
          "border border-white/[0.06] hover:active-row-glow hover:border-indigo-400/35",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlowRow.displayName = "GlowRow";
