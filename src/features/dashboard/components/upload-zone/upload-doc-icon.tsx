"use client";

import React from "react";

export interface UploadDocIconProps {
  isHovered: boolean;
  isDragging: boolean;
}

export function UploadDocIcon({ isHovered, isDragging }: UploadDocIconProps) {
  return (
    <div
      style={{
        willChange: isHovered || isDragging ? "transform" : "auto",
      }}
      className={`relative flex items-center justify-center transition-transform duration-200 ${
        isDragging ? "-translate-y-1 scale-110" : isHovered ? "scale-105" : "scale-100"
      }`}
    >
      <svg
        width="44"
        height="50"
        viewBox="0 0 44 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`drop-shadow-[0_0_18px_rgba(192,132,252,0.45)] transition-all duration-300 ${
          isHovered || isDragging ? "drop-shadow-[0_0_26px_rgba(192,132,252,0.75)]" : ""
        }`}
      >
        <defs>
          <linearGradient id="doc-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="doc-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(192, 132, 252, 0.16)" />
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.05)" />
          </linearGradient>
        </defs>
        {/* Outline folded document with smooth rounded corners */}
        <path
          d="M 15.5 3.5 L 26.5 3.5 C 28.5 3.5 30.5 4.5 32 6 L 37.5 11.5 C 39 13 40 15 40 17 L 40 40.5 C 40 44.5 36.5 47.5 32.5 47.5 L 15.5 47.5 C 11.5 47.5 8 44.5 8 40.5 L 8 10.5 C 8 6.5 11.5 3.5 15.5 3.5 Z"
          fill="url(#doc-fill-grad)"
          stroke="url(#doc-stroke-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Soft rounded inner fold crease */}
        <path
          d="M 27 4.5 L 27 11.5 C 27 13.8 28.8 15.5 31 15.5 L 39 15.5"
          stroke="url(#doc-stroke-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
