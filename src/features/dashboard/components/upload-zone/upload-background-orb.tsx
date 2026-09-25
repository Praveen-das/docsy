"use client";

import React from "react";
import { SpringValue } from "@react-spring/web";
import { GradientOrb } from "@/components/ui/gradient-orb";

export interface UploadBackgroundOrbProps {
  mousePos: { x: number; y: number };
  isHovered: boolean;
  orbScale: SpringValue<number> | number;
}

export function UploadBackgroundOrb({ mousePos, isHovered, orbScale }: UploadBackgroundOrbProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)`,
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: isHovered ? "transform" : "auto",
      }}
      className="absolute -inset-10 sm:-inset-20 lg:-inset-24 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-90"
    >
      <GradientOrb
        config={{
          background: "transparent",
          hue: 0,
          rotationSpeed: 0.35,
          noiseScale: 0.8,
          innerRadius: 0.45,
          wobbleStrength: 0.12,
          wobbleSpeed: 0.8,
          scaleFactor: 0.9,
        }}
        scale={orbScale}
        className="w-full h-full"
      />
    </div>
  );
}
