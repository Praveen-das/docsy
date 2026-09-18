# Motion, Spring Physics & Micro-Interactions

Authoritative motion engineering standards, spring physics calibrations, easing curves, and micro-interactions for Docsy.

---

## 1. The Animation Frequency Framework

Before animating any UI element, determine user exposure frequency:

| Frequency | Target Elements | Motion Decision |
|---|---|---|
| **100+ times / day** | `Cmd+K` Search opening, Route switching, Sidebar nav clicks | **0ms instant response.** Zero artificial delay. Never animate keyboard-initiated actions. |
| **Tens of times / day** | Card hover spotlights, Navigation sliding pill | High-performance spring or 200ms ease-out. |
| **Occasional** | Upload Modal dialog, User dropdown menu | Fast 100–150ms fade + scale (`zoom-in-95`). |
| **Delight / Key Touchpoint**| Hero 3D Gradient Orb | Continuous GPU fluid wobble; react-spring scale. |

---

## 2. Apple Spring Calibration Formulas

Docsy utilizes `@react-spring/web` with Apple-calibrated physical parameters:

```typescript
// 1. Sidebar Navigation Sliding Pill (Fast, crisp settle, ~220ms, damping ratio ~0.87)
const navSpringConfig = {
  tension: 420,
  friction: 34,
  mass: 0.9,
  precision: 0.005,
};

// 2. Navigation Pill Opacity Fade
const navOpacityConfig = {
  tension: 460,
  friction: 36,
  clamp: true,
};

// 3. Hero Dropzone Blob Expansion (Gentle organic jiggle)
const heroBlobConfig = {
  tension: 50,
  friction: 10,
  precision: 0.001,
};
```

---

## 3. Custom CSS Easing Curves

Never use default browser `ease` or `linear` for UI interactions. Use custom cubic-beziers:

```css
/* Responsive entries, button presses, and hover states */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);

/* Physical on-screen repositioning & layout shifts */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

/* Controlled overshoot & tactile pop */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Mobile sheet and drawer slide transitions */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

---

## 4. Micro-Interaction: Responsive Press Feedback

Every interactive button, icon trigger, and clickable card row MUST provide immediate physical confirmation on pointer-down:

```css
button:not(:disabled):active,
[role="button"]:not([aria-disabled="true"]):active {
  transform: scale(0.98);
  transition: transform 120ms var(--ease-out);
}
```

---

## 5. 60 FPS RequestAnimationFrame Mouse Tracking

Interactive spotlights (`handleGlowMouseMove`) must never cause layout thrashing or forced synchronous reflows:

1. **Measure Geometry Once on Enter:** Cache `getBoundingClientRect()` inside `handleGlowMouseEnter`.
2. **Coalesce Mousemove Ticks:** Store pending `clientX`/`clientY` and update only within `requestAnimationFrame`.
3. **Write Directly to CSS Variables:** Set `--glow-x`, `--glow-y`, `--outer-glow-x`, and `--inset-glow-x` directly on the element style property.

---

## 6. Reduced-Motion Contract (`prefers-reduced-motion`)

When `prefers-reduced-motion: reduce` is active:
- CSS animations (`animate-spin-glow`, `shimmerWave`, `citationPulse`) are disabled (`animation: none !important`).
- Dynamic spotlight pseudo-elements (`::before`) are hidden (`display: none`).
- Three.js WebGL canvas frameloop switches from `"always"` to `"demand"`.
- Spring animations snap immediately with `immediate: true`.
