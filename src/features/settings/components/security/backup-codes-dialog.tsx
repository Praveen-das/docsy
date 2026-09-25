"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BackupCodesDialogProps {
  isOpen: boolean;
  codes: string[];
  onClose: () => void;
  onDone: () => void;
}

export function BackupCodesDialog({
  isOpen,
  codes,
  onClose,
  onDone,
}: BackupCodesDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyBackupCodes = () => {
    if (codes.length === 0) return;
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Save Your Backup Codes"
      description="Keep these recovery codes in a safe place. If you lose access to your authenticator app, these codes are the only way to sign back into your Docsy account."
    >
      <div className="space-y-4 pt-1">
        <div className="rounded-xl border border-white/10 bg-black/40 p-3 grid grid-cols-2 gap-2 font-mono text-xs text-indigo-300 text-center select-all">
          {codes.map((code) => (
            <div key={code} className="py-1 px-2 rounded bg-white/5 border border-white/5">
              {code}
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleCopyBackupCodes}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer py-2 px-3 rounded-lg hover:bg-white/5 active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy all codes</span>
              </>
            )}
          </button>

          <Button variant="accent" size="sm" onClick={onDone} className="w-full xs:w-auto">
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
