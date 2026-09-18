---
name: docsy-design-system
description: "Authoritative design system and UI engineering guidelines for Docsy AI. Use whenever building, styling, reviewing, or refactoring UI components, pages, layouts, motion, themes, or visual effects in the Docsy application."
---

# Docsy Design System

Authoritative design system and UI engineering standards for the Docsy application.

## Purpose

Maintain strict visual, structural, and interaction consistency across all Docsy surfaces. Docsy pairs an **Obsidian Ethereal** dark-first aesthetic with Apple-grade fluid spring motion and Emil Kowalski micro-interaction polish.

## Core Rules

1. **Obsidian Surface Hierarchy:** Ground views in deep cosmic darks (`#08090d` canvas, `#07080c` sidebar, `#0c1017` cards). Never use flat generic grays.
2. **Depth Through Light:** Separate layers using diffuse radial glows, progressive backdrop blurs, and hairline specular rim highlights (`rgba(255, 255, 255, 0.06-0.08)`), not opaque borders.
3. **Responsive Press Feedback:** Every interactive button and row must compress to `transform: scale(0.98)` over `120ms var(--ease-out)` on pointer press (`:active`).
4. **Physical Spring Motion:** Use `@react-spring/web` or calibrated cubic-beziers (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`) for spatial movement. Zero delay on high-frequency actions.
5. **Atmospheric AI, Not Cyberpunk:** AI lighting is organic, diffused, and cosmic (simplex noise orbs, ambient nebulas). Never use harsh neon grids or saturated lasers.
6. **Tactile Micro-Anchors:** Use authentic skeuomorphic anchors (like the 3D folded-flap Red PDF badge) to ground digital assets.
7. **Progressive Feathering:** Sticky headers and overlays must use multi-layer progressive backdrop blur with optical gradient scrims, never hard opaque cuts.
8. **Strict Reduced Motion:** Honor `prefers-reduced-motion` by disabling ambient loops, continuous WebGL frameloops, and snapping spring transitions immediately.

## Task-Oriented Reference Map

Load only the specific reference file(s) required for your current task to conserve context tokens:

| Task / Feature Area | Load Reference Files |
|---|---|
| **General UI task / New page** | `principles.md` + `layout.md` |
| **New UI component / Element** | `components.md` + `tokens.md` |
| **Color selection / Theming** | `colors.md` + `tokens.md` |
| **Typography / Text hierarchy** | `typography.md` |
| **Spacing / Padding / Radii / Sizing** | `spacing.md` + `tokens.md` |
| **Containers / Grids / Page shell** | `layout.md` + `responsive.md` |
| **AI lighting / Nebulas / Shaders / Glow** | `effects.md` |
| **Animation / Transitions / Springs** | `motion.md` |
| **Mobile / Tablet layout adaptation** | `responsive.md` |
| **Accessibility / Contrast / Keyboard** | `accessibility.md` |
| **Design review / Linting / QA** | `anti-patterns.md` + `principles.md` |
| **CSS variables / Tailwind tokens** | `tokens.md` |

## How to Use This Skill

1. Identify the task category from the reference map above.
2. Read the corresponding reference file(s) from this skill directory before writing or reviewing code.
3. Apply the exact classes, tokens, dimensions, and motion parameters specified in the references.
4. Verify your implementation against `anti-patterns.md` to avoid visual regressions.
