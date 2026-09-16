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
 * Stylized "D" Mark from reference images:
 * Rounded futuristic ribbon D with purple-to-indigo-to-cyan gradient
 */
export function DocsyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.65)]", className)}
    >
      <defs>
        <linearGradient id="docsyMainGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="35%" stopColor="#a855f7" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="docsyInnerVoid" x1="12" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#090a10" />
          <stop offset="100%" stopColor="#0e101a" />
        </linearGradient>
      </defs>
      {/* Outer Ribbon Loop */}
      <path
        d="M6 7C6 4.79086 7.79086 3 10 3H20C27.1797 3 33 8.8203 33 16C33 23.1797 27.1797 29 20 29H10C7.79086 29 6 27.2091 6 25V7Z"
        fill="url(#docsyMainGrad)"
      />
      {/* Inner Tear Hole Cutout with Soft Smooth Curvature */}
      <path
        d="M13 10.5H19C22.5899 10.5 25.5 13.4101 25.5 17C25.5 20.5899 22.5899 23.5 19 23.5H13C11.6193 23.5 10.5 22.3807 10.5 21V13C10.5 11.6193 11.6193 10.5 13 10.5Z"
        fill="url(#docsyInnerVoid)"
      />
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
        <DocsyIcon className={cn(config.icon, "transition-transform duration-150 group-hover:scale-105", iconClassName)} />

        {!iconOnly && (
          <span
            className={cn(
              "font-bold tracking-tight text-zinc-900 dark:text-white font-sans",
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
