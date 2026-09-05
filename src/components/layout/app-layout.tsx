"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { UploadModal } from "@/features/documents/upload-modal";

export interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8] text-[#09090b] dark:bg-[#08080a] dark:text-[#f4f4f5] transition-colors duration-150">
      {/* Pinned Desktop Sidebar / Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative">
        {/* Mobile floating toggle to open sidebar when drawer is closed on mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3.5 left-3.5 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 shadow-sm backdrop-blur text-zinc-600 dark:border-white/10 dark:bg-[#141418]/90 dark:text-zinc-300 lg:hidden cursor-pointer active:scale-95 transition-transform"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* Global Ingestion / Upload Modal */}
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
    </div>
  );
}
