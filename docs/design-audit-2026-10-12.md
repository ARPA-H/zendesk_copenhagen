# Design audit: baseline, 2026-10-12

A technical audit of the theme as it stood on `sandbox` (`9157608c`), before any change in this pull request. It documents issues for the later phases to fix; it fixes nothing. Evidence comes from the offline render checks (the theme's real templates with Zendesk helpers stubbed and the API mocked, headless Chrome with every non-local request blocked), the Impeccable detector, and the source. Scores follow the [Impeccable audit scale](https://impeccable.style): each dimension 0 to 4, total out of 20.

## Audit Health Score

| # | Dimension | Score | Key finding |
| --- | --- | --- | --- |
| 1 | Accessibility | 2 | The Ask AI link is 1.0:1 on the home page, placeholders are 2.6:1, and two search inputs show no focus ring |
| 2 | Performance | 2 | A 1.8 MB hero PNG, an 870 KB shared bundle, and 267 `!important` declarations that fight the cascade |
| 3 | Responsive design | 2 | Device FAQs is 607px wide and the article page 404px wide at 390; fifteen cards stack in one column |
| 4 | Theming | 2 | NEXUS tokens exist only for the catalog; 205 of 359 color literals are off-palette |
| 5 | Implementation integrity | 2 | Nested cards, dead search CSS and a dead widget, stacked header overrides, assets that were deleted but are still referenced |
| | **Total** | **10/20** | **Acceptable: significant work needed** |

## Implementation integrity verdict

**Partial pass.** The Service Catalog hero is a coherent, product-specific system (time-aware greeting, pill search, popular chips, arc artwork) and the catalog already reads a small token set. Underneath, the implementation is layered patches: header rules are spread across five partials (`_header`, `_svc-header`, `_svc-home`, `_svc-tokens`, `_user`) and several carry `!important`, 68 attribute-substring selectors (`[class*="card"]`) restyle the React catalog from outside, and the Knowledge pages are stock Copenhagen with a font swap. The detector found four mechanical issues in the source and 35 findings that stand on the rendered pages (23 true, 12 weak); 119 further findings were false positives (see the critique).

## Executive summary

- Audit Health Score: **10/20** (Acceptable).
- Issues: 0 P0, 7 P1, 7 P2, 4 P3.
- Top issues: invisible Ask AI link; missing focus rings on the two search inputs; low-contrast placeholders and counts; horizontal overflow at 390 on two pages; a 1.8 MB hero image; a color system that is mostly hard-coded.
- Next steps: the token layer and header (Phase 1), then type, layout, hardening and distillation.

## Detailed findings

### P1

- **[P1-1] Ask AI is unreadable on the home and services pages.** *Location:* `_svc-home.scss` (`.svc-home .header .ask-ai span { color: #fff !important }` over a transparent header). *Category:* accessibility. *Impact:* the primary assistance action is invisible to everyone on the most visited page; measured 1.0:1. *Standard:* [WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum). *Recommendation:* give the header one background and one color relationship. *Command:* `colorize`.
- **[P1-2] No visible focus ring on two search inputs.** *Location:* `.svc-hero-search input` (`outline: none !important`, `_svc-home.scss`) and the "Kill Garden wrapper focus border" block for the catalog search. *Category:* accessibility. *Impact:* keyboard users cannot see where they are in the two main search fields. *Standard:* [WCAG 2.2 SC 2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible). *Recommendation:* draw the ring around the pill and the wrapper. *Command:* `harden`.
- **[P1-3] Placeholders and counts fail contrast.** *Location:* hero and item-page search placeholders (`#9aa1ad`, 2.6:1), catalog sidebar counts (`#848f99`, 2.65:1 on the selected tint), the Garden search placeholder (3.3:1), the help-banner subtext (4.48:1). *Standard:* WCAG 1.4.3. *Recommendation:* the NEXUS muted text token (4.7:1). *Command:* `colorize`.
- **[P1-4] Horizontal overflow at 390px.** *Location:* Device FAQs (`.custom-os-tile` rows with fixed widths and a -275px margin, 607px document) and the article breadcrumb list (404px). *Standard:* [WCAG 2.2 SC 1.4.10](https://www.w3.org/TR/WCAG22/#reflow). *Command:* `adapt`.
- **[P1-5] Broken Device FAQs tiles.** *Location:* `category_page.hbs` references `macOSsmall.png` and `Windows11small.png`, removed in `7803e6d7`. *Impact:* two broken images and no visible heading on the page. *Command:* `harden`.
- **[P1-6] A 1.8 MB hero image.** *Location:* `settings/service_catalog_hero_image.png` (the committed default; four settings images are 1.8 MB each). *Impact:* the largest paint on the home page; PNG does not compress further (1.85 MB gzipped). *Command:* `optimize`.
- **[P1-7] Knowledge pages break their own layout.** *Location:* `category_page.hbs` and `_category.scss` (title wraps beside an italic description; 230px dead column), `_article.scss` (84 to 104 character lines). *Category:* responsive and integrity. *Command:* `layout`.

### P2

- **[P2-1] Mostly hard-coded colors.** 36.9% of rendered color uses are off-palette (28 distinct colors); 205 of 359 source literals (87 distinct). The old link blue `#1954d0` appears 57 times across 7 of 9 pages. *Command:* `colorize`.
- **[P2-2] Four competing action colors.** Pink (hero button, card hover), dark blue `#003b91` (Submit), navy (outline buttons) and link blue (Ask AI) all act as the action color, while cyan, the NEXUS action color, appears nowhere. *Command:* `colorize`.
- **[P2-3] Nested cards on the item page.** Twelve detector findings: `.svc-topbar`, `.svc-form-panel`, `.svc-article-card` and three `.svc-card` inside `.svc-shell`. *Command:* `distill`.
- **[P2-4] Dead code.** `.svc-res-*` and `.svc-mr-*` (the live-results dropdown) and the `initSvcSearch` widget that built them, `.svc-username*`, the always-hidden header search, `.submit-a-request` desktop rules. About 300 lines. *Command:* `distill`.
- **[P2-5] Cascade warfare.** 267 `!important` declarations and 68 `[class*=` selectors in 7,404 lines of SCSS across 57 partials. *Command:* `distill`.
- **[P2-6] Type is off-scale.** Body 15px, h1 32px, h2 18 to 22px, microtext at 11, 11.5 and 12.5px; the font stacks repeat "Public Sans" and "sans-serif". *Command:* `typeset`.
- **[P2-7] Targets under 44px.** 199 interactive elements are under 24px in one dimension (all inside the spacing and inline exceptions of [SC 2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum), so not failures); 106 of them on desktop and 93 on mobile, led by article links (19px tall). *Command:* `adapt`.

### P3

- **[P3-1] Layout-property transitions** in `_notifications.scss` (`height`) and the training button (`max-width`, `width`). *Command:* `optimize`.
- **[P3-2] Tiny text.** The submit note is 11px on mobile. *Command:* `typeset`.
- **[P3-3] A cramped `figcaption`** (`padding: 10px 0`). *Command:* `polish`.
- **[P3-4] Hero chips are borderline** against the arc artwork at 390 (5th-percentile 4.09:1). *Command:* `colorize`.

## Patterns and systemic issues

- Color decisions live in three places (Zendesk settings, `--svc-*` variables, literals), so no change propagates.
- The React catalog is styled from outside by substring selectors, which makes every Garden update a risk.
- The Knowledge pages were never designed: there is no shared surface, band or rhythm.
- Focus handling is removed locally and never replaced.

## Positive findings

- Fonts are self-hosted with `font-display: swap`; both Poppins and Public Sans load on every audited page.
- The skeleton loaders reserve space for the catalog while it loads.
- Search result cards, the item-page rail and the post-submit card are well-aimed content.
- Honest engineering notes in the SCSS explain several earlier fixes.
- No horizontal overflow on home, services, service item, category, section or search.

## Recommended actions

1. **[P1] `colorize`:** token layer, one action color, accessible text and placeholders, indigo header and footer.
2. **[P1] `harden`:** focus rings, broken tiles, empty and error states, signed-out hero.
3. **[P1] `typeset`, `layout`:** the NEXUS scale and the Knowledge surfaces.
4. **[P1] `adapt`, `optimize`:** overflow and the hero image.
5. **[P2] `distill`:** dead code, nested cards, `!important`.
6. **[P2] `clarify`, then `polish`.**

Re-run the audit after the fixes to see the score move.
