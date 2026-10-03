import React from "react";
import { auth } from "@clerk/nextjs/server";
import { getSubscriptionByUserId } from "@/services/subscription.service";
import { AppLayout } from "@/components/layout/app-layout";

export interface AppRouteLayoutProps {
  children: React.ReactNode;
}

/**
 * Persistent route group layout for all authenticated application routes.
 * Preserves sidebar, header, and modal state across client-side page transitions.
 */
export default async function AppRouteLayout({ children }: AppRouteLayoutProps) {
  let isPro = false;
  try {
    const { userId } = await auth();
    if (userId) {
      const sub = await getSubscriptionByUserId(userId);
      isPro = sub?.plan === "pro";
    }
  } catch {
    isPro = false;
  }

  return <AppLayout isPro={isPro}>{children}</AppLayout>;
}
