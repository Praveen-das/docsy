"use client";

import React from "react";
import { QueryMeter } from "./query-meter";
import { StorageMeter } from "./storage-meter";
import { DocumentsMeter } from "./documents-meter";

export { formatStorageSize } from "./storage-meter";

interface UsageMeterProps {
  queriesUsed: number;
  queriesLimit: number;
  documentsCount?: number;
  documentsLimit?: number | null;
  totalBytesUsed?: number;
  storageLimitBytes?: number;
}

export function UsageMeter({
  queriesUsed,
  queriesLimit,
}: UsageMeterProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
        <span className="text-[12.5px] font-semibold text-zinc-200">Daily Query Allowance</span>
        <span className="text-[11px] text-zinc-500 font-mono">Live Sync</span>
      </div>

      {/* Daily AI Query Allowance */}
      <QueryMeter queriesUsed={queriesUsed} queriesLimit={queriesLimit} />
    </div>
  );
}
