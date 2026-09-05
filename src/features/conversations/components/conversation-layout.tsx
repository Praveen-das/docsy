"use client";

import React from "react";
import { MobilePaneSwitcher } from "./mobile-pane-switcher";

export interface ConversationLayoutProps {
  mobileTab: "conversation" | "pdf";
  onMobileTabChange: (tab: "conversation" | "pdf") => void;
  pdfViewer: React.ReactNode;
  chatPanel: React.ReactNode;
  conversationCount?: number;
}

export function ConversationLayout({
  mobileTab,
  onMobileTabChange,
  pdfViewer,
  chatPanel,
  conversationCount,
}: ConversationLayoutProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile Tab Switcher (<1024px) */}
      <MobilePaneSwitcher
        activeTab={mobileTab}
        conversationCount={conversationCount}
        onTabChange={onMobileTabChange}
      />

      {/* Dual Pane Desktop Workspace Layout */}
      <div className="h-full flex flex-1 overflow-hidden">
        {/* Left Pane: Interactive PDF Viewer */}
        <div
          className={`w-full lg:w-1/2 h-full ${
            mobileTab === "pdf" ? "block" : "hidden lg:block"
          }`}
        >
          {pdfViewer}
        </div>

        {/* Right Pane: Conversational Interface */}
        <div
          className={`w-full lg:w-1/2 h-full border-l border-zinc-200 dark:border-white/5 ${
            mobileTab === "conversation" ? "block" : "hidden lg:block"
          }`}
        >
          {chatPanel}
        </div>
      </div>
    </div>
  );
}
