# Accessibility & Ergonomics

Authoritative accessibility requirements, keyboard interactions, contrast ratios, and assistive tech patterns for Docsy.

---

## 1. Color Contrast Standards (WCAG 2.1 AA)

All text, icons, and interactive elements must satisfy WCAG 2.1 AA contrast requirements:

| Element Pair | Contrast Ratio | Compliance Level |
|---|---|---|
| **Primary Text (`#ffffff`) on Obsidian (`#08090d`)** | `18.2:1` | Exceeds AAA (`7.0:1`) |
| **Secondary Text (`#94a3b8`) on Obsidian (`#08090d`)**| `6.8:1` | Exceeds AA (`4.5:1`) |
| **Interactive Indigo Accent (`#818cf8`) on Obsidian** | `5.4:1` | Exceeds AA (`4.5:1`) |
| **Status Green (`#34d399`) on Obsidian** | `9.7:1` | Exceeds AAA (`7.0:1`) |
| **Status Amber (`#fbbf24`) on Obsidian** | `10.8:1` | Exceeds AAA (`7.0:1`) |
| **Status Red (`#f87171`) on Obsidian** | `6.2:1` | Exceeds AA (`4.5:1`) |

---

## 2. Focus Indicators

Never rely on the default browser blue outline. Always supply an intentional, offset focus ring:

```css
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-indigo-500/50 
focus-visible:ring-offset-2 
focus-visible:ring-offset-white 
dark:focus-visible:ring-offset-[#08090d]
```

---

## 3. Keyboard Navigation & Shortcuts

- **`Cmd+K` / `Ctrl+K`:** Global shortcut that immediately opens `SelectDocumentModal`.
- **`Escape` Key:** Instantly dismisses active modals, search dialogs, mobile drawers, and user menus.
- **`Tab` / `Shift+Tab` Trapping:** When any modal dialog opens, tab focus MUST be trapped inside the modal container. Upon closing, focus MUST return to the trigger element.
- **`Space` & `Enter` Activation:** Any custom interactive card with `role="button"` must handle both keys:
  ```tsx
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
  ```

---

## 4. Touch Targets

- **Desktop Minimum:** `40px × 40px` (e.g. `h-10 w-10`).
- **Mobile Minimum:** `44px × 44px`.
- **Icon-Only Buttons:** Wrap small 16px icons inside a padded button with an explicit `aria-label` (e.g., `aria-label="Document options"`).

---

## 5. Semantic HTML & ARIA Standards

1. **Heading Hierarchy:** One single `h1` per page (Hero heading), followed logically by `h2` for main page sections and `h3`/`h4` for individual card titles. Never skip heading levels.
2. **Interactive Elements:** Use native `<button>` or `<Link>` whenever possible. When using a `<div>` as an interactive card, apply:
   ```tsx
   role="button"
   tabIndex={0}
   aria-label="Descriptive action"
   ```
3. **Menu & Dialog States:**
   - Dropdown triggers must declare `aria-expanded={isOpen}` and `aria-haspopup="true"`.
   - Modals must declare `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`, and `aria-describedby="dialog-description"`.
4. **Decorative Graphics:** Set `aria-hidden="true"` on ambient nebulas, background glows, and decorative SVG arrows.

---

## 6. Reduced-Motion Guarantees

Respect user OS accessibility preferences:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-spin-glow,
  .shimmer-active::after,
  .citation-target-active {
    animation: none !important;
  }
  .active-card-glow::before,
  .active-row-glow::before {
    display: none !important;
  }
}
```
Three.js canvas frameloops must stop running continuously when reduced motion is enabled.
