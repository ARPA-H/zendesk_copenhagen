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

*Inferred.* **Signed-out visitors** see the alert banner and sign-in; there is
no public catalog.

## Product Purpose

*Inferred, from `PLAN.md`.* ARPA-H runs its internal IT service catalog and
staff self-service portal on Zendesk Guide using this theme. The theme
rebrands Copenhagen to ARPA-H's identity and extends it with an agency-specific
Service Catalog (request forms, a chat launcher, an "Ask AI" link) in place of
Copenhagen's stock community and article layout. The **Knowledge** side is the
Guide knowledge base: categories, sections, articles and search results.

**Success, in this inferred order of priority (unconfirmed):**

1. **The right service or answer in seconds.** Search is the front door;
   catalog and Knowledge are one experience, not two products.
2. **Requests that arrive complete.** Field validation, preview of related
   articles while typing, and one clear submit path reduce back-and-forth with
   the Service Desk.
3. **Fewer avoidable tickets.** A good article or self-service item resolves
   the need before a general request is filed.

## Positioning

A thin presentation and orchestration layer over Zendesk's own primitives:
Guide articles and search, the Service Catalog API, ticket forms and requests.
No workflow state lives in the theme; it reads from Zendesk and writes through
documented public REST APIs only. Its distinct mechanism is a search-first home
that greets the signed-in person, offers popular searches, and shows the
catalog beside its category tree, with the same visual system carried into
Knowledge pages.

## Operating Context

- **Host.** Zendesk Guide serves the theme. `style.css` is processed by
  Zendesk's ZASS, so Zendesk settings (`$brand_color` and the like) are
  substituted server-side. Zendesk-rendered components, such as instant
  search, cannot be restyled beyond the hooks Guide exposes.
- **Delivery.** GitHub Actions rebuild the theme and upload it through the
  Theme Update Job when changes reach `sandbox` (sandbox Zendesk) or `main`
  (production). Feature branches and pull requests never deploy; this work
  never touches a Zendesk environment.
- **Release flow.** `sandbox` is where day-to-day work lands before it is
  promoted to `main`. Conventional commits are enforced.
- **Locales.** Upstream ships about forty locales and RTL support; the fork's
  custom templates are mostly English (a known gap). New CSS keeps RTL working
  by using logical properties.
- **Rhythm.** Visits are short and task-driven. The catalog is fetched once per
  session and cached.

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
- Modules under `src/modules` import only from `shared`, `ticket-fields`,
  `flash-notifications` and `test`.

### Explicitly undecided (do not invent)

- Whether the USWDS `.gov` banner is required. The portal is internal and
  Zendesk-hosted; no banner is added until confirmed.
- Whether Knowledge needs its own entry point on the home page.
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
  primary and indigo text; 16px cards.
- **Feedback colors are for status only.** Yellow, green and red mark warning,
  success and error messages. Persistent UI, accents and decoration use cyan,
  blue, violet, turquoise and pink only (rule from the skill).
- **Cyan is the action color.** Static elements do not borrow it (a lesson
  from [ARPA-H/zendesk_onboarding_offboarding#41](https://github.com/ARPA-H/zendesk_onboarding_offboarding/pull/41)).
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
- Offline render checks produced for this work (see `docs/`).
- Absent, and not to be fabricated: usage analytics, user research,
  testimonials, support volumes, and visual-regression goldens.

## Product Principles

1. **Answers before tickets.** Put the article or service that solves the
   problem in front of the person before asking them to file anything.
2. **One front door.** Services and Knowledge share one search, one visual
   system and one vocabulary.
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
