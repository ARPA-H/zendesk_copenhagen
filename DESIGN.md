---
name: ARPA-H Service Desk (Help Center theme)
description: A lit service counter under an indigo sky: one dark gradient hero, bright orderly surfaces, cyan for actions and one hot pink search button, on the ARPA-H NEXUS tokens.
colors:
  indigo: "#000334"
  indigo-light: "#2a2d56"
  cyan: "#52daf2"
  cyan-light: "#6fe0f4"
  cyan-hover: "#4ac5df" # cyan under the 10% indigo hover overlay, flattened
  hot-pink: "#fd4497" # the NEXUS Accent Warmer; the search button only
  navy: "#001b5e"
  link: "#0957be"
  link-hover: "#07418f"
  link-visited: "#4535a7"
  blue-tint: "#e6f5fc"
  text: "#000334"
  text-subtle: "#4a4d52"
  text-muted: "#6f747a"
  surface: "#ffffff"
  surface-subtle: "#f3f5f8"
  stroke: "#d7dee8"
  divider: "#e5eaf0"
  control-border: "#6f747a"
  on-dark: "#ffffff"
  pink-accent: "#c93678"
  turquoise-accent: "#188478"
  violet-accent: "#4535a7"
  error: "#bf2d1d"
  error-light: "#f4dcd9"
  error-dark: "#7f1e13"
  warning-light: "#fdf3df"
  warning-dark: "#7a5d20"
  info-light: "#cdeafa"
  usa-gray-5: "#f0f0f0" # the stock USWDS banner background; the banner is never restyled
  usa-ink: "#1b1b1b" # the stock USWDS banner text
typography:
  display:
    fontFamily: "Poppins, 'Public Sans', sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-1px"
  h1:
    fontFamily: "Poppins, 'Public Sans', sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.5px"
  h2:
    fontFamily: "Poppins, 'Public Sans', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.5px"
  h3:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
  card-title:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
  lead:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
  meta:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "'Public Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.35
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  pill: "1000px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.indigo}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.cyan-hover}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.indigo}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
    height: "40px"
  nav-bar:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.on-dark}"
    height: "71px"
  government-banner:
    backgroundColor: "{colors.usa-gray-5}"
    textColor: "{colors.usa-ink}"
    height: "22px"
  search-button:
    backgroundColor: "{colors.hot-pink}"
    textColor: "{colors.on-dark}" # the magnifier icon; 3.26:1, enough for a graphic
    rounded: "{rounded.pill}"
    height: "48px"
  search-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.indigo}"
    rounded: "{rounded.pill}"
    padding: "9px 9px 9px 26px"
  catalog-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: ARPA-H Service Desk

Status: Phase 2 of the [design plan](docs/design-plan.md). The color, type, shape, elevation and component sections describe what is built, in the stylesheets and in the React modules. Sections marked *planned* land in later phases and are updated then; layout is still Copenhagen's. Remaining gaps are listed in the [audit](docs/design-audit-2026-10-12.md).

## Overview

Creative North Star: **"The Lit Service Counter"**

A person arrives mid-task, often stressed, needing a device or an access fixed. The portal answers with one atmospheric moment, a dark indigo sky with arc artwork and a Poppins greeting, and then gets out of the way: bright, orderly surfaces where the work happens, and exactly one lit button. Atmosphere is spent in the hero; everywhere else the interface is quiet, exact and fast to read.

The system is NEXUS-aligned, not NEXUS-conformant: it adopts the tokens and component conventions of the [arpa-h-web-design skill](.github/skills/arpa-h-web-design/SKILL.md) through the theme's own SCSS, without USWDS core (see the plan's assumption 6). It inherits Zendesk Guide's markup and cannot restyle Zendesk's instant-search web component.

**Key Characteristics:**

- One dark band (the navigation bar flowing into the hero) above bright working surfaces.
- Cyan is the action color; the one exception is the hero search button, which is hot pink. Yellow, green and red appear only in messages.
- Pill-shaped actions, 16px surfaces, hairline strokes, shallow elevation.
- Public Sans for reading, Poppins for the few big moments.

## Colors

A restrained palette: indigo and white carry almost everything, cyan marks the thing to press, hot pink marks the search button, and other accents appear in artwork and status labels only.

### Primary

- **Deep Indigo** (`#000334`): the navigation bar and footer, all body and heading text, outline buttons, the secondary button.
- **Action Cyan** (`#52daf2`): the primary action: Ask AI, Submit, `.button-primary` and `.button-large`, the training button. Always with indigo text, never with white (white on cyan is 1.6:1).
- **Hot Pink** (`#fd4497`, the NEXUS Accent Warmer): the hero and item-page search buttons, the one control that starts a search. The magnifier on it is white: 3.26:1, enough for a graphic (3:1). Text on this pink cannot be white (it needs 4.5:1); indigo reaches 6.07:1. Hover darkens with the same 10% indigo overlay. The owner chose this exception to the NEXUS cyan primary.

### Secondary

- **Link Blue** (`#0957be`, hover `#07418f`, visited `#4535a7`): links and the focus ring. Cards that are links also take this color on hover.
- **Blue Tint** (`#e6f5fc`): selected rows in the category rail and quiet bands. Selection is not an action, so it is never cyan.

### Neutral

- **Subtle Text** (`#4a4d52`) and **Muted Text** (`#6f747a`, 4.7:1 on white): secondary text, counts and placeholders. Nothing lighter carries text.
- **Surface** (`#ffffff`), **Subtle Surface** (`#f3f5f8`), **Stroke** (`#d7dee8`), **Divider** (`#e5eaf0`).
- **Control Border** (`#6f747a`): the boundary of inputs, selects and textareas. The skill specifies `#bac2cc`, which is 1.9:1 and fails [WCAG 1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast); this theme uses the 4.7:1 neutral instead.

### Accents and feedback

- **Pink 600** (`#c93678`) marks an open request; **Turquoise 700** (`#188478`) the default status label; **Violet 600** (`#4535a7`) a new request. Pink also lives in the hero artwork, which is an image, and on the search button (hot pink, above).
- **Error, warning, info** (`#bf2d1d` on `#f4dcd9`; `#7a5d20` on `#fdf3df`; `#cdeafa`) are messages: notifications, form validation and load failures. They are never decoration.

### Named Rules

**The Cyan Is Action Rule.** Cyan appears only on things that can be pressed. A static element that borrows it reads as interactive. ([ARPA-H/zendesk_onboarding_offboarding#41](https://github.com/ARPA-H/zendesk_onboarding_offboarding/pull/41) reached the same rule after review.)

**The Feedback Only Rule.** Yellow, green and red mark warning, success and error messages. No badge, card or accent on the in-scope pages uses them; request status tags use pink, blue and grey, and the approvals module keeps its red new-comment divider until it is designed.

**The No Raw Color Rule.** Components read alias tokens from `styles/_tokens.scss`, never a hex or rgb value, never a named color such as `yellow`, and never a palette step such as `--color-blue-700`; when a component needs a step it gets a role alias first (`--surface-selected`, `--status-open`). The gate in the plan checks all three. URL-encoded SVG data URIs cannot use `var()`; their colors are copies of tokens and are noted where they occur.

**The One Source Rule.** Tokens own every color and the logo, apart from the stock `.gov` banner, which keeps USWDS's own colors. The brand, text, link and background color settings and the Logo setting are removed from `manifest.json`, so Admin Center no longer offers controls that would do nothing, and a value saved under an older design cannot override the palette or put a full-color logo on the indigo bar; the alert banner keeps its own color settings because an announcement is chosen per use. The React modules cannot read CSS custom properties inside Garden color scales, so `src/modules/shared/garden-theme/nexusPalette.ts` mirrors the primitives it uses and a unit test fails when the two files drift.

## Typography

**Display, h1 and h2:** Poppins (fallback Public Sans). **Body, h3 to h6, controls:** Public Sans. Both are self-hosted woff2 in `assets/` with `font-display: swap`; there is no font CDN. Two families, no italics (no italic face is loaded, so italics would be synthesized and the theme avoids them).

**Character:** Poppins is the confident voice of the greeting and page titles; Public Sans is the plain, legible voice of everything you read and press.

### The scale

Eight NEXUS steps carry every role. Sizes are `rem` tokens (`--font-size-*` in `styles/_tokens.scss`), so a user's default font size scales them; the pixel values below assume the 16px browser default. Display, h1 and the larger steps scale down about 0.8x below 640px; body and secondary sizes do not.

| Role | Size | Weight and face | Line height | Used for |
| --- | --- | --- | --- | --- |
| Display | 40px (32px small) | Poppins 700, -1px | 1.15 | The home greeting only |
| h1 | 32px (25.6px small) | Poppins 600, -0.5px | 1.15 | Page titles |
| h2 | 24px | Poppins 600, -0.5px | 1.15 | Section titles |
| h3 | 20px | Public Sans 600 | 1.35 | Subsections, category names |
| Title | 16px | Public Sans 600 | 1.35 | Card titles, result titles, h4 |
| Lead | 18px | Public Sans 400 | 1.5 | The hero subtitle, page descriptions |
| Body | 16px | Public Sans 400 | 1.5 (prose 1.62) | Reading text, form fields |
| Label and meta | 14px | Public Sans 500 or 400 | 1.35 or 1.5 | Buttons, breadcrumbs, counts, dates, hints |
| Micro | 12px | Public Sans 600 | 1.35 | Badges, status labels and uppercase overlines only |

Page titles and section titles sit one step below the NEXUS marketing scale (h1 48px, h2 36px): these are working pages and a long article title has to stay on two lines. The deviation is deliberate; the display step carries the large moment.

### Rules

- **Measure.** Prose is held to `32em` (about 70 characters; `--measure-prose`) and set at 1.62 leading. Images, tables and code blocks stay as wide as their column.
- **Floor.** Nothing that is read is smaller than 14px. Twelve pixels is for badges, status labels and uppercase overlines.
- **Rhythm.** A heading gets more space above than below, so it reads as the start of the text that follows.
- **Numerals.** Counts, dates and table figures use tabular numerals so columns line up.
- **Resilience.** Headings balance their lines and may break inside a long unbroken token instead of widening the page.
- **One h1.** Every page has exactly one `h1`. The home and services pages keep Zendesk's visually hidden one (the Help Center name) and the greeting is an `h2`; the page title is the `h1` elsewhere; the Device FAQs page shows tiles instead of a title, so it has a visually hidden one. Visually hidden headings count, because screen readers announce them.
- **Inputs.** Form fields are 16px, which also stops iOS Safari from zooming the page on focus.
- **React.** Garden's sizes stay in pixels because its sizing math needs them, with the three off-scale values (10, 22 and 26px) moved to the nearest step and its largest heading (36px) set to the h1 size of 32px; the Garden system font stack leads with Public Sans, and the hand-styled catalog text reads the same `--font-size-*` tokens.

## Layout

One container. Content is at most 1160px wide and never closer than the page gutter to the viewport edge (`--page-gutter`: 16px, 32px from 768px), so the navigation bar, breadcrumbs, page content and footer share one left edge at every width (the stock government banner above them keeps its own USWDS container). Column tokens set the shared widths: `--column-reading` 720px (article, section list, search results, the item form), `--column-aside` 320px (the item page help rail), `--column-rail` 240px (filter and navigation rails) and `--column-gap` 48px between a rail and its column. Category pages put their sections on a two-column grid from 768px with one gutter and one row gap and no boxes; list rows use 12px of padding for a 48px pitch. The service item page is one calm form: the form takes the reading column and a static help rail (suggested articles, what happens after you submit) takes the aside column from 1024px, dropping below the form on narrower screens, with no greeting band, step pills, helper cards or nested shells. Spacing comes from the `--space-*` tokens (the NEXUS 8px scale); one dark band, one bright surface per page is the target composition for Knowledge. Wide article tables scroll inside their own focusable region instead of widening the page.

## Elevation & Depth

Flat by default. Service cards and search result cards rest on a stroke alone; the service item page has no panels and no shadows; hovered link cards raise to `--shadow-2`. Menus and popovers use `--shadow-3`. All shadows are 10% black with an offset; no colored halos.

### Shadow Vocabulary

- **Resting panel** (`box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1)`): the search pill on the results page and the alert banner.
- **Raised** (`0 4px 8px rgba(0, 0, 0, 0.1)`): hovered cards.
- **Overlay** (`0 8px 12px rgba(0, 0, 0, 0.1)`): menus, the mobile navigation panel.
- **Focus on light** (`0 0 0 1px #0957be, 0 0 3px 1px #0957be`): every keyboard focus.
- **Focus on dark** (`0 0 0 2px #000334, 0 0 0 4px #52daf2`): inside the navigation bar, footer and hero, where the blue ring would be 2.4:1.

### Named Rules

**The Visible Focus Rule.** Every interactive element shows a ring. The ring is a box-shadow plus a transparent 2px outline, so forced-colors mode repaints it. The skip link slides over the dark header, so it takes the dark-surface ring and keeps its white text; the global link focus color would otherwise turn it dark blue on black (2.2:1, first seen in the Phase 7 audit).

**The Touch Rule.** Every target is at least 24 by 24 pixels or spaced so a 24 pixel circle around it meets no other target ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)); a target nested inside another does not qualify for the spacing exception, so the catalog's category toggle has a 24 pixel hit area around its 12 pixel chevron (and sits beside the row's select button, never inside it, because a button must not contain another control). Where the pointer is coarse (`pointer: coarse`), the links people tap through lists (article lists, related and recently viewed articles) take 12.5 pixels of vertical padding, which grows the tap area to 44 pixels but not the line. Measured where a tap lands, article lists get all 44; the related and recently viewed lists keep 40 for every link but the last, because their links sit 40 pixels apart and each area gives its last 4 pixels to the link below. Search-result titles do not: a taller area would bring the breadcrumb links above them inside the 24 pixel circles.

**The Forced Colors Rule.** Meaning never rests on a fill alone. In forced-colors mode the palette replaces authored colors, so a pill button keeps a border (the shared primary buttons, the form submit and the split button included; a transparent border is itself forced to a system color, because [CSS Color Adjust](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties) forces every color that is not already a system color, which is why the primary variant of the outline button keeps its edge), a selected row an outline, a selected vote or follow button and a voted comment arrow a ring inside their edge (a focused one shows the focus outline outside it instead), each white wordmark (header and footer) its own dark tile, and the mobile menu button a surface of its own, because the transparent header sits over dark artwork and a bare icon would turn dark on dark (`styles/_forced-colors.scss`). Check both palettes: the dark one hides the wordmark problem, the light one shows it. Selected state is also exposed in markup (`aria-current`), not just painted.

**The Print Rule.** A printed page is its content: no site chrome or screen-only controls (the banner, header, footer, skip link, rails, votes, comments, and on the catalog the category list, search field and sort menu), dark text on white at the width of the paper, the address of each outside link after its text, and no page break inside a figure, table, code block or quote (`styles/_print.scss`). A request form is the exception that proves the rule: its fields are its content, so it prints as a paper form, labels and boxes without the Submit button. Browsers drop background colors when printing: the default, [`print-color-adjust: economy`](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust), lets them "leave out all background images and adjust text colors". So anything white on a dark fill is left out or recolored rather than trusted to survive; in Chrome's print output the hero's white text came out light gray on white.

## Shapes

Actions are pills (`1000px`). Surfaces are 16px, with the large catalog panel at 24px. Selects and textareas use 8px. Chips and the search field are pills.

## Components

### Buttons

- **Shape:** pill, 40px minimum height, `8px 20px` padding, 14px medium text.
- **Primary:** cyan, indigo text, no border. Hover darkens with a 10% indigo overlay.
- **Outline (the default `.button`):** transparent, 2px indigo border and text; hover adds a 5% indigo fill.
- **Secondary:** solid indigo, white text.
- **Disabled:** 40% opacity.

### React components (Garden)

The service catalog list, the item page and the request forms are React modules built on Zendesk Garden. `createTheme` maps Garden onto NEXUS instead of overriding components one by one:

- **Palette:** the `grey`, `blue`, `green`, `yellow` and `red` hues are replaced with NEXUS ramps. Each Garden shade (100 to 1200) takes the NEXUS step whose contrast against white is closest to the shade's target, and shades 600 and up never drop below 4.5:1, so text drawn with them passes WCAG AA. Where NEXUS has no step in between, neighboring shades share a color.
- **Roles:** body text is indigo, subtle text is `#4a4d52`, links and focus are link blue, and form-control borders are `#6f747a` (hover `#07418f`).
- **Buttons:** pills; primary is cyan with indigo text, the default is an indigo outline.
- **Selection:** the active category in the catalog sidebar is the blue tint, as in the stylesheets.
- **Status tags:** the request list uses the same accents as the stylesheets: open is pink, awaiting reply is blue, solved is grey.

### Government banner

The official [USWDS banner](https://designsystem.digital.gov/components/banner/) sits above the navigation bar on every page, signed in or not, because help.arpa-h.gov is a public .gov site. It is stock USWDS and is never restyled: the NEXUS reference (`.github/skills/arpa-h-web-design/SKILL.md`, header checklist) says the banner must never be visually modified. Its colors, 12px text, spacing, 1024px centered container and focus ring are exactly what USWDS ships, so it does not share the page container's left edge, and NEXUS styling stops at its edge. Its CSS is compiled from the `@uswds/uswds` package by `bin/build-usa-banner.mjs`: only the banner, the accordion base and the media block, emitted as shipped, so no reset, grid or utility rule reaches the page (measured: 0 rendered elements change; the full library changes 17%). The only edits are delivery ones: the settings comments are dropped, the icon URLs are inlined, and the font name the banner asks for, "Public Sans Web", is served from the theme's self-hosted Public Sans files. The explanation panel is rendered collapsed and opens from the "Here's how you know" button; without script, or if the script has not started the controller within five seconds, the panel stays visible. The copy is the official English text.

### Navigation bar

Full-bleed indigo, 71px tall, the reverse logo at 37px and white text, with no site title: help.arpa-h.gov serves several audiences (IT and HR among them), and the original theme hid the Help Center name for the same reason. On the home and services pages the bar is transparent and the hero artwork runs behind it, so the bar and the hero read as one dark band; every other page has the solid indigo bar. Ask AI is the only cyan pill in the bar. The user menu is a white 16px card. The full bar holds at 768px and wider, as the NEXUS checklist requires; below 768px it keeps the logo and a 44px menu button that opens a white panel.

### Hero and search

A dark gradient hero (the hero artwork image) with a Poppins greeting, one white pill search with a hot pink circular submit and a white magnifier, and popular-search chips: translucent pills over a 55% indigo scrim, so white text stays above 4.5:1 on any part of the artwork. The search pill takes the dark-surface focus ring as a whole. The greeting is an `h2` (the page's `h1` is the visually hidden Help Center name). Signed out, the greeting, search and catalog stay behind sign-in, so the band carries a heading ("Sign in to get help"), one sentence and a cyan sign-in action instead of sitting empty.

The artwork is a layer of its own (`.svc-hero::before`), as wide as the hero and one header height taller at the bottom, fitted with `cover`, centered, and cut off at the hero's edge. It does not repeat. Where the hero is wide (769 pixels and up) that is exactly where the artwork sat before the header went transparent, so the crop behind the content has not moved. Where the hero is tall and narrow (phones) the artwork scales up just enough to run from the top of the transparent header to the bottom of the hero ("zoomed to fill"): no strip to fill with a flat color, and still the whole artwork, dark navy with the pink glow at the bottom (about 8% pink and 78% dark at 390 pixels). Two earlier attempts are recorded as rejected: a flat indigo fill for the strip ("padding it with indigo isn't appropriate"), and the artwork at one image pixel per CSS pixel, which is a close-up of its bright pink bottom and turned 93% of the hero pink. The layer is positioned without a z-index, so it creates no stacking context and the greeting (z-index 2, holding Zendesk's instant search) and the catalog card (z-index 3) keep their order. The indigo background shows only while the artwork loads.

### Cards

White with a 2px `#e5eaf0` stroke (carried over from the current catalog) and a 16px radius. Link cards raise to `--shadow-2` and take a link-blue border on hover. A service name and a category heading wrap in full instead of truncating, because cut-off text cannot be read at 320 pixels and a native `title` tooltip is out of reach of keyboard and touch users; cards in a row stretch to the tallest, and only the secondary description clamps (three lines). On the catalog, a card's description is hidden and shown in a hover tooltip; where the device cannot hover (`hover: none`: phones and most tablets) the tooltip never appears, so the description shows under the title in muted text, two lines at most.

### Footer

Full-bleed indigo with white text, in the order the NEXUS spec sets for a portal: the reverse logo with a row of site links (Service catalog, Submit a request, and My requests when signed in) and the language menu when the Help Center has alternate languages; a hairline divider (`--on-dark-stroke`); the nine policy links the public arpa-h.gov footer carries, wrapped and centered; then the copyright line at 60% opacity, with the year kept current by script. Links are 14px white with an underline on hover and the dark-surface focus ring. The policy labels are fixed English text, because a theme cannot add Help Center translation keys.

### Messages

Notifications and validation use the feedback tokens only, as soft fills with dark text. A list with nothing in it says so in plain words in the body voice (`.empty-state`), not in the stock italic link. English locales get a sentence ("There are no articles in this section yet."); every other locale keeps Zendesk's translated "Empty", because the theme cannot add Help Center translation keys and `src/domFixups.js` hides an element whose only text is the English word.

A failed load replaces its skeleton at once. The module's error screen is announced as an alert (`role="alert"`), the page's skeleton treats that alert as "loaded" so a failure shows in about a second instead of after the six second hard cap, and on a request form with no form to submit the custom submit button is hidden rather than left as a control that does nothing.

## Do's and Don'ts

### Do

- **Do** use cyan with indigo text for the single primary action on a page.
- **Do** keep text on the 4.5:1 neutrals (`#6f747a` or darker) and give every control a visible focus ring.
- **Do** keep read text at 14px or larger and prose at about 70 characters per line.
- **Do** put new colors in `_tokens.scss` as aliases first.
- **Do** keep the hero and the navigation bar one continuous dark band.

### Don't

- **Don't** use cyan for anything that cannot be pressed, and don't put white text on it.
- **Don't** use yellow, green or red outside a message.
- **Don't** nest a card inside a card.
- **Don't** add a colored border on one side of a card, list item or alert wider than 1px.
- **Don't** use `outline: none` without a replacement ring.
- **Don't** hard-code hex, rgba or named color values (such as `yellow`) in the stylesheets. The one exception is the generated stock USWDS banner (`styles/_usa-banner-generated.scss`).
- **Don't** restyle the `.gov` banner: no color, type, spacing, container or focus changes. NEXUS styling stops at its edge.
- **Don't** write a font size outside the scale: new text takes a `--font-size-*` token.
- **Don't** add USWDS reset, grid or utility CSS: the banner is the only USWDS component, compiled in isolation, because the full library changes 17% of rendered elements (it grows the Garden catalog search field from 47 to 54px, which shifts everything below it).
