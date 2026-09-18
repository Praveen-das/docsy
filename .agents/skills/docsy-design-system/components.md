# Component Guidelines

Authoritative component patterns, anatomy, styling, states, and usage rules for Docsy.

---

## 1. Buttons (`Button`)

- **Purpose:** Primary, secondary, promotional, and destructive interactive triggers.
- **Anatomy:** `[Optional Loader / Icon] + Label + [Optional Trailing Arrow]`
- **Variants:**
  - `accent`: Electric indigo (`bg-indigo-600 hover:bg-indigo-500 text-white shadow-md dark:shadow-[0_0_20px_rgba(99,102,241,0.3)]`). Primary CTA.
  - `gradient`: Tri-color neon gradient (`bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(99,102,241,0.35)] border border-white/15`). Promotional touchpoints.
  - `primary`: Solid slate/obsidian (`dark:bg-white/10 dark:text-white dark:hover:bg-white/15`).
  - `secondary`: Soft surface fill (`dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/[0.12]`).
  - `outline`: Hairline border (`dark:border-white/10 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-white/5`).
  - `ghost`: Transparent chrome-less button (`dark:text-zinc-400 dark:hover:text-zinc-200`).
  - `destructive`: Warning red (`dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60`).
- **Sizes:**
  - `sm`: `h-8 px-3 py-1.5 text-xs rounded-lg gap-1.5`
  - `md`: `h-9 px-4 py-2 text-xs sm:text-sm rounded-xl gap-2`
  - `lg`: `h-10 px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2.5`
  - `icon`: `h-8 w-8 p-0 rounded-lg`
- **Active Behavior:** All buttons compress to `scale(0.98)` over `120ms var(--ease-out)` on press.

---

## 2. Search Pill (`HeaderSearchBar`)

- **Purpose:** Instant global search opening without typing into a tiny header box.
- **Anatomy:**
  - Container: `h-11 w-full max-w-[420px] sm:max-w-[460px] rounded-2xl border border-[#212738]/70 bg-(--surface-card)/90 px-4 backdrop-blur-md`.
  - Icon: `Search` icon (`h-4 w-4 text-[#727f9d] stroke-[1.8]`).
  - Label: `"Search documents, conversations..."` (`text-[13.5px] text-[#687593]`).
  - Shortcut Badge: `Ctrl K` (`px-2.5 py-1 text-[11px] font-sans rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#727f9d]`).
- **Interaction:** Global `Cmd+K` / `Ctrl+K` keydown opens `SelectDocumentModal`. Hover lifts background to `#111424`.

---

## 3. Dropdowns & User Menus (`HeaderUserMenu`)

- **Purpose:** User profile navigation and account controls.
- **Anatomy:**
  - Trigger Pill: Avatar circle (`h-10 w-10 border border-[#374161] bg-[#141829] text-[13px] font-medium text-[#c4cbdd]`), display name (`text-[14px] text-[#e2e8f0]`), and chevron arrow.
  - Dropdown Card: `w-52 rounded-xl border border-white/10 bg-[#12141e]/90 p-1.5 shadow-xl shadow-black/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100`.
- **Keyboard:** Dismisses on `Escape` or outside click.

---

## 4. Segmented Tabs (`Tabs`)

- **Purpose:** View-switching (e.g. List vs Grid) and category filtering.
- **Anatomy:** Outer container (`h-8 rounded-lg bg-[#121216] border border-white/5 p-0.5`).
- **The Hairline Separator Rule:** Distinct 1px vertical hairline dividers (`bg-white/10 h-3 my-auto mx-0.5`) sit between inactive items. The hairline adjacent to the currently active tab transitions to `opacity: 0` to prevent visual collision.

---

## 5. Sidebar Navigation & Sliding Pill (`SidebarNavPills`)

- **Purpose:** Persistent route navigation without layout jumps or flash-of-null.
- **Anatomy:**
  - Background Sliding Pill: Driven by `@react-spring/web` on the GPU (`tension: 420, friction: 34, mass: 0.9, precision: 0.005`).
  - Measures item geometry on mount and container resize, sliding smoothly between items.
  - Nav Item: `h-10 rounded-2xl px-3.5 gap-3 text-[13.5px] font-medium text-[#8b95a8] hover:text-[#d1d5e5]`. Active text: `#f1f3f9`.
  - Upgrade Card: `rounded-[22px] border border-[#1e2336]/60 bg-(--surface-card) p-4.5` with glowing `Zap` icon and circular arrow button.

---

## 6. Document Cards (`RecentDocumentsSection`)

- **Purpose:** Primary grid presentation of uploaded documents.
- **Dimensions:** `rounded-[22px] border border-white/[0.07] bg-(--surface-card) px-5 py-4`.
- **Anatomy:**
  - Left: 3D Red PDF Badge (`40px × 50px`).
  - Middle: Document title (`text-[14px] font-medium text-[#f1f5f9]`), Page count and size (`text-[13px] text-[#818ea8]`), Relative timestamp (`text-[12.5px] text-[#6b7794]`).
  - Right: `MoreVertical` options trigger.
- **Hover Behavior:** Activates dynamic mouse spotlight (`hover:active-card-glow hover:border-indigo-400/35 hover:bg-[#10141f]`).

---

## 7. Photorealistic 3D Red PDF Badge (`RedPdfBadge`)

- **Purpose:** Authentic skeuomorphic anchor for PDF documents.
- **Dimensions:** `40px × 50px`.
- **Anatomy:**
  - Base sheet with folded top-right corner (`L 40 12` path).
  - Main gradient: `#ff455b` (top-left) → `#f5223c` (mid) → `#d91428` (ruby bottom).
  - Gloss overlay: Top-left radial specular glow (`#ffffff` at 55% opacity).
  - Corner fold: Subtle pale silver-white gradient with under-fold drop shadow (`#88000b` at 40%).
  - Acrobat wishbone symbol: Authentic white curve vector.
  - Typography: Clean, bold, crisp `"PDF"` text in system sans-serif (`fontSize="8.5" fontWeight="700"`).

---

## 8. Conversation Rows (`RecentConversationsSection`)

- **Purpose:** High-density horizontal list of past conversations.
- **Anatomy:** Full-width flex row (`rounded-2xl p-2.5 border border-white/[0.06] hover:active-row-glow hover:border-indigo-400/35`):
  - Indigo icon box (`w-10 h-10 rounded-xl bg-indigo-300/4 text-[#b8c3ee]`) with `MessageSquare`.
  - Title: `text-xs sm:text-sm font-semibold text-white truncate max-w-[220px]`.
  - Document link pill: `bg-indigo-300/4 text-[11px] text-[#8fa2d4] px-2.5 py-1 rounded-lg`.
  - Snippet preview: `text-xs text-(--sidebar-nav-muted) truncate flex-1 font-normal`.
  - Timestamp & Context menu trigger.

---

## 9. Modals & Dialogs (`Dialog`)

- **Purpose:** Ingestion workflows and document selectors.
- **Anatomy:**
  - Backdrop: `fixed inset-0 z-50 bg-black/70 backdrop-blur-xs`.
  - Dialog Box: `w-full max-w-lg rounded-2xl border border-white/10 bg-[#121216] p-6 shadow-2xl animate-in fade-in zoom-in-95`.
  - Header with title, description, and top-right `X` button.
  - Trapped tab focus and `Escape` listener.

---

## 10. Badges & Status Indicators (`Badge`, `StatusBadge`)

- **`Ready`:** `bg-emerald-500/10 text-emerald-400 border border-emerald-500/15` + check icon.
- **`Analyzing` (Extracting/Chunking/Embedding):** `bg-amber-500/10 text-amber-400 border border-amber-500/20` + spinning `Loader2`.
- **`Failed`:** `bg-rose-500/10 text-rose-400 border border-rose-500/15` + `AlertCircle`.
- **`Citation Target`:** High-contrast amber badge with pulsing animation (`citationPulseDark`).

---

## 11. Upload Dropzone & Gradient Orb Canvas (`GradientOrb`)

- **Purpose:** Hero section drag-and-drop document upload.
- **Anatomy:**
  - 3D WebGL Canvas with react-spring hover scale (`1.0` → `1.15`).
  - Glowing upload cloud icon (`text-[#b7a6fd] drop-shadow-[0_0_20px_rgba(167,139,250,0.55)]`).
  - Primary text: `"Drop your PDF here"` (`text-indigo-300 font-medium`).
  - Subtext: `"or click to upload"` (`text-[#94a3b8]`).
  - Playful Caveat annotation note with curved pointer arrow.

---

## 12. Empty States

- **Purpose:** Displayed when searches or queries return zero results.
- **Anatomy:** Enclosed dashed container (`rounded-xl border border-dashed border-white/5 bg-[#121216] p-12 text-center`):
  - Icon: Muted icon (`h-8 w-8 text-zinc-500 mb-2`).
  - Title: `text-sm font-semibold text-zinc-200`.
  - Description: `text-xs text-zinc-400 mt-1`.
  - Primary action button to reset or upload.
