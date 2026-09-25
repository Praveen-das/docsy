"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { currentUser } from "@/lib/mock-data";
import { Calendar, Trash2 } from "lucide-react";
import { ProfileHeader } from "./profile/profile-header";
import { DeleteAccountDialog } from "./profile/delete-account-dialog";

export interface TabProfileProps {
  onNavigateTab?: (tab: "billing" | "behavior" | "general") => void;
  onCloseModal?: () => void;
}

export function TabProfile({ onCloseModal }: TabProfileProps) {
  const { user } = useUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const displayName = user?.fullName || user?.firstName || currentUser.name;
  const displayEmail = user?.primaryEmailAddress?.emailAddress || currentUser.email;
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "March 2024";

  return (
    <div className="space-y-4">
      {/* Profile — identity info */}
      <ProfileHeader
        displayName={displayName}
        displayEmail={displayEmail}
        userInitials={userInitials}
        imageUrl={user?.imageUrl}
      />

      {/* Account settings — flat rows with dividers */}
      <div className="divide-y divide-white/[0.06]">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-medium text-zinc-200">Member Since</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">{memberSince}</span>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[13px] font-medium text-rose-400 block">Delete Account</span>
              <span className="text-[11.5px] text-zinc-500">
                Permanently remove your account and all associated documents
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-full bg-rose-500/[0.08] hover:bg-rose-500/[0.16] text-rose-400 border border-rose-500/20 px-3.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onAccountDeleted={onCloseModal}
      />
    </div>
  );
}
