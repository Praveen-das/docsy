"use client";

import React from "react";
import { KeyRound, ShieldCheck, Check } from "lucide-react";

interface SecurityStatusRowsProps {
  isBackupCodesEnabled: boolean;
}

export function SecurityStatusRows({ isBackupCodesEnabled }: SecurityStatusRowsProps) {
  return (
    <div className="divide-y divide-white/[0.06]">
      {/* Recovery Codes Row */}
      <div className="flex items-center justify-between py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[13.5px] font-medium text-zinc-200 block">Backup Recovery Codes</span>
            <span className="text-[12px] text-zinc-500">
              {isBackupCodesEnabled
                ? "Recovery codes generated for account emergency access."
                : "Generated automatically when enabling Authenticator MFA."}
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {isBackupCodesEnabled ? "Enabled" : "Not configured"}
        </span>
      </div>

      {/* Security Status Info */}
      <div className="flex items-center justify-between py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[13.5px] font-medium text-zinc-200 block">Account Protection</span>
            <span className="text-[12px] text-zinc-500">Protected via Clerk Authentication Engine</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
          <Check className="h-3 w-3 stroke-[2.5]" />
          Secure
        </span>
      </div>
    </div>
  );
}
