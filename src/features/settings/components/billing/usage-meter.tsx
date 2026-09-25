"use client";

import React from "react";
import { QueryMeter } from "./query-meter";
import { StorageMeter } from "./storage-meter";
import { DocumentsMeter } from "./documents-meter";

export { formatStorageSize } from "./storage-meter";

interface UsageMeterProps {
  queriesUsed: number;
  queriesLimit: number;
  documentsCount: number;
  documentsLimit: number | null;
  totalBytesUsed: number;
  storageLimitBytes: number;
}

export function UsageMeter({
  queriesUsed,
  queriesLimit,
  documentsCount,
  documentsLimit,
  totalBytesUsed,
  storageLimitBytes,
}: UsageMeterProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
        <span className="text-[12.5px] font-semibold text-zinc-200">Resource Consumption</span>
        <span className="text-[11px] text-zinc-500 font-mono">Live Sync</span>
      </div>

      {/* 1. Daily AI Query Allowance */}
      <QueryMeter queriesUsed={queriesUsed} queriesLimit={queriesLimit} />

      {/* 2. Actual Storage Usage */}
      <div className="pt-3 border-t border-white/[0.05]">
        <StorageMeter totalBytesUsed={totalBytesUsed} storageLimitBytes={storageLimitBytes} />
      </div>

      {/* 3. Document Library Quota */}
      <div className="pt-3 border-t border-white/[0.05]">
        <DocumentsMeter documentsCount={documentsCount} documentsLimit={documentsLimit} />
      </div>
    </div>
  );
}
