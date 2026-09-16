"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { UploadModal } from "@/features/documents/upload-modal";

export interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideHeader?: boolean;
}

export function AppLayout({ children, title, hideHeader }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const isConversationMode =
    pathname === "/conversation" ||
    pathname.startsWith("/conversation/") ||
    pathname === "/chat" ||
    pathname.startsWith("/chat/");

  const shouldShowHeader = !hideHeader && !isConversationMode;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08090d] text-[#f4f4f5] transition-colors duration-150">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative">
        {/* Global Top Header matching Image 1 for non-conversation pages */}
        {shouldShowHeader && (
          <Header
            title={title}
            onToggleSidebar={() => setSidebarOpen(true)}
          />
        )}

        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* Global Upload Ingestion Modal */}
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </div>
  );
}
