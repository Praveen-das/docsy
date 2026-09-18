# Typography Hierarchy

Authoritative typography standards, scale definitions, font configurations, and editorial rules for Docsy.

---

## 1. Font Family Configuration

### 1.1 Primary Interface Sans: Inter
- **Family:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **CSS Variable:** `--font-sans`
- **OpenType Feature Settings:**
  ```css
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  ```
- **Application:** All standard UI headings, body descriptions, form inputs, buttons, navigation, and tabular data.

### 1.2 Handwritten Editorial Accent: Caveat
- **Family:** `Caveat, cursive, sans-serif`
- **CSS Variable:** `--font-handwriting`
- **Tailwind Utility:** `.font-handwriting`
- **Application:** Strictly reserved for human/playful annotations (e.g., the `"Upload / Ask / Discover"` hero invitation). Never use for system labels or technical data.

### 1.3 Technical Metrics Monospace
- **Family:** Standard system monospace (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)
- **Tailwind Utility:** `font-mono`
- **Application:** Numerical metadata, page counts, byte sizes, status counts, and keyboard shortcuts (`Ctrl K`).

---

## 2. Complete Type Scale

| Role | Size | Line Height | Weight | Letter Spacing | Case | Tailwind Implementation | Example Usage |
|---|---|---|---|---|---|---|---|
| **Eyebrow / Kicker** | `12.5px` / `13px` | `1.0` | 700 (Bold) | `+0.22em` | UPPERCASE | `text-xs sm:text-[13px] font-bold tracking-[0.22em] uppercase select-none text-[#818cf8]` | `"YOUR KNOWLEDGE. AMPLIFIED."` |
| **Display H1** | `46px` / `52px` | `1.08` | 800 (Extrabold) | `-0.03em` | Sentence | `text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-extrabold tracking-tight text-white leading-[1.08]` | `"Chat with your documents."` |
| **Page H2** | `22px` / `24px` | `1.2` | 700 (Bold) | `-0.02em` | Sentence | `text-xl sm:text-2xl font-bold tracking-tight text-white` | `"My Documents"`, `"Conversations"` |
| **Section Title** | `15px` / `16px` | `1.25` | 600 (Semibold) | `-0.015em` | Sentence | `text-sm sm:text-base font-semibold text-white` | `"Recent Documents"`, `"Recent Conversations"` |
| **Card Title** | `14px` | `1.25` | 500 (Medium) | `-0.01em` | Sentence | `text-[14px] font-medium text-[#f1f5f9] leading-tight truncate` | `"System Design Notes.pdf"` |
| **Body Lead** | `15px` / `16px` | `1.6` | 400 (Regular) | `0` | Sentence | `text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed` | Hero description paragraph |
| **Card Meta** | `13px` | `1.3` | 400 (Regular) | `-0.01em` | Sentence | `text-[13px] text-[#818ea8] font-normal tracking-tight` | `"24 pages • 3.2 MB"` |
| **Tertiary Meta** | `12.5px` | `1.3` | 400 (Regular) | `-0.005em` | Sentence | `text-[12.5px] text-[#6b7794] font-normal tracking-tight` | `"2 hours ago"` |
| **Sidebar Nav** | `13.5px` | `1.0` | 500 (Medium) | `0` | Title | `text-[13.5px] font-medium` | `"Home"`, `"Documents"` |
| **Search Input** | `13.5px` | `1.0` | 400 (Regular) | `0` | Sentence | `text-[13.5px] font-normal text-[#687593]` | `"Search documents, conversations..."` |
| **Handwritten** | `16px` / `18px` | `1.15` | 400 (Regular) | `0` | Title | `font-handwriting text-[#a5b4fc] text-base sm:text-lg leading-tight` | `"Upload / Ask / Discover"` |
| **Micro Badge** | `10px` / `11px` | `1.0` | 600 (Semibold) | `+0.02em` | Title/Mono | `text-[10px] font-mono font-semibold` | Badge counts, status pills, `Ctrl K` |

---

## 3. Letter-Spacing & Kerning Rules

- **Negative Tracking on Large Headings:** Larger text requires tightened tracking. Use `-0.03em` for `46px+` display titles, `-0.02em` for `24px` titles, and `-0.01em` for standard card titles.
- **Wide Tracking on All-Caps Kickers:** Any all-caps kicker or eyebrow badge MUST have generous tracking (`tracking-[0.22em]`) to prevent characters from crowding together.
- **Micro-Adjustment on Buttons:** Standard buttons use `tracking-[-0.01em]` to enhance modern density and visual sharpness.

---

## 4. Editorial Casing Standards

1. **Sentence Case Everywhere by Default:** Use sentence case for headers, titles, card headings, buttons, and form labels (`"Recent documents"`, `"Upload document"`, `"Confirm deletion"`).
2. **Uppercase Exceptions:** Only eyebrow kickers (`"YOUR KNOWLEDGE. AMPLIFIED."`), skeuomorphic file type labels (`"PDF"`), and acronyms (`"MB"`, `"GB"`, `"AI"`, `"RAG"`) use uppercase.
3. **No Title Case on Action Buttons:** Write `"Analyze document"` rather than `"Analyze Document"`, and `"Upload PDF"` rather than `"Upload Pdf"`.
