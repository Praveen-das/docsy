"use client";

import React from "react";
import { useUIStore, type ThemeMode } from "@/stores/ui-store";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: "light", label: "Light", description: "Clean white & gray for daytime clarity", icon: Sun },
  { id: "dark", label: "Dark", description: "Obsidian deep-black cosmic aesthetic", icon: Moon },
  { id: "system", label: "System", description: "Matches your OS preference automatically", icon: Monitor },
];

export function TabAppearance() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] text-zinc-500 leading-relaxed">
          Choose your interface color scheme or let Docsy sync with your device.
        </p>
      </div>

      {/* Theme selector */}
      <div className="grid grid-cols-3 gap-2.5">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex flex-col items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer relative select-none active:scale-[0.98]",
                isSelected
                  ? "active-tile-glow"
                  : "interactive-tile",
              )}
            >
              <div className="flex items-center justify-between w-full mb-2.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                    isSelected
                      ? "bg-indigo-500 text-white"
                      : "bg-white/[0.05] text-zinc-400 border border-white/[0.06]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {isSelected && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                  </span>
                )}
              </div>
              <span className="text-[12.5px] font-semibold text-zinc-100">{opt.label}</span>
              <span className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
