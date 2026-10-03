import React, { Suspense } from "react";
import { Sidebar, SidebarFallback } from "@/components/layout/sidebar";
import { UploadModal } from "@/features/documents/upload-modal";
import { SelectDocumentModal } from "@/features/documents/components/select-document-modal";
import { SettingsModal } from "@/features/settings/components/settings-modal";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export interface AppLayoutProps {
  children: React.ReactNode;
  isPro?: boolean;
}

export function AppLayout({ children, isPro }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08090d] text-[#f4f4f5] transition-colors duration-150">
      {/* Desktop & Mobile Sidebar */}
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar isPro={isPro} />
      </Suspense>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative">{children}</div>

      {/* Global Upload Ingestion Modal */}
      <UploadModal />

      {/* Global Search / Select Document Modal */}
      <SelectDocumentModal />

      {/* Global Settings Modal with URL Tab Routing */}
      <Suspense fallback={null}>
        <SettingsModal />
      </Suspense>

      {/* Mobile Bottom Navigation Bar matching reference mobile design */}
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
