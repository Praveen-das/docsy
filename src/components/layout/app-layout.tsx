"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { UploadModal } from "@/features/documents/upload-modal";
import { SelectDocumentModal } from "@/features/documents/components/select-document-modal";

import { useUIStore } from "@/stores/ui-store";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  console.log("app layout rendered");

  // Global UI store eliminating prop drilling
  const isSearchOpen = useUIStore((state) => state.isSearchOpen);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const isUploadOpen = useUIStore((state) => state.isUploadOpen);
  const openUpload = useUIStore((state) => state.openUpload);
  const closeUpload = useUIStore((state) => state.closeUpload);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#08090d] text-[#f4f4f5] transition-colors duration-150">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} onOpenUpload={openUpload} />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative">{children}</div>

      {/* Global Upload Ingestion Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={closeUpload} />

      {/* Global Search / Select Document Modal */}
      <SelectDocumentModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenUpload={() => {
          setSearchOpen(false);
          openUpload();
        }}
      />
    </div>
  );
}
