"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const sizeConfig = {
  sm: { icon: "h-6 w-6", text: "text-base", gap: "gap-2" },
  md: { icon: "h-7 w-7", text: "text-lg", gap: "gap-2.5" },
  lg: { icon: "h-8 w-8", text: "text-xl", gap: "gap-3" },
  xl: { icon: "h-10 w-10", text: "text-2xl", gap: "gap-3.5" },
};

/**
 * Docsy Icon:
 * An interconnected "D" ribbon mark fusing an AI document/folio with an infinite neural loop.
 * Built with precision geometry, gradient illumination, and crisp SVG optics.
 */
export function DocsyIcon({ className }: { className?: string }) {
  const uid = React.useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Main Ribbon Gradient */}
        <linearGradient
          id={`docsyGrad-${uid}`}
          x1="4"
          y1="4"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="40%" stopColor="#6366f1" />
          <stop offset="85%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Ambient Glow Gradient */}
        <radialGradient
          id={`docsyGlow-${uid}`}
          cx="18"
          cy="18"
          r="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>

        {/* Top Fold Glass Sheen */}
        <linearGradient
          id={`docsySheen-${uid}`}
          x1="6"
          y1="4"
          x2="28"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Inner Arc Overlay */}
        <linearGradient
          id={`docsyInnerArc-${uid}`}
          x1="14"
          y1="10"
          x2="26"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Drop Shadow Filter */}
        <filter
          id={`docsyShadow-${uid}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#4f46e5"
            floodOpacity="0.45"
          />
        </filter>
      </defs>

      {/* Atmospheric Backglow */}
      <circle cx="18" cy="18" r="16" fill={`url(#docsyGlow-${uid})`} />

      {/* Primary Dimensional D Mark */}
      <g filter={`url(#docsyShadow-${uid})`}>
        {/* Background stem + outer loop compound path */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 7.5C6 5.567 7.567 4 9.5 4H19C26.1797 4 32 9.8203 32 17C32 24.1797 26.1797 30 19 30H9.5C7.567 30 6 28.433 6 26.5V7.5ZM12.5 10C12.5 9.17157 13.1716 8.5 14 8.5H18.5C23.1944 8.5 27 12.3056 27 17C27 21.6944 23.1944 25.5 18.5 25.5H14C13.1716 25.5 12.5 24.8284 12.5 24V10Z"
          fill={`url(#docsyGrad-${uid})`}
        />

        {/* Futuristic Interlocking AI Document Ribbon (Layered Depth) */}
        <path
          d="M12.5 8.5H18C22.6944 8.5 26.5 12.3056 26.5 17C26.5 21.6944 22.6944 25.5 18 25.5"
          stroke={`url(#docsyInnerArc-${uid})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Specular Rim Light on upper curvature */}
        <path
          d="M7 11V7.5C7 6.11929 8.11929 5 9.5 5H19C25.0751 5 30 9.92487 30.8 15.5"
          stroke={`url(#docsySheen-${uid})`}
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Document Fold Micro-Prism (Representing Paper & Intelligence) */}
        <path
          d="M19 4L32 17"
          stroke="#ffffff"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Core Intelligence Spark / Node */}
        <circle cx="18" cy="17" r="2.2" fill="#ffffff" />
        <circle cx="18" cy="17" r="1.2" fill="#38bdf8" />
      </g>
    </svg>
  );
}

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      size = "md",
      iconOnly = false,
      className,
      iconClassName,
      textClassName,
      ...props
    },
    ref
  ) => {
    const config = sizeConfig[size];

    return (
      <div
        ref={ref}
        className={cn("flex items-center select-none group", config.gap, className)}
        {...props}
      >
        <DocsyIcon
          className={cn(
            config.icon,
            "transition-all duration-200 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]",
            iconClassName
          )}
        />

        {!iconOnly && (
          <span
            className={cn(
              "font-bold tracking-tight text-zinc-900 dark:text-white font-sans flex items-center",
              config.text,
              textClassName
            )}
          >
            Docsy
          </span>
        )}
      </div>
    );
  }
);

Logo.displayName = "Logo";
