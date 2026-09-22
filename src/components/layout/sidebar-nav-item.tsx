import React, { useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { handleGlowMouseEnter, handleGlowMouseMove, handleGlowMouseLeave } from "@/lib/interactive-glow";
import type { NavItem } from "./sidebar-navigation.types";
import { useRouter } from "next/router";

export const NAV_MUTED_COLOR = "text-(--sidebar-nav-muted)";

export interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: (item: NavItem) => void;
  refCallback: (el: HTMLElement | null) => void;
}

export const SidebarNavItem = React.memo(function SidebarNavItem({
  item,
  isActive,
  isCollapsed,
  onSelect,
  refCallback,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    onSelect(item);
  }, [onSelect, item]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (isActive) {
      handleGlowMouseEnter(e);
      handleGlowMouseMove(e);
      const navEl = e.currentTarget.closest("nav");
      const pillEl = navEl?.querySelector<HTMLElement>(".active-nav-pill");
      if (pillEl) {
        handleGlowMouseEnter({ ...e, currentTarget: pillEl });
        handleGlowMouseMove({ ...e, currentTarget: pillEl });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isActive) {
      handleGlowMouseMove(e);
      const navEl = e.currentTarget.closest("nav");
      const pillEl = navEl?.querySelector<HTMLElement>(".active-nav-pill");
      if (pillEl) {
        handleGlowMouseMove({ ...e, currentTarget: pillEl });
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (isActive) {
      handleGlowMouseLeave(e);
      const navEl = e.currentTarget.closest("nav");
      const pillEl = navEl?.querySelector<HTMLElement>(".active-nav-pill");
      if (pillEl) {
        handleGlowMouseLeave({ ...e, currentTarget: pillEl });
      }
    }
  };

  const itemClassName = cn(
    "group relative z-10 flex items-center select-none cursor-pointer overflow-hidden bg-transparent",
    "border-0 border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none ring-0 active:scale-[0.98]",
    "transition-colors duration-150",
    isCollapsed ? "h-8 w-8 justify-center rounded-xl mx-auto" : "h-8 w-full px-2.5 gap-2 rounded-xl",
    isActive ? "text-[#f1f3f9]" : cn(NAV_MUTED_COLOR, "hover:text-[#d1d5e5] hover:bg-(--card-spotlight-mid)"),
  );

  if (item.isSearch) {
    return (
      <button
        ref={refCallback}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        title={isCollapsed ? item.label : undefined}
        className={itemClassName}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 group-hover:text-[#c4cbdd] transition-colors stroke-[1.8] relative z-10",
            NAV_MUTED_COLOR,
          )}
        />
        {!isCollapsed && (
          <span
            className={cn(
              "truncate text-[12.5px] font-medium leading-none group-hover:text-[#d1d5e5] relative z-10",
              NAV_MUTED_COLOR,
            )}
          >
            {item.label}
          </span>
        )}
      </button>
    );
  }

  return (
    <Link
      ref={refCallback}
      href={item.href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title={isCollapsed ? item.label : undefined}
      className={itemClassName}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0 transition-all duration-150 stroke-[1.8] relative z-10",
          isActive
            ? "text-[#a3b8fc] drop-shadow-[0_0_6px_rgba(163,184,252,0.6)]"
            : cn(NAV_MUTED_COLOR, "group-hover:text-[#c4cbdd]"),
        )}
      />

      {!isCollapsed && (
        <span
          className={cn(
            "truncate text-[12.5px] tracking-normal font-medium leading-none transition-colors duration-150 relative z-10",
            isActive ? "text-[#f1f3f9]" : cn(NAV_MUTED_COLOR, "group-hover:text-[#d1d5e5]"),
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
});
