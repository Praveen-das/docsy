"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-120 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#08080a] disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98] tracking-[-0.01em] border-0";

    const variants = {
      // Primary: Solid in light mode, elevated near-black charcoal in dark mode (no borders)
      primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 border-0 shadow-2xs dark:bg-[#202027] dark:text-white dark:border-0 dark:hover:bg-[#2a2a35] dark:hover:text-white dark:active:bg-[#191920]",
      // Secondary: Quiet neutral surface with subtle definition (no borders)
      secondary:
        "bg-zinc-100 text-zinc-800 hover:bg-zinc-200/80 active:bg-zinc-200 border-0 shadow-2xs dark:bg-[#15151a] dark:text-zinc-300 dark:border-0 dark:hover:bg-[#1e1e24] dark:hover:text-zinc-100 dark:active:bg-[#101014]",
      // Outline: Framed surface for secondary actions (no borders)
      outline:
        "bg-zinc-100/90 text-zinc-800 hover:bg-zinc-200/80 hover:text-zinc-900 border-0 shadow-2xs active:bg-zinc-200 dark:bg-[#15151a] dark:text-zinc-300 dark:border-0 dark:hover:bg-[#1e1e24] dark:hover:text-white dark:active:bg-[#101014]",
      // Ghost: Flat chrome-less tertiary button
      ghost:
        "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200/60 border-0 dark:bg-transparent dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.06] dark:active:bg-white/[0.10]",
      // Destructive: Restrained danger state avoiding neon blowouts (no borders)
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border-0 shadow-xs dark:bg-rose-950/40 dark:text-rose-300 dark:border-0 dark:hover:bg-rose-950/70 dark:hover:text-rose-200 dark:active:bg-rose-950/90",
      // Accent: Primary action styling (no borders)
      accent:
        "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 border-0 shadow-2xs dark:bg-[#202027] dark:text-white dark:border-0 dark:hover:bg-[#2a2a35] dark:hover:text-white dark:active:bg-[#191920]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5 rounded-[8px]",
      md: "text-sm px-3.5 py-2 h-9 gap-2 rounded-[9px]",
      lg: "text-base px-5 py-2.5 h-11 gap-2.5 rounded-[11px]",
      icon: "h-8 w-8 p-0 rounded-[8px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
