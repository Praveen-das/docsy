"use client";

import { useQuery } from "@tanstack/react-query";

export interface SubscriptionData {
  plan: "free" | "pro";
  stripeSubscriptionId: string | null;
  planPeriodEnd: string | null;
  planCancelAt: string | null;
  dailyQueriesUsed: number;
  dailyQueriesLimit: number;
}

async function fetchSubscription(): Promise<SubscriptionData> {
  const res = await fetch("/api/stripe/subscription");
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json() as Promise<SubscriptionData>;
}

export function useSubscription() {
  return useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
}
