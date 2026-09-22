"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { handleGlowMouseEnter, handleGlowMouseMove, handleGlowMouseLeave } from "@/lib/interactive-glow";

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
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      handleGlowMouseEnter(e);
      onMouseEnter?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      handleGlowMouseMove(e);
      onMouseMove?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      handleGlowMouseLeave(e);
      onMouseLeave?.(e);
    };

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
