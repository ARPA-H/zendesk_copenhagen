# Product

<!-- impeccable:product-schema 1 -->

> **Provenance.** The product owner was unavailable for the Impeccable `init`
> interview on 2026-10-12, so this record is written from repository evidence
> and the task brief. Facts marked *Inferred* come from `PLAN.md`, `AGENTS.md`,
> `manifest.json`, the templates and the theme source; they are hypotheses, not
> approvals. Facts marked *Task brief* come from the request that started this
> work. Correct any *Inferred* line and the later design passes follow.

## Platform

web

A Zendesk Guide (Help Center) theme: Curlybars templates (a large subset of
Handlebars, see the [Templating API v4 reference](https://developer.zendesk.com/api-reference/help_center/help-center-templates/introduction/)),
SCSS compiled to `style.css`, vanilla ES2015 compiled to `script.js`, and React
19 modules bundled to `assets/` for the service catalog, request forms,
request list and approvals. Mobile web is part of the same product.

## Users

*Inferred.* **Primary: ARPA-H staff** (employees, contractors, detailees) who
are signed in to the Help Center and need IT help mid-task: request a service
from the catalog, find a how-to article, check a request or an approval. The
home page copy and popular searches (PIV certificate renewal, lost or stolen
device, lost or stolen PIV card, SharePoint, shared mailboxes and distribution
lists) show the jobs: get a device or access fixed fast, with as little form
filling as possible. Staff arrive on managed macOS and Windows laptops and on
phones.

*Inferred.* **Secondary: Service Desk staff and Guide admins** who curate
catalog items and Knowledge articles in Zendesk and receive the resulting
requests there. They preview draft items in the theme (`?preview=true`); they
do not work inside this theme.

*Owner-confirmed.* **Visitors and sign-in.** help.arpa-h.gov is a public .gov
site, and the Help Center has two models: anonymous and authenticated. The
search hero, the popular-search chips, the service catalog and the Knowledge
band on the home page stay behind authentication; signed-out visitors see the
alert banner and sign-in. The `.gov` banner shows to everyone.

## Product Purpose

*Inferred, from `PLAN.md`.* ARPA-H runs its IT service catalog and staff
self-service portal on Zendesk Guide, at the public address help.arpa-h.gov,
using this theme. The theme
rebrands Copenhagen to ARPA-H's identity and extends it with an agency-specific
Service Catalog (request forms, a chat launcher, an "Ask AI" link). The home
page leads with the catalog instead of Copenhagen's stock category blocks and
promoted articles; the community, request and approval templates still ship and
inherit the same tokens. The **Knowledge** side is the
Guide knowledge base: categories, sections, articles and search results.

**Success, in this inferred order of priority (unconfirmed):**

1. **The right service or answer in seconds.** The home page leads with search
   and browsing; catalog and Knowledge are one experience, not two products.
2. **Requests that arrive complete.** Field validation, preview of related
   articles while typing, and one clear submit path reduce back-and-forth with
   the Service Desk.
3. **Fewer avoidable tickets.** A good article or self-service item resolves
   the need before a general request is filed.

## Positioning

A thin presentation and orchestration layer over Zendesk's own primitives:
Guide articles and search, the Service Catalog API, ticket forms and requests.
No workflow state lives in the theme; it reads from Zendesk and writes through
documented public REST APIs only. Its distinct mechanism is a home that greets the
signed-in person, leads with Zendesk's instant search and popular searches, and
shows the catalog beside its category tree, with the same visual system carried
into Knowledge pages.

## Operating Context

- **Host.** Zendesk Guide serves the theme. `style.css` is processed by
  Zendesk's ZASS, so Zendesk settings (the font, image and alert banner
  settings) are substituted server-side; colors come from the design tokens,
  not from settings. Zendesk-rendered components, such as instant search,
  cannot be restyled beyond the hooks Guide exposes.
- **Delivery.** GitHub Actions rebuild the theme and upload it through the
  Theme Update Job when changes reach `sandbox` (sandbox Zendesk) or `main`
  (production). Feature branches and pull requests never deploy; this work
  never touches a Zendesk environment.
- **Release flow.** `sandbox` is where day-to-day work lands before it is
  promoted to `main`. Conventional commits are enforced.
- **Locales.** Upstream ships about forty locales and RTL support; the fork's
  custom templates are mostly English (a known gap). New CSS keeps RTL working
  by using logical properties.
- **Rhythm.** Visits are short and task-driven. The home hero uses Zendesk's
  native instant search; the catalog page fetches categories on load and items
  for each search, filter, sort and page. (`src/svcSearch.js` still contains a
  cache-backed live-search widget, `initSvcSearch`, that no template calls;
  only its `svcSafeHref` helper is used. It is a removal candidate for the
  distill phase.)

## Capabilities and Constraints

### Capabilities (confirmed in the source)

- Service Catalog home and list: greeting, native instant search in the hero,
  popular-search chips, category tree sidebar, search, sort, service cards,
  "General request" fallback.
- Service item page: request form with inline validation, suggested Knowledge
  articles as the person types, helper cards, optional training button.
- Knowledge: category page (with an OS tile layout for one category), section
  page, article page (sidebar of articles in section, votes, related and recent
  articles), search results with filters.
- Requests list and detail, approval requests, new request form.

### Technical constraints

- ES2015 only for `script.js`; no Babel. Do not hand-edit `script.js`,
  `style.css` or `assets/*-bundle.js`; they are generated by `yarn build`.
- No third-party font CDN: Public Sans and Poppins are self-hosted in `assets/`.
- Curlybars is only a subset of Handlebars. `{{t}}` resolves only keys Guide
  exposes; never run `yarn download-locales` in this fork (see `AGENTS.md`).
- Only public, documented Zendesk REST APIs.
- `category_page.hbs` hard-codes one category ID and three section IDs for the
  OS tiles; moving them to settings is a known follow-up, not part of this work.
- ESLint (`.eslintrc.js`) keeps the `approval-requests`, `new-request-form` and
  `service-catalog` modules from importing any other feature module; they may
  import `shared`, `test`, `ticket-fields` and `flash-notifications`, which
  import only each other.

### Decided with the owner

- The `.gov` banner is required (the site is public): it is built from the
  `@uswds/uswds` package in isolation and shown on every page, unmodified (the
  NEXUS reference says the banner must never be visually modified). The rest of
  the USWDS library stays out.
- The home page gets a Knowledge entry point (a "Browse help articles" band),
  for signed-in people only, with the hero, chips and catalog.
- The service item page is rebuilt: no greeting band, step pills, helper cards
  or nested shells.
- Expressive phases are moderate: state motion plus one signature moment per
  key page, always honoring reduced motion.
- The Admin Center color and Logo settings stay removed.
- The hero search button is hot pink with a white magnifier. Ask AI stays cyan
  with indigo text.

### Explicitly undecided (do not invent)

- Dark mode (not provided by Guide; none is built).
- Analytics, usage metrics and service-desk volumes: none were provided.

**Terminology.** Service Catalog; service (catalog item); category; request;
Service Desk; Knowledge (the Guide knowledge base); article; section; General
request; Ask AI.

## Brand Commitments

- **ARPA-H NEXUS Design System** (the `arpa-h-web-design` skill in
  `.github/skills/arpa-h-web-design`) is binding for color (*Task brief*) and
  is followed for type, shape and component conventions where Guide allows:
  indigo `#000334`, cyan `#52daf2`, navy `#001b5e`; Poppins for display,
  h1 and h2; Public Sans for body and h3 to h6; pill buttons with a cyan
  primary and indigo text (the hero search button is hot pink, an owner
  exception); 16px cards.
- **NEXUS-aligned, not NEXUS-conformant.** The skill treats USWDS core as a
  prerequisite of every NEXUS web project. The owner chose to install
  `@uswds/uswds` for the `.gov` banner only: the banner is compiled from the
  package in isolation (no global selectors; 0 of 4,689 measured elements
  change). NEXUS sits on top of the
  [U.S. Web Design System](https://designsystem.digital.gov/), whose package
  [contains all the styles for USWDS components](https://designsystem.digital.gov/documentation/getting-started/developers/phase-two-compile/).
  This theme adopts the NEXUS tokens (color, type, spacing, radius, elevation,
  focus) and component conventions through its own SCSS and leaves out the
  USWDS reset, grid and utilities: the full library would change 17% of
  rendered elements (it grows the Garden catalog search field from 47 to 54
  pixels), and Guide renders much of the markup itself (search form,
  breadcrumbs, votes, pagination), so `usa-*` classes cannot be applied. The
  measurements are in `docs/design-plan.md`.
- **Feedback colors are for status only.** Yellow, green and red mark warning,
  success and error messages. Persistent UI, accents and decoration use cyan,
  blue, violet, turquoise and pink only (rule from the skill).
- **Cyan is the action color.** Static elements do not borrow it (a lesson
  from [ARPA-H/zendesk_onboarding_offboarding#41](https://github.com/ARPA-H/zendesk_onboarding_offboarding/pull/41)).
  The one exception is the hero search button, which the owner chose to make
  hot pink (`#fd4497`, the NEXUS Accent Warmer) with a white magnifier: white is
  3.26:1 on that pink, enough for a graphic but not for text, so Ask AI keeps
  its cyan and indigo.
- **Keep the current signature recognizable** (*Task brief*): the dark gradient
  hero with the Poppins greeting, the pill search, the popular-search chips and
  the rounded catalog card are carried forward, not replaced.
- The `arpa-h-internal-design` skill does not apply to this theme (`AGENTS.md`).
- **Voice** (*Inferred*): plain, second person, service-oriented ("What do you
  need help with today?", "Submit to the Service Desk."). No marketing register.
- **Assets:** `assets/arpa-h-logo*.svg` and `assets/arpa-h-logomark*.svg`;
  `settings/service_catalog_hero_image.png` (the hero artwork).

## Evidence on Hand

- `PLAN.md` (session log and rationale), `AGENTS.md`, `manifest.json`,
  `templates/`, `styles/`, `src/`, and `thumbnail.png` (a screenshot of the
  current Service Catalog home).
- A scored baseline critique ([`docs/design-critique-2026-10-12.md`](docs/design-critique-2026-10-12.md))
  and audit ([`docs/design-audit-2026-10-12.md`](docs/design-audit-2026-10-12.md)),
  both built on offline renders of the real templates (Zendesk helpers stubbed,
  API mocked); later phases add their own.
- Absent, and not to be fabricated: usage analytics, user research,
  testimonials, support volumes, and visual-regression goldens.

## Product Principles

1. **Answers before tickets.** Put the article or service that solves the
   problem in front of the person before asking them to file anything.
2. **One front door.** Services and Knowledge share one entry point, one visual
   system and one vocabulary. Search is not unified today (the hero searches
   Knowledge articles through Zendesk; the catalog's "Search for services"
   control uses the Service Catalog API), so every search control must say what
   it covers.
3. **Zendesk stays the system of record.** Reskin and extend Guide; derive
   state from Zendesk; hold none of our own.
4. **Earned familiarity.** Guide conventions and NEXUS tokens carry the
   interaction model; ARPA-H identity lives in a few signature moments, not in
   every component.
5. **Accessible by default.** Meet the standard first; then make it pleasant.

## Accessibility & Inclusion

- **Section 508 is binding.** The 2018 refresh of the [Section 508
  Standards](https://www.section508.gov/manage/laws-and-policies/) harmonized
  with WCAG 2.0. This repo's pull request template asks for WCAG 2.1; this work
  targets **WCAG 2.2 AA** where it does not conflict (visible focus, target
  size of at least 24 by 24 CSS pixels, see
  [SC 2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum)).
- Keyboard-complete, screen-reader labeled, reflows at 320px and 200% zoom,
  honors `prefers-reduced-motion`, and stays legible in `forced-colors` mode.
- **Right-to-left** layouts keep working: prefer logical properties.
- Color is never the only signal; every text and control pairing is checked
  for contrast, and the NEXUS focus ring (`0 0 0 1px #0957be, 0 0 3px 1px
  #0957be`) is the focus indicator.
