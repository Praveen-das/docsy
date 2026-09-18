# Responsive Design Strategy

Authoritative rules for layout adaptation across mobile, tablet, and desktop viewports in Docsy.

---

## 1. Breakpoint System

Docsy uses three primary responsive tiers:

| Tier | Tailwind Prefix | Pixel Range | Primary Device Targets |
|---|---|---|---|
| **Mobile** | Default (`< 640px`) | `0px – 639px` | Smartphones (portrait & landscape) |
| **Tablet** | `sm:` / `md:` | `640px – 1023px` | Tablets, iPad Mini/Air, folded foldables |
| **Desktop** | `lg:` / `xl:` | `1024px+` | Laptops, desktop monitors, ultrawides |

---

## 2. Shell & Navigation Adaptation

### 2.1 Sidebar Restructuring
- **Desktop (`≥ 1024px`):** Persistent static sidebar. Supports expanded (`256px` / `w-64`) and collapsed (`64px` / `w-16`) states.
- **Mobile / Tablet (`< 1024px`):** The sidebar is hidden from static flow (`-translate-x-full lg:translate-x-0`). It becomes an off-canvas slide-over drawer triggered by `HeaderMobileNavToggle`. Tapping outside the drawer on the backdrop overlay (`bg-black/60 backdrop-blur-xs`) dismisses it.

### 2.2 Top Header Restructuring
- **Mobile (`< 640px`):**
  - Displays hamburger menu button (`HeaderMobileNavToggle`) and small brand logo.
  - Search pill shrinks to fit remaining space; hides `Ctrl K` shortcut badge.
  - User menu displays circle avatar initials only; hides display name.
- **Desktop (`≥ 1024px`):**
  - Hamburger menu button is hidden (`lg:hidden`).
  - Search pill expands up to `max-w-[460px]`; shows `Ctrl K` badge.
  - User menu shows circle avatar + display name + chevron.

---

## 3. Page Section Adaptations

### 3.1 Hero Section
- **Desktop (`≥ 1024px`):** 12-column grid (`lg:grid-cols-12`). Left content takes `7 cols`; 3D Gradient Orb dropzone takes `5 cols`.
- **Mobile / Tablet (`< 1024px`):** Collapses to a single-column stack (`grid-cols-1`). Headline and micro-features appear first, followed by the dropzone centered below.
- **Dropzone Scaling:** On mobile, the dropzone uses `w-full aspect-square`; on desktop it locks to `h-[420px]`.
- **Annotation Arrow:** Playful Caveat annotation arrow is hidden on small mobile screens (`hidden sm:flex`).

### 3.2 Document Cards Grid
- **Mobile (`< 640px`):** `grid-cols-1` (single vertical column).
- **Tablet (`640px – 1023px`):** `grid-cols-2`.
- **Desktop (`≥ 1024px`):** `grid-cols-4`.

### 3.3 Conversation Items List
- **Mobile (`< 640px`):**
  - Conversation snippet preview is hidden (`hidden lg:inline`).
  - Linked document pill badge is hidden on small screens (`hidden sm:inline-flex`).
  - Item title truncates cleanly to prevent row wrapping.
- **Desktop (`≥ 1024px`):** Full row displays: Chat Icon + Title + Document Badge + Preview Snippet + Timestamp + Options Menu.

---

## 4. Mobile Ergonomics & Touch Targets

1. **Touch Target Sizing:** All mobile click targets must measure at least `44px × 44px`.
2. **Container Padding:** Mobile containers use `px-4` (`16px`) margin; tablet/desktop uses `px-8` (`32px`).
3. **Viewport Overflow Guard:** All major layout containers enforce `overflow-x-hidden` and `min-w-0` to eliminate horizontal page scrolling caused by long filenames or badges.
