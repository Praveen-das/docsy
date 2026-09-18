# Reusable Design Tokens

Authoritative CSS variables, Tailwind configurations, and token constants for Docsy.

---

## 1. CSS Custom Properties

```css
:root {
  /* Surfaces (Light Mode) */
  --color-background: #f7f7f8;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-surface-card: #ffffff;
  --color-surface-hover: #f4f4f6;
  --color-active-row: #f4f4f6;

  /* Text & Foreground (Light Mode) */
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

  /* Semantic Statuses */
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

  /* Corner Radii Scale */
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
  /* Surfaces (Obsidian Dark Mode) */
  --color-background: #08090d;
  --color-sidebar: #07080c;
  --color-surface: #0c1017;
  --color-surface-elevated: #121216;
  --color-surface-card: #0c1017;
  --color-surface-hover: #10141f;
  --color-active-row: #0b0d14;

  /* Text & Foreground (Dark Mode) */
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

  /* Semantic Statuses */
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

## 2. Spring Physics Parameters

```typescript
export const springTokens = {
  // Navigation sliding pill: fast, crisp settle without overshoot
  navPill: {
    tension: 420,
    friction: 34,
    mass: 0.9,
    precision: 0.005,
  },
  // Modal / Dropdown entrance: fast fade
  fade: {
    tension: 460,
    friction: 36,
    clamp: true,
  },
  // Hero dropzone orb: fluid, gentle jiggle
  heroOrb: {
    tension: 50,
    friction: 10,
    precision: 0.001,
  },
};
```

---

## 3. Tailwind Quick-Reference

| Design Token | Equivalent Tailwind Class |
|---|---|
| Card background | `bg-(--surface-card)` or `bg-[#0c1017]` |
| Card border | `border border-white/[0.07]` |
| Card hover surface | `hover:bg-[#10141f]` |
| Card hover border | `hover:border-indigo-400/35` |
| Card corner radius | `rounded-[22px]` |
| Card idle shadow | `shadow-lg shadow-black/30` |
| Primary text | `text-white` or `text-[#f1f5f9]` |
| Secondary text | `text-slate-400` or `text-[#94a3b8]` |
| Muted metadata | `text-[#818ea8]` or `text-[#6b7794]` |
| Primary CTA button | `Button variant="accent"` |
| Active press feedback | `active:scale-[0.98]` |
| Hairline separator | `w-px h-3 bg-white/10` |
