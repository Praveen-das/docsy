import React from "react";
import { Header } from "@/components/layout/header";

export interface MainGroupLayoutProps {
  children: React.ReactNode;
}

/**
 * Nested layout for standard application pages (Dashboard, Documents, Conversations, Settings).
 * Renders the top progressive-blur Header and provides the primary scrollable content container.
 */
export default function MainGroupLayout({ children }: MainGroupLayoutProps) {
  return (
    <main className="flex-1 overflow-y-auto min-w-0 relative">
      <Header />
      {children}
    </main>
  );
}
