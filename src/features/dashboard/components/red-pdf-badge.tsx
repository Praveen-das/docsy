import React from "react";
import { cn } from "@/lib/utils";

export interface RedPdfBadgeProps {
  className?: string;
}

/**
 * Photorealistic 3D Red PDF Document Badge matching reference image:
 * Features folded top-right corner, vibrant gloss red gradient,
 * Acrobat ribbon curve, and bold white 'PDF' title.
 */
export function RedPdfBadge({ className }: RedPdfBadgeProps) {
  return (
    <div
      className={cn(
        "relative flex h-[50px] w-[40px] shrink-0 items-center justify-center select-none",
        className,
      )}
    >
      <svg
        viewBox="0 0 40 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Main Red Gradient: bright coral red at top-left fading to deep ruby red at bottom */}
          <linearGradient id="pdfCardGrad" x1="0" y1="0" x2="40" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff455b" />
            <stop offset="30%" stopColor="#f5223c" />
            <stop offset="100%" stopColor="#d91428" />
          </linearGradient>

          {/* Top-left soft specular glow */}
          <radialGradient id="pdfGlossGlow" cx="6" cy="6" r="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Corner Fold: subtle pale silver-white */}
          <linearGradient id="pdfCornerFold" x1="28" y1="0" x2="40" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Under-fold shadow */}
          <filter id="foldShadow" x="24" y="0" width="16" height="16" filterUnits="userSpaceOnUse">
            <feDropShadow dx="-1" dy="1.5" stdDeviation="1" floodColor="#88000b" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Base sheet: rounded corners, top-right cut */}
        <path
          d="M 6 0 
             H 28 
             L 40 12 
             V 44 
             C 40 47.31 37.31 50 34 50 
             H 6 
             C 2.69 50 0 47.31 0 44 
             V 6 
             C 0 2.69 2.69 0 6 0 
             Z"
          fill="url(#pdfCardGrad)"
        />

        {/* Gloss overlay on upper sheet */}
        <path
          d="M 6 0 
             H 28 
             L 40 12 
             V 44 
             C 40 47.31 37.31 50 34 50 
             H 6 
             C 2.69 50 0 47.31 0 44 
             V 6 
             C 0 2.69 2.69 0 6 0 
             Z"
          fill="url(#pdfGlossGlow)"
        />

        {/* Folded Flap in top right corner */}
        <path
          d="M 28 0 
             V 8 
             C 28 10.21 29.79 12 32 12 
             H 40 
             L 28 0 
             Z"
          fill="url(#pdfCornerFold)"
          filter="url(#foldShadow)"
        />

        {/* Clean, authentic Adobe Acrobat wishbone symbol matching reference */}
        <path
          d="M 20 18.5
             C 19.4 18.5 18.8 21.2 18.4 23.8
             C 17.6 24.3 16.4 25.1 15.2 26.2
             C 13.5 27.8 12.5 29.5 13 30.6
             C 13.4 31.4 14.3 31.6 15.2 31.1
             C 16.6 30.3 18.1 28.5 19.3 26.3
             C 20.9 26.9 22.8 27.7 24.4 28.6
             C 25.4 29.2 26.3 29.5 26.8 29.2
             C 27.4 28.8 27.2 27.8 26.1 27.1
             C 24.5 26.1 22.3 25.2 20.5 24.6
             C 20.9 22.1 21.3 18.5 20 18.5
             Z
             M 19.6 21.5
             C 19.8 20.2 20.2 20.2 20.2 21.5
             C 20.1 22.6 19.9 23.7 19.7 24.5
             C 19.6 23.6 19.6 22.6 19.6 21.5
             Z
             M 15 29.8
             C 14.3 30.2 13.8 30.1 13.7 29.8
             C 13.5 29.2 14.2 28.1 15.3 27.1
             C 15.8 26.6 16.4 26.2 17 25.8
             C 16.2 27.4 15.5 28.9 15 29.8
             Z
             M 25.7 28.4
             C 25.3 28.6 24.8 28.3 23.9 27.8
             C 22.8 27.1 21.6 26.5 20.5 26
             C 21.9 26.4 23.6 27.1 24.8 27.8
             C 25.6 28.2 25.9 28.3 25.7 28.4
             Z"
          fill="#ffffff"
        />

        {/* Clean, bold, crisp "PDF" typography under symbol */}
        <text
          x="20"
          y="42"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="0.4px"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          PDF
        </text>
      </svg>
    </div>
  );
}
