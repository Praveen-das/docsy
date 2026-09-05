"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const sizeConfig = {
  sm: { icon: "h-5 w-5", text: "text-sm", gap: "gap-2" },
  md: { icon: "h-6 w-6", text: "text-base", gap: "gap-2.5" },
  lg: { icon: "h-7 w-7", text: "text-xl", gap: "gap-3" },
  xl: { icon: "h-8 w-8", text: "text-2xl", gap: "gap-3.5" },
};

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
        className={cn("flex items-center select-none", config.gap, className)}
        {...props}
      >
        {/* Solid Standalone Brand Mark — No Background Container */}
        <Sparkles
          className={cn(
            config.icon,
            "shrink-0 fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white transition-transform duration-150 group-hover:scale-105",
            iconClassName
          )}
          aria-hidden="true"
        />

        {!iconOnly && (
          <span
            className={cn(
              "font-bold tracking-tight text-zinc-900 dark:text-white",
              config.text,
              textClassName
            )}
          >
            Docsy AI
          </span>
        )}
      </div>
    );
  }
);

Logo.displayName = "Logo";
