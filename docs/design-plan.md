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
   base and the media block and emits them exactly as USWDS ships them: the
   NEXUS reference says the banner must never be visually modified, so no color,
   type, spacing, container or focus change is applied to it.
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
   guidance and the baseline audit. The form takes the 720px reading column and
   the rail the 320px aside column from 1024px; below that the rail drops under
   the form. The rail is static: with five suggestions it is taller than most
   viewports, and the original sticky rule could not take effect (the rail's
   column shrank to its content, so the card had no room to travel; the same
   markup scrolled away with the page when measured), so people only ever saw a
   static rail. The form module keeps a hidden action column that held a third
   of the form's width, which left the fields at about 60% of their container in
   the original; the page script now collapses that column so the fields use the
   whole reading column.
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
   | `.gov` banner | The stock USWDS banner, compiled from the package in isolation and never restyled (see owner decision 1) |

7. **Commits.** Created through GitHub's `createCommitOnBranch` mutation, which
   [signs commits and marks them Verified](https://github.blog/changelog/2021-09-13-a-simpler-api-for-authoring-commits/),
   because the local Secretive key needs Touch ID for every signature.

## Phases

| Phase | Command | What changes | Status |
| --- | --- | --- | --- |
| 0 | `init`, `critique`, `audit` | PRODUCT.md, a scored baseline critique ([23/40](design-critique-2026-10-12.md)) and audit ([10/20](design-audit-2026-10-12.md)) | Done |
| 1 | `colorize`, `document` | Token layer, NEXUS color rules, indigo header and footer, pill buttons, focus ring, and the React (Garden) theme mapped onto NEXUS; DESIGN.md is written from the built system | Done |
| 2 | `typeset` | One NEXUS type scale in `rem` tokens (12 to 40 pixels, eight sizes in use): Poppins for the greeting and h1 and h2, Public Sans for everything read or pressed; a 70-character prose measure; tabular numerals; rewritten article, table and heading rhythm; the Garden theme on the same scale; the dead `.svc-hero-results`, `.svc-res-*`, `.svc-mini-*` and `.svc-mr-*` styles removed | Done |
| 3 | `layout` | Spacing scale, containers, Knowledge page layouts, catalog rhythm; the Solutions footer structure (logo, site navigation row, divider, centered auxiliary links, copyright); the `.gov` banner; the header blended into the hero; the signed-in Knowledge band on the home page; the service item rebuild | In progress: footer, hero, one gutter and column set, category, section, article and search grids, Device FAQs tiles, overflow fixes, the banner, the blended header, the Knowledge band, the service item rebuild, the spacing sweep and the catalog title handling done; the Phase 3 review and polish remain |
| 4 | `harden` | Empty, error and loading states; long text; RTL; forced colors; heading structure; the signed-out hero | Done, reviewed: the Device FAQs heading (and a corrected heading probe), the signed-out hero, locale-aware empty states, failed loads (prompt error, no dead button), forced colors (both palettes), RTL logical properties, unclamped service names and the mobile hero artwork ("zoomed to fill": its own layer, no strip, the original colors) |
| 5 | `distill` | Remove dead and duplicated styles and markup that remain after phase 2 (which already deleted the unused hero-results and mini-form styles), including the unused `initSvcSearch` widget in `src/svcSearch.js` | Done apart from review: the widget removed (its one used helper kept in `src/safeHref.js`), the dead partials, rules and selector parts removed, the base `.button` dimmed for a native `disabled`; every page, form state and catalog interaction compared pixel for pixel with the build before |
| 6 | `clarify` | Microcopy (labels, placeholders, empty and error states); every search control says what it covers, since the hero placeholder mentions services but Zendesk's native search covers articles | Planned |
| 7 | `adapt` | Responsive behavior, touch targets, print, high contrast, reflow | Planned |
| 8 | `optimize` | CSS weight, font loading, layout shift, images | Planned |
| 9 | `onboard`, `bolder`, `quieter`, `animate`, `delight`, `overdrive`, `extract` | Moderate expressive layer (state motion plus one signature moment per key page, reduced-motion safe) and token extraction; `bolder` targets the Knowledge pages, `quieter` anything the critique finds excessive | Planned |
| 10 | `polish`, `audit` | Final pass, final score, docs | Planned |

Layout decisions made during Phase 3 (each is easy to reverse):

- **Rails stay static.** The roadmap proposed sticky article, search and
  catalog rails that scroll inside themselves. The item page showed the cost:
  with five suggestions the rail is taller than most viewports, and its
  original sticky rule could not take effect, so people only ever saw a static
  rail. The Knowledge rails were static too, and stay static.
- **Search results keep their bordered cards.** The roadmap suggested hairline
  rows, but the cards are part of the look people recognize, so only their
  spacing changed: the base list rule padded every item on top of the card gap,
  which put 52 pixels between cards, and it is now 16. The page moved onto the
  shared 240 | 48 | 720 grid, the same as the article page.
- **The article grid is rail 240, gap 48, column 720** (it was 17%, 66%
  and 30 pixel padding), with the free space on the right. Prose keeps its
  70-character cap; tables and figures use the full column.
- **The spacing sweep covers the Knowledge and catalog partials** and snaps
  raw values onto the `--space-*` scale (left and right pairs became logical
  properties, which also drops the RTL special cases). The hero's search pill
  and chips are exempt: they keep the dimensions the owner approved by eye.

Hardening decisions made during Phase 4 (each is easy to reverse):

- **Heading structure: one `h1` per page, and a correction.** The home and
  services pages already carry Zendesk's visually hidden `h1` (the Help Center
  name), with the greeting as an `h2`. An earlier pass here said those pages had
  no `h1` and promoted the greeting, which produced two; the cause was the probe,
  which skipped visually hidden headings that screen readers still announce. The
  greeting is an `h2` again, as in the stock theme, and the probe now counts
  hidden headings. The one real gap is the Device FAQs category, which shows
  tiles instead of a title and had no `h1` at all: it gets a visually hidden one.
- **The signed-out home says why it is empty.** The greeting, search and
  catalog stay behind sign-in (owner decision 2), so the hero band now carries
  a heading (an `h2`, like the greeting it replaces), one sentence and a cyan
  sign-in action instead of sitting empty.
  The wording ("Sign in to get help", "Use your ARPA-H account to search help
  articles, submit a request and follow it.") is a placeholder for the
  `clarify` phase to review; it avoids naming a service desk, because
  help.arpa-h.gov also serves HR.
- **Empty category and section pages say so**, in a styled paragraph rather than
  the stock italic link. English locales get a sentence ("There are no sections in
  this category yet.", "There are no articles in this section yet."); every other
  locale keeps Zendesk's translated "Empty" (`{{t 'empty'}}`), chosen with the
  [`contains` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#contains-helper)
  on `help_center.locale`. The split exists because `src/domFixups.js` hides any
  element whose only text is the English word "empty" (a placeholder that had
  leaked onto pages), so a bare translated word would paint nothing in English, and
  a theme cannot add Help Center translation keys. The bare `{{t 'empty'}}` was
  tried first and did exactly that: the text was in the DOM but its wrapper was
  hidden, which only showed up when the page was checked by what is painted rather
  than by its DOM text. Both pages are now checked that way.
- **Forced colors:** the white reverse wordmark vanished on the plain header
  (the palette replaces the indigo bar), pill buttons lost their shape, and a
  selected row lost its tint. Each now keeps a dark logo tile, a border or an
  outline. A later check of the hero found one more: on the home and services
  pages the header is transparent over dark artwork, so the mobile menu button's
  icon (the only navigation on phones) turned dark on dark and vanished; it now
  has a button face and a border. A Copilot review then found two gaps in the
  first pass, both confirmed: the footer uses the same white wordmark on indigo
  and vanished on a light canvas (it shares the header's dark tile now), and the
  shared primary controls (`.button-large`, the `.hbs-form` submit and the
  split button) set `border: 0`, so with the fill replaced they had no boundary
  (they get the same 1px `ButtonText` border as the other pills). The first
  pass had been checked only in Chrome's dark palette, where the wordmark stays
  visible; the audit now runs both palettes. A static scan of the compiled CSS
  for borderless filled rules found no other control that relies on its fill.
  This was checked with Chrome's forced-colors emulation, not on Windows itself,
  and the Garden form controls were not re-themed.
- **RTL:** pages were rendered with `dir="rtl"` at 1440 pixels and the grids,
  rails, header and footer mirror. The remaining physical properties in the
  Knowledge and catalog partials (blockquote border, the training button, the
  lock icon nudge, the mobile catalog toggle) are now logical. Garden reads the
  direction when it loads, so the React form controls need a real RTL locale to
  verify.
- **A real defect found on the way, and two owner corrections:** at narrow widths
  the header blend left a strip at the top of the hero (the artwork was nudged
  down by half the header's height, and on a tall, narrow hero the fitted artwork
  was only as tall as the hero), and the artwork tiled its bright bottom edge into
  it, a pink and cyan band behind the logo. The artwork no longer repeats.
  Filling the strip with flat indigo was rejected by the owner ("padding it with
  indigo isn't appropriate"). The next attempt read "1:1 pixel" as native
  resolution (one image pixel per CSS pixel); the artwork is 3456 by 2234 pixels,
  so a phone showed only a window of its bright pink bottom: 93% of the hero was
  pink (52% hot pink, none dark) against 11% pink and 75% dark before, and the
  owner called it far too pink. It was pushed in `7fa10300` before it had been
  compared with the approved look; it is replaced.

  The artwork is now a layer of its own (`.svc-hero::before`): as wide as the
  hero, one header height taller at the bottom, fitted with `cover`, centered and
  cut off at the hero's edge. At 769 pixels and wider that is where the artwork
  already sat (the same crop; a pixel diff against the previous build changes about
  0.2% of pixels by at most 20 of 255 levels, sub-pixel resampling of thin lines).
  On phones it scales up just enough to run from the top of the header to the
  bottom of the hero, so there is no strip and nothing to fill. It shows the whole
  artwork rather than a close-up of its bottom: 7.5% pink and 78% dark at 390
  pixels, 10% pink at 320 and 4.5% at 430 (the approved look was 11% at 390). The
  gap detector (a magenta fill under the artwork, any magenta pixel is a gap)
  finds none at 19 widths from 320 to 1440 and with a long first name, a case
  that opened a 9 pixel gap at 769 pixels under the old nudge. The layer is
  positioned without a z-index, so it creates no stacking context: the greeting
  (z-index 2, holding Zendesk's instant search) and the catalog card (z-index 3)
  keep their order. The indigo background remains only as the fallback while the
  artwork loads. The subtitle and "Popular:" label changes that came with the
  native-size version are reverted. Open: at 600 to 768 pixels the "Popular:" label
  sits over the artwork's cyan glow, 6.8 to 7.8:1 for the typical pixel and 3.4 to
  4.2:1 at the single lightest one; that is the original design, and `adapt` can
  decide whether it needs a scrim.
  The 1.8 MB artwork is unchanged here; `optimize` will look at its weight.
- **Failed loads show up promptly and leave no dead control.** With the catalog
  or the item API forced to 500, the skeleton used to stay for the six second
  hard cap and, on a request form, a "Submit a request" button stayed under the
  error even though there was no form behind it. The shared error screen is now
  `role="alert"` (announced to assistive technology), both pages treat that
  alert as "loaded" (the error appears in about one second), the submit button
  is hidden while the form holds no field (CSS `:has()`, [Baseline widely
  available](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has)
  since Chrome and Edge 105, Safari 15.4 and Firefox 121, and already used by
  the form validation styles), and the module's "Go to the homepage"
  button keeps its natural size instead of stretching with the form
  width overrides.
- **Service names are no longer clamped.** A Copilot review noted that the
  two-line clamp plus a native `title` tooltip left keyboard and touch users
  unable to read a long name. Names now wrap in full (a 104-character test name
  takes seven lines in a four-column row, and the other cards in the row
  stretch); the description keeps its three-line clamp. Real names are short, so
  most cards look unchanged.
- **Not changed:** the current page's breadcrumb is still link-colored (stock
  behavior), and the catalog's "No services in sight" copy still says "Enter
  your keywords" after someone has typed some; both are for `clarify`.

Distill decisions made during Phase 5 (each is easy to reverse):

- **The unused live-search widget is gone; the one helper that is used stays.**
  `src/svcSearch.js` held `initSvcSearch`, a cache-backed live-search widget that
  no template calls (the home hero uses Zendesk's native instant search), and
  `svcSafeHref`, which `templates/service_page.hbs` uses to vet the training
  button's URL and every suggested-article link. The widget (591 lines) and its
  spec are deleted; the helper moved to `src/safeHref.js` with a spec of its own
  (eight tests). A first search for the helper's callers was case-sensitive and
  missed `svcSafeHref`, which would have turned every suggested-article link into
  `#`; reading the template before deleting caught it.
- **A rule counted as dead only when four checks agreed.** None of its class
  tokens appears in a template, a script or the React sources (exact tokens, so
  `community-hero` does not count as `community`); its selector matched no element
  on any offline page, including a "kitchen sink" service with every field type,
  open dropdowns and focus states; Chrome's CSS coverage across those pages
  showed it never applied; and the markup it styled was written by a theme rather
  than emitted by Zendesk: the class sat in a template of [upstream's Copenhagen
  theme](https://github.com/zendesk/copenhagen_theme) or of this fork's history
  and was dropped from it. What went:
  - the `.blocks-item-img` hover scale, `.home-section h2`, the `.community` block
    with its image, `.centered-buttons` and `.hero-inner .submit-a-request`;
  - `.see-all-sections-trigger`, `.heading-centered` and `.form-centered`;
  - `.svc-hero-input` (the hero search is Zendesk's native one);
  - the catalog's duplicate card selectors (`[class*="card"]`, `[class*="Card"]`,
    and the heading and paragraph rules inside cards): a card is a link holding a
    thumbnail and two `div`s, and the script hides the description by class;
  - the `StyledMedia` substring (Garden's class is `StyledTextMediaInput`, which
    does not contain it);
  - the item form's width overrides for inline styles and for generated class
    names (`imWYAI`, `hkLxcw`, `dIeWIF`, `sc-jEACwC`), which change whenever the
    component library does and so could never be relied on.
- **Rules that looked dead and were not.** The first pass removed three live
  things, found two different ways; all are restored byte for byte.
  - The two catalog-search focus rules keyed on `[class*="StyledTextFauxInput"]`.
    The class exists on the field's wrapper, but the rules apply only while the
    field has focus (`:focus-within`), so a count of matching elements at rest read
    zero. The pixel comparison caught it (the focused search drew a gray border
    inside a blue ring). A selector that carries a state (`:focus-within`,
    `:hover`, `:checked`) is now judged by its base selector, or measured in that
    state.
  - The whole `_recent-activity.scss` partial, which a Copilot review caught. Two
    community templates (`community_topic_list_page.hbs` line 92 and
    `community_post_list_page.hbs` line 150) render Zendesk's `{{recent_activity}}`
    helper, and the markup it emits carries the `.recent-activity*` classes, so no
    template ever names them (upstream's templates do not either, though its styles
    do). No offline page renders those templates, so neither the pixel comparison
    nor the element counts could see it; the fourth check above exists because of
    this.
  - `#user #user-name`, which also appears in upstream's styles but in none of its
    templates, so it may style platform markup. Restored without proof either way.
- **Kept on purpose.** Classes the platform or the content generates and no
  template names: pagination, `nesty-input`, the multiselect, the stock `usa-*`
  banner, CKEditor's `image-style-*` and `ck-*`, status labels, notifications,
  related and recent articles, the `.recent-activity*` markup of the
  `{{recent_activity}}` helper, avatars and `request-form`; styles gated by a
  setting (the training button); the selectors for Zendesk's editor chrome; and the
  Garden override selectors that still match live markup (floating menus and
  listboxes, avatars and icons in the catalog and the item form; the rule for SVG
  icons was left alone because the offline mock has none). The header search stays
  hidden (see Open decisions).
- **The base `.button` dims for a native `disabled`.** A Copilot note on Phase 4:
  only `data-disabled` was covered, while `.button-large` and `.button-secondary`
  already handled both.
- **Found on the way, not changed here:** `CollapsibleDescription` decides whether
  to offer "Read more" from one measurement taken in the frame after the first
  render. If the web fonts settle afterwards, a description that fits in two lines
  keeps a "Read more" that reveals nothing. At 1024 pixels about half of the offline
  loads show it with identical CSS, and each is pixel-identical to the build before
  this phase. It depends on width and font timing, so it is a job for `adapt`
  (measure again when the fonts load and when the box resizes).
- **How it was checked.** Each of 81 captures was compared pixel for pixel with
  the same capture taken before any edit: 55 pages (11 pages at 1440, 1024, 768,
  390 and 320 pixels), 16 states of a kitchen-sink request form (initial, every
  dropdown open, the date picker, focus; at 1440 and 390) and 10 catalog
  interactions (hover, search focus, sort menu, tab focus). The capture is
  deterministic (two baselines are identical). Every capture is identical except for
  timing races that also vary between repeated runs of the same build: the "Read
  more" measurement above, the card tooltip (visible in some runs and not in
  others) and, in one run of five, 283 antialiasing-level pixels in the 3,700 pixel
  tall list at 390 pixels. The community, user profile and request templates are
  not rendered offline, so pixels cannot vouch for rules that only they use; the
  provenance check stands in for that.

## Gates

Run from the repository root; each should hold at the end of the work.

```bash
yarn eslint && yarn lint:md && yarn test && yarn build

# Token contract: no raw color literal (hex, rgb or a named color such as
# yellow) and no palette-step reference (--color-<hue>-<step>) outside
# styles/_tokens.scss; exits 0 when clean. The generated stock USWDS banner
# (styles/_usa-banner-generated.scss) is the one exception, because the NEXUS
# reference says the banner must never be visually modified.
! grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--color-(blue|pink|violet|turquoise|green|yellow|red|cyan|indigo|navy|grey)-[a-z0-9]+\)|:[[:space:]]*(yellow|red|green|blue|orange|purple|pink|black|white|gr[ae]y)\b" styles --include='*.scss' --exclude=_tokens.scss --exclude=_usa-banner-generated.scss
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
| 5 | Generated files: `style.css` fell from 226,208 to 220,756 bytes (2.4%) and `script.js` from 61,166 to 42,664 bytes (30.2%); `!important` in the compiled CSS fell from 207 to 190 and `[class*=` attribute selectors from 65 to 15 (the rest match Garden's generated class names); the compiled CSS has 26 fewer blocks (counted as closing braces). Source (styles, scripts and templates): 867 lines deleted and 16 added in existing files, plus 75 lines in the two new helper files. Unit tests: 91 suites and 871 tests (874 before: the widget's spec went, the helper's eight tests came). Renders: no visible change, checked pixel for pixel (see the distill decisions). |

## Open decisions

Resolved with the product owner: the USWDS exception and the `.gov` banner
(owner decision 1), the Knowledge entry point on the home page (decision 2),
the footer's policy links (help.arpa-h.gov is public, so the public HHS and
arpa-h.gov policy pages belong there) and the Admin Center settings (decision 5).
Still open:

- Whether pages without their own search should get a search entry point. Nine templates render no page-level search (applications, approval request and approval request list, contributions, error, request, requests, subscriptions and user profile). They had none before this work either: the base theme hid the header search on every page (`html body .header .search-wrapper { display: none !important; }` in `styles/_svc-tokens.scss`, still the case on the `sandbox` tip), so this work removed dead markup rather than a visible control. A compact search in the header on those pages is the cheapest fix if the owner wants one.
- Moving the hard-coded OS tile IDs in `category_page.hbs` into settings. (It would need a number-type setting, because the [`is` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#is-helper) "is always based on the `===` JS operator"; left as is, since `distill` removes code and does not add Admin Center settings.)
- Two theme settings read by nothing that renders: `community_image` ("Community banner"; its only consumer, the `.community-image` rule, was dead and is removed in Phase 5) and `service_catalog_hero_image` (its consumer, `.service-catalog-hero`, is used by no template). The hero artwork comes from `homepage_background_image`. Both stay in `manifest.json`, because removing a setting changes the Admin Center, which is the owner's call.
- The live [arpa-h.gov](https://arpa-h.gov/) still ships the older USWDS 1.x banner copy ("The .gov means it's official."); this theme uses the current official 3.x text. Whether the two should be aligned is a content decision for the main site's owners.
- The banner copy is English only, because a theme cannot add Help Center translation keys; USWDS publishes Spanish text if a Spanish locale is ever enabled.
