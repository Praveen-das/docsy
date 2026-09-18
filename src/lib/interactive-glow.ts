import React from "react";

interface GlowTargetState {
  rect: DOMRect | null;
  rafId: number | null;
  pendingClientX: number;
  pendingClientY: number;
  leaveTimeout: ReturnType<typeof setTimeout> | null;
}

const targetStateMap = new WeakMap<HTMLElement, GlowTargetState>();

function isReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getOrCreateState(element: HTMLElement): GlowTargetState {
  let state = targetStateMap.get(element);
  if (!state) {
    state = {
      rect: null,
      rafId: null,
      pendingClientX: 0,
      pendingClientY: 0,
      leaveTimeout: null,
    };
    targetStateMap.set(element, state);
  }
  return state;
}

/**
 * Prepares the element for high-performance interaction on hover:
 * - Caches element geometry once on enter to avoid forced reflows during subsequent mousemove ticks
 */
export function handleGlowMouseEnter(e: React.MouseEvent<HTMLElement>): void {
  if (isReducedMotion()) return;

  const target = e.currentTarget;
  const state = getOrCreateState(target);

  if (state.leaveTimeout) {
    clearTimeout(state.leaveTimeout);
    state.leaveTimeout = null;
  }

  // Measure once on enter to avoid forced reflows during subsequent mousemove ticks
  state.rect = target.getBoundingClientRect();
}

/**
 * High-performance mousemove handler:
 * - Coalesces high-frequency mouse events into a single requestAnimationFrame tick
 * - Uses cached bounding geometry to eliminate layout/reflow overhead
 * - Applies batch updates to custom CSS properties
 */
export function handleGlowMouseMove(e: React.MouseEvent<HTMLElement>): void {
  if (isReducedMotion()) return;

  const target = e.currentTarget;
  const state = getOrCreateState(target);

  // Lazy cache if entered without mouseenter event
  if (!state.rect) {
    state.rect = target.getBoundingClientRect();
  }

  state.pendingClientX = e.clientX;
  state.pendingClientY = e.clientY;

  if (state.rafId !== null) return;

  state.rafId = requestAnimationFrame(() => {
    state.rafId = null;
    const rect = state.rect;
    if (!rect) return;

    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    const x = Math.max(0, Math.min(width, Math.round(state.pendingClientX - rect.left)));
    const y = Math.max(0, Math.min(height, Math.round(state.pendingClientY - rect.top)));

    const normX = x / width - 0.5;
    const normY = y / height - 0.5;

    const outerX = Math.round(normX * 5);
    const insetX = (-normX * 3).toFixed(1);
    const insetY = (-normY * 2).toFixed(1);
    const insetXSoft = Math.round(-normX * 16);
    const insetYSoft = Math.round(-normY * 8);

    const style = target.style;
    style.setProperty("--glow-x", `${x}px`);
    style.setProperty("--glow-y", `${y}px`);
    style.setProperty("--outer-glow-x", `${outerX}px`);
    style.setProperty("--outer-glow-x-sm", `${Math.round(outerX * 0.8)}px`);
    style.setProperty("--inset-glow-x", `${insetX}px`);
    style.setProperty("--inset-glow-y", `${insetY}px`);
    style.setProperty("--inset-glow-x-soft", `${insetXSoft}px`);
    style.setProperty("--inset-glow-y-soft", `${insetYSoft}px`);
  });
}

/**
 * Handles pointer exit:
 * - Cancels any pending animation frame
 * - Clears cached layout metrics
 */
export function handleGlowMouseLeave(e: React.MouseEvent<HTMLElement>): void {
  const target = e.currentTarget;
  const state = targetStateMap.get(target);
  if (!state) return;

  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  state.rect = null;

  if (state.leaveTimeout) {
    clearTimeout(state.leaveTimeout);
    state.leaveTimeout = null;
  }
}
