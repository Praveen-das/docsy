# Anti-Patterns & Visual Pitfalls

Authoritative guide to common mistakes, disallowed visual cliches, and implementation anti-patterns in Docsy.

---

## 1. Visual & Aesthetic Anti-Patterns

### ❌ Cyberpunk & Web3 Clichés
- **Do not** add green/cyan Matrix text cascades, scanline overlays, or techno-glitch animations.
- **Do not** use glowing neon borders on every box or card.
- **Do not** use futuristic angular polygon shapes or monospace body text.
- **Why:** Docsy is an executive, high-end document intelligence tool — not a crypto casino or gaming platform.

### ❌ Heavy Opaque Dividers
- **Do not** use 2px solid gray borders (`border-2 border-gray-700`) to separate sections.
- **Why:** Docsy achieves depth through luminance contrast, diffuse ambient light, and hairline specular highlights (`border-white/[0.08]`).

### ❌ Flat Generic Grays
- **Do not** use Tailwind default slate/gray/zinc bases (`bg-gray-900`, `bg-zinc-800`) for the root canvas or main surfaces.
- **Why:** Docsy relies on deep obsidian slates with subtle indigo undertones (`#08090d`, `#07080c`, `#0c1017`). Generic grays look washed out and lifeless.

### ❌ Hard Glow Falloffs
- **Do not** create radial gradients that end abruptly (e.g. `radial-gradient(circle, blue 0%, blue 100%)`).
- **Why:** Ambient lighting must always smoothly feather out to `transparent` over multiple optical stops.

---

## 2. Component & Placement Anti-Patterns

### ❌ 3D WebGL Orbs Outside the Hero Dropzone
- **Do not** place 3D Three.js canvas orbs inside document library tables, settings headers, or chat bubbles.
- **Why:** The 3D liquid gradient orb is a signature hero dropzone anchor. Overuse degrades GPU battery life and dilutes the visual delight.

### ❌ Handwritten Caveat Annotations in Data Views
- **Do not** use Caveat font for document metadata, column headers, or error alerts.
- **Why:** The Caveat font is strictly an editorial onboarding invitation (`"Upload / Ask / Discover"`). Using it in data interfaces hurts readability.

### ❌ Rainbow Gradient Text on Standard Headings
- **Do not** apply the multi-color hero gradient (`f472b6 → c084fc → 818cf8 → 38bdf8`) to standard section titles like "My Documents" or "Settings".
- **Why:** Gradient text is reserved exclusively for the keyword `documents.` in the hero H1 display greeting.

### ❌ Sharp Razor Edge Glows under Form Inputs or Rows
- **Do not** place the 1px `.sharp-edge-glow` under form fields or chat message rows.
- **Why:** The razor glow marks the bottom horizon of the dashboard hero fold.

---

## 3. Motion & Interaction Anti-Patterns

### ❌ Animating High-Frequency Actions
- **Do not** animate `Cmd+K` command palette opening, route switching, or sidebar nav clicks with slow fades or slides.
- **Why:** Actions performed hundreds of times per day must respond with **0ms instant latency**. Animation makes tools feel sluggish.

### ❌ Using Generic CSS Transitions
```css
/* ❌ WRONG: Sluggish, uncalibrated, animates expensive layout properties */
transition: all 300ms ease;

/* ✅ CORRECT: Specific, punchy, GPU-accelerated */
transition: transform 120ms var(--ease-out), border-color 200ms ease;
```

### ❌ Missing `:active` Press Feedback
- **Do not** create clickable buttons or cards that lack `:active { transform: scale(0.98); }`.
- **Why:** Without physical depression feedback, interfaces feel unresponsive and disconnected.

### ❌ Uncached Forced Reflows on Mousemove
```javascript
// ❌ WRONG: Calling getBoundingClientRect on every mousemove tick causes layout thrashing
function onMouseMove(e) {
  const rect = e.target.getBoundingClientRect(); // FORCED REFLOW 60x/sec!
}

// ✅ CORRECT: Cache geometry once on mouseenter, update in requestAnimationFrame
function onMouseEnter(e) {
  cachedRect = e.target.getBoundingClientRect();
}
```

---

## 4. Accessibility Anti-Patterns

- **Do not** hide focus outlines without providing an offset focus ring (`focus:outline-none` alone is forbidden).
- **Do not** build icon-only buttons without an explicit `aria-label`.
- **Do not** create custom interactive elements without keyboard `Enter` and `Space` handlers.
- **Do not** ignore `prefers-reduced-motion` media queries.
