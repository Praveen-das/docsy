"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GlowContainer } from "@/components/ui/glow-container";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabProfile } from "./tab-profile";
import { TabPreferences } from "./tab-preferences";
import { TabAppearance } from "./tab-appearance";
import { TabBilling } from "./tab-billing";
import { TabCustomize } from "./tab-customize";
import { TabDataControls } from "./tab-data-controls";
import { TabSecurity } from "./tab-security";
import { SettingsSidebar, SettingsTabId, TAB_GROUPS } from "./settings-sidebar";

export type { SettingsTabId };

const TAB_TITLES: Record<SettingsTabId, string> = {
  account: "Account",
  general: "General",
  security: "Security & MFA",
  behavior: "Behavior",
  customize: "Customize AI",
  billing: "Plan & Billing",
  data: "Data Controls",
};

const TAB_ALIAS_MAP: Record<string, SettingsTabId> = {
  account: "account",
  profile: "account",
  general: "general",
  appearance: "general",
  security: "security",
  mfa: "security",
  behavior: "behavior",
  preferences: "behavior",
  customize: "customize",
  billing: "billing",
  data: "data",
};

function resolveActiveTab(param: string | null): SettingsTabId {
  if (!param) return "account";
  return TAB_ALIAS_MAP[param] ?? "account";
}

function SettingsTabContent({
  activeTab,
  onNavigateTab,
  onClose,
}: {
  activeTab: SettingsTabId;
  onNavigateTab: (tab: SettingsTabId) => void;
  onClose: () => void;
}) {
  return (
    <div key={activeTab} className="animate-in fade-in duration-150 will-change-[opacity,transform]">
      {activeTab === "account" && <TabProfile onNavigateTab={onNavigateTab} onCloseModal={onClose} />}
      {activeTab === "general" && <TabAppearance />}
      {activeTab === "security" && <TabSecurity />}
      {activeTab === "behavior" && <TabPreferences />}
      {activeTab === "customize" && <TabCustomize />}
      {activeTab === "billing" && <TabBilling onClose={onClose} />}
      {activeTab === "data" && <TabDataControls />}
    </div>
  );
}

export function SettingsModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const settingsParam = searchParams.get("settings");
  const isOpen = Boolean(settingsParam);
  const activeTab = useMemo(() => resolveActiveTab(settingsParam), [settingsParam]);

  const updateSettingsQuery = useCallback(
    (tabId?: SettingsTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tabId) {
        params.set("settings", tabId);
      } else {
        params.delete("settings");
      }
      const query = params.toString();
      const targetUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleClose = useCallback(() => {
    updateSettingsQuery();
  }, [updateSettingsQuery]);

  const handleTabChange = useCallback(
    (tabId: SettingsTabId) => {
      updateSettingsQuery(tabId);
    },
    [updateSettingsQuery],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP MODAL (sm and above): 100% UNTOUCHED ORIGINAL MODAL   */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center p-6 select-none">
        {/* Obsidian Backdrop */}
        <div
          aria-hidden="true"
          onClick={handleClose}
          className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm transition-opacity duration-150 animate-in fade-in will-change-[opacity]"
        />

        {/* Docsy Cosmic Obsidian Glassmorphic Modal Card */}
        <GlowContainer
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          className="relative z-10 w-full max-w-[860px] rounded-[24px] text-white shadow-2xl transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95 will-change-transform h-[580px] flex flex-row overflow-hidden"
        >
          {/* Left Navigation Sidebar */}
          <SettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Right Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.05] shrink-0">
              <h2 id="settings-modal-title" className="text-base font-semibold text-white tracking-tight">
                {TAB_TITLES[activeTab]}
              </h2>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-colors cursor-pointer active:scale-95 will-change-transform"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Viewport */}
            <div className="flex-1 overflow-y-auto px-6 py-2 pb-6 custom-scrollbar will-change-[scroll-position,transform]">
              <SettingsTabContent activeTab={activeTab} onNavigateTab={handleTabChange} onClose={handleClose} />
            </div>
          </main>
        </GlowContainer>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE SCREEN (< sm): NOT A MODAL, FULL BLEED NATIVE VIEW     */}
      {/* ------------------------------------------------------------- */}
      <div className="sm:hidden fixed inset-0 z-35 flex flex-col bg-[#08090d] text-white select-none">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-white/[0.08] bg-[#08090d]/90 backdrop-blur-xl shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Back"
              className="flex items-center justify-center h-8.5 w-8.5 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight leading-tight">Settings</h1>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-0.5">{TAB_TITLES[activeTab]}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </header>

        {/* Mobile Horizontal Category Tabs */}
        <div className="w-full border-b border-white/[0.06] flex flex-row shrink-0 overflow-x-auto no-scrollbar py-2.5 px-3 gap-1.5 bg-[#08090d]/95 backdrop-blur-md sticky top-14 z-10">
          {TAB_GROUPS.map((group) => (
            <div key={group.category} className="flex gap-1.5 shrink-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98]",
                      isActive
                        ? "bg-indigo-500/20 text-white font-semibold border border-indigo-500/30"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-(--card-spotlight-low) border border-white/[0.06]",
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-indigo-400" : "text-zinc-400")} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile Tab Content Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-28 custom-scrollbar">
          <SettingsTabContent activeTab={activeTab} onNavigateTab={handleTabChange} onClose={handleClose} />
        </div>
      </div>
    </>
  );
}
