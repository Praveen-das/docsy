# Docsy Design System & Design Guidelines
**Version:** 1.0.0  
**Target Application:** Docsy AI (PDF Assistant & Citation-Backed Document Intelligence)  
**Reference Surface:** `/dashboard`, Layout Architecture, and Shared UI Primitives  
**Status:** Canonical Design System Reference  

---

## Table of Contents
1. [Visual Direction & Personality](#1-visual-direction--personality)
2. [A. Design Principles](#2-a-design-principles)
3. [B. Color System](#3-b-color-system)
4. [C. Typography Hierarchy](#4-c-typography-hierarchy)
5. [D. Spacing Scale, Radii & Surface Depth](#5-d-spacing-scale-radii--surface-depth)
6. [E. Layout System & Grid Architecture](#6-e-layout-system--grid-architecture)
7. [F. Component Guidelines](#7-f-component-guidelines)
   - [7.1 Buttons](#71-buttons)
   - [7.2 Search Pill & Text Inputs](#72-search-pill--text-inputs)
   - [7.3 Dropdowns & Context Menus](#73-dropdowns--context-menus)
   - [7.4 Segmented Tabs & Line Navigation](#74-segmented-tabs--line-navigation)
   - [7.5 Sidebar & Hardware-Accelerated Sliding Nav Pill](#75-sidebar--hardware-accelerated-sliding-nav-pill)
   - [7.6 Document Cards & Photorealistic 3D Red PDF Badge](#76-document-cards--photorealistic-3d-red-pdf-badge)
   - [7.7 Conversation Rows](#77-conversation-rows)
   - [7.8 Modals & Dialog System](#78-modals--dialog-system)
   - [7.9 Badges & Status Indicators](#79-badges--status-indicators)
   - [7.10 Upload Dropzone & Gradient Orb Canvas](#710-upload-dropzone--gradient-orb-canvas)
   - [7.11 Empty States](#711-empty-states)
8. [G. AI Visual Language & Atmospheric Lighting](#8-g-ai-visual-language--atmospheric-lighting)
9. [H. Motion, Spring Physics & Micro-Interactions](#9-h-motion-spring-physics--micro-interactions)
10. [I. Responsive Design Strategy](#10-i-responsive-design-strategy)
11. [J. Accessibility & Ergonomics](#11-j-accessibility--ergonomics)
12. [K. Reusable Design Tokens (CSS Variables)](#12-k-reusable-design-tokens-css-variables)
13. [L. Core Design Rules vs. Dashboard-Specific Patterns](#13-l-core-design-rules-vs-dashboard-specific-patterns)

---

## 1. Visual Direction & Personality

Docsy embodies an **"Obsidian Ethereal"** aesthetic — a fusion of Apple-grade spatial elegance, Emil Kowalski interaction craftsmanship, and subtle, deep atmospheric AI illumination.

### Core Visual Attributes
- **Obsidian Dark Foundation:** Deep cosmic blacks and obsidian slates (`#07080c`, `#08090d`, `#0c1017`) replace flat generic grays. Interfaces feel grounded, infinite, and cinematic.
- **Atmospheric Ethereal Glows:** AI is represented not by jarring neon wires or cyberpunk cliches, but by organic, diffused cosmic nebulas, 3D simplex noise gradients, and optical lens scrims.
- **Physical Materiality:** Clean frosted glass surfaces, 8-layer progressive backdrop blur gradients, inner rim specular highlights (`1.5px rgba(165, 180, 252, 0.2)`), and skeuomorphic tactile cues (such as the photorealistic folded-paper 3D PDF badge).
- **Physical Spring Motion:** Direct manipulation feeling where motion originates from velocity, settles with custom Apple-calibrated damping ratios, and remains interruptible at all times.
- **Extreme Craft Polish:** Unseen micro-details (e.g., `-0.01em` letter spacing, `transform: scale(0.98)` active button taps, 60fps `requestAnimationFrame` pointer spotlight calculations).

---

## 2. A. Design Principles

### 1. Depth Through Light, Not Heavy Borders
Instead of dividing sections with heavy opaque lines or loud strokes, surfaces emerge naturally through **diffuse ambient lighting, progressive blurs, and hairline specular rim highlights** (`rgba(255, 255, 255, 0.06)` to `0.08`).

### 2. Physical & Velocity-Aware (Apple Spring Physics)
No jarring linear animations or stale CSS default curves. Every animated interactive element (nav pills, dropzones, dialogs) utilizes interruptible spring physics (`react-spring`) or punchy custom cubic-beziers (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`). Motion responds to user intent immediately.

### 3. Invisible Details Compound (Emil Kowalski Philosophy)
True UI luxury is felt before it is noticed. Instant feedback on `:active` press (`scale(0.98)`), single-frame geometry caching to eliminate browser reflows, and hairline segment separators that seamlessly dissolve when adjacent to active tabs.

### 4. Atmospheric AI, Not Web3 Cyberpunk
AI capabilities are conveyed through sophisticated organic light (multi-harmonic simplex liquid orbs, indigo/violet chromatic flow) rather than glowing neon grids, techno fonts, or harsh saturated lasers. It feels like high-end scientific equipment.

### 5. Content-Forward Density
Documents and conversations are prioritized. UI controls reside in borderless, transparent obsidian headers and slim sidebars so that user documents, text previews, and citation sources command maximum visual focus.

### 6. Tactile Skeuomorphic Micro-Accents
In an overly flat digital world, subtle skeuomorphic anchors — such as the glossy, folded-flap Red PDF badge and glowing hardware-like lightning bolts — provide immediate spatial recognition and delight.

### 7. Dual-Mode Cohesion
While dark mode is the flagship obsidian experience, light mode preserves identical information hierarchy, proportional typography, and contrast fidelity with subtle warm paper grays (`#f7f7f8`) and crisp borders (`#e4e4e7`).

---

## 3. B. Color System

Docsy uses an intentional palette built around deep cosmic darks, electric indigo intelligence tones, violet accents, and functional semantic status hues.

### 3.1 Background & Surface Hierarchy (Dark Mode — Flagship)
| Token | Hex / Value | Role / Usage |
|---|---|---|
| `App Background` | `#08090d` | Root application canvas; deep cosmic slate-black |
| `Sidebar Background` | `#07080c` | Persistent sidebar surface; deeper obsidian ground |
| `Card Base Surface` | `#0c1017` / `var(--surface-card)` | Primary container surface for document cards, hero micro-features, upgrade card |
| `Card Hover Surface` | `#10141f` to `#111622` | Slightly elevated indigo-infused obsidian on cursor hover |
| `Active Row / Pill Base` | `#0b0d14` / `#111528` | Background of active navigation pill or table row |
| `Dialog / Modal Surface` | `#121216` to `#12141e` | Floating dialog elevated surface with 90% opacity & backdrop-blur |
| `Search Bar Surface` | `#0c1017` at 90% | Floating header search pill surface |

### 3.2 Background & Surface Hierarchy (Light Mode)
| Token | Hex / Value | Role / Usage |
|---|---|---|
| `App Background` | `#f7f7f8` | Soft neutral paper canvas |
| `Card Base Surface` | `#ffffff` | Pure crisp white elevated surface |
| `Secondary Surface` | `#f4f4f6` | Segmented controls, badge backgrounds, hover tiles |
| `Border Default` | `#e4e4e7` | Hairline divider border |

### 3.3 Text & Foreground Hierarchy
| Level | Dark Mode Value | Light Mode Value | Description & Intent |
|---|---|---|---|
| **Primary Text** | `#ffffff` / `#f4f4f5` / `#f1f5f9` | `#09090b` / `#18181b` | Main headings, active titles, high-emphasis text |
| **Secondary Text** | `#cbd5e1` / `#94a3b8` / `slate-400` | `#52525b` / `#71717a` | Body descriptions, hero subtitle, card secondary text |
| **Muted Text** | `#818ea8` / `#8b95a8` | `#a1a1aa` | Page counts, file sizes, nav icons, search placeholder |
| **Tertiary / Sub-muted** | `#6b7794` / `#525f7a` / `zinc-500` | `#d4d4d8` | Relative timestamps ("2 hours ago"), divider dots (`•`) |

### 3.4 Brand, Neon & AI Accents
| Token | Hex / Gradient | Description & Application |
|---|---|---|
| `Indigo Primary` | `#6366f1` | Primary interactive brand color; active glow spotlights |
| `Indigo Light` | `#818cf8` | Eyebrow badges, uppercase sub-headers, arrow indicators |
| `Indigo Muted` | `#a5b4fc` | Subtle highlights, handwritten Caveat annotation |
| `Electric Purple` | `#a855f7` | Ambient secondary nebula, Docsy icon ribbon gradient stop |
| `Deep Violet` | `#9333ea` | Lower-right ambient blur aura |
| `Sky Cyan` | `#38bdf8` | Terminal stop in gradient text; icon ribbon highlight |
| `Hero Text Gradient` | `linear-gradient(90deg, #f472b6 0%, #c084fc 32%, #818cf8 65%, #38bdf8 100%)` | Applied strictly to the keyword `documents.` in the hero heading |
| `Logo Mark Gradient` | `linear-gradient(#d8b4fe 0%, #a855f7 35%, #6366f1 70%, #38bdf8 100%)` | Iconic "D" Ribbon vector mark |

### 3.5 Functional & Semantic System
| State | Dark Value | Light Value | Border / Pill Usage |
|---|---|---|---|
| **Success (Ready)** | `#34d399` (`emerald-400`) | `#059669` (`emerald-600`) | Document processing complete; `bg-emerald-500/10` |
| **Warning (Analyzing)**| `#fbbf24` (`amber-400`) | `#d97706` (`amber-600`) | Extraction, Chunking, Embedding; `bg-amber-500/10` |
| **Destructive / Error**| `#f87171` (`rose-400`) | `#e11d48` (`rose-600`) | Upload failure, Delete confirmation; `bg-rose-500/10` |
| **PDF Skeuomorphic Red**| `#ff455b` → `#f5223c` → `#d91428` | Multi-stop linear gradient for the 3D Red PDF Badge |

---

## 4. C. Typography Hierarchy

Docsy uses **Inter** as its primary sans-serif workhorse, supplemented by **Caveat** for human/editorial annotations, and system monospace for numerical metrics.

### 4.1 Font Families
- **Primary Interface:** `Inter`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Font features enabled: `font-feature-settings: "cv02", "cv03", "cv04", "cv11";`
  - Smoothing: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`
- **Handwritten Accent:** `Caveat`, `cursive`, `sans-serif` (`--font-handwriting`)
- **Technical Numbers:** Standard monospace (`font-mono`) for badge counts and byte sizes.

### 4.2 Type Scale Specification

| Role | Font Size | Line Height | Weight | Letter Spacing | Case | Target Usage |
|---|---|---|---|---|---|---|
| **Eyebrow / Kicker** | `12px` / `13px` | `1.0` | 700 (Bold) | `+0.22em` | Uppercase | `"YOUR KNOWLEDGE. AMPLIFIED."` |
| **Hero Display H1** | `46px` / `52px` | `1.08` | 800 (Extrabold) | `-0.03em` | Sentence | `"Chat with your documents."` |
| **Page Header H2** | `22px` / `24px` | `1.2` | 700 (Bold) | `-0.02em` | Sentence | Dashboard / Document main titles |
| **Section Title** | `15px` / `16px` | `1.25` | 600 (Semibold) | `-0.015em` | Sentence | `"Recent Documents"`, `"Recent Conversations"` |
| **Card Title (Primary)** | `14px` | `1.25` | 500 (Medium) | `-0.01em` | Sentence | Document original filename |
| **Body / Lead** | `15px` / `16px` | `1.6` | 400 (Regular) | `0` | Sentence | Hero descriptive paragraph |
| **Card Meta / Subtitle**| `13px` | `1.3` | 400 (Regular) | `-0.01em` | Sentence | `"24 pages • 3.2 MB"` |
| **Tertiary Meta** | `12.5px` | `1.3` | 400 (Regular) | `-0.005em` | Sentence | Relative time text ("2 hours ago") |
| **Sidebar Nav Label** | `13.5px` | `1.0` | 500 (Medium) | `0` | Title | `"Home"`, `"Documents"`, `"Conversations"` |
| **Search Placeholder** | `13.5px` | `1.0` | 400 (Regular) | `0` | Sentence | `"Search documents, conversations..."` |
| **Handwritten Note** | `16px` / `18px` | `1.15` | 400 (Regular) | `0` | Title | `"Upload / Ask / Discover"` |
| **Micro Badge / Pill** | `10px` / `11px` | `1.0` | 600 (Semibold) | `+0.02em` | Title/Mono | Badges, status pills, keyboard shortcuts |

---

## 5. D. Spacing Scale, Radii & Surface Depth

### 5.1 Spacing Scale
Docsy strictly relies on an 8pt-based rhythm, with 4px half-steps for micro-alignments:

| Token | Pixels | Rem | Canonical Purpose |
|---|---|---|---|
| `--space-2xs` | `2px` / `4px` | `0.125rem` / `0.25rem` | Hairline offsets, tab separators, inner badge margins |
| `--space-xs` | `6px` / `8px` | `0.375rem` / `0.5rem` | Button gap, icon margins, search tag padding |
| `--space-sm` | `12px` / `14px` | `0.75rem` / `0.875rem` | Card internal gap, conversation row horizontal pad |
| `--space-md` | `16px` / `20px` | `1.0rem` / `1.25rem` | Document card padding (`p-5 py-4`), sidebar item pad |
| `--space-lg` | `24px` / `28px` | `1.5rem` / `1.75rem` | Hero column gap, section header bottom margin |
| `--space-xl` | `32px` / `36px` | `2.0rem` / `2.25rem` | Hero bottom separation, modal content padding |
| `--space-2xl`| `48px` | `3.0rem` | Major dashboard vertical section gaps (`space-y-12`) |

### 5.2 Corner Radii Scale
Curvature is calibrated to create friendly, modern enclosures that soften technical data:

| Token | Class | Radius | Applied Elements |
|---|---|---|---|
| `Radius Small` | `rounded-lg` | `8px` | Badges, small buttons, sub-menus, icon buttons (`MoreVertical`) |
| `Radius Medium` | `rounded-xl` | `12px` | Collapsed sidebar items, hero micro-feature icons, modals |
| `Radius Large` | `rounded-2xl` | `16px` | Expanded nav items, conversation rows, search pill, active nav pill |
| `Radius Card` | `rounded-[22px]` | `22px` | **Signature Document Cards**, Upgrade Pro sidebar card |
| `Radius Dropzone` | `rounded-[34px]` | `34px` | Hero upload card container / dropzone glow rim |
| `Radius Pill` | `rounded-full` | `9999px` | Avatars, status pills, circular action arrows, tags |

### 5.3 Surface Depth, Shadows & Specular Highlights

1. **Card Idle Shadow:** `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);` (`shadow-lg shadow-black/30`)
2. **Interactive Outer Bloom:** `box-shadow: var(--outer-glow-x, 0px) 0 5px 0px rgba(99, 102, 241, 0.32);`
3. **Specular Inner Rim Highlight:**
   ```css
   inset var(--inset-glow-x, 0px) var(--inset-glow-y, 0px) 1.5px rgba(165, 180, 252, 0.2)
   ```
4. **Active Nav Pill Glow:**
   ```css
   box-shadow:
     var(--outer-glow-x-sm, -8px) 0 10px -5px rgba(129, 140, 248, 0.28),
     inset var(--inset-glow-x, 1.5px) var(--inset-glow-y, 0px) 2px rgba(165, 180, 252, 0.25),
     inset var(--inset-glow-x-soft, 8px) var(--inset-glow-y-soft, 0px) 16px -4px rgba(99, 102, 241, 0.16);
   ```

---

## 6. E. Layout System & Grid Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Docsy App Shell Layout (`AppLayout`)                                                    │
│  ┌───────────────────────┬────────────────────────────────────────────────────────────┐  │
│  │ Sidebar (`w-64`/`w-16`)│  Top Header (`h-20`, sticky, ProgressiveBlur scrim)        │  │
│  │ - Logo Mark + Docsy   │  [MobileMenu]   [  Search Pill (Ctrl+K)  ]   [Sun] [UserAvatar]│  │
│  │ - Sliding Nav Pills   ├────────────────────────────────────────────────────────────┤  │
│  │ - Upgrade Pro Card    │  Main Viewport (`max-w-7xl mx-auto px-4 sm:px-8 py-7`)     │  │
│  │                       │  ┌──────────────────────────────────────────────────────┐  │  │
│  │                       │  │ Hero: 12-Col Grid (7 cols Headline / 5 cols 3D Orb)   │  │  │
│  │                       │  ├──────────────────────────────────────────────────────┤  │  │
│  │                       │  │ Recent Documents: 4-Col Grid (rounded-[22px] cards)   │  │  │
│  │                       │  ├──────────────────────────────────────────────────────┤  │  │
│  │                       │  │ Recent Conversations: 1-Col Stack (interactive rows) │  │  │
│  │                       │  └──────────────────────────────────────────────────────┘  │  │
│  └───────────────────────┴────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Core Layout Dimensions
- **Sidebar Width (Desktop):** `256px` (`w-64`), Collapsed: `64px` (`w-16`). Fixed static flex item with zero right border.
- **Top Header Height:** `80px` (`h-20`), sticky, borderless, overlays content with progressive optical scrim (`ProgressiveBlur`).
- **Main Container Width:** `max-w-7xl` (`1280px`), centered (`mx-auto`).
- **Container Horizontal Padding:** `px-4` (`16px` on mobile), `sm:px-8` (`32px` on tablet/desktop).
- **Major Section Vertical Gap:** `space-y-12` (`48px`).

### 6.2 Grid Behavior
- **Hero Grid:** 12-column grid (`grid-cols-1 lg:grid-cols-12 gap-8 items-center`). Left hero title takes `lg:col-span-7`, right 3D orb dropzone takes `lg:col-span-5`.
- **Recent Documents Grid:**
  - Mobile (`< 640px`): `grid-cols-1 gap-4`
  - Tablet (`640px – 1023px`): `grid-cols-2 gap-4`
  - Desktop (`≥ 1024px`): `grid-cols-4 gap-4`
- **Recent Conversations:** Single column vertical stack (`space-y-3`).

---

## 7. F. Component Guidelines

### 7.1 Buttons
- **Purpose:** Primary, secondary, and destructive triggers.
- **Anatomy:** `[Optional Leading Icon / Loader] + Label + [Optional Trailing Icon]`
- **Variants:**
  1. `accent`: Solid electric indigo (`bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]`). Used for key actions: "Upload", "Analyze Document", "Open Chat".
  2. `gradient`: Neon gradient `from-blue-600 via-indigo-600 to-purple-600` with subtle border `border-white/15`. Used for high-emphasis promotional triggers.
  3. `primary`: Solid slate/obsidian (`dark:bg-white/10 dark:text-white dark:hover:bg-white/15`).
  4. `secondary`: Soft surface fill (`dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/[0.12]`).
  5. `outline`: Hairline border (`dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5`).
  6. `ghost`: Chrome-less tertiary button (`dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.04]`).
  7. `destructive`: Warning red (`dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60`).
- **Active Behavior:** Every button contracts to `scale(0.98)` over `120ms` on `:active` tap.

### 7.2 Search Pill & Text Inputs
- **Purpose:** Global instant document and conversation discovery.
- **Anatomy:** Outer pill container (`h-11 rounded-2xl border border-[#212738]/70 bg-(--surface-card)/90 px-4`), Search Icon (`16px #727f9d`), placeholder text (`text-[13.5px] #687593`), and `Ctrl K` shortcut badge.
- **Interaction:** Global `Cmd+K` / `Ctrl+K` listener opens `SelectDocumentModal`.
- **States:** Hover intensifies border to `#333d59` and lifts background to `#111424`. Focus applies `ring-1 ring-indigo-500/50`.

### 7.3 Dropdowns & Context Menus
- **Purpose:** User account settings (`HeaderUserMenu`) and document item options (`MoreVertical`).
- **Anatomy:** Floating card anchored to trigger, `rounded-xl`, `border border-white/10`, `bg-[#12141e]/90`, `backdrop-blur-md`, `shadow-xl shadow-black/40`.
- **Motion:** Enter transition: `animate-in fade-in zoom-in-95 duration-100`.
- **Keyboard:** Dismisses on `Escape` or outside click.

### 7.4 Segmented Tabs & Line Navigation
- **Purpose:** View-switching (e.g., List vs. Grid) and category filtering.
- **Anatomy (Segmented):** Enclosed rounded container (`h-8 rounded-lg bg-[#121216] border border-white/5 p-0.5`).
- **The Hairline Separator Rule:** Distinct 1px vertical hairline dividers (`bg-white/10 h-3 my-auto mx-0.5`) sit between inactive items. The hairline adjacent to the currently active tab transitions to `opacity: 0` to prevent visual collision.

### 7.5 Sidebar & Hardware-Accelerated Sliding Nav Pill
- **Purpose:** Main application routing across Home, Documents, Conversations, and Settings.
- **Anatomy:**
  1. Top `SidebarHeader` with stylized SVG Docsy "D" icon and brand wordmark.
  2. Central navigation list with an underlying absolute **Spring Pill**.
  3. Bottom `SidebarUpgradeCard` with indigo atmospheric glow and lightning badge.
- **The Sliding Pill Mechanism:**
  - Rather than painting static background rectangles on each nav item, a single hardware-accelerated `SidebarNavPills` element smoothly slides on the GPU:
  ```js
  useSpring({
    x: activeRect.left,
    y: activeRect.top,
    width: activeRect.width,
    height: activeRect.height,
    borderRadius: isCollapsed ? 12 : 16,
    config: { tension: 420, friction: 34, mass: 0.9 }
  })
  ```
  - Eliminates DOM flicker and yields a 60 FPS Apple-grade sliding indicator.

### 7.6 Document Cards & Photorealistic 3D Red PDF Badge
- **Purpose:** Primary document representation in the recent dashboard grid.
- **Dimensions:** Responsive height, `rounded-[22px]`, `px-5 py-4`.
- **Anatomy:**
  - **Left:** 3D Red PDF Badge (`w-[40px] h-[50px]`).
  - **Center:** Document title (`text-[14px] font-medium text-[#f1f5f9]`), Page count and size (`text-[13px] text-[#818ea8]`), Relative timestamp (`text-[12.5px] text-[#6b7794]`).
  - **Right:** More options button (`p-1.5 text-[#818ea8] hover:text-[#e2e8f0]`).
- **Skeuomorphic 3D PDF Badge Details:**
  - Folded top-right corner with realistic drop shadow (`#88000b` at 40% opacity).
  - Bright coral red to deep ruby gradient base (`#ff455b` → `#f5223c` → `#d91428`).
  - Top-left radial specular gloss highlight (`#ffffff` at 55% opacity).
  - Authentic crisp white Adobe Acrobat wishbone curve symbol + bold white `PDF` label.
- **Hover State:** Triggers interactive cursor spotlight (`hover:active-card-glow hover:border-indigo-400/35 hover:bg-[#10141f]`).

### 7.7 Conversation Rows
- **Purpose:** Horizontal list of recent dialogue sessions on the dashboard.
- **Anatomy:** Full-width flex row (`rounded-2xl p-2.5 border border-white/[0.06]`):
  - Indigo icon box (`w-10 h-10 rounded-xl bg-indigo-300/4 text-[#b8c3ee]`) with `MessageSquare`.
  - Conversation title (`text-xs sm:text-sm font-semibold text-white truncate max-w-[220px]`).
  - Document link pill (`bg-indigo-300/4 text-[11px] text-[#8fa2d4] px-2.5 py-1 rounded-lg`).
  - Snippet preview text (`text-xs text-(--sidebar-nav-muted) truncate flex-1`).
  - Timestamp (`text-xs text-zinc-500`) and context menu trigger.
- **Hover State:** Triggers `active-row-glow` following pointer coordinates.

### 7.8 Modals & Dialog System
- **Purpose:** Upload workflow (`UploadModal`) and document selector (`SelectDocumentModal`).
- **Anatomy:**
  - Fixed full-screen backdrop: `bg-black/70 backdrop-blur-xs`.
  - Centered dialog container: `rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-2xl`.
  - Dismiss button: top-right `X` icon with hover surface.
  - Body area with autofocus and trapped tab navigation.

### 7.9 Badges & Status Indicators
- **`Ready`:** `bg-emerald-500/10 text-emerald-400 border border-emerald-500/15` + check icon.
- **`Analyzing` (Extracting/Chunking/Embedding):** `bg-amber-500/10 text-amber-400 border border-amber-500/20` + spinning `Loader2`.
- **`Failed`:** `bg-rose-500/10 text-rose-400 border border-rose-500/15` + `AlertCircle`.
- **`Citation Target`:** High-contrast amber badge with pulsing animation (`citationPulseDark`).

### 7.10 Upload Dropzone & Gradient Orb Canvas
- **Purpose:** Hero dropzone for zero-friction file ingestion.
- **Anatomy:**
  - 3D WebGL Canvas (`GradientOrb`) with react-spring hover scale (`1.0` → `1.15`).
  - Floating glowing upload cloud icon (`text-[#b7a6fd] drop-shadow-[0_0_20px_rgba(167,139,250,0.55)]`).
  - Text prompts: `"Drop your PDF here"` and `"or click to upload"`.
  - Handwritten annotation note with curved pointing arrow (`"Upload / Ask / Discover"` in Caveat font).
- **Drag Behavior:** When dragging files over, the orb expands and surface jiggle activates dynamically.

### 7.11 Empty States
- **Purpose:** Displayed when searches or queries return zero results.
- **Anatomy:** Enclosed dashed border box (`rounded-xl border border-dashed border-white/5 bg-[#121216] p-12 text-center`):
  - Muted icon (`h-8 w-8 text-zinc-500 mb-2`).
  - Title (`text-sm font-semibold text-zinc-200`).
  - Helpful descriptive subtext (`text-xs text-zinc-400 mt-1`).
  - Primary action button to upload or reset filters.

---

## 8. G. AI Visual Language & Atmospheric Lighting

Docsy distinguishes itself by treating AI as an **ambient, organic cosmic intelligence**.

### 8.1 The Atmospheric Lighting Stack
1. **Upper Ambient Nebulas:** Soft, massive radial gradients positioned in background corners:
   ```css
   .glow-ambient-blue {
     background: radial-gradient(
       circle at 65% 35%,
       rgba(59, 130, 246, 0.24) 0%,
       rgba(99, 102, 241, 0.14) 28%,
       transparent 80%
     );
   }
   ```
2. **Hero Bottom Atmospheric Glow:** Gentle upward gradient covering the bottom third of the hero:
   ```css
   .hero-bottom-glow {
     background: radial-gradient(
       ellipse 55% 100% at 50% 100%,
       rgba(165, 180, 252, 0.16) 0%,
       rgba(165, 180, 252, 0.08) 35%,
       transparent 100%
     );
   }
   ```
3. **Razor Edge Glow:** A 1px horizontal line with a brilliant white specular core fading horizontally:
   ```css
   .sharp-edge-glow {
     background: linear-gradient(
       90deg,
       transparent 0%,
       rgba(165, 180, 252, 0.45) 35%,
       rgba(255, 255, 255, 0.9) 50%,
       rgba(165, 180, 252, 0.45) 65%,
       transparent 100%
     );
   }
   ```
4. **Interactive Mouse Spotlight:**
   A dynamic radial spotlight embedded in card pseudo-elements (`::before`) that follows the exact pointer coordinates `(var(--glow-x), var(--glow-y))` computed via `requestAnimationFrame`.

### 8.2 Three.js / WebGL 3D Gradient Orb
- Rendered via a GPU GLSL shader on a fullscreen triangle in Normalized Device Coordinates (NDC).
- Employs 3D Simplex noise domain warping and YIQ color-space hue rotations.
- Organic liquid wobble undulates continuously; hovering the orb excites high-frequency gelatinous ripples (`uJiggle`) via react-spring velocity tracking without triggering DOM repaints.

### 8.3 Strict Rules: When to Use vs. When NOT to Use
- **DO USE** atmospheric lighting on:
  - Landing / Dashboard hero section dropzones.
  - Interactive card and row hover highlights.
  - Upgrade promotional cards.
  - Citation highlight targets in the PDF reader.
- **DO NOT USE** neon glows or atmospheric lighting on:
  - Form inputs, textareas, or active typing surfaces (causes eye fatigue).
  - Dense document tables or high-frequency list headers.
  - Modals and utility dialogs.
  - Static body text paragraphs.

---

## 9. H. Motion, Spring Physics & Micro-Interactions

Docsy enforces strict motion restraint based on the **Animation Frequency Framework**:

| Frequency | UI Element | Allowed Animation |
|---|---|---|
| **100+ times / day** | `Cmd+K` Search, Route switching, Sidebar item clicks | **0ms instant response.** Zero artificial delay. |
| **Tens of times / day** | Card hover spotlights, Nav sliding pill | High-performance spring or 200ms ease-out. |
| **Occasional** | Upload Modal dialog, User dropdown | Fast 100–150ms fade + scale (`zoom-in-95`). |
| **Delight / Key Entry** | Hero 3D Gradient Orb | Continuous GPU fluid wobble; react-spring scale. |

### 9.1 Apple Spring Calibration Values
Docsy uses calibrated spring parameters:
```typescript
// Sidebar Navigation Sliding Pill (Fast, crisp settle, ~220ms, no oscillation)
const navSpringConfig = {
  tension: 420,
  friction: 34,
  mass: 0.9,
  precision: 0.005,
};

// Hero Dropzone Blob Expansion (Gentle organic jiggle)
const heroBlobConfig = {
  tension: 50,
  friction: 10,
  precision: 0.001,
};
```

### 9.2 Emil Kowalski Custom CSS Easings
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* Interactive entries, taps */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* Physical repositioning */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Controlled overshoot */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* Mobile sheet transitions */
```

### 9.3 Micro-Interaction: Responsive Press Feedback
Every interactive button or clickable row in Docsy provides immediate physical confirmation on pointer-down:
```css
button:not(:disabled):active,
[role="button"]:not([aria-disabled="true"]):active {
  transform: scale(0.98);
  transition: transform 120ms var(--ease-out);
}
```

### 9.4 60 FPS RequestAnimationFrame Mouse Tracking
Mouse-reactive glows (`lib/interactive-glow.ts`) never trigger layout reflows during mouse movements:
- Measures element geometry `getBoundingClientRect()` strictly once on `mouseenter`.
- Coalesces mousemove coordinates into a single `requestAnimationFrame` tick.
- Updates CSS variables (`--glow-x`, `--glow-y`, `--outer-glow-x`) directly on the DOM style object.

### 9.5 Reduced-Motion Contract (`prefers-reduced-motion`)
When the OS reduced-motion flag is active:
- CSS animations (`animate-spin-glow`, `shimmerWave`, `citationPulse`) are disabled (`animation: none !important`).
- Dynamic spotlight pseudo-elements (`::before`) are set to `display: none`.
- Three.js WebGL orb stops continuous frameloops and switches to static demand-rendering.
- Spring animations snap immediately (`immediate: true`).

---

## 10. I. Responsive Design Strategy

| Breakpoint | Width | Dashboard Layout Behavior |
|---|---|---|
| **Mobile (`< 640px`)** | `< 640px` | - Sidebar collapses into slide-over drawer triggered by header hamburger.<br>- Hero grid switches to single-column stack.<br>- Hero dropzone scales to fit viewport width.<br>- Document cards display as 1 column.<br>- Conversation snippet preview text hides.<br>- Search pill hides `Ctrl K` badge. |
| **Tablet (`640px – 1023px`)** | `640px – 1023px` | - Document cards switch to 2 columns.<br>- Hero shows handwritten arrow annotation.<br>- Linked document badge on conversation rows is displayed.<br>- Top header displays user display name. |
| **Desktop (`≥ 1024px`)** | `≥ 1024px` | - Persistent sidebar visible (256px expanded / 64px collapsed).<br>- Hero 12-column split (7 cols headline, 5 cols dropzone).<br>- Document cards switch to 4 columns.<br>- Full conversation snippet previews render. |

---

## 11. J. Accessibility & Ergonomics

Docsy adheres to **WCAG 2.1 AA** standards across all views:

### 11.1 Color Contrast Ratios
- **Primary Text on Obsidian (`#ffffff` on `#08090d`):** `18.2:1` (Exceeds AAA).
- **Secondary Text on Obsidian (`#94a3b8` on `#08090d`):** `6.8:1` (Exceeds AA).
- **Interactive Accent on Obsidian (`#818cf8` on `#08090d`):** `5.4:1` (Exceeds AA).

### 11.2 Focus Indicators
- Elements never rely on browser default blue halos.
- Focus states utilize crisp, offset rings:
  ```css
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#08090d]
  ```

### 11.3 Keyboard Traps & Navigation
- **`Cmd+K` / `Ctrl+K`:** Instant global search opening.
- **`Escape`:** Instantly dismisses search, upload modal, user dropdown, or mobile drawer.
- **`Tab` / `Shift+Tab`:** Trapped inside modal dialogs when open; restored to trigger upon close.
- **`Space` / `Enter`:** All clickable cards (`role="button"`) handle keyboard activation.

### 11.4 Touch Targets
- All touch and click targets maintain a minimum dimension of `40px × 40px` (or `44px × 44px` on mobile), with generous padding around icon-only buttons.

---

## 12. K. Reusable Design Tokens (CSS Variables)

Import this canonical token stylesheet into any application page or shared stylesheet:

```css
:root {
  /* Surface Tokens (Light Mode) */
  --color-background: #f7f7f8;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-surface-card: #ffffff;
  --color-surface-hover: #f4f4f6;
  --color-active-row: #f4f4f6;

  /* Text Tokens (Light Mode) */
  --color-text-primary: #09090b;
  --color-text-secondary: #52525b;
  --color-text-muted: #71717a;
  --color-text-submuted: #a1a1aa;

  /* Borders & Dividers */
  --color-border: #e4e4e7;
  --color-border-subtle: #f4f4f6;
  --color-border-focus: #6366f1;

  /* Brand & Accents */
  --color-accent: #0071e3;
  --color-accent-hover: #0077ed;
  --color-accent-glow: rgba(0, 113, 227, 0.25);
  --color-brand-indigo: #6366f1;
  --color-brand-violet: #a855f7;
  --color-brand-cyan: #38bdf8;

  /* Status Colors */
  --color-success: #059669;
  --color-warning: #d97706;
  --color-error: #e11d48;
  --color-pdf-red: #d91428;

  /* Spacing Scale */
  --space-2xs: 0.25rem;    /* 4px */
  --space-xs: 0.5rem;      /* 8px */
  --space-sm: 0.75rem;     /* 12px */
  --space-md: 1rem;        /* 16px */
  --space-lg: 1.5rem;      /* 24px */
  --space-xl: 2rem;        /* 32px */
  --space-2xl: 3rem;       /* 48px */

  /* Radii Scale */
  --radius-sm: 0.5rem;     /* 8px */
  --radius-md: 0.75rem;    /* 12px */
  --radius-lg: 1rem;       /* 16px */
  --radius-card: 1.375rem; /* 22px */
  --radius-dropzone: 2.125rem; /* 34px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-card: 0 10px 15px -3px rgba(0, 0, 0, 0.08);

  /* Motion Easings */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}

.dark {
  /* Surface Tokens (Obsidian Dark Mode) */
  --color-background: #08090d;
  --color-sidebar: #07080c;
  --color-surface: #0c1017;
  --color-surface-elevated: #121216;
  --color-surface-card: #0c1017;
  --color-surface-hover: #10141f;
  --color-active-row: #0b0d14;

  /* Text Tokens (Dark Mode) */
  --color-text-primary: #ffffff;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #818ea8;
  --color-text-submuted: #6b7794;

  /* Borders & Dividers */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.05);
  --color-border-hover: rgba(129, 140, 248, 0.18);
  --color-border-focus: #818cf8;

  /* Brand & Accents */
  --color-accent: #6366f1;
  --color-accent-hover: #818cf8;
  --color-accent-glow: rgba(99, 102, 241, 0.35);

  /* Status Colors */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;

  /* Glows & Shadows */
  --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  --shadow-glow-indigo: 0 0 45px -5px rgba(99, 102, 241, 0.35);
  --shadow-glow-purple: 0 0 45px -5px rgba(168, 85, 247, 0.35);
}
```

---

## 13. L. Core Design Rules vs. Dashboard-Specific Patterns

When building new features or pages across Docsy (e.g., Conversation Workspace, Documents Library, Account Settings), follow this distinction:

### 13.1 Core Design Rules (Apply Everywhere across Docsy)
1. **Always use Obsidian surface hierarchy:** `#08090d` canvas, `#0c1017` card surfaces, and hairlines `rgba(255, 255, 255, 0.06-0.08)`.
2. **Apply `:active` button response:** Every pressable element must scale to `0.98` with `--ease-out` transition.
3. **Use 8-layer/4-step Progressive Backdrop Blur:** Sticky headers and floating toolbars must use optical gradient feathering, never flat opaque cuts.
4. **Use Apple Spring Physics for spatial elements:** Sliding indicators, drawers, and tabs must be driven by springs, not linear transitions.
5. **Hairline divider suppression:** Segmented control dividers adjacent to active tabs must fade to `opacity: 0`.
6. **Photorealistic 3D Red PDF Badge:** When rendering standalone PDF files, use the official `RedPdfBadge` SVG primitive for immediate brand recognition.
7. **Strict Reduced-Motion compliance:** Respect `prefers-reduced-motion` across all components and animations.

### 13.2 Dashboard-Specific Patterns (Do NOT Copy Blindly to Other Pages)
1. **The 3D WebGL Simplex Gradient Orb:** Reserved strictly for the **Hero Dropzone** and major marketing/landing touchpoints. Do not insert 3D canvas orbs into workspace headers, chat sidebars, or table headers.
2. **The Handwritten Caveat Annotation Arrow:** Belongs exclusively to the onboarding/hero upload zone as a playful invitation. Do not place casual handwriting inside data tables or citation dialogs.
3. **The 52px Hero Display Headline with Rainbow Gradient Clip:** Reserved for top-level splash greetings. Page headers elsewhere should use crisp, clean semibold H2s (`20px – 24px font-bold text-white`).
4. **The Bottom Razor Edge Glow (`sharp-edge-glow`):** Belongs under the hero container to terminate the landing fold. Do not place sharp razor glows under normal conversation messages or form inputs.
