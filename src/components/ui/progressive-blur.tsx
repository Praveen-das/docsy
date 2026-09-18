"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressiveBlurProps {
  className?: string;
  height?: string | number;
  direction?: "top" | "bottom";
}

/**
 * High-performance 4-step progressive backdrop blur with optical gradient darkening.
 *
 * Streamlined to 4 GPU-friendly blur steps (20px down to 1.5px) paired with an underlying
 * smooth obsidian gradient scrim. This cuts GPU fillrate and compositing passes in half
 * compared to 8-step variants, eliminates unnecessary will-change layer bloating,
 * and maintains silky smooth 60 FPS scrolling while preserving the rich progressive blur aesthetic.
 */
export function ProgressiveBlur({
  className,
  height = 150,
  direction = "top",
}: ProgressiveBlurProps) {
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "progressive-blur pointer-events-none absolute left-0 right-0 top-0 overflow-hidden select-none -z-10",
        direction === "bottom" && "top-auto bottom-0 rotate-180",
        className,
      )}
      style={{
        height: heightStyle,
        contain: "strict",
        transform: "translate3d(0, 0, 0)",
      }}
    >
      {/* Underlying smooth optical gradient scrim - handles depth without expensive filters */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "linear-gradient(to bottom, rgba(8, 9, 13, 0.72) 0%, rgba(8, 9, 13, 0.45) 35%, rgba(8, 9, 13, 0.15) 68%, transparent 100%)",
        }}
      />

      {/* Step 1: 0% -> 25% (Blur: 20px + Rich Top Scrim) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          maskImage: "linear-gradient(to bottom, black 0%, black 15%, transparent 32%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 15%, transparent 32%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      />

      {/* Step 2: 15% -> 50% (Blur: 10px + Mid Scrim) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          maskImage:
            "linear-gradient(to bottom, transparent 10%, black 25%, black 40%, transparent 58%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 10%, black 25%, black 40%, transparent 58%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />

      {/* Step 3: 35% -> 75% (Blur: 4px + Soft Feathering) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          maskImage:
            "linear-gradient(to bottom, transparent 30%, black 48%, black 62%, transparent 80%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 30%, black 48%, black 62%, transparent 80%)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Step 4: 55% -> 100% (Blur: 1.5px + Seamless Base Blend) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          maskImage:
            "linear-gradient(to bottom, transparent 52%, black 72%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 52%, black 72%, black 85%, transparent 100%)",
          backdropFilter: "blur(1.5px)",
          WebkitBackdropFilter: "blur(1.5px)",
        }}
      />
    </div>
  );
}
