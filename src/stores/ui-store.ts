"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "system";

export function applyTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
}

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isSearchOpen: boolean;
  isUploadOpen: boolean;
  theme: ThemeMode;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  setUploadOpen: (open: boolean) => void;
  openUpload: () => void;
  closeUpload: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      isSearchOpen: false,
      isUploadOpen: false,
      theme: "dark",
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ isSidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setMobileSidebarOpen: (open: boolean) =>
        set({ isMobileSidebarOpen: open }),
      toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      setSearchOpen: (open: boolean) => set({ isSearchOpen: open }),
      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),
      setUploadOpen: (open: boolean) => set({ isUploadOpen: open }),
      openUpload: () => set({ isUploadOpen: true }),
      closeUpload: () => set({ isUploadOpen: false }),
      setTheme: (theme: ThemeMode) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "docsy-ui-preferences",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
