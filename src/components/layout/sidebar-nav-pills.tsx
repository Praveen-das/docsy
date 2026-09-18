"use client";

import React, { useRef } from "react";
import { animated, useSpring, to } from "@react-spring/web";
import { cn } from "@/lib/utils";
import type { PillRect } from "./sidebar-navigation.types";

export interface SidebarNavPillsProps {
  activeRect: PillRect | null;
  isReady: boolean;
  prefersReducedMotion: boolean;
  isCollapsed: boolean;
  isActive?: boolean;
  hasActiveItem?: boolean;
}

export const SidebarNavPills = React.memo(function SidebarNavPills({
  activeRect,
  isReady,
  prefersReducedMotion,
  isCollapsed,
  isActive,
  hasActiveItem,
}: SidebarNavPillsProps) {
  const isPillActive = isActive ?? hasActiveItem ?? false;
  const hasInitializedRef = useRef(false);

  const shouldAnimate = isReady && !prefersReducedMotion;
  const isTargetVisible = Boolean(isPillActive && activeRect);

  // If this is the initial layout pass or reduced motion is enabled, snap immediately without animation
  const isImmediate = !shouldAnimate || !hasInitializedRef.current;

  if (activeRect && !hasInitializedRef.current) {
    hasInitializedRef.current = true;
  }

  // Hardware-accelerated react-spring physics with Apple-grade damping and interruptibility
  const springs = useSpring({
    to: {
      x: activeRect?.left ?? 0,
      y: activeRect?.top ?? 0,
      width: activeRect?.width ?? 0,
      height: activeRect?.height ?? 0,
      borderRadius: isCollapsed ? 12 : 16,
      opacity: isTargetVisible ? 1 : 0,
    },
    immediate: isImmediate,
    config: (key) => {
      if (key === "opacity") {
        return {
          tension: 460,
          friction: 36,
          clamp: true,
        };
      }
      // Apple-calibrated spring physics: fast, fluid, crisp settle (damping ratio ~0.87, settle ~220ms)
      return {
        tension: 420,
        friction: 34,
        mass: 0.9,
        precision: 0.005,
      };
    },
  });

  if (!activeRect && !hasInitializedRef.current) {
    return null;
  }

  return (
    <animated.div
      aria-hidden="true"
      className={cn(
        "active-nav-pill pointer-events-none absolute top-0 left-0 z-0",
        isPillActive && "active-nav-glow",
        isCollapsed ? "rounded-xl" : "rounded-2xl",
      )}
      style={{
        position: "absolute",
        transform: to([springs.x, springs.y], (x, y) => `translate3d(${x}px, ${y}px, 0)`),
        width: springs.width.to((w) => `${w}px`),
        height: springs.height.to((h) => `${h}px`),
        borderRadius: springs.borderRadius.to((r) => `${r}px`),
        opacity: springs.opacity,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: shouldAnimate ? "transform" : "auto",
        ...(isCollapsed ? { "--glow-x": "20px", "--glow-y": "20px" } : {}),
      }}
    />
  );
});
