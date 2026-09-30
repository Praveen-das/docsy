"use client";

import React from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useUIStore } from "@/stores/ui-store";

export function HeaderMobileNavToggle() {
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);

  return (
    <div className="flex items-center gap-3 lg:hidden">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="hidden md:flex lg:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white cursor-pointer active:scale-95 transition-all"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Logo size="sm" />
    </div>
  );
}
