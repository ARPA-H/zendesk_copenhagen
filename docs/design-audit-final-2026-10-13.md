# Design audit: final, 2026-10-13

A technical audit of the theme after Phase 9 and the Phase 10 polish, with the baseline audit's method and scale. It documents issues for the owner and later passes; it fixes nothing (the polish fixes are recorded in the plan). Evidence comes from the offline render checks (the theme's real templates with Zendesk helpers stubbed and the API mocked, headless Chrome at 1440 and 390 pixels wide), axe-core 4.13, the Impeccable detector, the Phase 8 load measurements, the unit suite and the source. The baseline is the commit before the first design change (`f2a7bb42`), re-measured with the same scripts; the [baseline audit](design-audit-2026-10-12.md) recorded it at 10/20.

## Audit Health Score

| # | Dimension | Baseline | Final | Key finding |
| --- | --- | --- | --- | --- |
| 1 | Accessibility | 2 | 3 | axe-core finds nothing on all 18 states (46 rule hits at baseline); no text pair or placeholder under 4.5:1 (21 elements before); all 691 Tab stops show a focus change (10 did not); target size passes WCAG 2.5.8 everywhere. Not yet verified: a screen reader, forced colors on Windows, a real RTL locale, Zendesk's instant search |
| 2 | Performance | 2 | 3 | On a phone profile the home page's largest paint went from 11.5 to 7.1 seconds and its layout shift from 0.148 to 0.027, and Knowledge pages dropped from 261 to 12 KB of script; the 929 KB hero artwork still bounds the home page |
| 3 | Responsive design | 2 | 3 | No horizontal overflow on any of the 18 loads (two before) or across five widths; no target under 24 pixels without an exemption; 77% of targets are under 44 pixels, which passes AA and not the AAA target |
| 4 | Theming | 2 | 3 | 0 of 1,640 rendered colors are off the palette (35.7% before) and the token gate prints nothing; no dark theme exists to evaluate; one inherited illustration carries 28 off-palette grey values |
| 5 | Implementation integrity | 2 | 3 | One token layer, named rules, gates and 98 test suites; the detector's 46 findings are 41 in the generated stock banner, the training button's measured width transition and four in another module (three false positives); 201 `!important` rules and 16 selectors on Garden's generated class names remain |
| | **Total** | **10/20** | **15/20** | **Good: address weak dimensions** |

Scores are by the audit scale (3 means good, 4 excellent). Accessibility and theming stay at 3 for reasons that are not defects in the code: the first has areas the harness cannot verify, and the second has no dark theme to judge (this theme has none and none was in scope), which the scale's 4 assumes.

## Implementation integrity verdict

**Pass.** The theme is now one coherent, product-specific system, where the baseline was layered patches. One token layer (`styles/_tokens.scss`) owns color, type, space, radius, shadow and motion; the React (Garden) theme mirrors the palette under a drift test; named rules in `DESIGN.md` (cyan is action, feedback only, no raw color, one source, visible focus, touch, forced colors, print, load, motion) each have a check or a measurement behind them; and the plan records every decision with its numbers. The baseline's findings are gone: nested cards, the dead search CSS and widget, the stacked header overrides, the missing assets and the stray side-border accents (the detector's baseline findings were two layout transitions and two colored side borders; one layout transition remains, the training button's, measured at 0.67 ms of layout for a whole hover). What the detector reports now is mostly the stock USWDS banner, which is generated and must never be restyled: 41 of its 42 findings in `styles` are in `_usa-banner-generated.scss`.

## Executive summary

- Audit Health Score: **15/20** (Good), from 10/20.
- Issues: 0 P0, 0 P1, 4 P2, 6 P3.
- Top findings: icon data is requested from a public third-party API at runtime; the hero artwork still bounds the phone home page; a failed submit has no error summary; and four things a harness cannot verify (screen readers, Windows forced colors, a real RTL locale, instant search).
- Next steps: the owner's decisions on the icon source and the hero format, then a verification pass in the sandbox.

## Detailed findings

### P2

**[P2] Service icons are fetched from a third-party API at runtime.** Location: `src/modules/shared/service-icons/iconConfig.ts`, the `iconify_api_base` setting in `manifest.json` (empty). Category: Implementation integrity (privacy and CSP). Impact: each catalog page asks Iconify's public API for icon data (`api.iconify.design`, with `api.simplesvg.com` and `api.unisvg.com` as fallbacks), a third-party request carrying the visitor's address and the page's referrer from a .gov site; an agency proxy or a content security policy can block it, and a card then shows its fallback (the offline render blocks all three hosts on every home and services load). Standard: the same concern `_svc-tokens.scss` records for fonts ("third-party font CDNs are a privacy/CSP concern on a federal site"). Recommendation: point `iconify_api_base` at a self-hosted [Iconify API](https://iconify.design/docs/api/), or move the cards to `[icon: file.svg]` references served from theme assets. The code documents both. Suggested command: `harden` (an owner decision first).

**[P2] The hero artwork bounds the phone home page.** Location: `settings/homepage_background_image.png` (929,092 bytes, lossless; 1,851,030 before). Category: Performance. Impact: on the phone profile (Slow 4G, 4x CPU) the home page's largest paint is 7.1 seconds and bound by that download; WebP at quality 95 is 312 KB and measured 3.7 seconds with a mean error of about 0.5 in 255. Standard: [Largest Contentful Paint](https://web.dev/articles/lcp), good at 2.5 seconds or less. Recommendation: try a WebP hero in the sandbox (Zendesk's acceptance of WebP in a settings upload could not be confirmed offline). Suggested command: `optimize`.

**[P2] A failed submit has no summary and says the same thing for every field.** Location: `ServiceCatalogItem.tsx`, `useValidateServiceItemForm.ts`. Category: Accessibility. Impact: focus now moves to the first field that shows an error, of any type (Phase 10), but a person who has two or three fields to fix is told "This field is required." beside each one and nothing says how many or which, and the server error says "Give it a moment and try it again". Standard: [WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) and [3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html) are met by the text beside each field; a summary is the stronger pattern. Recommendation: a "2 fields need attention" summary with links, field names in the messages, and a retry hint on the server error. Suggested command: `harden`.

**[P2] Four things are unverified.** A screen reader (NVDA, JAWS, VoiceOver), forced colors on Windows (the checks use Chrome's emulation), a real RTL locale (pages were rendered with `dir="rtl"`, which the React form controls need a locale to confirm) and Zendesk's instant-search component (not emulated). Category: Accessibility. Impact: these are the likeliest places for a defect the harness cannot see. Recommendation: one verification pass in the sandbox after merge. Suggested command: `audit` again, on the sandbox.

### P3

- **The catalog count may announce less reliably when the category changes.** `ServiceCatalogList.tsx` replaces the count row while the skeleton shows, so the live region is new each time; a search and a sort, where the same element changes its text, announce. Standard: [WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Suggested command: `harden`.
- **On the search page the filter headings come before the h1 in the document.** The two sidebar `h3` headings ("Type" and "By category") precede the page's `h1`, as at baseline; there are no skipped levels. The order follows the mobile layout (filters above results). Suggested command: `harden`.
- **Most targets are under 44 pixels.** 530 of 686 controls (77.3%; 76.7% before), mostly footer links (29 pixels), popular chips (33) and breadcrumbs (16), every one passing the 24 pixel minimum by size or spacing. Standard: [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) met; the 44 pixel AAA target is not. Suggested command: `adapt`.
- **An inherited illustration is the one off-palette literal outside the tokens and the generated banner.** `templates/search_results.hbs` line 268 is Copenhagen's own 8 KB no-results SVG with 28 grey values (`#cccccc` and `#f2f2f2`); it shows only on a search with no results. Suggested command: `colorize`.
- **The stylesheet leans on the cascade and on Garden's class names.** 201 `!important` declarations (268 at baseline, counted the same way) and 16 `[class*="..."]` selectors on Garden's generated class names; if a Garden upgrade renames a class the rule stops matching and Garden's default shows, which is a mild failure, but each is a place to re-check. The home and services templates are also hand-synced copies. Suggested command: `distill`.
- **Pager spacing depends on markup the harness only stubs.** The two pager buttons touch in the offline render because the stub writes the list items with no whitespace; Zendesk's own output cannot be checked without a Zendesk environment. Suggested command: `polish`, in the sandbox.

Checked and not a finding: `prefers-reduced-motion`. The audit scale asks to flag a global 0.01 ms kill that destroys useful feedback. The theme's motion tokens do fall to 0.01 ms under the preference, but that is scoped to the theme's own transitions, no animation of `transform` or layout remains with the preference on (one Garden chevron turn was held still), and the one arrival cue has an alternative that keeps its meaning: a heading reached by a link keeps a plain tinted highlight, or a 2 pixel outline in forced colors. State changes stay instant and visible. Color and opacity fades are not motion under [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), so keeping them under the preference would also be compliant; taking them to near zero was a simplicity choice, and splitting the tokens by property would reverse it.

## Patterns and systemic issues

- **Runtime third parties are the one place the theme reaches outside the agency.** Fonts are self-hosted and the toast host no longer loads where nothing can toast, but the icon API is a live call; it is the same class of concern the theme already guards against for fonts.
- **Inherited exceptions are enumerated and gated.** The color literals outside the tokens are three files (the generated banner, the token definitions and the inherited illustration), and the token gate prints nothing for `styles`; the banner is checked for drift against the installed USWDS package.
- **Garden's generated class names are the main fragility.** Every override that cannot use a stable hook matches a class name from a package version; a pinned version keeps them working, and an upgrade needs a pass.
- **Stylesheet weight went up while page weight went down.** `style.css` grew from 32.7 to 40.2 KB gzipped (183,887 to 227,762 bytes raw) as the system was built (tokens, the banner, the footer, print, forced colors); `script.js` fell from 15.2 to 12.2 KB gzipped, the shared bundle from 259 to 254 KB, the hero from 1.85 to 0.93 MB, and Knowledge pages no longer load the 254 KB shared bundle at all.

## Positive findings

- Contrast, focus, target size, reflow, forced colors, print, reduced motion, language marks and text spacing were each measured and fixed where they failed, and axe-core finds nothing on all 18 states.
- Every Tab stop on every harness page shows a focus change, and the first control in the main content is five Tab presses away on a phone and six on a desktop (one more than before: the stock banner's button is now the second stop after the skip link).
- No horizontal overflow at 390 pixels on any page (the Device FAQs page was 607 pixels wide and the article page 404 at baseline).
- The load is measured, not assumed: layout shift 0.027, blocking time 0 to 86 ms, every interaction under 60 ms at 4x CPU slowdown on the services page.
- The token layer is enforced: a grep gate for raw colors, a drift test between the CSS and the React palette, a drift check on the generated banner, and a build that regenerates every artifact from source with no drift.
- Review findings were each measured before a change, and where a test could express the fix it fails on the old code.

## Recommended actions

1. **[P2] `harden`:** decide where service icons come from (a self-hosted Iconify API or theme SVG files) and set it.
2. **[P2] `optimize`:** try a WebP hero in the sandbox; the phone home page would go from 7.1 to about 3.7 seconds.
3. **[P2] `harden`:** an error summary on the request form, field names in the messages, a retry hint on the server error.
4. **[P2] `audit`:** a verification pass in the sandbox with a screen reader, Windows forced colors, a real RTL locale, instant search and the pager markup.
5. **[P3] `adapt`, `distill`, `colorize`, `polish`:** the remaining small items above, in any order.

You can ask for these one at a time, all at once or in any order; re-run `audit` after fixes to see the score change.
