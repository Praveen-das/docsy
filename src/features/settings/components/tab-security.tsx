"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PasswordSection } from "./security/password-section";
import { TotpSection } from "./security/totp-section";
import { BackupCodesDialog } from "./security/backup-codes-dialog";
import { SecurityStatusRows } from "./security/security-status-rows";

export function TabSecurity() {
  const { user, isLoaded } = useUser();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSuccess = useCallback((message: string) => {
    setErrorMessage(null);
    setSuccessMessage(message);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  }, []);

  const handleError = useCallback((message: string) => {
    setSuccessMessage(null);
    setErrorMessage(message);
  }, []);

  const handleBackupCodesGenerated = useCallback((codes: string[]) => {
    setBackupCodes(codes);
    setShowBackupCodesDialog(true);
  }, []);

  const handleBackupCodesDone = useCallback(() => {
    setShowBackupCodesDialog(false);
    handleSuccess("Authenticator app enabled and backup codes saved!");
  }, [handleSuccess]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">Loading security status...</span>
      </div>
    );
  }

  const hasPassword = Boolean(user?.passwordEnabled);
  const isTotpEnabled = Boolean(user?.totpEnabled);
  const isBackupCodesEnabled = Boolean(user?.backupCodeEnabled);

  return (
    <div className="space-y-4">
      {/* Description header */}
      <div>
        <h4 className="text-[13.5px] font-medium text-zinc-200">Security & Authentication</h4>
        <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">
          Manage your credentials, password protection, and two-factor authentication.
        </p>
      </div>

      {/* Global Success / Error Banners */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Management */}
      <PasswordSection hasPassword={hasPassword} onSuccess={handleSuccess} />

      {/* Two-Factor Authentication (TOTP) */}
      <TotpSection
        isTotpEnabled={isTotpEnabled}
        onSuccess={handleSuccess}
        onError={handleError}
        onBackupCodesGenerated={handleBackupCodesGenerated}
      />

      {/* Security Status Rows */}
      <SecurityStatusRows isBackupCodesEnabled={isBackupCodesEnabled} />

      {/* Backup Codes Modal */}
      <BackupCodesDialog
        isOpen={showBackupCodesDialog}
        codes={backupCodes}
        onClose={() => setShowBackupCodesDialog(false)}
        onDone={handleBackupCodesDone}
      />
    </div>
  );
}
