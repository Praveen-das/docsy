import { useState, useEffect, useRef, useCallback } from "react";
import type { PillRect } from "./sidebar-navigation.types";

export interface UseSlidingNavOptions {
  activeHref: string | null;
  isCollapsed: boolean;
}

// Module-scoped cache that survives Next.js client-side page transitions
const pillRectCache = new Map<string, PillRect>();
let lastKnownActiveRect: PillRect | null = null;
let isGloballyReady = false;

export function useSlidingNav({ activeHref, isCollapsed }: UseSlidingNavOptions) {
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const refCallbacks = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());

  // Initialize with cached rect immediately to eliminate flash-of-null across route changes
  const [activeRect, setActiveRect] = useState<PillRect | null>(() => {
    if (activeHref && pillRectCache.has(activeHref)) {
      return pillRectCache.get(activeHref)!;
    }
    return lastKnownActiveRect;
  });

  const [isReady, setIsReady] = useState(isGloballyReady);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Stable DOM ref callback per item to eliminate ref detachment across re-renders
  const registerItemRef = useCallback((href: string) => {
    let cb = refCallbacks.current.get(href);
    if (!cb) {
      cb = (el: HTMLElement | null) => {
        if (el) {
          itemRefs.current.set(href, el);
        } else {
          itemRefs.current.delete(href);
        }
      };
      refCallbacks.current.set(href, cb);
    }
    return cb;
  }, []);

  // Measure an item's geometry relative to the nav container with integer pixel rounding
  const measureItem = useCallback((href: string | null): PillRect | null => {
    if (!href || !navRef.current) return null;
    const itemEl = itemRefs.current.get(href);
    if (!itemEl) return null;

    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    return {
      top: Math.round(itemRect.top - navRect.top + navRef.current.scrollTop),
      left: Math.round(itemRect.left - navRect.left + navRef.current.scrollLeft),
      width: Math.round(itemRect.width),
      height: Math.round(itemRect.height),
    };
  }, []);

  // Update active pill position with value-equality check to prevent redundant re-renders
  const updateActiveRect = useCallback(() => {
    const rect = measureItem(activeHref);
    if (rect) {
      if (activeHref) {
        pillRectCache.set(activeHref, rect);
      }
      lastKnownActiveRect = rect;

      setActiveRect((prev) => {
        if (
          prev &&
          prev.top === rect.top &&
          prev.left === rect.left &&
          prev.width === rect.width &&
          prev.height === rect.height
        ) {
          return prev; // Value equality prevents redundant state updates & re-renders
        }
        return rect;
      });

      if (!isGloballyReady) {
        requestAnimationFrame(() => {
          isGloballyReady = true;
          setIsReady(true);
        });
      }
    }
  }, [activeHref, measureItem]);

  // Update on route change or container resize
  useEffect(() => {
    updateActiveRect();

    const navEl = navRef.current;
    if (!navEl) return;

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateActiveRect();
      });
      resizeObserver.observe(navEl);
    }

    window.addEventListener("resize", updateActiveRect);

    return () => {
      window.removeEventListener("resize", updateActiveRect);
      resizeObserver?.disconnect();
    };
  }, [updateActiveRect]);

  // Settle timers specifically for sidebar collapse/expand width transitions (does NOT fire on nav changes)
  useEffect(() => {
    if (!isReady) return;
    const t1 = setTimeout(updateActiveRect, 60);
    const t2 = setTimeout(updateActiveRect, 160);
    const t3 = setTimeout(updateActiveRect, 280);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isCollapsed, isReady, updateActiveRect]);

  return {
    navRef,
    registerItemRef,
    activeRect,
    isReady,
    prefersReducedMotion,
  };
}
