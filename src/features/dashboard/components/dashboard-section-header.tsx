import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface DashboardSectionHeaderProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  viewAllHref?: string;
}

export function DashboardSectionHeader({
  title,
  href,
  icon: Icon,
  viewAllHref,
}: DashboardSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={href}
        className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white hover:text-indigo-400 transition-colors group"
      >
        <Icon className="h-4 w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
        <span>{title}</span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-xs text-zinc-400 hover:text-white transition-colors font-medium"
        >
          View all
        </Link>
      )}
    </div>
  );
}
