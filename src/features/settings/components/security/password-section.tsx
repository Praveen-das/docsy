"use client";

import React, { useState } from "react";
import { PasswordStatusCard } from "./password-status-card";
import { PasswordDialog } from "./password-dialog";

export interface PasswordSectionProps {
  hasPassword: boolean;
  onSuccess: (message: string) => void;
}

/**
 * Password management section in Security tab.
 * Composes PasswordStatusCard and PasswordDialog.
 */
export function PasswordSection({ hasPassword, onSuccess }: PasswordSectionProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  return (
    <>
      <PasswordStatusCard
        hasPassword={hasPassword}
        onOpenDialog={() => setShowPasswordDialog(true)}
      />

      <PasswordDialog
        isOpen={showPasswordDialog}
        hasPassword={hasPassword}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}

export { PasswordStatusCard } from "./password-status-card";
export { PasswordDialog } from "./password-dialog";
export { PasswordInputField } from "./password-input-field";
