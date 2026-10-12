# Design plan: NEXUS for the Service Catalog and Knowledge

Status: in progress on `impeccable-design-passes` (one combined pull request
against `sandbox`). Nothing here deploys to Zendesk; deploys run only from
`sandbox` and `main`.

## Goal

Bring the Service Catalog and the Knowledge pages (category, section, article,
search results) onto one coherent visual system built from the ARPA-H NEXUS
tokens in the `arpa-h-web-design` skill, while keeping today's recognizable
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
   interactive browser session. The expressive phases (`bolder`, `animate`,
   `delight`, `overdrive`) are restrained and respect reduced motion.
5. **Copy.** Microcopy only. Service names, popular-search chips, article
   content and every string that comes from Zendesk stay as they are.
6. **Commits.** Created through GitHub's `createCommitOnBranch` mutation, which
   [signs commits and marks them Verified](https://github.blog/changelog/2021-09-13-a-simpler-api-for-authoring-commits/),
   because the local Secretive key needs Touch ID for every signature.

## Phases

| Phase | Command | What changes |
| --- | --- | --- |
| 0 | `init`, `document`, `critique`, `audit` | PRODUCT.md, DESIGN.md, a scored baseline critique and audit |
| 1 | `colorize` | Token layer, NEXUS color rules, indigo header, pill buttons, focus ring |
| 2 | `typeset` | Poppins display and headings, Public Sans body, one type scale |
| 3 | `layout` | Spacing scale, containers, Knowledge page layouts, catalog rhythm |
| 4 | `harden` | Empty, error and loading states; long text; RTL; forced colors |
| 5 | `distill` | Remove dead and duplicated styles and markup |
| 6 | `clarify` | Microcopy (labels, placeholders, empty and error states) |
| 7 | `adapt` | Responsive behavior, touch targets, print, high contrast, reflow |
| 8 | `optimize` | CSS weight, font loading, layout shift, images |
| 9 | `onboard`, `bolder` or `quieter`, `animate`, `delight`, `overdrive`, `extract` | Restrained expressive layer and token extraction |
| 10 | `polish`, `audit` | Final pass, final score, docs |

## Gates

Run from the repository root; each should hold at the end of the work.

```bash
yarn eslint && yarn lint:md && yarn test && yarn build
```

No raw color literals in the in-scope partials outside the token files, and no
decorative use of the feedback colors (the commands are refined as the token
layer lands). Every text and control pairing is checked for WCAG contrast, and
the offline render checks below run at 1440, 768 and 390 pixels wide.

## Verifying without Zendesk

Zendesk previews (`zcli themes:preview`) read from a live instance, so they are
not used. Instead the theme's real templates are rendered offline with stubbed
Zendesk helpers and mocked API responses, then screenshotted in headless
Chrome with every non-local request blocked. Instant search is a Zendesk web
component and is not emulated; it still needs a look in the sandbox after the
pull request is merged.

## Open decisions

- Whether a `.gov` banner is required.
- Whether Knowledge needs its own entry point on the home page.
- Moving the hard-coded OS tile IDs in `category_page.hbs` into settings.
