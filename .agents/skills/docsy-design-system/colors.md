# Color System

Authoritative color specifications, surface levels, and accent treatments for Docsy.

---

## 1. Dark Mode Surface Hierarchy (Flagship Obsidian)

Dark mode is the primary experience. Avoid generic 50% grays; use deep obsidian slates with subtle blue/indigo undertones.

| Surface Token | Hex / CSS Value | Semantic Role & Application |
|---|---|---|
| **App Canvas** | `#08090d` | Root application background. Sets the deep cosmic atmosphere. |
| **Sidebar Canvas** | `#07080c` | Persistent sidebar ground; sits slightly deeper than canvas with zero right border. |
| **Card Surface** | `#0c1017` / `var(--surface-card)` | Standard elevated surface for document cards, hero feature tiles, and upgrade cards. |
| **Card Hover Surface** | `#10141f` to `#111622` | Slightly elevated indigo-infused obsidian on cursor hover. |
| **Active Row / Pill** | `#0b0d14` / `#111528` | Background fill of active navigation sliding pill and selected list rows. |
| **Dialog Surface** | `#121216` (at 90% opacity) | Floating modal container with `backdrop-blur-md` and shadow. |
| **Search Pill Surface**| `#0c1017` (at 90% opacity) | Header search pill container with `backdrop-blur-md`. |

---

## 2. Light Mode Surface Hierarchy

| Surface Token | Hex / CSS Value | Semantic Role & Application |
|---|---|---|
| **App Canvas** | `#f7f7f8` | Soft, warm paper ground. |
| **Card Surface** | `#ffffff` | Elevated pure white container surface. |
| **Secondary Surface** | `#f4f4f6` | Segmented controls, badge backgrounds, and hover tiles. |
| **Border Default** | `#e4e4e7` | Hairline card and divider borders. |

---

## 3. Text & Foreground Hierarchy

| Level | Dark Mode | Light Mode | Tailwind Classes | Usage Context |
|---|---|---|---|---|
| **Primary Text** | `#ffffff` / `#f4f4f5` / `#f1f5f9` | `#09090b` / `#18181b` | `text-white`, `dark:text-zinc-100` | Headings, active card titles, high-emphasis text |
| **Secondary Text** | `#cbd5e1` / `#94a3b8` | `#52525b` / `#71717a` | `text-slate-400`, `dark:text-zinc-400` | Subtitles, hero descriptive lead, card secondary text |
| **Muted Text** | `#818ea8` / `#8b95a8` | `#a1a1aa` | `text-[--sidebar-nav-muted]`, `text-[#818ea8]` | Page counts, file sizes, nav icons, search placeholder |
| **Sub-Muted Text** | `#6b7794` / `#525f7a` | `#d4d4d8` | `text-[#6b7794]`, `text-zinc-500` | Relative timestamps ("2 hours ago"), divider dots (`•`) |

---

## 4. Brand, AI & Neon Accents

| Accent Token | Hex / Formula | Purpose & Guidelines |
|---|---|---|
| **Electric Indigo** | `#6366f1` / `#818cf8` / `#a5b4fc` | Primary interactive brand color; active glow spotlights, eyebrow kickers, button fills. |
| **Electric Purple** | `#a855f7` / `#c084fc` | Secondary ambient nebula, Docsy icon ribbon stop. |
| **Sky Cyan** | `#38bdf8` / `#3b82f6` | Chromatic flow highlight, terminal stop in gradient text. |
| **Rose Pink** | `#f472b6` | Leading stop in hero text gradient. |
| **Hero Text Gradient**| `linear-gradient(90deg, #f472b6 0%, #c084fc 32%, #818cf8 65%, #38bdf8 100%)` | Strictly applied to the keyword `documents.` in the H1 headline via `bg-clip-text text-transparent`. |
| **Logo Ribbon Gradient**| `linear-gradient(#d8b4fe 0%, #a855f7 35%, #6366f1 70%, #38bdf8 100%)` | Applied to the iconic Docsy "D" ribbon mark. |

---

## 5. Semantic Status & Functional Colors

| State | Dark Value | Light Value | Container Style | Border Style |
|---|---|---|---|---|
| **Ready (Success)** | `#34d399` (`emerald-400`) | `#059669` (`emerald-600`) | `bg-emerald-500/10` | `border-emerald-500/15` |
| **Analyzing (Warning)** | `#fbbf24` (`amber-400`) | `#d97706` (`amber-600`) | `bg-amber-500/10` | `border-amber-500/20` |
| **Failed (Destructive)**| `#f87171` (`rose-400`) | `#e11d48` (`rose-600`) | `bg-rose-500/10` | `border-rose-500/15` |
| **Citation Target** | `#f59e0b` (`amber-500`) | `#d97706` (`amber-600`) | Pulsing highlight with `border-l-3` | Dynamic glow shadow |

---

## 6. Skeuomorphic & Hardware Colors

- **Photorealistic Red PDF Badge:**
  - Base gradient: `#ff455b` (top-left bright coral) → `#f5223c` (mid) → `#d91428` (deep ruby).
  - Corner fold: `#ffffff` → `#e2e8f0` → `#cbd5e1`.
  - Fold drop shadow: `#88000b` at 40% opacity.
  - Gloss overlay: `#ffffff` radial specular glow at 55% fading to 0%.
- **Pro Lightning Icon:**
  - Fill & stroke: `#c7d2fe` with `drop-shadow-[0_0_10px_rgba(165,180,252,0.65)]`.

---

## 7. Borders & Dividers

- **Default Dark Border:** `rgba(255, 255, 255, 0.08)` (`border-white/[0.08]`)
- **Subtle Row Border:** `rgba(255, 255, 255, 0.06)` (`border-white/[0.06]`)
- **Hover Border Glow:** `rgba(129, 140, 248, 0.35)` (`hover:border-indigo-400/35`)
- **Segment Separator:** `rgba(255, 255, 255, 0.1)` (`bg-white/10`)
- **Default Light Border:** `#e4e4e7`
