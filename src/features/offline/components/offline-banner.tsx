"use client";

import React from "react";
import { WifiOff, Wifi, CloudOff } from "lucide-react";
import { useNetworkStatus } from "../hooks/use-network-status";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const { isOffline, wasOffline } = useNetworkStatus();

  if (!isOffline && !wasOffline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={isOffline ? "Application is in offline mode" : "Internet connection restored"}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-in fade-in slide-in-from-top-3 duration-200"
    >
      {isOffline ? (
        /* Disconnected Pill */
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-[#0c1017]/95 text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.2)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <WifiOff className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-medium tracking-tight">
            Offline Mode <span className="text-amber-400/70 hidden sm:inline">— Viewing cached documents & transcripts in read-only</span>
          </span>
        </div>
      ) : (
        /* Reconnected Flash Toast */
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-[#0c1017]/95 text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.2)] backdrop-blur-md">
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium tracking-tight">
            Back Online <span className="text-emerald-400/70 hidden sm:inline">— Connection restored</span>
          </span>
        </div>
      )}
    </aside>
  );
}
