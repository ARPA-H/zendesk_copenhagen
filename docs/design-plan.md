# Design plan: NEXUS for the Service Catalog and Knowledge

Status: all ten phases are done on `impeccable-design-passes` (one combined
pull request against `sandbox`, still a draft and not merged); what is left is
the owner's, under Open decisions. Nothing here deploys to Zendesk; deploys run
only from `sandbox` and `main`.

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
9. **The footer has no "Download Adobe Plugin" link.** The public
   [arpa-h.gov](https://arpa-h.gov/) footer, and the NEXUS list that copies it, end
   their auxiliary links with a link to `https://get.adobe.com/reader/`. A Help
   Center has no use for a PDF reader download, so it is removed (requested after
   the last phase) and the footer carries the other eight policy links. The skill's
   list is a read-only copy from another repository and is not edited; this is a
   deliberate departure from it.
10. **The footer's site links are for signed-in visitors only.** Anonymous visitors
    cannot submit requests (the owner's reason), and the services page already asks
    them to sign in, so "Service catalog", "Submit a request" and "My requests" all
    sit behind `{{#if signed_in}}`. Before this the template wrapped only "My
    requests" and left the other two to Zendesk's
    [`link` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#link-helper),
    which "takes care of hiding the link from certain users" and, for the
    [service catalog](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#service-catalog-link),
    "doesn't return anything if the service catalog is not available". Its
    documentation does not say that a public Help Center hides either link from an
    anonymous visitor (it does say so for `requests`, `contributions` and
    `subscriptions`), upstream Copenhagen renders both unconditionally in its header,
    and a saved signed-out page of a public Help Center ([support.digg.com](https://github.com/genieck/genieck.github.io/blob/b4cd91e4a97468d2ba175c48f8fe8609aba0140f/support.digg.com/index.html#L44))
    shows the link, labelled "Submit a request".
    The whole navigation sits inside the condition, so a signed-out footer has no
    empty landmark, and the language menu, which that navigation used to push to the
    end of the row, now pushes itself (`.footer-logo + .footer-language-selector`).
    Measured in the offline render at 1440 and 390 pixels wide, with and without a
    language menu: signed-in footers are unchanged to the pixel, a signed-out footer
    has one navigation landmark (Policies and information) and no empty list, and its
    language menu reaches the end of the logo row at 1440 as it does signed in (before
    the rule it sat beside the logo, 834 pixels short of the end). The render cannot
    show what Zendesk's helper does for an anonymous visitor: the harness stubs
    `link` and prints every link.
11. **The service item page's search pill is centered with the help rail's card.**
    From 1024 pixels the rail sits directly under the "Search help articles" pill and
    the two did not line up: the pill was a fixed 360 pixels wide against the card's
    320, so it was flush with the card on the right, stuck out 40 pixels on the left
    and was centered 20 pixels away from it (measured at 1920, 1440, 1280, 1100 and
    1024 pixels wide). The search row above the form is now laid on the same two
    columns as the form and the rail, from one shared definition (`item-columns` in
    `styles/_svc-service-item.scss`), so the pill is exactly the card's width and the
    two share a left edge, a right edge and a center. A fixed 320 pixels would have
    matched only until the text size changed: the columns are in `rem`, so the card
    grows with the root font size and a fixed pill would not. Measured in Chrome at
    those five widths with the root font at 24 and 32 pixels (150% and 200%; [WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
    asks that "text can be resized without assistive technology up to 200 percent
    without loss of content or functionality"), with a very long breadcrumb and in
    right-to-left, alone and together: the centers are 0 pixels apart and both edges
    match every time. Below 1024 pixels nothing changes. On a phone the pill and the
    card already matched (both span the container); on a tablet the rail has dropped
    under the whole form, about 1,000 pixels below the pill, so there is nothing under
    the pill to line up with and it stays at the right of the breadcrumb row. 21 of 22
    page captures are identical to the build before; the 22nd, the item page at 1440
    pixels, differs only inside the pill's box. Axe is clean on all 18 states, and
    print is unchanged (the pill and the rail are hidden there).
12. **The pager is text only, with room between its links.** After the pages were
    reviewed in the sandbox the owner asked that "Next" and "»" not be stroked ("I
    think they work better as text only"), or, if the guidelines needed the stroke,
    that they at least not touch. They do not need it. The NEXUS pagination
    (`.pagination` in the skill's `components.css`) draws each item with a transparent
    border, link-colored text, a 40 pixel minimum box and a 4 pixel gap, and
    [USWDS pagination](https://designsystem.digital.gov/components/pagination/) gives
    Previous and Next the `usa-pagination__link` class and only the page numbers
    `usa-pagination__button`, so the stroked pill was the old theme's, not the
    guidelines'. `.pagination` is now a centered, wrapping flex row
    (`styles/_pagination.scss`): each control is a link-colored 40 pixel target with
    no border, a 4 pixel gap between controls, a light tint on hover and the shared
    focus ring, and `.pagination-current`, where the markup has one, is bold and is
    not a link. A flex gap does not depend on the whitespace Zendesk's markup leaves
    between the list items, which the offline stub could not show: the strokes met at
    528.2 pixels there. Measured in Chrome with the stub's markup and with the
    documented [`{{pagination}}` output](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#pagination-helper)
    (First, Previous, page numbers with the current page as a non-link item, Next and
    Last): no border, 4 pixels between boxes and about 32 between the visible arrows,
    text contrast 6.73:1 (8.89:1 hovered), a visible focus ring, no sideways overflow
    at 390 pixels (a long list wraps onto a second row), at 200% text, in
    right-to-left (the arrows mirror) and in forced colors (a hovered link underlines,
    since the tint is dropped). Of the 22 page captures only the section and search
    pages changed, and only in the pager row. The change reaches every page that lists
    `{{pagination}}`; the stub writes First, Previous, Next and Last only, so Zendesk's
    real markup is the one thing left for the sandbox.
13. **Social sharing is removed, not just switched off.** The owner asked whether
    `manifest.json` can force the share buttons off "so it never gets reconfigured",
    and, if it cannot, for them to be left out of the preview screenshots. It cannot:
    a setting is an identifier, a type, a label, a description, a default `value` and,
    for some types, options, a minimum and a maximum
    ([Customizing the Settings panel of the theme](https://support.zendesk.com/hc/en-us/articles/4408846524954-Customizing-the-Settings-panel-of-the-theme)),
    and nothing in that list locks a value; a default only holds until an admin
    changes the setting, and `show_article_sharing` defaulted to on, which is why the
    render showed the icons. So "off" is made permanent by removing what can turn it
    on: the `show_article_sharing` and `show_post_sharing` settings (in
    `manifest.json`, `translations.yml` and `translations/en-us.json`), the two
    `{{share}}` blocks in `article_page.hbs` and `community_post_page.hbs`,
    `src/share.js` (the handler that opened each link in a popup), `styles/_share.scss`
    and the print stylesheet's entry. Two knock-on effects are handled. The article
    footer row held the share icons and the comment count, and an empty row would have
    kept its padding, so the row now exists only when there is a count to show. The
    community post footer held the share links and a comment-count link, both only
    through `show_post_sharing` (off in this theme since 2026-01-22), so it goes with
    it and nothing changes at the defaults; the comments section under a post is
    untouched. The other locale files keep the two retired labels as unused strings:
    they are synced from Zendesk, and the command that would drop them
    (`yarn download-locales`) must not be run in this fork anyway. Measured: article
    pages are 41 pixels shorter at 1440 and 390 and nothing else on them moved. After
    the theme is updated the Settings panel no longer lists the two "Social sharing"
    checkboxes, and values saved for them under an older install are ignored.
14. **Article tabs are a segmented control with a platform icon.** The owner found the
    tabs on knowledge articles "very stylistically plain", with "no-to-little visual
    queues" that they can be switched, and asked for Garden and USWDS to be checked,
    NEXUS colors (grayscale preferred) and a uniform monochrome icon left of each
    name: iOS, macOS, Windows, and the Apple logo for a guide that covers both iOS and
    macOS. These tabs are the editor's native
    [Tabs component](https://support.zendesk.com/hc/en-us/articles/11042740425754-Using-tabs-to-group-content-in-the-article-editor):
    the article carries a `<zd-tabs>` with one `<details>` per tab, and Zendesk's own
    script (read from its public copy) adds a `role="tablist"` bar of
    `button.wysiwyg-tabs-tab`; the default look is a hairline with an underline under
    the selected name. The
    [templating cookbook](https://support.zendesk.com/hc/en-us/articles/4408832681626-Help-center-templating-cookbook)
    says the base styling "is driven by a supported set of --zd-wysiwyg-* CSS custom
    properties" and that styling its elements directly "is supported on a best effort
    case, meaning the component structure might change". Garden's
    [Tabs](https://garden.zendesk.com/components/tabs/) are the underline pattern
    Zendesk already imitates ("Use Tabs to organize related content in a single
    view"); [USWDS has no tabs component](https://designsystem.digital.gov/components/overview/),
    and its nearest part is the
    [segmented button group](https://designsystem.digital.gov/components/button-group/)
    ("a set of discrete buttons in a row as a single element"); NEXUS has filter tabs
    (`.card-nav`: pills, the selected one filled with the brand color and white text).
    The bar now takes all three: a light track (`--surface-subtle`) holding one pill per
    tab, the selected pill the near-black indigo with white text (`styles/_article-tabs.scss`).
    Apart from that fill it is grayscale; the fill is one token, so `--color-ui-80`
    would make it entirely so if the indigo reads as heavy. A hovered pill tints, the
    focus ring is the shared one, the bar wraps instead of scrolling (Zendesk hides its
    scrollbar, which hid the tabs that were off screen), a long name wraps inside its
    pill (Zendesk's `flex: 0 0 auto` let one push the page 238 pixels sideways at 390
    pixels; the stress fixture found it), and on a phone the track spans the column.
    Measured: selected 19.76:1, unselected 7.77:1, hovered 16.34:1; bar 48 pixels and
    tabs 40; Zendesk's own arrow, Home and End keys still work.

    The icons are `assets/apple.svg`, `ios.svg`, `macos.svg` and `windows.svg`: plain
    names, as the owner asked, in the style of the `ios.png`, `macos.png` and
    `windows.png` beside them. They are the four Iconify icons the owner named
    (`lineicons:apple-brand`, `lineicons:ios`, `streamline-logos:mac-finder-logo-solid`
    and `lineicons:microsoft`), embedded in the theme instead of fetched, which the
    owner chose over loading them from Iconify the way the service catalog does: no
    request to a third party from a .gov page, nothing to wait for and no dependence on
    `iconify_api_base`. Each `viewBox` is cropped to its glyph (the Finder icon fills
    22 of its 24 units and the others 18, so unmodified they would not match in size)
    and the drawing is unchanged, checked against Iconify's data path for path. The
    icon box is 18 pixels (`1.125rem`) and not a fractional size: measured on the tab
    fixtures at 1440 and 390 pixels, a 17.5 pixel box painted the iOS, macOS and Windows
    icons from 16 to 18 pixels wide depending on where each fell (Chrome snaps a
    fractional box to the pixel grid), and an 18 pixel box paints every one at 18 by 18
    at every position, with the Apple logo, which is narrower by design, 15 by 18.
    Lineicons is MIT and Streamline Logos is CC BY 4.0, so each file carries its credit
    and `NOTICE.md` has the license text. The credit is a comment inside the `<svg>`
    root, because Zendesk's theme importer rejects an SVG that opens with one (the
    failure `PLAN.md` records for an earlier asset), and `src/svgAssets.spec.js` now
    keeps every SVG asset opening with `<svg` or `<?xml`. The credit is not shown on
    the page, which is the owner's call to change. Each is drawn as a CSS mask over the tab's text color,
    so it follows every state (forced colors and print have rules of their own). The
    files load from the theme's own assets, which Zendesk serves from the Help Center's
    address: the [`asset` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#asset-helper)
    "inserts the relative path of the specified asset", and a public Help Center's
    stylesheet is `/hc/theming_assets/.../style.css` on its own host
    ([support.zendesk.com](https://support.zendesk.com/hc/en-us)), so the mask is not a
    cross-origin fetch. The path is the `$assets-<name>-svg` variable the fonts already
    use, written straight into `mask-image` as the fonts write theirs, not through a
    custom property, whose value Sass does not evaluate.

    `src/articleTabs.js` reads each tab's name and sets `data-platform`; the stylesheet
    does the rest. iOS (also iPadOS, iPhone, iPad), macOS (Mac, Mac OS X, OS X) and
    Windows get their own icon; a name that mentions iOS and macOS together, or Apple,
    gets the Apple logo; a name with Windows beside an Apple platform is ambiguous and
    gets none, as does one with no platform (Android, Web browser). An author can also
    choose in the name itself, as a service catalog item does in its description:
    `[icon: ios.svg] Phone setup`. The marker names one of the four files (`.svg` is
    optional), is removed from the name, and wins over the name; an unknown name shows
    no icon. The service catalog's own `[icon: ios.svg]` marker finds these files too,
    since it already resolves "a committed SVG in this theme's assets/ directory, by
    filename". Zendesk's script can run before or after the theme's, so the labeller
    handles the tabs already on the page and watches the article body for ones added
    later: checked with the platform script defined before the theme's, on
    DOMContentLoaded, 600 milliseconds after load, and not at all (then there is no tab
    bar, and the raw disclosures are untouched).

    Verified in the offline render with a port of Zendesk's `zd-tabs` element (from its
    public script) and its tab CSS loaded before the theme's, as the platform does: axe-core
    is clean on all 22 states (the 18 page states plus the two tab fixtures at both
    widths; the section and search pages among them carry the new pager), at 1440 and
    390 pixels, in right-to-left, at 200% text, in forced colors and in print (the
    selected tab is white on a fill, which print drops, so it prints as bold underlined
    text). The sandbox still has to confirm that the real article editor produces the
    structure the emulation assumes (`zd-tabs > details > summary` and
    `.wysiwyg-disclosure-content`).

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
| 3 | `layout` | Spacing scale, containers, Knowledge page layouts, catalog rhythm; the Solutions footer structure (logo, site navigation row, divider, centered auxiliary links, copyright); the `.gov` banner; the header blended into the hero; the signed-in Knowledge band on the home page; the service item rebuild | Done, reviewed: the footer, the hero, one gutter and column set, the category, section, article and search grids, the Device FAQs tiles, the overflow fixes, the banner, the blended header, the Knowledge band, the service item rebuild, the spacing sweep and the catalog title handling |
| 4 | `harden` | Empty, error and loading states; long text; RTL; forced colors; heading structure; the signed-out hero | Done, reviewed: the Device FAQs heading (and a corrected heading probe), the signed-out hero, locale-aware empty states, failed loads (prompt error, no dead button), forced colors (both palettes), RTL logical properties, unclamped service names and the mobile hero artwork ("zoomed to fill": its own layer, no strip, the original colors) |
| 5 | `distill` | Remove dead and duplicated styles and markup that remain after phase 2 (which already deleted the unused hero-results and mini-form styles), including the unused `initSvcSearch` widget in `src/svcSearch.js` | Done apart from review: the widget removed (its one used helper kept in `src/safeHref.js`), the dead partials, rules and selector parts removed, the base `.button` dimmed for a native `disabled`; every page, form state and catalog interaction compared pixel for pixel with the build before |
| 6 | `clarify` | Microcopy (labels, placeholders, empty and error states); every search control says what it covers, since the hero placeholder mentions services but Zendesk's native search covers articles | Done apart from review: the search placeholders and accessible names, the catalog's search-miss message, three sets of control names (sidebar row, sidebar toggle, sort button), "Service Hub" to "Service Desk" (owner decision), and two wording fixes |
| 7 | `adapt` | Responsive behavior, touch targets, print, high contrast, reflow | Done, with its review rounds answered: the audit and its fixes (the category toggle's hit area and structure, tap areas for list links on touch, the skip link's text and tab order), service descriptions on devices that cannot hover (owner decision) and for screen readers on desktop, a print stylesheet, the "Popular:" label, the "Read more" measurement found in Phase 5, English copy limited to English locales, fixed-English blocks marked `lang="en"`, and an axe-core pass over every page state; reflow, landscape phones and text spacing checked with nothing to change |
| 8 | `optimize` | CSS weight, font loading, layout shift, images | Done: the hero artwork re-encoded without changing a pixel (1.85 to 0.93 MB), the catalog skeleton pinned (layout shift 0.148 to 0.027), the toast host loaded only where something can toast (Knowledge pages lose 249 KB of script), `shared-bundle.js` preloaded where a page has a module, and the training button, fonts and interaction speed measured and left |
| 9 | `onboard`, `bolder`, `quieter`, `animate`, `delight`, `overdrive`, `extract` | Moderate expressive layer (state motion plus one signature moment per key page, reduced-motion safe) and token extraction; `bolder` targets the Knowledge pages, `quieter` anything the critique finds excessive | Done apart from review: `extract` put twelve literal durations onto four motion tokens that fall to almost nothing under reduced motion (nothing the theme owns still moves for a visitor who asks for that, and Garden's one chevron turn is held still), `animate` eased the service cards' hover shadow along with their border and gave an article heading reached by a link a one-time wash, and `delight`, `bolder` and `quieter` found nothing further that earns its place; `onboard` (a first-use state for My requests) and `overdrive` (three directions) are recorded as open decisions |
| 10 | `polish`, `audit` | Final pass, final score, docs | Done: the final critique ([25/40](design-critique-final-2026-10-13.md), from 23) and audit ([15/20](design-audit-final-2026-10-13.md), from 10); the polish they pointed to (the Device FAQs labels on one line, the search breadcrumb at the left on phones, the category introduction's orphaned "H.", a readable note under Submit, the help rail's hint said once, a status message for the catalog's count, focus on the first field with an error after a failed submit, and the alert banner's default text); the design sidecar refreshed from DESIGN.md; and the Before and After screenshots in the pull request description, regenerated after the last phase and again for the footer changes (owner decisions 9 and 10) and for the pager, sharing and tabs (owner decisions 12 to 14) |

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
  (only the lightest pixel at 768 pixels still misses 4.5:1). The owner chose to
  leave it there rather than add a scrim, which would clear it (10.7:1 at the
  worst pixel) at the cost of a visible pill.
  The 1.8 MB artwork was unchanged in this phase; Phase 8 re-encoded it without
  changing a pixel (see Optimize decisions).
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
  made it a sibling of the row's button) and "Sort services: A-Z". Nothing visible
  changes in English. The Phase 8 review pointed out that the two new messages
  existed only in `en-us.json` (1 of 101 locale files), so every other locale
  would have announced an English phrase inside a translated page. The sort
  button's name is now built from the two messages all 101 locales already
  translate ("Sort services" and the selected option), so it needs no new key and
  reads the same in English. The toggle's name cannot be built that way, because
  no translated message names a category's subcategories: where the locale has
  the English message it is used, and elsewhere the toggle reads the Expand or
  Collapse message the locale already translates followed by the category's own
  name (so it changes with its state there, next to `aria-expanded`, as it did
  before this work; the two keys are in use again and no longer marked obsolete).
  `i18n.exists` decides, so a translation added later takes over by itself.
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
  pagination).

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
  band, and keep the Knowledge band's topic list as a plain section (naming it
  would announce a second generic site label, and a section without a name is not
  exposed as a landmark; review asked for exactly this). A
  second harness server in a non-English locale showed all three; English renders
  as before.
- **Skip link, landmarks and the OS tiles.** axe-core also flagged a positive
  `tabindex="1"` on the skip link on every page. It is already the first element
  in the document, so the attribute only reorders focus for what follows it and is
  gone. The catalog rendered its own `<main>` inside the platform's, which made
  three landmark findings on the home and services pages; it is a `div` now (no
  CSS or test depended on the tag). Help Center supplies the outer one: no template
  in this theme or in [upstream Copenhagen](https://github.com/zendesk/copenhagen_theme/tree/master/templates)
  emits a `<main>`, yet upstream's [`styles/_base.scss`](https://github.com/zendesk/copenhagen_theme/blob/master/styles/_base.scss)
  styles `body > main`, and saved pages of two real help centers show
  `<main role="main">` between the theme's header and footer with the theme's
  `#main-content` inside it ([one](https://github.com/genieck/genieck.github.io/blob/b4cd91e4a97468d2ba175c48f8fe8609aba0140f/support.digg.com/index.html#L55),
  [two](https://github.com/anishjana-star/LearnIndia/blob/caa2d4c83a90ce64b54826d7f4a5b42f50d99058/pricing.html#L46)).
  A Phase 10 review read the repository's templates as the whole page and asked for
  the `main` back. Measured in the offline render, which wraps pages the same way:
  as rendered the page has one main and axe is clean; with the catalog's wrapper made
  a main again it has two, and axe reports `landmark-main-is-top-level`,
  `landmark-no-duplicate-main` and `landmark-unique`. The wrappers (the page, its
  loading state and its error fallback) now carry a comment saying so. What cannot be
  checked offline is the live sandbox itself, where one `main` on the home and
  services pages is worth confirming. The OS-tile category page had no
  `id="main-content"` for the skip link to land on, so it has one.
- **Fixed-English blocks say so.** Review noted that the `.gov` banner and the
  footer's policy block are English on every locale, so on a non-English page
  assistive technology would read them in the page's language. [WCAG 3.1.2](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)
  (Level AA) asks that "the human language of each passage or phrase" can be
  programmatically determined, and [technique H58](https://www.w3.org/WAI/WCAG22/Techniques/html/H58)
  is the `lang` attribute with the primary code. The banner's `<section>` (the
  element that carries its `aria-label`) and the footer's bottom block now carry
  `lang="en"`. The footer's top navigation is the same case in miniature: its name,
  "Footer", is English while its links are translated, so the name moved to a
  hidden element with its own `lang` that `aria-labelledby` reads. The name is the
  same in every locale, which is what keeps the two footer navigation landmarks
  distinct for axe (a signed-out footer has only the policy navigation: owner
  decision 10). In the harness with a French page (`html lang="fr"`), the old
  templates resolved all of these to `fr`; they resolve to `en` now, the
  translated links stay `fr`, the screens are unchanged (22 of 22 captures
  identical) and axe is clean on all 18 states. The Understanding document adds
  that accessible names are flat strings and some assistive technology will not
  switch voices for them; that is a limit of the tools, and the markup is what the
  criterion asks for. The request page's own copy ("Suggested articles", "What
  happens after you submit?") is English in the original fork as well and is not
  part of this change.
- **Table regions and OS tile labels.** A later review noted two more fixed-English
  accessible names. A wide article table becomes a focusable region named by its
  caption, or by the English "Scrollable table" when it has none. With three
  captionless wide tables in a harness article the committed script named all
  three "Scrollable table", and axe reported `landmark-unique` on an English
  page, so the note was right before locale came into it. The fallback was first
  limited to English pages (`lang` of `en` or `en-` plus a region), and it is
  numbered when several captionless tables overflow ("Scrollable table 2 of 3",
  counted over the tables that overflow at that width and recomputed on resize).
  A captionless table on another language's page was first left focusable but
  unnamed (axe's `scrollable-region-focusable` still passed), on the reasoning that
  a name read in the wrong language helps less than none. The Phase 10 review of
  the final documentation commit showed the cost: that region has no role and no
  name, so a screen reader announces a focusable, scrolling element with no
  purpose. It now keeps `role="region"` and a name on every locale. On an English
  page the name is the `aria-label`, as before. On any other page it comes from a
  hidden `span` marked `lang="en"` inside the region, which the region references
  with `aria-labelledby`: [the accessible name computation](https://www.w3.org/TR/accname-1.2/#step2A)
  skips a hidden node unless it is part of an `aria-labelledby` traversal, so a
  hidden label can still name the region, and the English words are marked as
  English. The caveat above applies: names are flat strings and some assistive
  technology will not switch voices for them. A caption is the article's own text
  and is used on every locale. Measured in Chrome on a French page with three
  captionless wide tables and one with a caption: before, three regions were
  `generic` with an empty name and Tab stopped on each; after, all four are
  regions with a name ("Scrollable table 1 of 3", the caption, "2 of 3" and
  "3 of 3"), the hidden labels are never displayed, the boxes are the same size,
  and axe reports nothing on the French page or the English one. The English page
  is unchanged. Four specs for another language's page fail on the old code. The
  OS tiles' visible
  labels are new in this work (the images carried the same English as `alt` text
  before): English locales keep "macOS FAQs", "iOS FAQs" and "Windows FAQs"
  exactly, and other locales show the product name alone, since macOS, iOS and
  Windows are proper names that need no translation. In a French render the three
  links are named "macOS", "iOS" and "Windows", never empty; English renders are
  pixel-identical.
- **An independent check.** [axe-core](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
  4.13 over the nine page states at 1440 pixels with a mouse and 390 with touch:
  all 18 had findings before this round (`tabindex` on all 18, `nested-interactive`
  and `aria-tooltip-name` on the two desktop catalog states, the duplicate landmark
  rules on the four catalog states, a skip link without a target on the two OS-tile
  states); none do now. Axe finds a subset of what is wrong, so this is not a
  conformance claim.
- **Selected states in forced colors.** Review said the primary and selected
  buttons lose their boundary and their state in forced colors. I rendered the
  controls in both palettes. The boundary is fine: a transparent border is a color
  other than a system color, and [CSS Color Adjust](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties)
  forces those to one, so the primary variant keeps the edge the outline button
  has. The state was a real gap: the selected Yes or No vote differs from the
  plain one only by its fill, a voted comment arrow only by its color, and a
  selected follow button by its fill (Zendesk's [`subscribe`
  helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#subscribe-helper)
  also switches the label from "Follow" to "Unfollow", so that one was covered by
  text). In both palettes the selected and plain states were pixel-identical. Each
  now gets a 2 pixel ring in the system highlight inside its edge (a focused
  control keeps the focus outline outside it, as the sidebar row does); the two
  states then differ by 496 pixels for the votes, 248 for the comment arrow and 484
  for follow. The earlier Phase 4 scan had looked for missing boundaries, not
  missing states. Chrome's emulation, not Windows.
- **A focused selected filter keeps its focus ring.** The Phase 8 review found that
  the selected-row ring I added for the search results' filter list lacked the
  `:not(:focus-visible)` guard the catalog row's had, and as the more specific,
  later rule it replaced the global focus outline with an inside ring. Measured: a
  keyboard-focused selected filter was pixel-identical to the unfocused one in
  both palettes (no differing pixels), so focus was invisible on it. It is now the
  outside focus ring, like every other link, and the two states differ by 2,144
  pixels. Every `Highlight` outline in the file is now either guarded or the focus
  rule itself.
- **A failed catalog import shows at once.** When the catalog module cannot load,
  the template writes a one-line fallback (`.svc-catalog-fallback`) with a link to
  the services page, but the completion selector looked for links containing
  `/services/` and the fallback's link ends in `/services`, so the page showed its
  skeleton until the six second cap: the fallback was in the DOM at 0.25 seconds
  and visible at 6.6 on both the home and services pages. The selector now
  includes the fallback, and both pages show it in about 0.95 seconds (0.25 for the
  module's failure, 0.4 of settle time and a 0.3 second fade). A catalog that
  loads but is empty was missed by the same selector; see the polish decisions. If the request page's
  module cannot load there is still no fallback at all: its skeleton stays for the
  six seconds and then the form panel is empty, with only the one-line "Can't find
  the right service?" below it (see Open decisions).
- **Service descriptions show on devices that cannot hover** (owner decision). On
  desktop, hovering a catalog card shows its description in a tooltip; a phone has
  no hover, so the cards showed only an icon and a title, and the tooltip was
  hidden below 769 pixels. Where `hover: none`, the description now shows under the
  title in muted text (`#6f747a`, 4.7:1), two lines at most, and the tooltip is
  hidden. The services page at 390 pixels grows from 3,721 to 4,389 pixels (18%);
  desktop pointers are unchanged. This first version left a desktop window narrowed
  below 769 pixels with a mouse with neither the tooltip nor the description; the
  Phase 10 review of the code commit pointed it out, and it is fixed there (see the
  polish decisions).
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
  pixels still reads 4.0:1; the owner chose to leave it (see Open decisions).
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

Optimize decisions made during Phase 8 (each is easy to reverse):

- **How it was measured.** Pages were loaded in headless Chrome against the
  offline harness, which serves text gzipped the way a CDN would, with the cache
  off (a first visit). The phone profile is 390 by 844 pixels at 2x on the [Slow
  4G preset](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)
  (150 ms round trip, 1.6 Mbps down, 750 Kbps up) with the CPU 4x slower; the
  desktop profile is 1440 by 900 on 10 Mbps with a 40 ms round trip. Each figure
  is the median of three runs (five for the comparisons below). The metrics are
  first paint, [Largest Contentful Paint](https://web.dev/articles/lcp) (good at 2.5
  seconds or less), [Cumulative Layout Shift](https://web.dev/articles/cls) (0.1 or
  less), total blocking time from long tasks, bytes by type, and "ready": the
  moment the catalog or the form replaces its skeleton. Two cautions. The harness
  is a local HTTP/1.1 server with request-level throttling, which the same
  Lighthouse notes call "a decent approximation, it's not a sufficient model of a
  slow connection", and CPU throttling is [relative to the host machine](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md#benchmarking-cpu-power).
  So absolute times are indications, and the comparisons between variants on one
  machine are the evidence.
- **The hero artwork was most of the weight, and it is lossless now.** On the
  home page the artwork was 1.81 of 2.28 MB and the Largest Contentful Paint
  element, so on the phone profile the page was done when those bytes arrived
  (11.5 seconds). `settings/homepage_background_image.png` (3456 by 2234 pixels,
  8-bit RGB) was stored interlaced; it was written again without interlacing and
  recompressed with [oxipng](https://github.com/oxipng/oxipng), "a multithreaded
  lossless PNG/APNG compression optimizer", at its sixth level with Zopfli:
  1,851,030 to 929,092 bytes, 49.8% smaller. All 7.7 million pixels are identical
  to the original (an RGBA comparison finds no difference), the color type and bit
  depth are unchanged, and the 22 page captures are identical. Home on the phone
  profile: 11.5 to 7.1 seconds to LCP and 2.28 to 1.38 MB transferred.
- **Lossy options were measured and not applied.** Lossless WebP came to 740 KB
  (LCP 6.2 seconds); WebP at quality 95 to 312 KB (LCP 3.7 seconds, a mean error
  of about 0.5 in 255 and 99.9% of pixels within 9); at quality 90 to 198 KB; JPEG
  at quality 92 to 448 KB. The lossless PNG stays because it changes nothing
  visible. Whether Zendesk accepts WebP for a settings upload could not be
  confirmed from its documentation, so that is a question for the owner and the
  sandbox (see Open decisions).
- **The catalog skeleton is pinned to the stage, which removes most of the layout
  shift.** Chrome counts a node that is pushed out of the viewport as having
  moved, and the skeleton was in the flow: as the cards rendered, the stage grew
  from 460 to about 3,000 pixels and carried the skeleton down with it, which was
  0.12 of the 0.148 on the home and services pages on the phone profile. The
  skeleton is now `position: absolute` and pinned to the stage's 460 pixel floor
  (`--svc-stage-floor`). The screens are identical (22 of 22) and the shift is
  0.027. What remains is the greeting gaining a line when the signed-in user's
  first name arrives from the API (37 pixels; see Open decisions). On desktop the
  home pages report 0.036 to 0.048, each a single layout pass about 10 ms before
  the first paint, and the request page 0.02 (the footer moving as the form
  replaces its placeholder, unchanged from before); all are in the good range.
- **The toast host loads only where something can toast.** `document_head.hbs`
  imported the notifications host statically on every page, which pulled in React,
  the Garden components and i18next (the 254 KB gzipped shared bundle) even on an
  article, where nothing can toast. The head script now loads it only when a flash
  notification is waiting in `sessionStorage` (written before a redirect, and a
  non-empty JSON array: see below; unreadable storage counts as waiting, which is
  what every page did before) or
  the page has a module of its own (found by its inline module script: a page with
  a module can notify at any time, and its notifications wait in the bus until the
  host subscribes). Phone profile, Knowledge pages: script 261 to 12 KB, a
  category page 334 to 86 KB (74% less), blocking time 76 ms to none, and the load
  event 2.1 to 0.9 seconds. Fifteen checks pass in English and in French:
  no host or shared bundle on six Knowledge pages; both loaded once on four module
  pages; a waiting flash shows its toast on a category and an article page and is
  consumed; a failed form submit shows its error toast whether the host is already
  there or still held back (the toast queues until the host subscribes); and with
  storage unreadable the host still loads and fails exactly as before (the same two
  errors from the unchanged `FlashNotifications`, confirmed against the old head).
- **A value the host cannot use is dropped, not kept.** The Phase 9 review found
  that the first version of that check was a truthiness test, and the host
  (`FlashNotifications.tsx`) leaves a value it cannot parse in `sessionStorage`
  after logging an error, so a bad value (not JSON, `null`, an object, a number)
  would have loaded the 250 KB host on every Knowledge page for the rest of the
  tab session. That was measured before it was fixed: seeded with each of those
  four values and two Knowledge pages visited in one tab, the host loaded on both
  pages and the value was still there afterwards (two console errors per page).
  The head now parses the value and counts it as waiting only when it is a
  non-empty array; anything else, an empty array included, is removed and no host
  is loaded. With the fix, six checks (the five bad values and a real flash, which
  still loads the host once, shows its toast and is consumed) pass in English and
  in French, so 21 of 21 in each. A spec (`src/documentHead.spec.js`) lifts the
  check out of the template and runs that same code against a fake storage: ten
  tests, of which seven fail on the old template.
- **A guard for the translation instance.** The head used to run the host before
  any page module, and a lazily loaded host does not. `initI18next` resets the one
  shared i18next instance to no resources, so a host that initializes after a page
  module has loaded its translations would wipe them. `hasInitializedI18next()`
  now lets the host leave an instance that a page module has started alone. The
  failure is real, not theoretical: in a French render with the host held back for
  a second and a half, a second form failure after the host loaded came out in
  English without the guard (one French title of two) and in French with it. The
  host's spec fails on the old code.
- **What the static import did for free.** The same import made the browser fetch
  the shared bundle while it parsed the page, so the big download was under way
  before the page's own module asked for it. A dynamic import starts after
  parsing: the home and services hero image arrived 176 ms later and the request
  form was ready 154 ms later. A [`modulepreload`](https://web.dev/articles/modulepreload)
  link puts the download back at the start; that article describes the problem
  ("the browser needs to wait for a module to load before it finds out what its
  dependencies are") and the remedy of preloading so the browser "can keep the
  connection busy". Every template with a module script now carries one for
  `shared-bundle.js`. Home on the phone profile, five runs each:

  | Variant | First paint | LCP | Catalog ready | Blocking time |
  | --- | --- | --- | --- | --- |
  | Before: static import in the head | 736 ms | 7,080 ms | 5,255 ms | 81 ms |
  | Dynamic import, no hint | 680 ms | 7,256 ms | 5,266 ms | 111 ms |
  | Dynamic import, preload of the host's graph | 680 ms | 7,248 ms | 5,220 ms | 72 ms |
  | Dynamic import, preload of `shared` | 852 ms | 7,080 ms | 4,535 ms | 71 ms |
  | The same with `fetchpriority="low"` | 848 ms | 7,084 ms | 4,600 ms | 71 ms |

  The request form, five runs each:

  | Variant | First paint | LCP | Form ready | Load event |
  | --- | --- | --- | --- | --- |
  | Before: static import in the head | 736 ms | 756 ms | 3,563 ms | 2,389 ms |
  | Dynamic import, no hint | 676 ms | 696 ms | 3,717 ms | 2,553 ms |
  | Dynamic import, preload of `shared` | 856 ms | 872 ms | 3,546 ms | 2,383 ms |

  Preloading `shared` itself is the only variant that restored the image's timing
  (preloading the host, which would then discover `shared`, did not), and it makes
  the catalog ready about 0.7 seconds sooner than before and keeps the form as
  quick as before. The price is a first paint about 120 ms later, because the
  254 KB download now shares the connection with the stylesheet and the fonts.
  `fetchpriority="low"` changed nothing here, since the harness cannot tell
  priorities apart, so it is not used. The new request, requests and approval
  pages carry the same hint without a measurement of their own: the mechanism is
  identical and the harness has no ready signal for them.
- **Measured and left alone.**
  - Interaction speed. [INP](https://web.dev/articles/inp) is good at 200 ms or
    less. Every interaction on the services page, read from the Event Timing API
    at 4x CPU slowdown, took 56 ms or less on a phone (touch) and 48 ms on desktop
    (mouse): opening and choosing from the sort menu, typing in the search,
    clearing it, and expanding and selecting categories.
  - Fonts. Public Sans and Poppins are self-hosted with `font-display: swap`, so
    text paints in the fallback at first paint and the web font swaps in without
    moving anything (layout shift 0 on every Knowledge page on the phone profile).
    On those pages the first paint and the LCP are the same moment, so a preload
    has nothing to win and none was added.
  - The training button's width transition. It animates a layout property, but
    on a fixed button in its own box: hovering it costs 0.67 ms of layout across
    22 layouts and 19 ms of main-thread time in all, at 4x CPU slowdown. A
    transform-based version would change how the label opens, so it stays.
  - The stock `.notification` rule `transition: height .2s`. Nothing sets a
    height and an `auto` height cannot be interpolated, so it never runs; it is
    an upstream rule for a page this site does not use. (Phase 9 removed it while
    it moved the durations onto tokens, since it was the one literal duration
    that could not run.)
  - Preloading the hero image (`<link rel="preload" as="image">`, with and without
    `fetchpriority="high"`). LCP stayed at 7.08 seconds, first paint came 76 to
    232 ms later and the catalog 240 to 290 ms later: the download is bound by
    bandwidth, so asking for it sooner only slows the page's scripts. Not used.
  - The shared bundle itself (254 KB gzipped: React, Garden, i18next) is the
    upstream architecture; splitting it per module would change the build, and
    pages that need it load it once.

Expressive decisions made during Phase 9 (each is easy to reverse):

- **What each command came to.** The catalog is an Operate surface and the
  Knowledge pages are Read, and [Impeccable](https://impeccable.style)'s guidance
  for both is that motion serves feedback, state and continuity, with no page-load
  choreography, and that delight is concentrated at meaningful moments rather than
  spread around. So: `extract` moved every literal duration onto four tokens, and
  `animate` made two changes (the card hover and the anchor arrival, both below).
  `delight` found nothing further to add, and a celebration for a submitted
  request would be manufactured. `bolder` and `quieter` found no target: the
  Knowledge pages are meant to recede, and nothing is too loud (the one hot pink
  button is the owner's decision).
  `onboard` and `overdrive` became open decisions. The owner's decision names four
  moments (home hero, catalog card hover, article header, request success), and
  they came to this. **Home hero:** the greeting's authored fade, kept and now a
  token; a sequence for the search pill and the chips after it would make people
  wait for the control they came to use. **Catalog card hover:** the shadow now
  eases with the border, and the original's no-lift stays. **Article header:** the
  title is not animated, because a Read page that animates its title on load only
  delays the text; the cue goes to a heading reached by a link instead, which is
  where a reader loses their place. **Request success:** submitting already
  redirects to the new request with a "Service request submitted" toast waiting for
  it, which is the completion moment, and the page has no state of its own to
  animate. The category, section and search pages were not in the list and have
  none, because there a flourish only slows someone down.
- **Twelve durations become four, and every one of them falls to almost nothing
  under reduced motion.** The theme wrote its transition lengths by hand: twelve
  different ones from 0.1 to 0.45 seconds, across seven style files and two React
  components. They are now `--motion-fast` (150 ms: color, border and opacity under
  a pointer), `--motion-base` (200 ms: a routine state change), `--motion-slow`
  (340 ms: a change big enough to move something) and `--motion-arrive` (450 ms:
  the greeting), plus `--ease-out` for the training button's width. No duration
  moved by more than 60 ms (0.4 to 0.34 seconds on the tile zoom is the largest).
  Across the 18 page states there are 45 distinct transitions: 24 are exactly as
  before, 20 changed length by 60 ms at most, and one, the service cards', now also
  eases its shadow (below). Under
  [`prefers-reduced-motion`](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
  the four tokens are 0.01 ms. That is a hundredth of a millisecond and not zero
  because, in the [CSS Transitions spec](https://www.w3.org/TR/css-transitions-1/#starting),
  a transition starts only when its combined duration is "greater than 0s": with
  zero no `transitionend` ever fires for a script that waits on it, and with 0.01
  the change is instant and the event still arrives. The original author had
  already written overrides for the greeting, tooltips, skeletons, the training
  button and the search results, and gated the tile zoom. Measured with the page
  states loaded and the preference on, 12 theme-owned rules still ran before: ten
  color or border fades (buttons, chips, search borders, pagination, votes), the
  submit area's fade-in and the sidebar chevron's turn. None runs now. The one
  hand-written transition time left is the training button's 0.06 second label
  delay, which is a delay and not a duration. The authored animations keep their
  own timings and are each already off under reduced motion (the skeleton shimmer,
  the training button's pulse, the validation shake) or become a static highlight
  (the wash below).
- **Garden's chevron was the last movement, and it is held still.** WCAG's
  [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
  (2.3.3, Level AAA) says "Motion animation does not include changes of color,
  blurring, or opacity which do not change the perceived size, shape, or position of
  the element", so what remains inside Garden's components (22 rules: color,
  border, shadow, opacity, visibility and stacking order) is not motion. One was: Garden turns
  a select's chevron 180 degrees over 0.25 seconds, and on the request form it did so
  with the preference on (sampled as the menu opened: about 6, 60 and 153 degrees on
  the way to 180). One rule in `_svc-tokens.scss` now limits Garden icons'
  transitions to color under reduced motion, and the chevron arrives turned. No
  rule on any of the 18 page states, as loaded, transitions `transform` or a layout
  property under the preference now. The rule matches Garden's generated
  `StyledBaseIcon` class name, as the theme already does for avatars and menus; if a
  Garden upgrade renames it the rule stops matching and the turn returns, which is a
  mild failure.
- **Service cards: the hover shadow now eases with the border.** The one visible
  change at rest or on hover. The card's border faded over 0.2 seconds while its
  raised shadow snapped on at the first frame, which read as two events; both now
  ease over 200 ms. The cards still do not lift: the original author forced
  `transform: none !important` on them and that stays. Static pages are identical.
- **A heading reached by a link gets a wash.** A shared deep link, a table of
  contents entry or an in-article anchor scrolls a heading to the top of the window
  with nothing to say it was the one asked for. The heading
  (`.article-body` `h1` to `h6` that is the [`:target`](https://developer.mozilla.org/en-US/docs/Web/CSS/:target),
  or contains one) is washed with the selection tint (`--surface-selected`, the one
  the sidebar already uses for a selected row, so it is not a new color): it holds
  for 720 ms, long enough to be found after the jump, then fades to nothing by 1.8
  seconds and stays gone. It runs once per arrival and never on a page with no
  hash. With reduced motion the tint stays as a plain highlight for as long as the
  heading is the target; in forced colors, where authored fills are dropped, it is a
  2 pixel `Highlight` outline. Measured in headless Chrome by stepping the
  animation: the background at 0, 500 and 720 ms is the tint, then 61% at 1,000 ms,
  19% at 1,400 ms and clear at 1,800 ms; a heading that is not the target and every
  heading on a page with no hash have no animation; an anchor nested inside a
  heading also triggers it. The `:has(:target)` half of the selector sits inside a
  forgiving `:is()`, because [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
  says "If the `:has()` pseudo-class itself is not supported in a browser, the
  entire selector block will fail unless `:has()` is in a forgiving selector list,
  such as in `:is()` and `:where()`". In Chrome, a selector list with an unsupported
  pseudo-class is dropped whole (a `SyntaxError` on insertion) and the `:is()` form
  is accepted and still styles a heading that is itself the target.
- **Left as they were.** The tile zoom (the original author's, already gated on
  `no-preference`), the greeting's fade, the training button's width transition
  (Phase 8 measured its cost) and the validation shake (the original's, once, and
  `no-preference` only).
- **Weight.** `style.css` grew by 2.7 KB raw (1.2%) and 0.78 KB gzipped (2.0%) for
  the tokens, the wash, the forced-colors outline and the chevron rule, comments
  included; the two React bundles changed by 13 bytes each.

Polish decisions made during Phase 10 (each is easy to reverse). The final
[critique](design-critique-final-2026-10-13.md) (two isolated assessments: a design
review that saw only the screenshots, `PRODUCT.md`, `DESIGN.md` and the source, and a
detector and measurement pass) scored the portal 25/40, from 23 at baseline, and the
final [audit](design-audit-final-2026-10-13.md) 15/20, from 10. The critique's short
list of specific observations was measured in the offline render before anything
changed, and the ones that held are fixed:

- **The Device FAQs labels sit on one line.** The three tiles center a logo and its
  label as a group, and the logos are three different heights (10, 6 and 4.5 rem), so
  the labels sat at 429, 397 and 385 pixels down the page at 1440 wide. Where tiles
  share a row (from 31rem, two or more columns) each logo now gets the largest
  logo's box (`--os-logo-box`), so all three labels are at 429. The logos did not
  move (each is still centered at 333 pixels) and the tiles keep their height
  (252); on a phone, where each tile is its own row, nothing changes.
- **The search page's breadcrumb starts at the left on a phone.** The search page's
  own override centered the stacked breadcrumb (148 pixels wide, starting 121 pixels
  in at 390 wide); category, section and article pages stretch it across the row and
  start it at the left edge (358 pixels wide, 16 pixels in). The search page now
  does the same below the tablet width and keeps its centered row above it.
- **A page introduction no longer splits a name.** On a category page at 390 wide,
  "ARPA-H" broke after its hyphen and left "H." alone on a line (line widths 346, 347
  and 18 pixels). `text-wrap: pretty` on the description gives 346, 288 and 72, and
  leaves 360 and 414 wide as they were; a browser without it ignores the property.
- **The note under Submit is body text again.** Below 600 pixels it was 12 pixels
  (the badge size, which `DESIGN.md` reserves for badges and status labels) on a
  single line that truncated with an ellipsis; it only fit at 390 wide because it was
  small. It is now 14 pixels like the desktop note and wraps, so the service item
  page is 26 pixels taller on a phone (2,139 to 2,165) and the text can no longer be
  cut off.
- **The catalog's result count is a status message.** "15 services" changed with no
  announcement when a person searched, sorted or changed category. WCAG 4.1.3
  asks that "status messages can be programmatically determined through role or
  properties such that they can be presented to the user by assistive technologies
  without receiving focus" and its [Understanding page](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  lists "18 results returned" as an example. The first version put `role="status"`
  on the visible count. The review of the final documentation commit pointed out
  that a category change replaces the count row, so the region was inserted already
  holding text, and [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
  advises to "Establish the live region before updating its content. Start with an
  empty live region, then allow time for it to be exposed to assistive technologies
  before updating its content." Measured in Chrome with a click on a category: the
  old node was removed and a new one appeared holding the old "15 services", then
  "4 services" 4 ms later. Keeping the row mounted would not have been enough, because
  the count is the previous list's until a response arrives and would have been
  announced again. The announcer is therefore a separate region: visually hidden and
  out of flow (so the column gets no extra gap), in the page from the first render,
  empty while the list loads and holding the count once it has settled. The visible
  count is `aria-hidden` so the number is not read twice, and its row is unchanged.
  Measured the same way: one node for the whole sequence, empty while loading, then
  "4 services". Nothing visible changes (22 of 22 captures identical) and axe is
  clean on all 18 states. Four specs; three fail on the old code.
- **A failed submit moves focus to the first field that shows an error.** With
  required fields empty, the fields turned red and Garden's alert read "This field is
  required." beside each one, but focus stayed on the Submit button, so a keyboard
  user had to find the field that failed. The [W3C forms tutorial](https://www.w3.org/WAI/tutorials/forms/notifications/)
  says "If the submitted data contains errors, it is convenient to set the focus to
  the first `<input>` element that contains an error." The first version looked for
  `aria-invalid="true"` and the Phase 10 review found it missed checkboxes and
  attachments. Measured on a kitchen-sink form with each field type required alone,
  it missed more than that: a dropdown's and a multi-select's `aria-invalid` sits on
  a hidden input that cannot take focus, so focus stayed put for four of the five
  types (only a text field worked). Focus now goes by what the person sees: the
  first error message (`role="alert"`) in the form, then the first control in its
  field that a keyboard can reach, which is the text input, the checkbox, the
  combobox trigger (not the hidden input inside it) or the attachments drop zone
  (not the file input behind it). Measured in the built bundle with text, dropdown,
  multi-select, checkbox and attachments each required alone, focus lands on that
  field's control every time, and on the first of two empty required fields at 1440
  with a mouse and at 390 with touch. Eight new specs render the real field
  components (six for the helper, two for the checkbox); the checkbox now also says
  `aria-invalid` when it has an error, as its message was already tied to it with
  `aria-describedby`. The drop zone is left without it: [ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/#global_states)
  deprecates global use of `aria-invalid`, and the drop zone's role is `button`. This
  adds no new element; a summary of the errors would, and it is left as an open
  decision.

  The same handoff now follows a server-side rejection. A "previously missed" note on
  the review of the footer commit pointed out that the first version covered only the
  client-side check: when the server answers 422 with `details.base` naming a field,
  `handleValidationErrors` marks the field but nothing moved focus. Measured in Chrome
  on the kitchen-sink form (one required text field, filled, with the submit answered
  by a 422 naming it): the field showed "Short text: is too long" and `aria-invalid`,
  and focus was on the page body, not even on Submit, because the button is disabled
  for the attempt. The field errors are now committed with `flushSync` (updates made
  after an `await` are not flushed with a later synchronous one, so the DOM would not
  have the error yet), the button is freed, and focus goes to the first error. After
  the change focus lands on the field's input; with the committed bundle it still
  lands on the body. A failure that shows no field error (a 500, a 422 with no field
  id, which is a toast) asks for nothing. Two specs: the handoff comes after the error
  update and frees the button, and a 500 asks for no handoff (the first fails on the
  old component).
- **The help rail says its hint once.** Before anything was suggested, the rail on
  the request page read "Related content appears as you type." and, a line below,
  "Start typing in the request form to see related help articles.": the same
  sentence twice. The subtitle now waits for the results
  (`.svc-article-card:has(.svc-article-empty) .svc-article-subtitle { display: none; }`),
  so no copy changes. Measured with a title typed into the form: the subtitle is
  hidden in the empty state (the rail's header is 18 pixels tall instead of 43) and
  shows again with the five suggestions. On a phone the page is 25 pixels shorter
  (2,165 to 2,140). A browser without `:has()` keeps both lines, as before.
- **The card tooltip works in a narrowed desktop window.** A catalog card's description
  is hidden and shown in a hover tooltip, and where the device cannot hover
  (`hover: none`) it is shown under the title instead (Phase 7). Two conditions
  decided that: the script and the inline description used `hover: none`, but an older
  rule hid the tooltip below 769 pixels for every pointer, so a desktop window narrowed
  below that width with a mouse got neither (the Phase 10 review of the code commit
  found it; it was already recorded here as an open decision). Measured in Chrome
  before the change, hovering a card with a mouse at 1440, 600 and 360 pixels wide: the
  tooltip showed at 1440 only, and no description showed at the other two. The rule is
  removed, so `(hover: none)` alone decides, for the tooltip and the description alike:
  a mouse gets the tooltip at every width (inside the viewport at 360 as well), a phone
  still gets the description under the title, and the card is described by it through
  `aria-describedby` wherever it is not shown. The alternative, showing the description
  below 769 pixels as well, would have made the list taller in narrow windows, which
  the owner's "desktop pointers are unchanged" decision argued against. Resting pages
  are identical to the build before (the document is 2,045, 2,610 and 3,758 pixels tall
  at 1440, 600 and 360 wide with a mouse and 4,389 on a 390 pixel touch phone, before
  and after), 22 of 22 page captures are identical, and the tooltip is invisible until a
  card is hovered. No unit test: the change is one rule in a stylesheet, checked in
  Chrome.
- **A catalog that loads empty is revealed at once.** The page swaps the skeleton for
  the catalog when real service links, the module's error screen or the
  module-failure fallback appear (Phase 7 added the last two). A catalog that loaded
  successfully with no services has none of them, only the "No services in sight"
  state, so the skeleton stayed over it until the six second cap. A "previously
  missed" note on the review of the count fix found it; the same predicate sits in
  the home and the services templates. Measured in Chrome with the catalog's search
  answered with zero services: the empty state was in the page at about 0.15 to 0.3
  seconds and the catalog was revealed at 6.1 to 6.3 seconds, on both pages. The
  count announcer (above) is empty while the list loads and holds text once it has
  settled, whatever the count, so it is a completion signal too. It carries a
  `data-service-count` marker: a bare `role="status"` would also match any other
  status region. Both pages now reveal at 0.56 to 0.76 seconds, the same as a
  populated catalog (0.57 to 0.59 seconds, unchanged). The announcer's sequence is
  unchanged, 22 of 22 page captures are identical, and axe is clean on all 18
  states. Twelve specs lift the selector out of each template and run it against
  what the module renders in each state; the two for a catalog with no services fail
  on the old templates.
- **A typo in a default.** The default text of the alert banner setting
  (`manifest.json`) said "inquires" twice, for "inquiries". It predates this work and
  only a fresh install reads it, since Admin Center values override the default.
- **Two statements in `DESIGN.md` now match what is built.** The catalog's service
  filter is a Garden field with 4 pixel corners (measured), not a pill, so the Shapes
  section says the hero search is the pill and the filter keeps Garden's corners; and
  the rule against nesting a card inside a card names the catalog's large panel as the
  one container for the grid.
- **Measured and left, then fixed.** The pagination buttons touched in the offline
  render ("Next ›" and "»" shared an edge at 528.2 pixels) and the share icons on
  articles came from the `show_article_sharing` setting, which was on by default. I
  could not tell from the render whether the sandbox showed either, so both were left
  for it; the owner then confirmed the pager touched and asked for both to change, which
  is owner decisions 12 (a text-only pager with a gap) and 13 (the sharing settings and
  markup removed). Article and section titles in the category page's lists are
  body-colored with no underline, as they were before this work (checked against the
  baseline capture), so a link only reads as one by its place in a list.
- **A runtime call to a third party.** The service icons come from Iconify's public
  API (`api.iconify.design`, with two fallback hosts) unless the Guide setting
  `iconify_api_base` names a self-hosted API; it is empty in `manifest.json`, and
  `src/modules/shared/service-icons/iconConfig.ts` documents it for "a
  government/enterprise deployment". That is the original design with a documented
  switch, so nothing changed here, but whether a .gov page should call a public
  service for its icons is a question for the owner (see Open decisions).

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
Chrome with every non-local request blocked. Pages are wrapped in
`<main role="main">` between the header and the footer, as Help Center does (see
the landmark decision under Phase 7). Instant search is a Zendesk web component
and is not emulated; it still needs a look in the sandbox after the pull request
is merged, and so does that wrapper: the home and services pages should have
exactly one `main` landmark.

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
| 7 | Target size (WCAG 2.5.8, with the nested-target and spacing rules applied): failures on the nine page states went from 1 control on 2 pages (the 12 pixel category toggle) to 0 in all 18 combinations (touch at 390 pixels, mouse at 1440); a padded search title that would have made 18 breadcrumb links fail was caught and left out. Touch targets under 44 pixels: category page 41 to 20, section 32 to 20, article 36 to 34 (36 to 29 by box size; the related and recently viewed lists keep a 40 pixel area because neighbors overlap by 4). Keyboard on the catalog's category toggle: Enter and Space did nothing, because the row cancelled them (a review finding, present in the original code); both now expand and collapse, and the toggle is no longer inside a button. axe-core 4.13 over the nine page states at 1440 (mouse) and 390 (touch): findings in all 18 before, none after. Renders on a desktop pointer after this round: 54 of 55 identical to the build before; the 55th (home at 1440) differs by 18 pixels of at most 8 of 255 on one icon edge, with identical geometry to three decimals. Skip link on focus: 2.2:1 (dark blue on black) to 21:1. "Popular:" label at the lightest pixel: 3.4 to 4.2:1 to 4.0 to 5.1:1 at 600 to 768 pixels (typical 6.8 to 7.8:1 to 8.7 to 10.1:1). False "Read more" at 1024 pixels: 4 of 8 loads to 0 of 12. Catalog at 390 pixels on a device that cannot hover: descriptions visible, page 3,721 to 4,389 pixels tall. Print: a stylesheet where there was none, checked on all nine page states; the interactive elements visible in print went from 9 on the services page (6 category rows, a toggle, the search field and the sort menu) and 6 on the request page to none on the catalog pages and the request form's own 5 fields, and the home and services pages print about 320 pixels shorter. The 45 combinations of nine pages at five widths: no overflow, no contrast failures, no colors outside the palette and no control without a focus ring. Renders on a desktop pointer: 45 of 55 identical to Phase 6, and the other 10 (home and services at five widths) differ only in the 52 by 15 pixel patch of the "Popular:" label; the "Read more" timing difference that showed in earlier comparisons is gone. Language of parts: on a French page the `.gov` banner, the footer's policy block and the footer navigation's name resolved to French before and resolve to English now (the translated footer links stay French), with the screens identical (22 of 22) and axe clean on all 18 states. Scrollable tables: three captionless wide tables in an article were all named "Scrollable table" (axe: `landmark-unique`, moderate) and are now numbered 1 to 3 of 3 with a captioned one untouched (axe clean); on a French page they stayed focusable and unnamed until the Phase 10 review, and are now named through a hidden English label (see the polish decisions). OS tiles: English identical, French links named "macOS", "iOS" and "Windows". Unit tests: 94 suites and 902 tests (877 before; five new for "Read more", six for the sidebar's controls, six for the card descriptions, two for the print hooks, six for the table names). |
| 8 | Phone profile (Slow 4G, 4x CPU slowdown, cache off, median of three), before to after. Home: LCP 11.5 to 7.1 s, layout shift 0.148 to 0.027, blocking time 179 to 86 ms, 2,278 to 1,378 KB; services: LCP 11.5 to 7.1 s, layout shift 0.148 to 0.027, blocking time 204 to 79 ms, 2,280 to 1,382 KB. Signed-out home: LCP 10.9 to 5.5 s, 2,162 to 1,014 KB, script 261 to 12 KB, blocking time 92 to 0 ms. Knowledge pages (category, OS tiles, section, article, search): LCP 764 to 920 ms down to 688 to 852 ms, script 261 to 12 KB, transferred 334 to 382 KB down to 86 to 134 KB (65 to 74% less), blocking time 63 to 139 ms down to 0 to 12 ms, load event 2.1 to 2.4 s down to 0.9 to 1.1 s. Request form: first paint 760 to 856 ms and LCP 780 to 872 ms (the price of the preload; the form is ready as fast as before, 3,563 and 3,546 ms in the five-run comparison), blocking time 80 to 57 ms. Catalog ready on home: 5,255 to 4,562 ms. Interactions at 4x CPU slowdown: 56 ms at worst on a phone and 48 ms on desktop (good is 200). Desktop, after (no earlier desktop baseline was taken): home LCP 1.20 s, signed-out home 0.96 s, Knowledge pages 168 to 192 ms, layout shift at most 0.048. Pixels: the re-encoded hero differs from the original in none of its 7.7 million pixels, and 22 of 22 captures are identical across the phase. Unit tests: 95 suites and 908 tests (94 and 902 before this phase; two new for the translation guard, four for the localized control names after review). |
| 9 | Computed transitions and animations across the 18 page states (nine pages at 1440 pixels with a mouse and 390 with touch): 45 distinct rules, of which 24 are unchanged, 20 changed in length by 60 ms at most and one (the service cards') now also eases its shadow; twelve literal durations became four tokens. With the reduced-motion preference on: theme-owned rules that still ran went from 12 to 0, and no rule transitions `transform` or a layout property (Garden's chevron turn ran for 0.25 seconds with the preference on and is now instant); the 22 rules left are Garden's color, border, shadow, opacity, visibility and stacking-order changes, which WCAG does not count as motion. The anchor wash, stepped frame by frame: the full tint at 0, 500 and 720 ms, 61% at 1,000 ms, 19% at 1,400 ms and clear at 1,800 ms; no animation on a heading that is not the target or on any page with no hash; a static tint under reduced motion; a 2 pixel `Highlight` outline in forced colors; an anchor nested in a heading also triggers it. Pixels: 22 of 22 page captures identical to the build before Phases 8 and 9 (nothing here changes a resting page). axe-core over the 18 page states: no findings. Generated files: `style.css` +2,661 bytes raw (+780 gzipped), the two React bundles +13 bytes each. Unit tests: 96 suites and 918 tests (95 and 908 before this phase): the CSS changes have no unit tests and are checked by the computed-style probes above, and the ten new specs cover the toast host check from Phase 8 that the Phase 9 review found too loose (seven of the ten fail on the old template). |
| 10 | Final critique, run as two isolated assessments like the baseline: 25/40 against 23/40, with status feedback, consistency and minimalism up a point each and user control down one (a difference between reviewers, explained in the document). Final audit: 15/20 against 10/20, each of the five dimensions at 3 from 2. Measured on the 18 page loads, baseline to final: horizontal overflow on 2 loads to none; colors off the palette in the rendered pages 35.7% to 0 (3.7% counting the stock banner's three colors); text pairs below 4.5:1 21 elements to none; distinct font sizes 20 to 9; text nodes under 14 pixels 37.7% to 4.7% (the stock banner supplies 45 of the 50); Tab stops without a visible focus change 10 to 0 of 691; pages with exactly one h1 7 to 9 of 9; states with axe-core violations 18 (46 rule hits) to none; HTTP errors 4 to 0. Polish: of the 22 page captures, four changed by exactly the fixes (the Device FAQs labels, the search breadcrumb at 390, the category introduction at 390 and the note under Submit at 390), and one later fix changed the help rail on the request page; axe-core stays clean on all 18 states. A failed submit now moves focus to the first field with an error for text, dropdown, multi-select, checkbox and attachments fields, each required alone (before the polish it stayed on the Submit button for every type), and so does a server rejection (422) that names a field: measured on a text field, focus was on the page body before and is on the input now. With a mouse in a window narrower than 769 pixels a catalog card now shows its hover tooltip (before: neither the tooltip nor the description), and resting pages are unchanged (22 of 22 captures identical). From 1024 pixels the search pill on the service item page shares its left edge, right edge and center with the help rail's card at five widths from 1024 to 1920, at 150% and 200% text, with a long breadcrumb and in right-to-left (before: 360 pixels against 320, 40 pixels too wide on the left and 20 off center); 21 of 22 captures identical, and the 22nd (the item page at 1440 pixels) differs only inside the pill. Unit tests: 99 suites and 949 tests (96 and 918 before the polish: two new for the count's status role, one for the focus handoff, six for the helper on real field components, two for the checkbox; and, after the Copilot reviews of the final commits, two more for the count's announcer, four for the table labels on other languages' pages, twelve for the catalog's completion check, a suite of its own, and two for the handoff after a server 422). For the owner's later requests (decisions 12 to 14): of the 22 page captures, 16 are identical to the build before, and the other six differ by exactly the changes (the section and search pages at both widths, in the pager row only; the article page at both widths, 41 pixels shorter without its share icons); the two tab fixtures and the pager add four more states to the axe-core pass, which is clean on all 22; the stress fixture's long tab name (607 pixels wide, 238 pixels of sideways scroll at 390) now wraps inside its pill with no overflow. Unit tests: 101 suites and 1,024 tests (99 and 949 before; 52 new for the tab labels and the platforms' files, and 23 for the first bytes of every SVG asset). Generated files: `style.css` 224.3 KB and `script.js` 49.4 KB, against Zendesk's [limit](https://support.zendesk.com/hc/en-us/articles/4408831783962-Knowledge-product-limits-for-your-help-center) of 800 KB each, and four assets of 3.7 KB in all (the limits are 5 MB an asset and 50 MB in total; there is no cap on the number of assets). |

## Open decisions

Resolved with the product owner: the USWDS exception and the `.gov` banner
(owner decision 1), the Knowledge entry point on the home page (decision 2),
the footer's policy links (help.arpa-h.gov is public, so the public HHS and
arpa-h.gov policy pages belong there, less the public footer's "Download Adobe
Plugin" link, which the owner dropped as not needed: owner decision 9), the footer's site links for signed-in visitors only (decision 10), the Admin Center settings (decision 5) and,
in the Phase 7 review, the "Popular:" label at 768 pixels, which reads 4.0:1 at its
lightest pixel and stays as it is: a dark pill like the chips would clear 4.5:1
(10.7:1 at the worst pixel) but adds a visible capsule that could read as a sixth,
non-clickable chip, and the owner prefers the original look.
Still open:

- Whether pages without their own search should get a search entry point. Nine templates render no page-level search (applications, approval request and approval request list, contributions, error, request, requests, subscriptions and user profile). They had none before this work either: the base theme hid the header search on every page (`html body .header .search-wrapper { display: none !important; }` in `styles/_svc-tokens.scss`, still the case on the `sandbox` tip), so this work removed dead markup rather than a visible control. A compact search in the header on those pages is the cheapest fix if the owner wants one.
- Moving the hard-coded OS tile IDs in `category_page.hbs` into settings. (It would need a number-type setting, because the [`is` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#is-helper) "is always based on the `===` JS operator"; left as is, since `distill` removes code and does not add Admin Center settings.)
- Two theme settings read by nothing that renders: `community_image` ("Community banner"; its only consumer, the `.community-image` rule, was dead and is removed in Phase 5) and `service_catalog_hero_image` (its consumer, `.service-catalog-hero`, is used by no template). The hero artwork comes from `homepage_background_image`. Both stay in `manifest.json`, because removing a setting changes the Admin Center, which is the owner's call.
- The live [arpa-h.gov](https://arpa-h.gov/) still ships the older USWDS 1.x banner copy ("The .gov means it's official."); this theme uses the current official 3.x text. Whether the two should be aligned is a content decision for the main site's owners.
- The banner copy is English only, because a theme cannot add Help Center translation keys; USWDS publishes Spanish text if a Spanish locale is ever enabled. Until then the banner and the footer's policy block are marked `lang="en"`, so assistive technology reads them as English on any locale.
- The copy this work wrote (the signed-out hero sentences, the Knowledge band's heading and lede, the "Search help articles" placeholder and label, the "Scrollable table" fallback name (the `aria-label` on English pages, a hidden `lang="en"` label elsewhere), the "FAQs" on the OS tiles and the sidebar toggle's "subcategories" name) is English and shows only in `en-` locales, for the same reason; every other locale gets the fallbacks described under Phase 6, Phase 7 and the table and tile decisions. If a second locale is ever enabled, each of those strings needs a translation route: a theme cannot add `{{t}}` keys, so the options are Zendesk Dynamic Content (the [`dc` helper](https://developer.zendesk.com/api-reference/help_center/help-center-templates/helpers/#dc-dynamic-content-helper), "translated according to the current locale") or one `contains` branch per locale. The request page's own copy and accessible names ("Service request form", "Help with this request", "What happens after you submit?" and the rest) are English in the original fork and are not part of this work.
- If the request page's module cannot load (for example its script is blocked), the skeleton stays for six seconds and the form panel is then empty, with no message; the one-line "Can't find the right service? Submit a general request." below it is the only way forward. The catalog pages write a fallback for the same failure; the request page does not. A message needs new copy and a locale decision, so it is left for the owner.
- Where suggested articles belong on the request page on a phone. They update as someone types, but the help rail follows the form, so a phone user sees them only below the Submit button. Putting the rail first would push the form down and shift the page as results arrive; an alternative is a compact "Related articles" strip just above Submit. Left as is until the owner chooses.
- The popular chips (33 pixels), the footer links (29) and the breadcrumbs (16) are under 44 pixels on a phone. They meet the 24 pixel minimum by size or spacing; padding them would move the footer, make the pills taller and change the breadcrumb line.
- The training button shows its label on hover or keyboard focus only; on a phone it is the cap icon. Whether it should carry a permanent short label ("Training") on touch devices is the owner's call.
- The hero artwork's format. The lossless PNG (929 KB) is kept so that nothing visible changes. On the phone profile the home page is bound by that one download: WebP at quality 95 is 312 KB (LCP about 3.7 s against 7.1 s) with a mean error of about 0.5 in 255 and 99.9% of pixels within 9; lossless WebP is 740 KB (6.2 s). I could not confirm from Zendesk's documentation that a settings upload accepts WebP, so the owner would need to try it in the sandbox first.
- Three copies of the old hero and one unused asset. `settings/community_background_image.png`, `settings/community_image.png` and `settings/service_catalog_hero_image.png` are byte-identical copies of the original 1.85 MB hero (the defaults of three settings), and `assets/Finder_Icon_macOS_Tahoe.png` (280 KB) is referenced by nothing in the theme; an article might reference it by its theme asset URL, which cannot be checked offline. None loads on the pages measured, so they cost package size (about 5.5 MB and 0.3 MB), not page weight. Replacing a default changes Admin Center and deleting an asset could break an article, so both are left to the owner.
- The greeting's extra line. When a signed-in user's first name arrives from the API the greeting can wrap onto a second line and move the content below it by 37 pixels, which is the remaining 0.027 of layout shift on the home and services pages. Reserving the line leaves a blank gap for short names; keeping the name in browser storage so the first paint can include it raises a privacy question. It is left for the owner.
- Three bigger motion ideas, recorded and not built, because `overdrive` pushes past conventional limits and which direction (if any) is the owner's call. Each would be a progressive enhancement behind `prefers-reduced-motion: no-preference`, so a browser without the feature simply keeps today's behavior. (1) Cards that glide to their new places when the catalog is sorted or filtered, using [same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document) ("supported in Chrome as of Chrome 111"). (2) A short cross-fade between pages, using [cross-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) ("supported in Chrome from Chrome 126"; "Both pages need to opt-in", with `@view-transition { navigation: auto; }`). (3) A reading-progress line on articles, driven by [scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations) (Chrome and Edge 115, Safari 26; that page's own reading-progress demo is the pattern). The line would need a color that is not cyan, under the Cyan Is Action Rule.
- My requests has no first-use state. `RequestsTable` renders the bare text "No requests found" whenever the list is empty, so a person who has never submitted a request meets a dead end, and so does someone whose search matched nothing. The `request-list` module knows whether a search or filter is active, so a first-use message with a link to the service catalog is feasible (`onboard`). The page is outside this work's scope (pages outside the catalog and Knowledge inherit tokens only) and has no offline fixture to check it against, so it is left for the owner.
- From the final critique, not built, because each changes information architecture, content or product behavior (the [final critique](design-critique-final-2026-10-13.md) has the evidence for each). (a) The front door: the hero search and the popular-search chips send service intents to articles (four of the five chips name things that are also catalog cards), results have no "Matching services" row, the Knowledge search is silently scoped to the current category, and the no-results page has no request or Ask AI route. (b) The shell: the desktop header carries no navigation (Services, Submit a request and My requests are in the footer, for signed-in visitors, and the avatar menu), the signed-in home shows nothing about a person's own requests, and the alert banner reaches signed-out visitors only, which `PRODUCT.md` records as an owner decision. (c) The urgent path: no Service Desk number or hours outside the alert's default text, no lost-PIV-card service (only an article), and no route for a locked-out visit. (d) The catalog grid: fifteen cards of equal weight, hover-only descriptions on desktop (an owner decision from Phase 7), repeated icons and A to Z sorting only. (e) The submit moment on phones: the rail after the Submit button (above), no saved draft, and a hidden Requester line.
- An error summary on the request form. A failed submit now moves focus to the first field with an error, but each empty field says only "This field is required." and nothing says how many fields need attention. A "2 fields need attention" list with links is the stronger pattern and adds a visible element, so it is left for the owner (see the [final audit](design-audit-final-2026-10-13.md)).
- Where service icons come from. The catalog asks Iconify's public API for icon data at runtime (`api.iconify.design`, with two fallback hosts) unless the Guide setting `iconify_api_base` names a self-hosted [Iconify API](https://iconify.design/docs/api/); it is empty. The other route is `[icon: file.svg]` references served from theme assets. Either keeps the traffic inside the agency; which one is the owner's call, and what the live theme has set is worth checking first. The four platform icons on article tabs (`assets/apple.svg` and its siblings) take the second route and never call out, and a catalog item can use them by name too (`[icon: ios.svg]`).
- What only the sandbox can show for the pager, sharing and tabs (owner decisions 12 to 14). The pager: Zendesk's real markup (the render writes First, Previous, Next and Last; the documented output also lists page numbers, which the styles cover). The tabs: that the article editor's Tabs component stores the structure the emulation assumes, that Zendesk's script still adds the `.wysiwyg-tabs-tab` buttons (by Zendesk's own account the component's structure "might change") and that the four icons load from the theme's assets. Each fails soft: a pager whose markup differs still has a gap and no stroke, and tabs that do not match the styles are Zendesk's default tabs. Settings: that the Settings panel no longer lists "Social sharing" and that no article shows a share row.
- Whether the credit for the macOS icon (CC BY 4.0) should also be visible. The license lets the credit be given ["in any reasonable manner based on the medium, means, and context"](https://creativecommons.org/licenses/by/4.0/legalcode.en) of the use, and it is in the icon file and in `NOTICE.md` (creator, a link to the icon, the license, and that the `viewBox` was cropped). The page shows no credit; a line in the footer is the visible alternative and the owner's call.
