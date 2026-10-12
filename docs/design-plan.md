# Design plan: NEXUS for the Service Catalog and Knowledge

Status: in progress on `impeccable-design-passes` (one combined pull request
against `sandbox`). Nothing here deploys to Zendesk; deploys run only from
`sandbox` and `main`.

## Goal

Bring the Service Catalog and the Knowledge pages (category, section, article,
search results) onto one coherent, NEXUS-aligned visual system built from the
ARPA-H tokens and component conventions in the `arpa-h-web-design` skill, while
keeping today's recognizable
signature: the dark gradient hero with the Poppins greeting, the pill search,
the popular-search chips and the rounded catalog card. The work runs every
Impeccable phase in turn; each phase ends in a push, a Copilot review, and a
reply to every finding.

## Owner decisions

The product owner joined during Phase 3 and answered these questions. They
supersede the assumptions below wherever the two differ.

1. **USWDS: the banner only.** help.arpa-h.gov is a public .gov site, so the
   [official banner](https://designsystem.digital.gov/components/banner/) is on
   every page, signed in or not. It is built from the real `@uswds/uswds` 3.14.0
   package (a devDependency with no advisories in the GitHub Advisory Database)
   by `bin/build-usa-banner.mjs`, which compiles only the banner, the accordion
   base and the media block and maps the USWDS colors onto NEXUS role tokens.
   Measured offline over 9 pages at 1440 and 390 pixels wide (4,689 elements,
   625 of them Zendesk Garden):

   | Build | Size (minified, gzip) | Global rules | Elements changed | Garden elements changed |
   | --- | --- | --- | --- | --- |
   | Banner only | 18.5 KB, 2.6 KB | 0 | 0 | 0 |
   | Full library, loaded before the theme | 527 KB, 61 KB | 58 | 801 (17%) | 466 of 625 |
   | Full library, loaded after the theme | 527 KB, 61 KB | 58 | 2,919 (62%) | 520 of 625 |

   The full library grows the Garden catalog search field from 47 to 54 pixels
   (which shifts everything below it), gives every image `max-width: 100%`, sets
   `overflow-x: hidden` on `body`, and adds a blue focus outline that fights the
   NEXUS ring. Zendesk [caps `style.css` at 800 KB](https://support.zendesk.com/hc/en-us/articles/4408831783962-Knowledge-product-limits-for-your-help-center)
   and this one is 196 KB, so inlining it would reach 723 KB. The USWDS reset,
   grid and utilities therefore stay out: an intentional exception backed by
   measurement.

   The banner is compiled in its own step because the theme's build cannot read
   USWDS: `rollup-plugin-sass` bundles Dart Sass 1.66, and USWDS 3.14 uses the
   [`if(sass(...))` syntax](https://sass-lang.com/documentation/breaking-changes/if-function/)
   that only newer Sass accepts. Moving the whole theme to the repo's Sass 1.105
   rewrote 352 lines of `style.css`, because Sass 1.77.7 and later keep
   [declarations after a nested rule in source order](https://sass-lang.com/documentation/breaking-changes/mixed-decls/),
   which would let base styles beat the theme's responsive overrides. So only
   the banner is compiled with the newer Sass (`yarn build:usa-banner`, which
   `yarn build` runs first), and the theme imports the result as plain CSS.
2. **Knowledge entry point on the home page: yes, signed in only.** The Help
   Center has an anonymous and an authenticated model. The search hero, the
   popular chips, the service catalog and the new Knowledge band all stay
   behind authentication.
3. **Service item page: a full rebuild** per the critique: remove the greeting
   band, the step pills, the helper cards and the nested shells; one form
   column beside a help rail. Neither NEXUS nor Garden requires this; it follows
   Impeccable's [nested cards](https://impeccable.style/anti-patterns)
   guidance and the baseline audit.
4. **Expressiveness: moderate.** State motion plus one signature moment on each
   key page (home hero, catalog card hover, article header, request success),
   all honoring `prefers-reduced-motion`.
5. **Admin Center color and Logo settings stay removed.**
6. **Hero search button: hot pink with a white magnifier**, as it was before this
   work. White on `#fd4497` is 3.26:1, enough for a graphic (3:1) but not for
   text (4.5:1), so Ask AI stays cyan with indigo text. The hero artwork keeps its
   original crop and scale.
7. **No site title in the header.** help.arpa-h.gov serves several audiences (IT
   and HR among them), and the original CSS hid the Help Center name as well.
   Phase 1 had added it from the skill's nav bar step ("Add a `| Site Title`
   text separator"); it is removed, together with the Show Help Center name
   setting that no longer does anything.
8. **The header blends into the hero** on the home and services pages: the bar
   is transparent and the artwork runs behind it, with the part behind the
   content kept where it was. Every other page keeps the solid indigo bar. The
   rounded white catalog card, the original signature, is kept.

## Assumptions

The product owner could not be reached when the work started, so these
decisions were made from the repository and the brief. Each is easy to reverse.
Items 3, 4 and 6 are refined by the owner decisions above.

1. **Scope.** Service Catalog (home, list, item), Knowledge (category,
   section, article, search results) and the shared chrome (header, footer,
   alert banner, breadcrumbs, buttons, forms). Community, profiles, requests
   and approvals inherit the new tokens and receive no bespoke redesign.
2. **Direction.** Extend the existing signature into Knowledge; keep the
   information architecture. Cyan is the action color only. Pink, violet,
   turquoise and blue are accents. Yellow, green and red are feedback only.
3. **Header.** The NEXUS indigo navigation bar with the reverse logo, as the
   skill's restyling checklist specifies, without the checklist's site title
   (owner decision 7) and blended into the hero on the home and services pages
   (owner decision 8). The `.gov` banner is added above it (owner decision 1).
4. **Phases.** All Impeccable commands except `live`, which needs an
   interactive browser session. `bolder` and `quieter` pull in opposite
   directions, so both are evaluated and each is applied only where the
   critique calls for it; a command with nothing to do is recorded as a no-op
   with the reason. The expressive phases (`bolder`, `animate`, `delight`,
   `overdrive`) are moderate and respect reduced motion (owner decision 4).
5. **Copy.** Microcopy only. Service names, popular-search chips, article
   content and every string that comes from Zendesk stay as they are.
6. **NEXUS-aligned, not NEXUS-conformant.** The skill's rule is that every
   NEXUS web project installs `@uswds/uswds` (NEXUS layers on top of the
   [U.S. Web Design System](https://designsystem.digital.gov/)). This work
   installs it for the banner only (owner decision 1), so it is described as
   NEXUS-aligned (tokens, color, type, shape and component conventions) rather
   than NEXUS-conformant, and the rest of the library stays out on measured
   evidence.
   Guide generates much of its own markup (search form, breadcrumbs, votes,
   pagination), so `usa-*` classes cannot be applied, and a second reset, grid
   and utility layer would put every page at risk without a Zendesk-hosted
   baseline to compare against. The prerequisites are met as follows:

   | USWDS prerequisite in the skill | In this theme |
   | --- | --- |
   | Reset and normalize | Copenhagen's `normalize.css` stays |
   | Grid | Copenhagen's containers, with the NEXUS spacing scale and breakpoints |
   | Fonts | Public Sans and Poppins self-hosted in `assets/`; the skill's Google Fonts CDN option is not used (`AGENTS.md` forbids font CDNs) |
   | Icon sprite | Inline SVGs in the templates |
   | Utility classes | Not used |
   | `.gov` banner | The USWDS banner, compiled from the package in isolation (see owner decision 1) |

7. **Commits.** Created through GitHub's `createCommitOnBranch` mutation, which
   [signs commits and marks them Verified](https://github.blog/changelog/2021-09-13-a-simpler-api-for-authoring-commits/),
   because the local Secretive key needs Touch ID for every signature.

## Phases

| Phase | Command | What changes | Status |
| --- | --- | --- | --- |
| 0 | `init`, `critique`, `audit` | PRODUCT.md, a scored baseline critique ([23/40](design-critique-2026-10-12.md)) and audit ([10/20](design-audit-2026-10-12.md)) | Done |
| 1 | `colorize`, `document` | Token layer, NEXUS color rules, indigo header and footer, pill buttons, focus ring, and the React (Garden) theme mapped onto NEXUS; DESIGN.md is written from the built system | Done |
| 2 | `typeset` | One NEXUS type scale in `rem` tokens (12 to 40 pixels, eight sizes in use): Poppins for the greeting and h1 and h2, Public Sans for everything read or pressed; a 70-character prose measure; tabular numerals; rewritten article, table and heading rhythm; the Garden theme on the same scale; the dead `.svc-hero-results`, `.svc-res-*`, `.svc-mini-*` and `.svc-mr-*` styles removed | Done |
| 3 | `layout` | Spacing scale, containers, Knowledge page layouts, catalog rhythm; the Solutions footer structure (logo, site navigation row, divider, centered auxiliary links, copyright); the `.gov` banner; the header blended into the hero; the signed-in Knowledge band on the home page; the service item rebuild | In progress: footer, hero, one gutter and column set, category and section grids, Device FAQs tiles, overflow fixes, the banner, the blended header and the Knowledge band done |
| 4 | `harden` | Empty, error and loading states; long text; RTL; forced colors | Planned |
| 5 | `distill` | Remove dead and duplicated styles and markup that remain after phase 2 (which already deleted the unused hero-results and mini-form styles), including the unused `initSvcSearch` widget in `src/svcSearch.js` | Planned |
| 6 | `clarify` | Microcopy (labels, placeholders, empty and error states); every search control says what it covers, since the hero placeholder mentions services but Zendesk's native search covers articles | Planned |
| 7 | `adapt` | Responsive behavior, touch targets, print, high contrast, reflow | Planned |
| 8 | `optimize` | CSS weight, font loading, layout shift, images | Planned |
| 9 | `onboard`, `bolder`, `quieter`, `animate`, `delight`, `overdrive`, `extract` | Moderate expressive layer (state motion plus one signature moment per key page, reduced-motion safe) and token extraction; `bolder` targets the Knowledge pages, `quieter` anything the critique finds excessive | Planned |
| 10 | `polish`, `audit` | Final pass, final score, docs | Planned |

## Gates

Run from the repository root; each should hold at the end of the work.

```bash
yarn eslint && yarn lint:md && yarn test && yarn build

# Token contract: no raw color literal (hex, rgb or a named color such as
# yellow) and no palette-step reference (--color-<hue>-<step>) outside
# styles/_tokens.scss; exits 0 when clean.
! grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--color-(blue|pink|violet|turquoise|green|yellow|red|cyan|indigo|navy|grey)-[a-z0-9]+\)|:[[:space:]]*(yellow|red|green|blue|orange|purple|pink|black|white|gr[ae]y)\b" styles --include='*.scss' --exclude=_tokens.scss
```

Feedback colors (yellow, green, red) are used only for messages; the review
of each phase checks that by reading the diff. Every text and control pairing
is checked for WCAG contrast, and the offline render checks below run at 1440,
768 and 390 pixels wide.

## Verifying without Zendesk

Zendesk previews (`zcli themes:preview`) read from a live instance, so they are
not used. Instead the theme's real templates are rendered offline with stubbed
Zendesk helpers and mocked API responses, then screenshotted in headless
Chrome with every non-local request blocked. Instant search is a Zendesk web
component and is not emulated; it still needs a look in the sandbox after the
pull request is merged.

## Results by phase

The numbers come from an offline render-and-measure harness that lives outside
this repository (it reads the theme and never contacts Zendesk). It loads each
page in headless Chrome at 1440 and 390 pixels wide and measures computed
styles, so the same pages and widths are compared before and after.

| Phase | Measured result |
| --- | --- |
| 1 | Across the home, services, service item, category, article and search pages (12 page views): colors outside the NEXUS palette fell from 456 of 1,264 uses (36.1%) to 0 of 1,262; text pairs below WCAG AA contrast fell from 20 to 0; keyboard-focused controls with no visible ring fell from 10 to 0. Horizontal overflow and small touch targets are unchanged and belong to phases 3 and 7. |
| 2 | Across the same pages, counting text nodes: distinct font sizes fell from 16 to 8 at 1440 pixels wide (13 to 8 at 768, 16 to 8 at 390); text under 14 pixels fell from 35.1% of nodes to 2.0% (37.3% to 2.1% at 768, 39.5% to 2.6% at 390); an article paragraph went from a 15-pixel, 706-pixel-wide measure of about 102 characters per line to 16 pixels at 70 characters (a 32em cap); body line height is 1.62 and heading line heights are 1.15 and 1.35. Detector findings over `styles` and `templates`, with DESIGN.md loaded, fell from 81 (69 font sizes off the documented ramp, 6 radii, 4 side-stripe borders, 2 layout transitions) to 6 (4 radii and 2 layout transitions, left to phases 3 and 8). |

## Open decisions

Resolved with the product owner: the USWDS exception and the `.gov` banner
(owner decision 1), the Knowledge entry point on the home page (decision 2),
the footer's policy links (help.arpa-h.gov is public, so the public HHS and
arpa-h.gov policy pages belong there) and the Admin Center settings (decision 5).
Still open:

- Whether pages without their own search (requests, profiles) should get a search entry point: the base theme hid the header search on every page (`_svc-tokens.scss` at the base commit), so this work removed dead markup rather than a visible control.
- Moving the hard-coded OS tile IDs in `category_page.hbs` into settings.
- The live [arpa-h.gov](https://arpa-h.gov/) still ships the older USWDS 1.x banner copy ("The .gov means it's official."); this theme uses the current official 3.x text. Whether the two should be aligned is a content decision for the main site's owners.
- The banner copy is English only, because a theme cannot add Help Center translation keys; USWDS publishes Spanish text if a Spanish locale is ever enabled.
