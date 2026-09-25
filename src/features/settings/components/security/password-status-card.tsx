"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PasswordStatusCardProps {
  hasPassword: boolean;
  onOpenDialog: () => void;
}

/**
 * Presentational card displaying current password configuration status and trigger button.
 */
export function PasswordStatusCard({ hasPassword, onOpenDialog }: PasswordStatusCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-medium text-zinc-200">Account Password</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  hasPassword
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {hasPassword ? "Configured" : "Not Set"}
              </span>
            </div>
            <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">
              {hasPassword
                ? "Your account is secured with a password. You can change it anytime."
                : "You currently sign in via social authentication. You can set a password for direct login."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenDialog}
          className="rounded-full text-xs active:scale-[0.98] shrink-0 cursor-pointer"
        >
          {hasPassword ? "Change Password" : "Set Password"}
        </Button>
      </div>
    </div>
  );
}
