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

## Assumptions

The product owner could not be reached when the work started, so these
decisions were made from the repository and the brief. Each is easy to reverse.

1. **Scope.** Service Catalog (home, list, item), Knowledge (category,
   section, article, search results) and the shared chrome (header, footer,
   alert banner, breadcrumbs, buttons, forms). Community, profiles, requests
   and approvals inherit the new tokens and receive no bespoke redesign.
2. **Direction.** Extend the existing signature into Knowledge; keep the
   information architecture. Cyan is the action color only. Pink, violet,
   turquoise and blue are accents. Yellow, green and red are feedback only.
3. **Header.** The NEXUS indigo navigation bar with the reverse logo, as the
   skill's restyling checklist specifies. No `.gov` banner is added; the portal
   is internal and the requirement is unconfirmed.
4. **Phases.** All Impeccable commands except `live`, which needs an
   interactive browser session. `bolder` and `quieter` pull in opposite
   directions, so both are evaluated and each is applied only where the
   critique calls for it; a command with nothing to do is recorded as a no-op
   with the reason. The expressive phases (`bolder`, `animate`, `delight`,
   `overdrive`) are restrained and respect reduced motion.
5. **Copy.** Microcopy only. Service names, popular-search chips, article
   content and every string that comes from Zendesk stay as they are.
6. **NEXUS-aligned, not NEXUS-conformant.** The skill's rule is that every
   NEXUS web project installs `@uswds/uswds` (NEXUS layers on top of the
   [U.S. Web Design System](https://designsystem.digital.gov/)). This work does
   not, so it is described as NEXUS-aligned (tokens, color, type, shape and
   component conventions) and the deviation is a requested exception that the
   product owner must approve before merge; the alternative is a follow-up that
   installs USWDS safely scoped and adds the `.gov` banner.
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
   | `.gov` banner | Open decision, see below |

7. **Commits.** Created through GitHub's `createCommitOnBranch` mutation, which
   [signs commits and marks them Verified](https://github.blog/changelog/2021-09-13-a-simpler-api-for-authoring-commits/),
   because the local Secretive key needs Touch ID for every signature.

## Phases

| Phase | Command | What changes | Status |
| --- | --- | --- | --- |
| 0 | `init`, `critique`, `audit` | PRODUCT.md, a scored baseline critique ([23/40](design-critique-2026-10-12.md)) and audit ([10/20](design-audit-2026-10-12.md)) | Done |
| 1 | `colorize`, `document` | Token layer, NEXUS color rules, indigo header and footer, pill buttons, focus ring, and the React (Garden) theme mapped onto NEXUS; DESIGN.md is written from the built system | Done |
| 2 | `typeset` | One NEXUS type scale in `rem` tokens (12 to 40 pixels, eight sizes in use): Poppins for the greeting and h1 and h2, Public Sans for everything read or pressed; a 70-character prose measure; tabular numerals; rewritten article, table and heading rhythm; the Garden theme on the same scale; the dead `.svc-hero-results`, `.svc-res-*`, `.svc-mini-*` and `.svc-mr-*` styles removed | Done |
| 3 | `layout` | Spacing scale, containers, Knowledge page layouts, catalog rhythm; the NEXUS header title separator and Solutions footer structure (logo, site navigation row, divider, centered auxiliary links, copyright) | In progress: footer and hero done |
| 4 | `harden` | Empty, error and loading states; long text; RTL; forced colors | Planned |
| 5 | `distill` | Remove dead and duplicated styles and markup that remain after phase 2 (which already deleted the unused hero-results and mini-form styles), including the unused `initSvcSearch` widget in `src/svcSearch.js` | Planned |
| 6 | `clarify` | Microcopy (labels, placeholders, empty and error states); every search control says what it covers, since the hero placeholder mentions services but Zendesk's native search covers articles | Planned |
| 7 | `adapt` | Responsive behavior, touch targets, print, high contrast, reflow | Planned |
| 8 | `optimize` | CSS weight, font loading, layout shift, images | Planned |
| 9 | `onboard`, `bolder`, `quieter`, `animate`, `delight`, `overdrive`, `extract` | Restrained expressive layer and token extraction; `bolder` targets the Knowledge pages, `quieter` anything the critique finds excessive | Planned |
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

- **Owner decision before merge:** approve the USWDS exception, or ask for a
  follow-up that installs USWDS core, which would also bring the `usa-banner`
  that the skill requires on `.gov` sites.
- Whether a `.gov` banner is required.
- Whether to rename the Help Center so the header reads "ARPA-H | Service Desk": the site title shows the Help Center name, and a name that starts with ARPA-H repeats the logo (the offline render uses "ARPA-H Service Desk"). The name is a Zendesk Admin Center setting; the theme only displays it, and the Show Help Center name setting turns the title off.
- Whether the footer's mandatory auxiliary links, which point at public HHS and arpa-h.gov policy pages, belong on an internal portal.
- Whether pages without their own search (requests, profiles) should get a search entry point: the base theme hid the header search on every page (`_svc-tokens.scss` at the base commit), so this work removed dead markup rather than a visible control.
- Whether Knowledge needs its own entry point on the home page.
- Moving the hard-coded OS tile IDs in `category_page.hbs` into settings.
