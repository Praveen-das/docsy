"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

let isAppHydrated = false;

export function useSidebarState(isOpen?: boolean, onClose?: () => void) {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  const effectiveIsOpen = isOpen ?? isMobileSidebarOpen;
  const effectiveOnClose = onClose ?? (() => setMobileSidebarOpen(false));

  const [mounted, setMounted] = useState(isAppHydrated);
  const [enableTransitions, setEnableTransitions] = useState(isAppHydrated);

  useEffect(() => {
    isAppHydrated = true;
    setMounted(true);
    const timer = setTimeout(() => {
      setEnableTransitions(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  return {
    isSidebarCollapsed,
    setSidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    effectiveIsOpen,
    effectiveOnClose,
    isCollapsed,
    enableTransitions,
  };
}
