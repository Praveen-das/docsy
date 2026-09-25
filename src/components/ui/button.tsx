"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#08090d] disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98] tracking-[-0.01em] border-0";

const variants = {
  // Primary: Solid obsidian (light) / elevated glass (dark)
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 border-0 shadow-sm dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:active:bg-white/10",
  // Secondary: Soft secondary surface fill
  secondary:
    "bg-[#f4f4f6] text-zinc-900 hover:bg-zinc-200 active:bg-zinc-200/80 border-0 shadow-xs dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/[0.12] dark:active:bg-white/[0.05]",
  // Outline: Hairline border — #e4e4e7 light / white/[0.08] dark
  outline:
    "border border-[#e4e4e7] bg-white text-zinc-800 hover:bg-[#f4f4f6] hover:text-zinc-900 active:bg-zinc-100 shadow-xs dark:border-white/[0.08] dark:bg-transparent dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white dark:active:bg-white/[0.08]",
  // Ghost: Flat chrome-less tertiary button
  ghost:
    "bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-[#f4f4f6] active:bg-zinc-100 border-0 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.08]",
  // Destructive: Danger state — rose-600 light / rose-950/50 dark
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border-0 shadow-xs dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 dark:hover:text-rose-200 dark:active:bg-rose-900/80",
  // Accent: Electric indigo — primary CTA
  accent:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/25 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 dark:active:bg-indigo-700 dark:shadow-[0_0_20px_rgba(99,102,241,0.3)]",
  // Gradient: Electric indigo-to-blue with rich shadow & glow matching upload CTA
  gradient:
    "bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3b82f6] text-white shadow-[0_4px_20px_rgba(79,70,229,0.55)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.8)] hover:brightness-110 active:brightness-95",
};

const sizes = {
  sm: "text-xs px-4 py-1.5 h-8 gap-1.5 rounded-xl",
  md: "text-xs sm:text-sm px-4 py-2 h-9 gap-2 rounded-xl",
  lg: "text-sm sm:text-base px-5 py-2.5 h-10 gap-2.5 rounded-xl",
  icon: "h-8 w-8 p-0 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
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
