# Spacing System & Radii Scale

Authoritative spatial rhythms, container paddings, radii scales, and surface depth metrics for Docsy.

---

## 1. The 8pt Spatial Scale

Docsy strictly enforces an 8pt spatial baseline, using 4px half-steps only for hairline alignments, icon offsets, and micro-badges.

| Token | Pixels | Rem | Tailwind Utility | Standard Usage |
|---|---|---|---|---|
| `--space-2xs` | `2px` / `4px` | `0.125rem` / `0.25rem` | `p-0.5`, `p-1`, `gap-1` | Hairline offsets, tab separators, inner badge margins |
| `--space-xs` | `6px` / `8px` | `0.375rem` / `0.5rem` | `p-1.5`, `p-2`, `gap-2` | Button gap, icon margins, search tag padding |
| `--space-sm` | `12px` / `14px` | `0.75rem` / `0.875rem`| `p-3`, `px-3.5`, `gap-3.5`| Card internal gap, conversation row horizontal pad |
| `--space-md` | `16px` / `20px` | `1.0rem` / `1.25rem` | `p-4`, `px-5 py-4`, `gap-4`| Document card padding, sidebar item pad |
| `--space-lg` | `24px` / `28px` | `1.5rem` / `1.75rem` | `p-6`, `py-7`, `gap-7` | Hero column gap, section header bottom margin |
| `--space-xl` | `32px` / `36px` | `2.0rem` / `2.25rem` | `p-8`, `gap-8`, `space-y-8`| Hero bottom separation, modal content padding |
| `--space-2xl`| `48px` | `3.0rem` | `space-y-12`, `py-12` | Major dashboard vertical section gaps |

---

## 2. Corner Radii Scale

Curvature is intentionally generous to soften technical information and maintain an approachable, tactile aesthetic.

| Token | Class | Radius | Applied Elements |
|---|---|---|---|
| **Radius Small** | `rounded-lg` | `8px` | Badges, small action buttons, sub-menus, icon buttons (`MoreVertical`), tags |
| **Radius Medium** | `rounded-xl` | `12px` | Collapsed sidebar items, hero micro-feature icon boxes, dropdown menus, modals |
| **Radius Large** | `rounded-2xl` | `16px` | Expanded nav items, conversation list rows, search pill, active nav sliding pill |
| **Radius Card** | `rounded-[22px]` | `22px` | **Signature Document Cards**, Upgrade to Pro sidebar card |
| **Radius Dropzone**| `rounded-[34px]` | `34px` | Hero upload card container / dropzone glow rim |
| **Radius Pill** | `rounded-full` | `9999px` | User avatars, status pills, circular action arrows, tags, slider indicators |

---

## 3. Surface Depth, Shadows & Specular Highlights

Elevation in Docsy is achieved through subtle luminance steps and diffuse specular lighting rather than harsh black drop-shadows.

### 3.1 Shadow Scale
- **Default Card Shadow:** `shadow-lg shadow-black/30` (`0 10px 15px -3px rgba(0, 0, 0, 0.3)`)
- **Micro Button Shadow:** `shadow-xs shadow-black/40` (`0 1px 2px 0 rgba(0, 0, 0, 0.4)`)
- **Dialog Float Shadow:** `shadow-2xl shadow-black/60`
- **Pro Lightning Icon Shadow:** `drop-shadow-[0_0_10px_rgba(165,180,252,0.65)]`

### 3.2 Dynamic Pointer Specular Rim Highlight
Interactive cards feature an organic specular rim highlight driven by mouse coordinates:
```css
/* Outer bloom */
box-shadow: var(--outer-glow-x, 0px) 0 5px 0px rgba(99, 102, 241, 0.32);

/* Inner specular rim highlight */
inset var(--inset-glow-x, 0px) var(--inset-glow-y, 0px) 1.5px rgba(165, 180, 252, 0.2);
```

### 3.3 Active Navigation Sliding Pill
```css
.active-nav-pill {
  border: 1px solid transparent;
  background:
    radial-gradient(circle at var(--glow-x, 22px) var(--glow-y, 50%), rgba(99, 102, 241, 0.1) 0%, transparent 68%) padding-box,
    linear-gradient(90deg, #111528 0%, #0c0f1c 55%, #080911 100%) padding-box;
  background-origin: padding-box, padding-box, border-box;
  background-clip: padding-box, padding-box, border-box;
  box-shadow:
    var(--outer-glow-x-sm, -8px) 0 10px -5px rgba(129, 140, 248, 0.28),
    inset var(--inset-glow-x, 1.5px) var(--inset-glow-y, 0px) 2px rgba(165, 180, 252, 0.25),
    inset var(--inset-glow-x-soft, 8px) var(--inset-glow-y-soft, 0px) 16px -4px rgba(99, 102, 241, 0.16);
}
```
