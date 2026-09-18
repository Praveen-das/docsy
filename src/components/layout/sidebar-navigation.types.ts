import React from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSearch?: boolean;
}

export interface PillRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SidebarNavigationProps {
  isCollapsed: boolean;
  onClose?: () => void;
  onOpenSearch?: () => void;
}
