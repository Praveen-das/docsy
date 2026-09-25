"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlowContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowEdgeClassName?: string;
  glowAuraClassName?: string;
}

/**
 * Reusable obsidian glassmorphic card container with ambient cosmic diffusions,
 * edge specular light rim reflection, and glow shadow.
 * Matches HeaderUserMenu & SelectDocumentModal aesthetics.
 */
export const GlowContainer = React.forwardRef<HTMLDivElement, GlowContainerProps>(
  ({ children, className, glowEdgeClassName, glowAuraClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "user-menu-glow relative rounded-[26px] bg-(--tile-bg) p-3.5 backdrop-blur-2xl backdrop-saturate-150 overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* Edge Specular Light Rim & Razor Horizon */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-blue-400/30 via-indigo-400/15 to-transparent pointer-events-none",
            glowEdgeClassName,
          )}
        />

        {/* Ambient Cosmic Diffuse Glow inside the Glass Sheet */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl will-change-transform pointer-events-none -z-10 opacity-30",
            glowAuraClassName,
          )}
        />

        {children}
      </div>
    );
  },
);

GlowContainer.displayName = "GlowContainer";
