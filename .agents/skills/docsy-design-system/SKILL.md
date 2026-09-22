---
name: docsy-design-system
description: "Authoritative design system for Docsy AI. Use for styling, token lookup, layout rules, motion, and UI components."
---

# Docsy Design System

Authoritative design system specifications for Docsy surfaces.

## Operating Constraints (STRICT)

1. **Zero Unrelated File Inspection:** Do NOT inspect or grep other components, layouts, or pages in the repository unless explicitly asked by the user.
2. **Self-Contained Truth:** The tokens, Tailwind classes, and parameters in this skill are pre-configured. Do NOT inspect `globals.css`, `tailwind.config`, or directory trees to verify them.
3. **Load Exactly One Reference File:** Identify the task and load ONLY the single matching reference file below. Do not load secondary files unless the single file is insufficient.
4. **No Speculative Exploration:** Work strictly on the file(s) specified in the user request.

## Core Rules (Applied Everywhere)

- **Obsidian Hierarchy:** Deep cosmic darks (`#08090d` canvas, `#07080c` sidebar, `#0c1017` cards).
- **Depth via Light:** Hairline specular highlights (`border-white/[0.08]`) and diffuse glows; no heavy opaque borders.
- **Tactile Press Feedback:** Every interactive button and row must use `active:scale-[0.98]` over `120ms var(--ease-out)`.
- **Motion:** Fast actions (search, nav clicks) are 0ms instant; spatial movement uses spring physics or `var(--ease-out)`.
- **Atmospheric AI:** Subtle, organic celestial glows; never harsh neon or cyberpunk grids.

## Selective Reference Map

Load **only the single file** that directly matches your current task:

| Task / Feature Area | Load Single File |
|---|---|
| **Component styling / Anatomy / States** | `components.md` |
| **CSS variables / Tailwind tokens / Colors** | `tokens.md` |
| **Color palette & Dark/Light roles** | `colors.md` |
| **Shell dimensions / Containers / Grids** | `layout.md` |
| **Typography scale / Font rules** | `typography.md` |
| **Spacing baseline / Radii scale / Shadows** | `spacing.md` |
| **Spring parameters / Animation timing** | `motion.md` |
| **Glows / Nebulas / Shaders / Blurs** | `effects.md` |
| **Breakpoints / Mobile adaptation** | `responsive.md` |
| **Keyboard / ARIA / Contrast / A11y** | `accessibility.md` |
| **Explicit Design Review / QA only** | `anti-patterns.md` |

## Execution Workflow

1. Read the user prompt and identify the single target file to modify.
2. Load **one** relevant reference file from the map above.
3. Apply the tokens and styling rules directly to the target file.
4. Stop. Do not explore other repository files.
