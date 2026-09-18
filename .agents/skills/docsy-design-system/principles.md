# Core Design Principles

Authoritative foundational principles governing all visual and interaction design in Docsy.

---

## 1. Depth Through Light, Not Heavy Borders
- Never divide sections with thick, opaque, or high-contrast borders.
- Surfaces emerge naturally via diffuse ambient lighting, multi-stage backdrop blurs, and hairline specular rim highlights (`rgba(255, 255, 255, 0.06)` to `0.08`).
- Elevation is communicated through subtle luminance steps and soft ambient drop shadows (`shadow-lg shadow-black/30`), not harsh drops.

## 2. Physical & Velocity-Aware (Apple Spring Physics)
- Avoid mechanical linear transitions or stock CSS eases.
- Elements that move on screen (sliding navigation pills, modals, drawers, dropzone scalers) must be driven by velocity-aware spring physics via `@react-spring/web` or calibrated cubic-beziers (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`).
- Every animation must be interruptible mid-motion without visual snapping or state lock-out.

## 3. Invisible Details Compound (Emil Kowalski Philosophy)
- True UI polish is felt intuitively rather than consciously analyzed.
- Buttons must respond instantly on pointer-down (`:active { transform: scale(0.98); }`).
- Geometry caching must prevent layout reflows during pointer tracking.
- Segmented control hairline dividers adjacent to the active selection must seamlessly dissolve to `opacity: 0`.

## 4. Atmospheric AI, Not Cyberpunk Gimmicks
- AI intelligence is depicted as organic, ambient, and celestial (diffuse simplex noise orbs, soft cosmic nebulas, chromatic flows).
- Never use harsh neon grids, glitch shaders, matrix text cascades, or saturated cyber-wireframes.
- The interface must feel like precision, high-end scientific laboratory equipment.

## 5. Content-Forward Density
- User documents, extracted knowledge, dialogue messages, and citation sources command primary visual prominence.
- Chrome (headers, sidebars, toolbars) remains borderless, translucent, and unobtrusive.
- Metadata is compact, legible, and balanced (`12.5px – 13px` muted tones).

## 6. Tactile Skeuomorphic Micro-Anchors
- In an overly flat digital space, tactile anchors give immediate spatial recognition.
- Use authentic skeuomorphic cues (such as the 3D folded-flap Red PDF badge with realistic gloss and under-fold shadow) to anchor digital assets.
- Glowing hardware-like icon accents ground technical actions in physical familiarity.

## 7. Dual-Mode Cohesion
- Obsidian dark mode is the flagship aesthetic, but light mode maintains identical hierarchy, proportional typography, and contrast fidelity.
- Light mode translates cosmic darkness into warm paper grays (`#f7f7f8`), pure white cards (`#ffffff`), and crisp dividers (`#e4e4e7`).
