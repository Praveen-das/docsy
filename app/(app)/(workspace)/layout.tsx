import React from "react";

export interface WorkspaceGroupLayoutProps {
  children: React.ReactNode;
}

/**
 * Nested layout for workspace pages (Conversation, Chat).
 * Provides a 100% full-height flex container without the top Header or outer scrollbars.
 */
export default function WorkspaceGroupLayout({ children }: WorkspaceGroupLayoutProps) {
  return (
    <main className="flex-1 h-full min-w-0 overflow-hidden relative">
      {children}
    </main>
  );
}
