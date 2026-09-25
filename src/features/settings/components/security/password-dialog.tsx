"use client";

import React, { useState } from "react";
import { useUser, useReverification } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import { Loader2, AlertCircle, KeyRound, ShieldCheck } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInputField } from "./password-input-field";
import { extractClerkErrorMessage } from "./security-utils";

export interface PasswordDialogProps {
  isOpen: boolean;
  hasPassword: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Self-contained modal dialog for setting or updating account password with Clerk authentication.
 * Styled to match the obsidian glassmorphic Docsy design system.
 */
export function PasswordDialog({ isOpen, hasPassword, onClose, onSuccess }: PasswordDialogProps) {
  const { user } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const updatePasswordWithReverification = useReverification(
    (params: { newPassword: string; currentPassword?: string }) => {
      if (!user) throw new Error("User not found");
      return user.updatePassword(params);
    }
  );

  const resetForm = () => {
    setPasswordError(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    if (isUpdatingPassword) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      await updatePasswordWithReverification({
        newPassword,
        currentPassword: hasPassword ? currentPassword : undefined,
      });

      await user.reload();

      handleClose();
      onSuccess(hasPassword ? "Password changed successfully!" : "Password created successfully!");
    } catch (err: unknown) {
      if (isReverificationCancelledError(err)) {
        return;
      }
      console.error("Failed to update password:", err);
      setPasswordError(extractClerkErrorMessage(err, "Failed to update password. Please check your credentials."));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const isSubmitDisabled = isUpdatingPassword || !newPassword || !confirmPassword || (hasPassword && !currentPassword);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={hasPassword ? "Change Password" : "Set Account Password"}
      description={
        hasPassword
          ? "Enter your current password and choose a new one to update your login credentials."
          : "Create a password to sign in directly with your email address and password."
      }
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Subtle Security Guidance Banner */}
        {hasPassword ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-zinc-400">
            <KeyRound className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <p className="leading-relaxed">
              Choose a strong password with at least 8 characters. You will use this new password on your next sign in.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
            <p className="leading-relaxed">
              Adding a password enables direct email sign-in alongside your social authentication provider.
            </p>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-3.5">
          {hasPassword && (
            <PasswordInputField
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
              disabled={isUpdatingPassword}
              autoComplete="current-password"
            />
          )}

          <PasswordInputField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="At least 8 characters"
            disabled={isUpdatingPassword}
            autoComplete="new-password"
          />

          <PasswordInputField
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter new password"
            disabled={isUpdatingPassword}
            autoComplete="new-password"
          />
        </div>

        {/* Structured Error Alert Banner */}
        {passwordError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed">{passwordError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUpdatingPassword}
            onClick={handleClose}
            className="w-full xs:w-auto active:scale-[0.98]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={isSubmitDisabled}
            className="gap-1.5 w-full xs:w-auto active:scale-[0.98]"
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
  );
}
