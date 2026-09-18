# AI Visual Language & Atmospheric Lighting

Authoritative specifications for ambient nebulas, 3D shader orbs, mouse spotlights, progressive blurs, and glow effects in Docsy.

---

## 1. Atmospheric Ambient Nebulas

Docsy uses massive, soft radial gradients in background corners to create an expansive cosmic depth without visual clutter:

```css
/* Upper-right celestial blue aura */
.glow-ambient-blue {
  background: radial-gradient(
    circle at 65% 35%,
    rgba(59, 130, 246, 0.24) 0%,
    rgba(99, 102, 241, 0.14) 28%,
    rgba(99, 102, 241, 0.06) 50%,
    rgba(99, 102, 241, 0.01) 70%,
    transparent 80%
  );
  transform: translate3d(0, 0, 0);
  contain: strict;
}

/* Lower-left deep purple nebula */
.glow-ambient-purple {
  background: radial-gradient(
    circle at 10% 90%,
    rgba(168, 85, 247, 0.2) 0%,
    rgba(147, 51, 234, 0.12) 30%,
    rgba(99, 102, 241, 0.05) 55%,
    rgba(99, 102, 241, 0.01) 75%,
    transparent 85%
  );
  transform: translate3d(0, 0, 0);
  contain: strict;
}
```

---

## 2. Hero Atmospheric Bottom & Razor Edge Glows

Terminates the landing fold with an upward diffuse aura and a sharp specular horizon:

```css
/* Upward diffuse aura covering bottom third of the container */
.hero-bottom-glow {
  background: radial-gradient(
    ellipse 55% 100% at 50% 100%,
    rgba(165, 180, 252, 0.16) 0%,
    rgba(165, 180, 252, 0.08) 35%,
    rgba(165, 180, 252, 0.03) 65%,
    rgba(165, 180, 252, 0.008) 85%,
    transparent 100%
  );
  transform: translate3d(0, 0, 0);
  contain: strict;
}

/* 1px razor-edge line with brilliant white center */
.sharp-edge-glow {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(165, 180, 252, 0) 10%,
    rgba(165, 180, 252, 0.45) 35%,
    rgba(255, 255, 255, 0.9) 50%,
    rgba(165, 180, 252, 0.45) 65%,
    rgba(165, 180, 252, 0) 90%,
    transparent 100%
  );
  transform: translate3d(0, 0, 0);
}
```

---

## 3. Dynamic Pointer Spotlight Glow

Interactive cards and rows feature a dynamic radial spotlight that follows pointer coordinates via CSS variables:

```css
.active-card-glow::before,
.hover\:active-card-glow:hover::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* Dynamic spotlight following pointer */
  background: radial-gradient(
    280px circle at var(--glow-x, 50%) var(--glow-y, 50%),
    rgba(99, 102, 241, 0.1) 0%,
    rgba(99, 102, 241, 0.05) 50%,
    transparent 100%
  );
  /* Interactive outer bloom & dynamic specular inner rim */
  box-shadow:
    var(--outer-glow-x, 0px) 0 5px 0px rgba(99, 102, 241, 0.32),
    inset var(--inset-glow-x, 0px) var(--inset-glow-y, 0px) 1.5px rgba(165, 180, 252, 0.2);
  opacity: 1;
  transition: opacity 280ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 0;
}
```

---

## 4. 3D WebGL Simplex Gradient Orb (`GradientOrb`)

Rendered via a GPU GLSL shader on a fullscreen triangle in Normalized Device Coordinates (NDC):
- **Domain Warping:** 3D Simplex noise with domain distortion.
- **Organic Liquid Wobble:** Multi-harmonic radial waves create gentle morphing lobes.
- **Physical Spring Scaling:** Expands from `1.0` to `1.15` on hover via react-spring, exciting high-frequency gelatinous ripples (`uJiggle`) via velocity tracking.
- **Breathing Pulse:** Subtle sine-wave pulse runs continuously.
- **YIQ Hue Rotation:** Colors shift smoothly in YIQ color space without muddy middle tones.

---

## 5. Progressive Backdrop Blur (`ProgressiveBlur`)

Prevents harsh cutoffs under sticky headers by layering 4 GPU-friendly blur steps over an optical gradient scrim:

| Stage | Vertical Coverage | Backdrop Blur | Purpose |
|---|---|---|---|
| **Scrim Base** | `0% – 100%` | Scrim `rgba(8, 9, 13, 0.72)` fading to transparent | Base contrast depth |
| **Step 1** | `0% – 25%` | `blur(20px)` | Dense top occlusion |
| **Step 2** | `15% – 50%` | `blur(10px)` | Smooth transition |
| **Step 3** | `35% – 75%` | `blur(4px)` | Soft feathering |
| **Step 4** | `55% – 100%` | `blur(1.5px)` | Seamless base blend into content |

---

## 6. Rules: When to Use vs. When NOT to Use

### Allowed Usage
- **Hero Section:** Ambient bottom glow, razor edge glow, 3D gradient orb dropzone.
- **Interactive Cards & Rows:** Dynamic mouse spotlights on hover.
- **Upgrade Cards:** Subtle background indigo aura and glowing lightning icon.
- **Citation Targets:** Soft pulsing amber highlight in PDF document viewer.

### Strict Prohibitions
- **Never** put glowing borders or nebulas on standard form textareas or inputs (distracts during typing).
- **Never** place 3D WebGL orbs inside dense table lists or chat message threads.
- **Never** use hard circular cutoffs for glows (always feather outer falloff to `transparent`).
- **Never** use saturated green/cyan matrix or cyberpunk neon wires.
