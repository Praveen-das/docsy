"use client";

import React, { useState } from "react";
import { useUser, useReverification } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOTPSetupState, extractClerkErrorMessage } from "./security-utils";

interface TotpSectionProps {
  isTotpEnabled: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onBackupCodesGenerated: (codes: string[]) => void;
}

export function TotpSection({
  isTotpEnabled,
  onSuccess,
  onError,
  onBackupCodesGenerated,
}: TotpSectionProps) {
  const { user } = useUser();

  // Setup state
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [totpData, setTotpData] = useState<TOTPSetupState | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Disable state
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const createTOTPWithReverification = useReverification(() => {
    if (!user) throw new Error("User not found");
    return user.createTOTP();
  });

  const verifyTOTPWithReverification = useReverification(
    (params: { code: string }) => {
      if (!user) throw new Error("User not found");
      return user.verifyTOTP(params);
    }
  );

  const disableTOTPWithReverification = useReverification(() => {
    if (!user) throw new Error("User not found");
    return user.disableTOTP();
  });

  const handleStartSetup = async () => {
    if (!user) return;
    try {
      setIsSettingUp(true);
      setVerificationCode("");

      const totp = await createTOTPWithReverification();
      setTotpData({
        secret: totp.secret,
        uri: totp.uri,
      });
    } catch (err: unknown) {
      if (isReverificationCancelledError(err)) {
        return;
      }
      console.error("Failed to initiate TOTP setup:", err);
      onError(
        extractClerkErrorMessage(
          err,
          "Failed to generate MFA secret. Please verify your Clerk MFA settings."
        )
      );
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || verificationCode.trim().length < 6) return;

    try {
      setIsVerifying(true);

      const result = await verifyTOTPWithReverification({ code: verificationCode.trim() });
      await user.reload();

      setTotpData(null);
      setVerificationCode("");

      if (result.backupCodes && result.backupCodes.length > 0) {
        onBackupCodesGenerated(result.backupCodes);
      } else {
        onSuccess("Authenticator app (MFA) enabled successfully!");
      }
    } catch (err: unknown) {
      if (isReverificationCancelledError(err)) {
        return;
      }
      console.error("Failed to verify TOTP code:", err);
      onError(
        extractClerkErrorMessage(
          err,
          "Invalid verification code. Please check your authenticator app and try again."
        )
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisableTOTP = async () => {
    if (!user) return;
    try {
      setIsDisabling(true);

      await disableTOTPWithReverification();
      await user.reload();

      setShowDisableDialog(false);
      onSuccess("Two-factor authentication has been disabled.");
    } catch (err: unknown) {
      if (isReverificationCancelledError(err)) {
        return;
      }
      console.error("Failed to disable TOTP:", err);
      onError(extractClerkErrorMessage(err, "Failed to disable MFA. Please try again."));
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCopySecret = () => {
    if (!totpData?.secret) return;
    navigator.clipboard.writeText(totpData.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <>
      {/* MFA Status Card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                isTotpEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/[0.04] text-zinc-400 border-white/[0.06]"
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-medium text-zinc-200">Authenticator App (TOTP)</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isTotpEnabled
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/10 text-zinc-400 border border-white/10"
                  }`}
                >
                  {isTotpEnabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">
                Use Google Authenticator, 1Password, or Authy to generate secure verification codes.
              </p>
            </div>
          </div>

          {isTotpEnabled ? (
            <button
              type="button"
              onClick={() => setShowDisableDialog(true)}
              className="rounded-full bg-rose-500/[0.08] hover:bg-rose-500/[0.15] text-rose-400 border border-rose-500/20 px-3.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer shrink-0"
            >
              Turn Off
            </button>
          ) : (
            <Button
              type="button"
              variant="accent"
              size="sm"
              disabled={isSettingUp || Boolean(totpData)}
              onClick={handleStartSetup}
              className="rounded-full text-xs active:scale-[0.98] shrink-0"
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Configuring...</span>
                </>
              ) : (
                <span>Set Up MFA</span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* TOTP Setup Form */}
      {totpData && (
        <form
          onSubmit={handleVerifyTOTP}
          className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-4 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-indigo-400" />
              <h5 className="text-[13px] font-semibold text-zinc-100">Step 1: Scan QR or enter key</h5>
            </div>
            <button
              type="button"
              onClick={() => setTotpData(null)}
              className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* QR Code display */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              {totpData.uri ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    totpData.uri,
                  )}`}
                  alt="MFA QR Code"
                  className="h-36 w-36 rounded-lg bg-white p-2 shadow-md"
                />
              ) : (
                <div className="h-36 w-36 rounded-lg bg-white/5 flex items-center justify-center text-xs text-zinc-500">
                  QR unavailable
                </div>
              )}
              <span className="text-[11px] text-zinc-500 mt-2 text-center">Scan with your Authenticator app</span>
            </div>

            {/* Secret key & code entry */}
            <div className="space-y-3">
              <div>
                <label className="text-[11.5px] font-medium text-zinc-400 block mb-1">
                  Or enter secret key manually:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={totpData.secret || ""}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer shrink-0"
                    title="Copy secret key"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="totp-code" className="text-[11.5px] font-medium text-zinc-400 block mb-1">
                  Step 2: Enter 6-digit code:
                </label>
                <input
                  id="totp-code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  className="w-full rounded-lg border border-indigo-500/30 bg-black/50 px-3 py-2 font-mono text-sm tracking-widest text-center text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={verificationCode.length < 6 || isVerifying}
                className="w-full rounded-lg text-xs"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify and Activate</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Disable TOTP Confirmation Dialog */}
      <Dialog
        isOpen={showDisableDialog}
        onClose={() => !isDisabling && setShowDisableDialog(false)}
        title="Disable Multi-Factor Authentication?"
        description="Your account will be less secure. You will only need your email and password to sign in."
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <p className="leading-relaxed">
              Disabling MFA removes the extra layer of security. You can re-enable an authenticator app at any time.
            </p>
          </div>

          <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDisabling}
              onClick={() => setShowDisableDialog(false)}
              className="w-full xs:w-auto"
            >
              Keep MFA
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDisabling}
              onClick={handleDisableTOTP}
              className="gap-1.5 w-full xs:w-auto"
            >
              {isDisabling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Disabling...</span>
                </>
              ) : (
                <span>Disable MFA</span>
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
