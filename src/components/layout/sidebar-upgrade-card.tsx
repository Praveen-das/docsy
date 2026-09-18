import React from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export interface SidebarUpgradeCardProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export const SidebarUpgradeCard = React.memo(function SidebarUpgradeCard({
  isCollapsed,
  onClose,
}: SidebarUpgradeCardProps) {
  if (isCollapsed) {
    return (
      <div className="mt-auto flex justify-center py-2">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 transition-colors shadow-[0_0_12px_rgba(99,102,241,0.25)] cursor-pointer"
          title="Upgrade to Pro"
        >
          <Zap className="h-4 w-4 fill-indigo-300" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-auto rounded-[22px] border border-[#1e2336]/60 bg-(--surface-card) p-4.5 relative overflow-hidden shadow-lg shadow-black/30">
      {/* Subtle Ambient indigo/lavender glow consistent with the app theme */}
      <div
        aria-hidden="true"
        className="absolute -top-6 -left-6 w-28 h-28 bg-[#818cf8]/10 rounded-full blur-2xl pointer-events-none transform-gpu"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-6 -right-6 w-28 h-28 bg-[#6366f1]/10 rounded-full blur-2xl pointer-events-none transform-gpu"
      />

      {/* Glowing Lavender/Indigo Lightning Bolt Icon */}
      <div className="mb-3 relative z-10">
        <Zap className="h-5 w-5 text-[#c7d2fe] fill-[#c7d2fe] drop-shadow-[0_0_10px_rgba(165,180,252,0.65)]" />
      </div>

      <div className="relative z-10 space-y-1.5">
        <h4 className="text-[14px] font-semibold text-[#f1f3f9] tracking-tight">Upgrade to Pro</h4>

        {/* Description & Circular Action Button side-by-side */}
        <div className="flex items-end justify-between gap-2 pt-0.5">
          <div className="text-[11.5px] text-[#7d879d] font-normal leading-relaxed select-none space-y-0.5">
            <p>More documents.</p>
            <p>Higher limits.</p>
            <p>Unlock more.</p>
          </div>

          <Link
            href="/settings"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#141824] border border-white/[0.08] text-[#9aa4bc] hover:text-white hover:bg-[#1d2233] hover:border-white/15 transition-all cursor-pointer shadow-sm mb-0.5"
            title="View Pro Plans"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
});
