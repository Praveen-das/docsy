"use client";

import React from "react";
import { User, Settings, Shield, SlidersHorizontal, CreditCard, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTabId = "account" | "general" | "security" | "behavior" | "customize" | "billing" | "data";

export interface TabCategory {
  category: string;
  items: {
    id: SettingsTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const TAB_GROUPS: TabCategory[] = [
  {
    category: "General",
    items: [
      { id: "account", label: "Account", icon: User },
      { id: "general", label: "General", icon: Settings },
      { id: "security", label: "Security & MFA", icon: Shield },
    ],
  },
  {
    category: "Docsy AI",
    items: [
      { id: "customize", label: "Customize AI", icon: SlidersHorizontal },
      { id: "billing", label: "Plan & Billing", icon: CreditCard },
    ],
  },
  {
    category: "Data & Storage",
    items: [{ id: "data", label: "Data Controls", icon: Database }],
  },
];

interface SettingsSidebarProps {
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
  className?: string;
}

export function SettingsSidebar({ activeTab, onTabChange, className }: SettingsSidebarProps) {
  return (
    <aside
      className={cn(
        "w-full sm:w-[230px] border-b sm:border-b-0 sm:border-r border-white/[0.06] flex flex-row sm:flex-col shrink-0 overflow-x-auto sm:overflow-y-auto no-scrollbar sm:custom-scrollbar py-2 sm:py-4 px-3 sm:px-0 sm:pr-4 gap-1.5 sm:gap-0 sm:space-y-4 relative z-10",
        className,
      )}
    >
      {TAB_GROUPS.map((group) => (
        <div key={group.category} className="flex sm:flex-col sm:space-y-1 gap-1.5 sm:gap-0 shrink-0">
          <span className="hidden sm:block px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
            {group.category}
          </span>

          <div className="flex sm:flex-col gap-1.5 sm:space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:py-2 rounded-full sm:rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer text-left will-change-transform shrink-0 whitespace-nowrap active:scale-[0.98]",
                    isActive
                      ? "bg-indigo-500/20 text-white font-semibold border border-indigo-500/30 sm:border-transparent sm:bg-(--card-spotlight-mid)"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-(--card-spotlight-low) border border-white/[0.06] sm:border-transparent",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", isActive ? "text-indigo-400" : "text-zinc-400")} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
