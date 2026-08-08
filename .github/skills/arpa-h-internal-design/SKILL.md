---
name: arpa-h-internal-design
description: "ARPA-H Internal App Design System. Use when building, extending, or restyling any internal ARPA-H web application UI. Covers color tokens, layout conventions, typography, semantic color rules, and component behavior specs. Stack-agnostic — applies to React, Svelte, Vue, or any other frontend framework. Self-contained: defines its own color primitives, spacing, typography, and component conventions — does not require loading any other skill or stylesheet."
---

# ARPA-H Internal App Design System

This is a bespoke, self-contained design system for ARPA-H's internal (staff-facing) web
applications. It shares a visual family resemblance with ARPA-H's public-site design system
but is maintained independently — do not treat the two as interchangeable, and do not load
one skill's assets to satisfy the other's requirements. Everything an internal app needs
(color primitives, spacing, typography, component specs) is defined in this skill.

## Design Philosophy

- **Self-contained token set.** Every color, spacing, radius, and type value used by an
  internal app is defined once, in this skill's own `assets/globals.css`. Do not hardcode
  hex values inline in application code, and do not pull tokens from another design
  system's stylesheet — copy/import only this skill's starter file.
- **Gradient canvas + glass content.** The page background is a full-viewport, fixed,
  layered brand gradient (indigo base → cyan/violet sweep → soft pink accent → white
  highlight fade) — not a flat fill. Content — cards, data grids, popovers, dialogs, menus —
  sits on top of that canvas as a translucent "glass" surface (~50% white + blur), so it
  reads as a light, legible surface floating above a darker backdrop, not a second,
  harder-to-read dark theme.
- **One dual-theme system, not light/dark mode.** Internal apps have a single, permanent
  appearance — there is no user-facing light/dark toggle. Two readings of the same neutral
  scale exist to render that one appearance: an indigo-tinted **dark chrome** reading (nav,
  page text directly on the gradient) and a **light/glass** reading (cards, grids,
  popovers). Pick tokens from the reading matching the surface you're on.
- **Inverted header.** The top title bar is a fixed, full-width, white-on-indigo bar
  (`--color-header-bg` white, `--color-header-fg` indigo) — a stable brand anchor over the
  gradient canvas regardless of scroll position or which glass surface is showing beneath.
- **Sparse accent use.** The warmer pink accent is reserved for warning/collision/attention
  signaling only — never decoration. Real destructive actions (delete) use the semantic
  error red, not the warmer pink accent.
- **Accessibility first.** All interactive elements must meet WCAG AA contrast on the
  surface they render on. Because glass surfaces are translucent over a variable gradient,
  text/border tokens on glass need *more* contrast headroom than the same token would need
  on a flat white background — don't assume a plain-white-page contrast value is safe here.

---

## Color Tokens

Define these as CSS custom properties (or equivalent) in every app. The starter file is at
[assets/globals.css](./assets/globals.css) — it is fully self-contained and requires no
other stylesheet.

### Brand

| Token name                     | Hex       | Use                                   |
|---------------------------------|-----------|----------------------------------------|
| `--color-brand-primary`         | `#000334` | Indigo — header text/icons, primary body text on glass |
| `--color-brand-primary-light`   | `#2A2D56` | Lighter indigo variant |
| `--color-brand-secondary`       | `#52DAF2` | Cyan — primary button/CTA fill, focus ring accent |
| `--color-brand-secondary-light` | `#6FE0F4` | Cyan hover state |
| `--color-brand-tertiary`        | `#001B5E` | Navy — tertiary brand accent |

### Neutral Scale — two readings

The same step names resolve differently depending on which surface they're applied to.
**Glass** = content cards/grids/popovers (light). **Dark chrome** = nav bar backdrop and
page-level text/elements sitting directly on the gradient canvas.

| Token name       | Glass (light) hex | Dark chrome hex | Primary use                          |
|-------------------|--------------------|-------------------|----------------------------------------|
| `--color-ui-5`    | `#F3F5F8`          | `#0D0E1A`         | Faintest surface / page background     |
| `--color-ui-10`   | `#E5EAF0`          | `#191B35`         | Card / surface background              |
| `--color-ui-20`   | `#D7DEE8`          | `#333669`         | Elevated surface (popover, dropdown)   |
| `--color-ui-30`   | `#CCD5E1`          | `#4C519D`         | Secondary muted text/border            |
| `--color-ui-40`   | `#BAC2CC`          | `#797EBF`         | Muted foreground, borders              |
| `--color-ui-50`   | `#959BA3`          | `#959BA3`         | Placeholder text, mid-tone (same both readings) |
| `--color-ui-60`   | `#6F747A`          | `#6F747A`         | Disabled foreground (same both readings) |
| `--color-ui-70`   | `#4A4D52`          | `#4A4D52`         | (same both readings) |
| `--color-ui-80`   | `#252729`          | `#252729`         | Near-black surface (e.g. Dev Mode badge bg) |
| `--color-ui-90`   | `#131314`          | `#131314`         | Near-black text/tooltip bg |
| `--color-white`   | `#FFFFFF`          | `#FFFFFF`         | Primary text on dark chrome, header background |

Only `ui-5`–`ui-40` (surface-level steps) differ between readings: the dark-chrome column is
hue-shifted to a ~236° indigo brand hue at the SAME lightness as the glass column's step, so
contrast/elevation ratios are identical between readings — only the cast changes from flat
grey to "midnight indigo." Steps `ui-50` and above are light text/chrome tones shared by both
readings — adding saturation there would hurt legibility.

### Semantic Accent Colors

| Token name                    | Hex       | Meaning — use ONLY for this        |
|-------------------------------|-----------|-------------------------------------|
| `--color-status-warning`      | `#FD4497` | Collision / duplicate / data-integrity warning |
| `--color-status-warning-soft` | `#FCC1DC` | Secondary warning text |
| `--color-status-warning-fill` | `#C93678` | Filled warning/collision badge background (one step darker than `--color-status-warning` — the base hue fails WCAG AA with white text at ~3.3:1; this step clears ~4.9:1) |
| `--color-active`              | `#ADECE5` | Active record, active filter state |
| `--color-inactive`            | `#B8B2E4` | Inactive / departed record |
| `--color-link`                | `#2A2D56` (glass) / `#8CE6F6` (dark chrome) | Table/identifier links — indigo-600 rest / indigo-800 hover on glass; brighter cyan on dark chrome where indigo would be too dark to read |
| `--color-error`               | `#BF2D1D` | Real destructive actions (delete), true validation errors — never the warmer pink accent |
| `--color-success`             | `#3C690E` | Success confirmation states |

### Header Colors (intentionally inverted — same on every surface)

| Token name          | Hex       | Use                               |
|---------------------|-----------|-----------------------------------|
| `--color-header-bg` | `#FFFFFF` | Header/nav bar background         |
| `--color-header-fg` | `#000334` | Header brand text and icons       |

---

## Layout

### Shell Structure

```text
┌─────────────────────────────────────────────────┐
│  HEADER — 48px tall, fixed, white bg, indigo fg │
│  [Brand icon + "App Name"]     [User area]      │
├─────────────────────────────────────────────────┤
│  ░░░░░░░░ layered brand gradient canvas ░░░░░░░ │
│  ░░  ┌───────────────────────────────────┐  ░░  │
│  ░░  │  glass content card / data grid   │  ░░  │
│  ░░  └───────────────────────────────────┘  ░░  │
│  MAIN — flex: 1, max-width 1200px, centered     │
│  padding: 24px horizontal, offset for header    │
└─────────────────────────────────────────────────┘
```

- Full-viewport height via flexbox column on the root element (`.app-shell`).
- Header: `position: fixed`, `top/left/right: 0`, `height: 48px`, elevated `z-index`;
  `justify-content: space-between`, `align-items: center`. Because it's fixed, the main
  content column needs a top margin/offset equal to the header height.
- Brand area is a link (left side): icon + app name, no underline, `--color-header-fg`. On
  narrow viewports (≤640px), drop leading qualifier words (e.g. "ARPA-H ", "Directory ") so
  the header stays one line instead of wrapping.
- User area (right side): avatar + display name + account menu (ghost/subtle trigger)
  containing at minimum "Sign out"; role-gated items (e.g. Admin) appear conditionally.
- **Page background is a fixed, viewport-sized gradient, not a flat fill on the scrolling
  container.** Paint it on a `position: fixed; inset: 0` pseudo-element (`.app-shell::before`,
  `z-index: -1`), not via `background-attachment: fixed` on the scrolling shell element
  itself. Mobile browsers (iOS Safari especially, Android Chrome for scroll-perf reasons)
  don't reliably honor `background-attachment: fixed` on a non-`<body>` element — it falls
  back to `scroll`, sizing the gradient to the *element's* full content height instead of
  the viewport, stretching/misplacing its stops as content grows. `.app-shell` needs
  `position: relative; z-index: 0` to form its own stacking context so the pseudo-element's
  negative z-index sits behind its own children without falling behind `<body>`'s opaque
  background.
- **Content cards and data grids never use the gradient or dark-chrome tokens directly** —
  they get the glass treatment: `background-color: rgba(255,255,255,0.5)`,
  `backdrop-filter: blur(16px)`, the glass-reading tokens scoped to that surface, and the
  standard corner radius. Small standalone controls sitting directly on the gradient with no
  surrounding card (e.g. a trailing nav button) use a higher, near-opaque variant
  (`rgba(255,255,255,0.75)`) since they have no larger surface to anchor contrast against.
- Components that portal outside the normal DOM tree (popovers, dialogs, menus) can't
  inherit the glass surface via CSS custom properties on a parent element — apply the
  glass-reading tokens via your component library's own theme-provider mechanism, scoped to
  transparent background, then apply the glass background/blur to the portaled surface
  element itself.

### Spacing Scale

4px base unit:

| Name | Value |
|------|-------|
| XS   | 4px   |
| S    | 8px   |
| M    | 12px  |
| L    | 16px  |
| XL   | 24px  |
| XXL  | 32px  |

---

## Typography

- **Font stack:** `'Public Sans', 'Segoe UI', system-ui, sans-serif`
- **Monospace stack:** `'Roboto Mono', Consolas, 'Courier New', monospace` — for IDs, codes,
  and other fixed-width descriptors.
- **Color scheme:** set `color-scheme: dark` on `:root` — even though content surfaces are
  visually light "glass," the page/chrome layer beneath is dark, and native form
  controls/scrollbars should follow that.
- **Base:** `font-size: 16px`, `line-height: 1.5`, `font-weight: 400`.
- **Body/page text color:** white on the dark-chrome canvas; indigo primary-text color
  inside glass surfaces (cards, grids, popovers).

### Size / Weight Scale

| Role                          | Size  | Weight      |
|--------------------------------|-------|------------|
| Page title (H1)                | 28–32px | 600      |
| Page title, secondary pages    | 24px  | 600        |
| Section / card title (H3)      | 20px  | 600        |
| Primary body                   | 16px  | 400        |
| Secondary body                 | 14px  | 400        |
| Labels / captions              | 12px  | 400        |
| Micro / edited timestamp       | 11px  | 400 italic |

---

## Semantic Color Rules

These rules are non-negotiable — they define the visual language of ARPA-H internal apps.

### Active vs. Inactive Records

- **Active** record title and status badge: `--color-active` (`#ADECE5`, muted teal)
- **Inactive / departed** record title and status badge: `--color-inactive` (`#B8B2E4`, soft
  lavender)
- Badge text color (on both): a near-black/dark token for legibility (these badge fills are
  light — do not pair with white text)
- Sort order: active records sort before inactive within the same list.

### Collisions / Warnings

- Any detected duplicate, collision, or data-integrity warning uses `--color-status-warning`
  (`#FD4497`) for icon and primary warning indicator color.
- Where used as a *filled badge background with white text*, use
  `--color-status-warning-fill` (`#C93678`) instead — the base hue fails WCAG AA contrast
  with white text at only ~3.3:1; this step clears ~4.9:1.
- Secondary/descriptive warning text: `--color-status-warning-soft` (`#FCC1DC`)
- Warning is surfaced inline (an icon next to the affected field/row), not via a special
  row/section background.

### Table Links

- Name/identifier links within data tables/grids: indigo at rest, darker indigo on hover on
  glass surfaces; a brighter cyan on dark-chrome surfaces where indigo would be too dark to
  read. This is a distinct, brand-indigo affordance — never the active/inactive accent
  colors.
- No underline at rest; underline on hover and on focus for accessibility.

### Active Filter Indicators

- A column filter icon that has an active (non-empty) filter is colored with the same
  link/interactive-affordance color (indigo), not the active-record accent.
- Inactive filter icon uses the default muted/neutral foreground for that surface.

### Dev Mode Badge

- Background: `--color-ui-80` (near-black surface)
- Text and border: `--color-status-warning` (`#FD4497`), 1px solid border
- Appears in the header user area only in development/preview environments.

---

## Component Behavioral Specs

Described functionally — implement with whatever component primitives your framework
provides.

### Buttons

| Variant          | Rest state                                              | Hover | Pressed |
|------------------|------------------------------------------------------------|-------|---------|
| **Primary**      | `--color-brand-secondary` (cyan) bg, `--color-brand-primary` (indigo) text | `--color-brand-secondary-light` bg | Darken one step |
| **Secondary**    | Neutral bg/border for the current surface                  | Lighten one step | Darken one step |
| **Ghost/subtle** | No bg, no border                                            | Neutral bg one step up | Neutral bg one step further |
| **Destructive**  | `primary` appearance + explicit `--color-error` background override | Darken slightly | Darken further |
| **Disabled**     | Muted foreground on muted bg; darken both further than a default light-surface pairing if the surface is glass/gradient-backed | No change | — |

### Data Table / Grid

- Renders as a glass surface (see Layout), not a flat/dark card.
- Sortable column headers: clicking a header toggles ascending/descending sort.
- Each sortable column header contains a small ghost icon button for per-column filtering;
  clicking the filter button must not also trigger the sort handler (stop propagation).
- The filter button opens a floating popover anchored to the button, itself rendered as a
  glass popover surface; the popover traps keyboard focus.
- A global text search bar (320px wide) sits above the table/grid.
- Status-type columns use a dropdown filter with explicit options (e.g. All / Active /
  Inactive) rather than free-text.
- No special row background for warning/collision rows — the warning surfaces via an inline
  icon in the relevant cell only.
- A row/result count label sitting outside the glass grid (directly on the gradient) must
  use the dark-chrome muted-foreground token, not the glass-reading muted-foreground token —
  the two resolve to very different, surface-appropriate contrast values and are not
  interchangeable across that boundary.

### Record Status Badge

- Pill-shaped, filled (solid background)
- Active: `--color-active` bg (`#ADECE5`), dark text
- Inactive: `--color-inactive` bg (`#B8B2E4`), dark text

### Cards / Panels

- Rendered as glass surfaces: translucent white (~50%) + blur, standard corner radius,
  glass-reading tokens scoped to their contents.
- Section title inside the card: 20px semibold.
- Field layout inside cards: multi-column grid with a consistent gap (24px/XL).
- Field structure: label (12px, muted) above value (16px, primary text).

### Authentication / Sign-in

- Internal apps built on platform-native auth (e.g. a host's built-in Entra ID auth) often
  have **no custom sign-in page at all** — an unauthenticated request is redirected
  server-side straight to the identity provider's hosted login, and the app itself never
  renders a "Sign in" screen. Do not build a bespoke sign-in card/CTA UI unless the app's
  auth integration genuinely requires a client-rendered login step; confirm the routing/auth
  configuration before assuming one is needed.
- If a client-rendered sign-in screen genuinely is required: full-viewport centered layout,
  background matches the app's dark-chrome page background (no contrast shift), centered
  card (360px wide, 32px padding, text centered) containing a large app icon, app name,
  muted subtitle, and a primary CTA button ("Sign in with Microsoft" or equivalent).

### Notes / Audit Timeline

- Each entry: horizontal flex row, icon/avatar on left, text content on right.
- Author name: 12px muted.
- Edited timestamp: 11px muted italic.
- Edit and delete action buttons appear on the right of the note, ghost/subtle variant,
  icon-only.
- Delete requires a confirmation dialog before executing. Audit/history entries are
  append-only in the data model — a "delete" marks an entry deleted, it does not remove it
  from the record.

### Dialogs / Modals

- Rendered as a glass surface (translucent + blur), themed via the portal's own
  theme-provider mechanism since dialogs mount outside the normal DOM tree.
- Trap focus while open.
- Actions row: Cancel (secondary appearance) is always present alongside the primary/
  destructive action.
- For a genuinely destructive action (e.g. permanent delete), the confirm button uses
  `primary` appearance with its background explicitly overridden to `--color-error` — do not
  use the warmer pink accent here, it is reserved for data-warning signaling, not UI
  destructive-action color.

---

## Interaction States (all interactive elements)

| State | Treatment |
| --- | --- |
| Hover | Lighten background one step up the neutral scale for the current surface reading (glass or dark-chrome) |
| Pressed | Darken background one step down the neutral scale for the current surface reading |
| Focus | Visible focus ring as a `box-shadow` (not an outline sweep or animated underline): `0 0 0 1px <accent>, 0 0 3px 1px <accent>` using `--color-brand-secondary` (cyan) — a brighter/more saturated cyan on the dark-chrome surface than on glass |
| Disabled | Muted foreground token for the current surface reading; no hover or pressed response; darken further than a plain light-surface default when the surface is glass/gradient-backed to preserve contrast |
| Selected | Border/stroke and text move to the surface's strongest foreground token (`--color-white` on dark chrome, `--color-brand-primary` on glass) |

Native form controls (input, textarea, dropdown, combobox) rendered inside a glass surface
should themselves get the glass treatment (translucent fill + blur), not a component
library's stock opaque white fill — otherwise they read as a disconnected solid box floating
inside the translucent card around them. Any component-library convention for underlining or
bottom-bordering these controls (e.g. an animated brand-color underline sweep, or a two-tone
border with a darker bottom edge) should be normalized to the ring-based focus convention
above and a single consistent border color on all sides — mixed conventions read as visual
bugs once the underline/two-tone border's original purpose (usually tied to a differently
themed focus indicator) is removed.
