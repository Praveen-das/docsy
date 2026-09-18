import React from "react";
import { AppLayout } from "@/components/layout/app-layout";

export interface AppRouteLayoutProps {
  children: React.ReactNode;
}

/**
 * Persistent route group layout for all authenticated application routes.
 * Preserves sidebar, header, and modal state across client-side page transitions.
 */
export default function AppRouteLayout({ children }: AppRouteLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}
