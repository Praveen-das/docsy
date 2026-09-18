"use client";

import React, { useState, useEffect } from "react";
import { useUIStore, ThemeMode } from "@/stores/ui-store";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
  variant?: "segmented" | "minimal";
}

export function ThemeToggle({ className, variant = "segmented" }: ThemeToggleProps) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "dark";

  if (variant === "minimal") {
    const isDark = currentTheme === "dark" || (currentTheme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer select-none",
          className
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-[18px] w-[18px] transition-transform duration-200 hover:rotate-45" strokeWidth={1.75} />
      </button>
    );
  }

  const options: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-white/10 dark:bg-[#141418]",
        className
      )}
      role="radiogroup"
      aria-label="Color theme selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = currentTheme === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.id)}
            title={`Switch to ${opt.label} mode`}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all cursor-pointer",
              isActive
                ? "bg-white text-zinc-900 shadow-xs font-semibold dark:bg-[#22222a] dark:text-white dark:shadow-xs dark:border dark:border-white/10"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/5"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
