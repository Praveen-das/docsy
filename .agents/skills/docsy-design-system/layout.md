# Layout System & Grid Architecture

Authoritative specifications for app shells, sidebars, headers, content containers, and responsive grids in Docsy.

---

## 1. Application Shell Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Docsy App Shell Layout (`AppLayout`)                                                    │
│  ┌───────────────────────┬────────────────────────────────────────────────────────────┐  │
│  │ Sidebar (`w-64`/`w-16`)│  Top Header (`h-20`, sticky, ProgressiveBlur optical scrim)│  │
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

---

## 2. Shell Dimension Specifications

### 2.1 Sidebar Dimensions
- **Desktop Expanded:** Width `256px` (`w-64`). Deep obsidian ground (`#07080c`) with zero right border.
- **Desktop Collapsed:** Width `64px` (`w-16`). Transitions smoothly via `transition-[width] duration-200 ease-out`.
- **Mobile Drawer:** Slide-over panel (`fixed top-0 bottom-0 left-0 z-40 w-64 -translate-x-full`) with `bg-black/60 backdrop-blur-xs` overlay.

### 2.2 Top Header Dimensions
- **Height:** `80px` (`h-20`).
- **Positioning:** `sticky top-0 -mb-10 z-30 flex shrink-0 w-full items-center justify-between px-6 sm:px-7 bg-transparent`.
- **Optical Scrim:** Renders an 8-layer progressive backdrop blur via `<ProgressiveBlur height={100} />` to gently feather scrolling content without harsh cutoff lines.

### 2.3 Main Content Viewport
- **Container Max Width:** `max-w-7xl` (`1280px`), horizontally centered with `mx-auto`.
- **Horizontal Padding:** `px-4` on mobile (`< 640px`), `sm:px-8` (`32px`) on tablet/desktop.
- **Vertical Padding:** `py-7` (`28px`).
- **Section Spacing:** `space-y-12` (`48px`) between Hero, Documents, and Conversations.

---

## 3. Grid Systems

### 3.1 Hero Section 12-Column Grid
- **Container:** `grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-8 sm:pb-10`.
- **Left Column (Headline & Badges):** `lg:col-span-7 relative z-10 flex flex-col justify-center`.
- **Right Column (Dropzone & 3D Orb):** `lg:col-span-5 relative flex justify-center lg:justify-end z-10`.

### 3.2 Document Cards Grid
- **Container:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Breakpoint Behavior:**
  - Mobile (`< 640px`): `1 column` (vertical stack)
  - Tablet (`640px – 1023px`): `2 columns`
  - Desktop (`≥ 1024px`): `4 columns`

### 3.3 Conversation Items List
- **Container:** Vertical stack (`space-y-3`).
- **Items:** Full-width interactive horizontal row cards with left-aligned chat icon, document pill, title, flex preview snippet, and right-aligned timestamp + context menu.

---

## 4. Alignment & Layering Rules

1. **Z-Index Layering Hierarchy:**
   - Background Nebulas: `z-0` / `-z-10`
   - Interactive Content Cards: `relative z-10`
   - Top Sticky Header: `z-30`
   - Mobile Sidebar Drawer & Overlay: `z-40`
   - Modals & Global Dialogs: `z-50`
2. **Horizontal Rhythm:** Ensure all section headers (`DashboardSectionHeader`) align flush with card edges.
3. **Vertical Scroll Containment:** The main scroll container (`<main className="flex-1 overflow-y-auto min-w-0 relative">`) must contain all page scrolling. The outer app shell (`AppLayout`) remains strictly `overflow-hidden`.
