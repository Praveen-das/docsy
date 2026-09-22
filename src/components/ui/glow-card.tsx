"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { handleGlowMouseEnter, handleGlowMouseMove, handleGlowMouseLeave } from "@/lib/interactive-glow";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable card container matching Docsy Design System:
 * Features dynamic mouse spotlight glow (`active-card-glow`), specular border highlight,
 * obsidian surface card styling, and subtle drop shadow.
 */
export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
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
          "group relative isolate flex items-center justify-between rounded-[22px] border border-white/[0.07] bg-(--surface-card) px-5 py-4",
          "hover:active-card-glow hover:border-indigo-400/35",
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
