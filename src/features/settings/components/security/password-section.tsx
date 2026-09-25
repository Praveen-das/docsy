"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { extractClerkErrorMessage } from "./security-utils";

interface PasswordSectionProps {
  hasPassword: boolean;
  onSuccess: (message: string) => void;
}

export function PasswordSection({ hasPassword, onSuccess }: PasswordSectionProps) {
  const { user } = useUser();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const resetForm = () => {
    setPasswordError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  const handleOpenDialog = () => {
    resetForm();
    setShowPasswordDialog(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (hasPassword && !currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordError(null);

      await user.updatePassword({
        newPassword,
        currentPassword: hasPassword ? currentPassword : undefined,
      });

      await user.reload();

      setShowPasswordDialog(false);
      resetForm();
      onSuccess(hasPassword ? "Password changed successfully!" : "Password created successfully!");
    } catch (err: unknown) {
      console.error("Failed to update password:", err);
      setPasswordError(
        extractClerkErrorMessage(err, "Failed to update password. Please check your credentials.")
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
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
            onClick={handleOpenDialog}
            className="rounded-full text-xs active:scale-[0.98] shrink-0"
          >
            {hasPassword ? "Change Password" : "Set Password"}
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={showPasswordDialog}
        onClose={() => !isUpdatingPassword && setShowPasswordDialog(false)}
        title={hasPassword ? "Change Password" : "Set Account Password"}
        description={
          hasPassword
            ? "Enter your current password followed by your new password to update your login credentials."
            : "Set a password so you can sign in directly using your email and password."
        }
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
          {hasPassword && (
            <div className="space-y-1.5">
              <label htmlFor="current-password" className="text-xs font-medium text-zinc-300 block">
                Current Password:
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 pr-9 text-xs text-zinc-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-xs font-medium text-zinc-300 block">
              New Password:
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 pr-9 text-xs text-zinc-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-xs font-medium text-zinc-300 block">
              Confirm New Password:
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isUpdatingPassword}
              placeholder="Re-enter new password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
          </div>

          {passwordError && (
            <p className="text-xs text-rose-400 leading-relaxed">{passwordError}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdatingPassword}
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
              className="gap-1.5"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>{hasPassword ? "Change Password" : "Set Password"}</span>
              )}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
