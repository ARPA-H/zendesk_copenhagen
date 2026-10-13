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
| 6 | `clarify` | Microcopy (labels, placeholders, empty and error states); every search control says what it covers, since the hero placeholder mentions services but Zendesk's native search covers articles | Done apart from review: the search placeholders and accessible names, the catalog's search-miss message, three sets of control names (sidebar row, sidebar toggle, sort button), "Service Hub" to "Service Desk" (owner decision), and two wording fixes |
| 7 | `adapt` | Responsive behavior, touch targets, print, high contrast, reflow | Done, with two review rounds answered: the audit and its fixes (the category toggle's hit area and structure, tap areas for list links on touch, the skip link's text and tab order), service descriptions on devices that cannot hover (owner decision) and for screen readers on desktop, a print stylesheet, the "Popular:" label, the "Read more" measurement found in Phase 5, English copy limited to English locales, and an axe-core pass over every page state; reflow, landscape phones and text spacing checked with nothing to change |
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
  articles, submit a request and track it.", refined in Phase 6 from "follow it")
  avoids naming a service desk, because
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
  native-size version are reverted. Open (updated in Phase 7): at 600 to 768 pixels
  the "Popular:" label sits over the artwork's cyan glow, 6.8 to 7.8:1 for the
  typical pixel and 3.4 to 4.2:1 at the single lightest one; that is the original
  design. Phase 7 made the label full white, like the chips beside it, which
  lifted it to 8.7 and 10.1:1 typical and 4.0 to 5.1:1 at the lightest pixel
  (only the lightest pixel at 768 pixels still misses 4.5:1), and left the
  decision on a scrim, which would clear it at the cost of a visible pill, to the owner.
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
  behavior), which Phase 6 also leaves alone. The catalog's "Enter your keywords"
  message, which read oddly after someone had typed some, is fixed in Phase 6.

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
- **Found on the way, fixed in Phase 7:** `CollapsibleDescription` decides whether
  to offer "Read more" from one measurement taken in the frame after the first
  render. If the web fonts settle afterwards, a description that fits in two lines
  keeps a "Read more" that reveals nothing. At 1024 pixels about half of the offline
  loads show it with identical CSS, and each is pixel-identical to the build before
  this phase. It depends on width and font timing, so it was left for `adapt`,
  which measures again when the fonts load and when the box resizes.
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

Clarify decisions made during Phase 6 (each is easy to reverse):

- **Every search says what it covers.** Zendesk's search box finds help articles:
  the [`search` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#search-helper)
  enables Instant Search to provide "HC article suggestions", and the hero
  template's own comment says "articles". The placeholders on the home, services
  and request pages said "Search by service or keyword (e.g., Software, Device,
  SharePoint)…" and "Search by service or keyword…", which promised services. All
  three now say "Search help articles", and the inline script sets the field's
  accessible name to the same words, so the two cannot disagree whatever label the
  platform's markup carries (a visible label should match or be contained in the
  accessible name, [SC 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).
  The catalog's own field keeps its "Search for services". The example keywords
  are gone: the popular chips just below already show examples, and the 66
  characters of the old text were clipped at every phone width ("Search by service
  or ke" at 390 pixels). The new text fits at 375 pixels and wider and still reads
  "Search help ar…" at 320. A placeholder doing double duty as the label is the
  least harmful case for a one-field search box, [as Nielsen Norman Group
  notes](https://www.nngroup.com/articles/form-design-placeholders/). The
  Knowledge pages keep Zendesk's stock "Search": no services search competes with
  it there, and it follows the Admin Center scope setting.
- **A search that finds nothing says what to do next.** After someone typed,
  the catalog said "Enter your keywords in the search field." under "No services
  in sight". It now says "Try a different keyword, or clear the search to see all
  services.", which points at the clear button visible in the field; an empty
  state should give a direct pathway ([Nielsen Norman Group on empty
  states](https://www.nngroup.com/articles/empty-state-interface-design/)). The
  empty catalog with no query keeps its own text. This is a React module string,
  so it changed in the code default, `en-us.yml` and `locales/en-us.json` together,
  as this fork's earlier string changes did; other locales keep their existing
  translation of the old sentence until it is retranslated.
- **Controls that sound alike are told apart** (descriptive labels, [SC
  2.4.6](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)).
  The browser's accessibility tree showed three problems in the catalog: a
  category row whose action is to select it was named "Expand Hardware 4" (it
  swallowed the nested toggle's label), every toggle was a bare "Expand", and the
  sort button was just "A-Z". They are now "Hardware 4", "Hardware subcategories"
  (a constant name; Phase 7 added `aria-expanded` to say whether it is open and
  made it a sibling of the row's button) and "Sort services: A-Z". The names are
  translatable messages with `{{name}}` and `{{option}}` placeholders (two new
  keys; the two replaced keys are marked obsolete), so translators can reorder
  them; until a locale translates them, it falls back to the English default.
  Nothing visible changes.
- **"Service Hub" becomes "Service Desk"** (an owner decision in session). The last
  line of the request page's "What happens after you submit?" now matches the three
  other lines that name the Service Desk. The two words are joined with a
  non-breaking space, because they split across lines at 1440 pixels ("Service /
  Desk"). The owner chose this over neutral wording even though HR also uses the
  site; the header still shows no site title.
- **Two wording fixes.** The signed-out line says "track" instead of "follow"
  ("follow" reads as subscribing, and the request page says "track progress"). The
  request page's empty suggestions line says "help articles" instead of "knowledge
  base articles", matching the hero and the home page's "Browse help articles".
- **Kept on purpose.** "Related content appears as you type." and the line under it
  say nearly the same thing; a rewrite wrapped to a second line with an orphaned
  word and was reverted, since the repetition is mild. The "Still can't find what
  you need?" banner repeats "general request" in its line and its button; the
  button names the catalog item it opens. "Request or ticket number", the
  category descriptions and the popular chips are the owner's wording. The
  current page's breadcrumb stays link-colored (stock behavior). Zendesk's own
  strings are untouched ("Knowledge Base" in the results filter, "Follow",
  pagination, the share links).

Adapt decisions made during Phase 7 (each is easy to reverse):

- **A target size audit with the spacing exception done properly.** The audit
  covers the nine page states with touch emulation at 390 pixels and a mouse at
  1440. A target under 24 by 24 pixels passes only if no other target comes within
  a 24 pixel circle around it, and a target nested inside another never qualifies
  ([WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
  It found one real failure on two pages: the catalog's category toggle, a 12 pixel
  chevron inside a row that is itself a button. The toggle now has a 24 pixel hit
  area, positioned with negative margins so the chevron and the text beside it do
  not move (every page is pixel-identical to the build before, apart from
  the label described below). The same audit then caught a regression of mine:
  padding the search-result titles, which looked harmless, brought the 16 pixel
  breadcrumb links above them inside the 24 pixel circles and made 18 links fail,
  so the titles are left alone (they are 163 pixels apart already). Final: 0
  failures in all 18 combinations.
- **Tap areas for the links people tap through lists.** Where the pointer is coarse,
  article lists, related articles and recently viewed articles take 12.5 pixels of
  vertical padding, which makes a 19 pixel line a 44 pixel target without moving
  anything (padding on an inline box grows the area, not the line). Review asked
  whether that area is real, so I measured where a tap lands, scanning a vertical
  line through every link with `elementFromPoint` (which honors overflow clipping
  and paint order) at 390 pixels wide. The 33 links in the category and section
  article lists hit over the full 44 pixels: the link overhangs its 24 pixel line by
  10.5 pixels, inside the item's own 12 pixel padding, so the item's `overflow:
  hidden` clips nothing (that padding must stay at 11 pixels or more). In the related
  and recently viewed lists the links sit 40 pixels apart, so each area gives its last
  4 pixels to the link below it and measures 40 pixels, except the last link of a
  list, which keeps 44. Counting that overlap, the touch targets under 44 pixels go
  from 41 to 20 on the category page, 32 to 20 on the section page and 36 to 34 on
  an article (36 to 29 by box size alone, which treats the overlapped 4 pixels as
  tappable). The rest are the footer links
  (29 pixels), the breadcrumbs (16), the popular chips (33) and the form controls,
  which meet the 24 pixel minimum on their own or by spacing; they are left alone
  because growing them would move the footer, the pills and the form. Making the
  links `inline-block` was measured too: with the padding in the layout every row
  grows by 25 pixels (the category page from 2,460 to 2,985 pixels tall, the
  section page from 1,645 to 1,945, an article from 4,188 to 4,363); with negative
  margins that cancel the growth the areas barely change (48 in article lists,
  where the item's clip stops them, and still 40 in the related and recently
  viewed lists, because the overlap comes from their 40 pixel pitch).
- **The category toggle sat inside a button, and the keyboard could not use it.**
  The catalog sidebar's row was a `div` with `role="button"` that held the expand
  button, and its key handler cancelled the default action of every Enter and
  Space that bubbled up from the toggle, so a keyboard user could not expand or
  collapse a category. Review found the keyboard half (the handler is in the
  original code). Running axe-core over every page state then found the structural
  half, `nested-interactive`, which it rates serious: the ARIA [`button`
  role](https://www.w3.org/TR/wai-aria-1.2/#button) has "Children Presentational:
  True", and axe's rule description says nested controls "are not always announced
  by screen readers or can cause focus problems". The row is now two siblings: the
  toggle, which reports `aria-expanded` and points `aria-controls` at the rows it
  shows, and a select button (still "Hardware 4", with `aria-current` when
  selected) whose `::after` overlay stretches over the whole row, so a click
  anywhere on the row still selects it and the toggle sits above the overlay. The
  toggle's name is now constant, "Hardware subcategories", because the
  [button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) says a
  toggle's label must not change when its state does; `aria-expanded` carries the
  state. The row-wide focus ring moved to the overlay, the theme's own ring on the
  select button is switched off so there is one ring, and the forced-colors
  selectors follow the new element. Nothing visible changes: 12 of 13 sidebar
  captures (hover, selected, expanded, a nested selection, focus rings, forced
  colors in both palettes, the open phone list) are pixel-identical, and the 13th
  differs by at most 2 of 255 on 24 pixels of the toggle's focus ring. Clicking a
  toggle expands without selecting, clicking a nested row selects it, and Enter on
  the toggle collapses it. Nine specs cover the names, the state, the sibling
  structure and both keys on both controls; the two that press Enter and Space on
  the toggle failed on the original code.
- **Card descriptions reach screen readers on desktop.** The description is hidden
  by CSS and shown in a hover tooltip, and `display: none` also hides it from
  assistive technology; the tooltip was a bare `role="tooltip"` that nothing
  referenced, so a screen reader heard only the card's title (axe: `aria-tooltip-name`,
  serious). Each card is now described by its own description element through
  `aria-describedby` (the target may be hidden; the accessible name computation
  still uses it), the visual tooltip is `aria-hidden`, and nothing is added where
  the description is already shown inside the card (`hover: none`), so a phone does
  not read it twice. Six specs; three fail on the old script.
- **New English copy no longer overrides other locales.** Review noted that the
  signed-out hero sentences, the Knowledge band's heading and lede, and the search
  fields' placeholder and `aria-label` are English literals; the `aria-label`
  replaced a name Zendesk's search helper localizes. They now apply only where
  `help_center.locale` contains `en-` (Zendesk's [`contains`
  helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#contains-helper),
  the same pattern as the empty states). Other locales keep Zendesk's placeholder
  and accessible name, get the translated sign-in action alone in the signed-out
  band, and keep the Knowledge band's topic list under an unseen region label. A
  second harness server in a non-English locale showed all three; English renders
  as before.
- **Skip link, landmarks and the OS tiles.** axe-core also flagged a positive
  `tabindex="1"` on the skip link on every page. It is already the first element
  in the document, so the attribute only reorders focus for what follows it and is
  gone. The catalog rendered its own `<main>` inside the platform's, which made
  three landmark findings on the home and services pages; it is a `div` now (no
  CSS or test depended on the tag). The OS-tile category page had no
  `id="main-content"` for the skip link to land on, so it has one.
- **An independent check.** [axe-core](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
  4.13 over the nine page states at 1440 pixels with a mouse and 390 with touch:
  all 18 had findings before this round (`tabindex` on all 18, `nested-interactive`
  and `aria-tooltip-name` on the two desktop catalog states, the duplicate landmark
  rules on the four catalog states, a skip link without a target on the two OS-tile
  states); none do now. Axe finds a subset of what is wrong, so this is not a
  conformance claim.
- **Service descriptions show on devices that cannot hover** (owner decision). On
  desktop, hovering a catalog card shows its description in a tooltip; a phone has
  no hover, so the cards showed only an icon and a title, and the tooltip was
  hidden below 769 pixels. Where `hover: none`, the description now shows under the
  title in muted text (`#6f747a`, 4.7:1), two lines at most, and the tooltip is
  hidden. The services page at 390 pixels grows from 3,721 to 4,389 pixels (18%);
  desktop pointers are unchanged. A desktop window narrowed below 769 pixels with a
  mouse still gets neither the tooltip nor the description; see Open decisions.
- **The skip link was nearly unreadable on focus.** Pressing Tab on any page shows
  it, and the global link focus color (`a:focus`) outranked its own white text, so
  it appeared as dark blue (`#07418f`) on black, 2.2:1. It now keeps white text
  (21:1) and takes the dark-surface focus ring, because it slides over the dark
  header. This was the "skip link boundary" item that Phase 4 left for `adapt`.
- **A print stylesheet**, since there was none (`styles/_print.scss`). A printed page
  is its content: the banner, header, footer, skip link, rails, votes and comments
  are left out, text is dark on white at the width of the paper, the address of an
  outside link follows its text, and figures, tables, code and quotes do not break
  across pages. The first print render showed that browsers drop background colors
  by default ([`print-color-adjust: economy`](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)):
  the hero's white text came out light gray on white, so the hero prints a dark
  greeting without its search, chips or sign-in button. The catalog prints its
  heading, count and cards without the category list, search field and sort menu,
  which only work on a screen (the first version stacked the list above the cards
  and left the other two; review caught it, and the three now carry hooks the
  stylesheet hides, two of them class names in the React components with a spec
  each). A request form prints as a paper form: its labels, hints and empty boxes,
  without the Submit button or the suggested-articles rail, because the fields are
  what that page is. Checked by emulating print on all nine page states (no text
  light enough to vanish on white paper, no overflow, no interactive control except
  a request form's own fields, and no visible repeating fixed element) and by
  looking at the rendered PDFs. The home and services pages print about 320 pixels
  shorter than before.
- **The "Popular:" label is full white.** It was 85% white while the chips beside it
  are full white. See Phase 4's note for the numbers: the lightest pixel at 768
  pixels still reads 4.0:1, and a scrim is the owner's call.
- **"Read more" measures again.** Phase 5 found that the item page's description
  decides from one measurement, before the web fonts settle, whether to offer
  "Read more", so a description that fits in two lines could keep a button that
  reveals nothing. The component now measures again when fonts finish loading and
  when its box changes size, but never while the text is expanded (an expanded box
  is not clamped, so measuring then would take "Read less" away). The false button
  showed in 4 of 8 loads at 1024 pixels before and in 0 of 12 after; a long
  description still collapses, expands and collapses again at 1440 and 390 pixels.
  Five new tests (four of them fail on the old component) cover fit, overflow,
  fonts, resize and the expanded state.
- **Checked, nothing to change.** No horizontal overflow at 1440, 1024, 768, 390 or
  320 pixels, nor on landscape phones (844 by 390 and 667 by 375 with touch
  emulation) on seven pages. With the [WCAG 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
  text spacing overrides on seven pages at 1440 and 390 pixels, nothing visible
  clips (the only newly clipped nodes are visually hidden text for screen readers,
  which clips by design). No function depends on hover: a scan of the compiled CSS
  finds two rules that reveal anything on hover, the notification dismiss button
  (visible at 60% opacity at rest, 100% on hover) and the training button's label
  (below).
- **Left alone on purpose.** The item page's help rail still follows the form on a
  phone, so suggested articles, which appear as someone types, sit below the Submit
  button; moving them needs a design decision (see Open decisions). The training
  button (a setting-gated 52 pixel graduation-cap circle with an accessible name
  that the offline render does not show) reveals its text label on hover or
  keyboard focus, so on a phone it is the icon alone; a permanent 32 character pill
  would cover most of a phone's width. Safe-area handling (`viewport-fit=cover`) is
  not added: the offline render has no notch, so it cannot be verified here.

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
| 6 | Search boxes whose placeholder promised services on an articles-only search: 3 pages, now none (all say "Search help articles", with a matching accessible name); the old text was clipped at every phone width and the new one fits at 375 pixels and wider. Catalog accessibility names: the sidebar row, the sidebar toggle and the sort button went from "Expand Hardware 4", "Expand" and "A-Z" to "Hardware 4", "Expand Hardware" and "Sort services: A-Z". Renders: 20 of 55 differ (home, services, signed-out home and the request page, each at the changed words) and the other 35, including every Knowledge page, are identical. Unit tests: 92 suites and 877 tests (871 before; six new). |
| 7 | Target size (WCAG 2.5.8, with the nested-target and spacing rules applied): failures on the nine page states went from 1 control on 2 pages (the 12 pixel category toggle) to 0 in all 18 combinations (touch at 390 pixels, mouse at 1440); a padded search title that would have made 18 breadcrumb links fail was caught and left out. Touch targets under 44 pixels: category page 41 to 20, section 32 to 20, article 36 to 34 (36 to 29 by box size; the related and recently viewed lists keep a 40 pixel area because neighbors overlap by 4). Keyboard on the catalog's category toggle: Enter and Space did nothing, because the row cancelled them (a review finding, present in the original code); both now expand and collapse, and the toggle is no longer inside a button. axe-core 4.13 over the nine page states at 1440 (mouse) and 390 (touch): findings in all 18 before, none after. Renders on a desktop pointer after this round: 54 of 55 identical to the build before; the 55th (home at 1440) differs by 18 pixels of at most 8 of 255 on one icon edge, with identical geometry to three decimals. Skip link on focus: 2.2:1 (dark blue on black) to 21:1. "Popular:" label at the lightest pixel: 3.4 to 4.2:1 to 4.0 to 5.1:1 at 600 to 768 pixels (typical 6.8 to 7.8:1 to 8.7 to 10.1:1). False "Read more" at 1024 pixels: 4 of 8 loads to 0 of 12. Catalog at 390 pixels on a device that cannot hover: descriptions visible, page 3,721 to 4,389 pixels tall. Print: a stylesheet where there was none, checked on all nine page states; the interactive elements visible in print went from 9 on the services page (6 category rows, a toggle, the search field and the sort menu) and 6 on the request page to none on the catalog pages and the request form's own 5 fields, and the home and services pages print about 320 pixels shorter. The 45 combinations of nine pages at five widths: no overflow, no contrast failures, no colors outside the palette and no control without a focus ring. Renders on a desktop pointer: 45 of 55 identical to Phase 6, and the other 10 (home and services at five widths) differ only in the 52 by 15 pixel patch of the "Popular:" label; the "Read more" timing difference that showed in earlier comparisons is gone. Unit tests: 94 suites and 896 tests (877 before; five new for "Read more", six for the sidebar's controls, six for the card descriptions, two for the print hooks). |

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
- The copy this work wrote (the signed-out hero sentences, the Knowledge band's heading and lede, the "Search help articles" placeholder and label) is English and shows only in `en-` locales, for the same reason; every other locale gets the fallbacks described under Phase 7. If a second locale is ever enabled, each of those strings needs a translation route: a theme cannot add `{{t}}` keys, so the options are Zendesk Dynamic Content (the [`dc` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#dc-dynamic-content-helper), "translated according to the current locale") or one `contains` branch per locale.
- Where suggested articles belong on the request page on a phone. They update as someone types, but the help rail follows the form, so a phone user sees them only below the Submit button. Putting the rail first would push the form down and shift the page as results arrive; an alternative is a compact "Related articles" strip just above Submit. Left as is until the owner chooses.
- A desktop window narrowed below 769 pixels, with a mouse, gets neither the card tooltip (hidden below 769 pixels by an older rule) nor the inline description (shown only where `hover: none`). Showing the description below 769 pixels as well would close that gap at the cost of a taller list in narrow windows.
- At 768 pixels exactly, the lightest pixel behind the "Popular:" label reads 4.0:1 (typical 8.7:1). A 55% indigo scrim, as the chips have, would clear 4.5:1 and show as a pill; the owner prefers the original look, so none is added.
- The popular chips (33 pixels), the footer links (29) and the breadcrumbs (16) are under 44 pixels on a phone. They meet the 24 pixel minimum by size or spacing; padding them would move the footer, make the pills taller and change the breadcrumb line.
- The training button shows its label on hover or keyboard focus only; on a phone it is the cap icon. Whether it should carry a permanent short label ("Training") on touch devices is the owner's call.
