# Design critique: final, 2026-10-13

Method: two independent assessments, run after Phase 9 and before the last polish. Assessment A was a design review that saw only the frozen screenshots (the eleven page states at 1440, 768 and 390 pixels wide), `PRODUCT.md`, `DESIGN.md` and the source; it never saw the detector output, the design plan, this pull request or the baseline critique. Assessment B ran the Impeccable detector and the offline measurements and gave no opinions. Each ran as its own sub-agent and neither could see the other's output, which is the split the [baseline critique](design-critique-2026-10-12.md) used.

Evidence: the same offline harness as the baseline (the theme's real templates with Zendesk helpers stubbed and API responses mocked, so the content is synthetic; Zendesk's instant-search web component is not emulated). Handlebars renders the templates, Dart Sass compiles `styles/index.scss`, and headless Chrome takes the screenshots and the measurements with every non-local request blocked.

Scope: the Service Catalog (home, services, service item) and Knowledge (category, section, article, search results) plus the shared header and footer, at 1440, 768 and 390 pixels wide.

## Design Health Score

| # | Heuristic | Baseline | Final | Key issue now |
| --- | --- | --- | --- | --- |
| 1 | Visibility of system status | 2 | 3 | Feedback on an action is good (skeleton, counts, "Submitting…", success toast then redirect), but signed-in staff never see the alert banner and nothing shows their open requests or approvals |
| 2 | Match between system and real world | 3 | 3 | Plain second person, but one thing has several names (Services, Service catalog, All services; help articles, Knowledge Base, IT Help) and the 404 still says "Oops!" |
| 3 | User control and freedom | 3 | 2 | The form invites you to leave it (same-tab suggested articles, a search pill above it) yet keeps no draft and does not warn on leave |
| 4 | Consistency and standards | 2 | 3 | Tokens, header, footer and cards agree now; search still has five treatments and three labels, and the two request forms differ |
| 5 | Error prevention | 2 | 2 | Validation runs only after submit, Priority defaults to "-", card descriptions are hover-only on desktop, and there is no duplicate-request check |
| 6 | Recognition rather than recall | 2 | 2 | The desktop header has no navigation: Services, Submit a request and My requests live in the footer or the avatar menu |
| 7 | Flexibility and efficiency | 2 | 2 | Chips, instant search and deep links help; there is no most-requested lane, recent services or repeat request |
| 8 | Aesthetic and minimalist design | 2 | 3 | Restrained palette, one lit control, good type; General request appears three times and the footer has nine policy links |
| 9 | Error recovery | 2 | 2 | Every empty required field says "This field is required." and the server toast says "Give it a moment and try it again"; the 404 and no-results states are dead ends |
| 10 | Help and documentation | 3 | 3 | A searchable, task-focused knowledge base, Ask AI and a "what happens next" rail; no Service Desk number or hours outside the alert text |
| | **Total** | **23/40** | **25/40** | **Acceptable (20 to 27), three points short of Good** |

How to read the comparison: the two reviews were independent, so a one-point move can be reviewer variance as well as change. What it does support is that the heuristics this work targeted went up (status feedback, consistency, minimalism), and that the lowest scores now are the areas the brief left alone: recognition, flexibility, error prevention and recovery. Heuristic 3 went down by one because this reviewer weighed an unsaved draft and a search box above an open form, which the baseline reviewer did not raise; the form's own structure is better than it was. The final reviewer's summary: the craft layer (tokens, focus, motion, print) is in the Good band, and navigation, search, urgency and recovery are what hold the total down.

## Design specificity verdict

**Service Catalog: partly authored, structurally generic.** Grounded in ARPA-H: the vocabulary (PIV certificate renewal, lost or stolen device, shared mailbox or distribution list, government-furnished device), the NEXUS indigo and cyan with one hot-pink search button, the arc artwork running behind a transparent header so the bar and hero read as one dark band, the untouched `.gov` banner, and a "lit service counter" idea with a real point of view. Interchangeable: a greeting, a pill search, five chips, a left category rail with counts, a four-up grid of icon-over-title cards and a "Still can't find what you need?" strip is the stock service-portal template. Two pairs of cards repeat an icon (a key for both "Password or MFA reset" and "Software license", a phone for both "Lost or stolen device" and "Mobile device"), the default sort is A to Z so a lost device ranks beside a software license, and nothing in the structure encodes what is distinctive about ARPA-H IT: time-critical credential and device incidents, a PIV lifecycle, supervisor approvals.

**Knowledge: category-interchangeable.** Category, section, article and search are Copenhagen's information architecture on the new tokens: breadcrumb and search pill, plain link lists, a sibling-article sidebar, helpful votes, related and recent lists. The one ARPA-H-shaped object is the Device FAQs tile page. (The baseline verdict was the same for Knowledge, "category-interchangeable", and the structure was out of scope: the brief was a reskin on NEXUS with the signature carried through, not a new information architecture.)

## Overall impression

The portal now looks like one product: one indigo band from the banner through the header into the hero, one container and column grid, one type scale, one action color, one focus ring, and a footer that matches the rest of ARPA-H. The remaining weaknesses are not visual. They are about where the front door sends people (articles when the intent is a service), what the shell carries (no navigation, no view of a person's own requests), and what happens in the most urgent moments (a lost device or PIV card, a locked-out visit). Those are product and content decisions that the brief put out of scope ("microcopy only; service names, popular chips and article content untouched"), so they are recorded as open decisions and not built.

## What is working

1. **The service item page.** One 720 pixel form column, one cyan primary action, a quiet help rail and no nested shells; the button becomes "Submitting…" and success lands on the new request. It is the clearest expression of "answers before tickets".
2. **The article reading experience.** A 32em measure at 1.62 leading, a clear heading rhythm, an in-flow callout, a captioned figure, a table that scrolls inside its own labeled region and a closing "Still need help?" block.
3. **The hero as one dark band with one lit control.** Cyan stays on things that can be pressed, the signed-out state says why the page is empty and offers one action.

## Baseline issues: where they stand

| Baseline issue | Now |
| --- | --- |
| P1: Knowledge pages lose the signature and break their own layout (wrapped title, 230 pixel void, 84 to 104 character lines, glued pagination, removed tile assets) | Resolved: one container and grid, a 70 character measure, the title on one line, the tiles rebuilt as a responsive grid with labels. The glued pager buttons remain in the offline render (see Minor observations) |
| P1: The front door overpromises and omits doors (placeholder says services, chips open article searches, nothing links into Knowledge, Ask AI invisible) | Partly: every search says what it covers, Ask AI is readable, the signed-in home has a Knowledge band. The chips still open article searches and the shell still has no phone number (Assessment A raises both again as P1) |
| P1: Service cards hide what tells them apart | Partly: descriptions show under the title where a device cannot hover and reach screen readers everywhere (`aria-describedby`); on desktop they stay in a hover tooltip |
| P1: Contrast and color roles fail Section 508 and NEXUS | Resolved: no text pair under 4.5:1, one action color, a ring on every control (see the final audit) |
| P2: The item page competes with its own task | Resolved: rebuilt around one column and a rail; on a phone the rail still follows the Submit button (an open decision) |
| P2: Signed-out and status states are dead ends | Resolved for signed-out visitors (a sentence and a Sign in action); the alert banner still does not reach signed-in staff, which `PRODUCT.md` records as the owner's decision |

## Priority issues

No P0. Assessment A found five; each has the disposition it was given.

1. **[P1] Search is fragmented, and the largest search controls send service intents to Knowledge.** The hero search and all five chips query Knowledge only; the catalog has its own "Search for services" box; Knowledge pages carry a third field labelled just "Search" that is scoped to the current category (`scoped_kb_search`); the results page filters by Knowledge Base and Community and has no Services type; the no-results state has no request or Ask AI route. Four of the five chips name things that are also catalog cards. *Fix suggested:* point service-intent chips at the item, add a "Matching services" row above article results, label or drop the scoped search, give no-results three exits. *Disposition:* left for the owner. It changes content (the chips) and routing, and `PRODUCT.md` Principle 2 admits the split; this work's answer was labeling (Phase 6).
2. **[P1] The shell does not carry the recurring jobs: find a service, find an answer, check my request, learn what is down.** The desktop header holds the logo, Ask AI and the user menu; Services, Submit a request and My requests are in the footer, and the mobile menu carries more links than the desktop bar. The signed-in home shows nothing about a person's own work. The alert banner renders only for signed-out visitors. *Fix suggested:* a three-item primary navigation with `aria-current`, a compact "Your requests" strip, the alert for signed-in users in an informational treatment. *Disposition:* left for the owner. Navigation and a requests strip are information architecture, and the alert audience is a recorded owner decision.
3. **[P1] The most urgent moments have no designed path: a lost device or PIV card, and locked-out visitors.** "Lost or stolen device" is one of fifteen equal cards, fourth in A to Z; there is no lost-PIV-card service (only an article); the signed-out page offers Sign in, Ask AI and an alert above an empty band; no phone number or hours appear outside the alert's default text, and the article's "Call the Service Desk" has no number. *Fix suggested:* an "Urgent? Call the Service Desk" line in the footer and the signed-out hero, a pinned "Urgent" row, a "Can't sign in?" route that needs no sign-in. *Disposition:* left for the owner. It needs content this work does not have (the number, the hours, a new lost-PIV-card service in Zendesk).
4. **[P2] The catalog is a flat, partly mute grid.** Fifteen cards carry equal weight; near-twin names (Software license and Software request, Mobile device and Lost or stolen device) need their hover-only descriptions; General request appears as a card, as the strip button and on every item page; icons repeat and mix two dialects; sorting is A to Z, Z to A or Newest only; on a phone the cards run about 1,950 pixels. *Disposition:* left. Most of it is data and product (most-requested sorting, icon choices, which cards exist); the descriptions-on-desktop question was settled as an owner decision in Phase 7.
5. **[P2] The submit moment under-delivers reassurance and recovery.** On phones the aside (suggestions and "What happens after you submit?") falls below the Submit button; suggested articles are same-tab links and no draft is saved; a failed submit marks each empty field "This field is required.", moves no focus and gives no summary; the Requester line and "Change" link are hidden; below 600 pixels the reassurance note drops to 12 pixels on one truncating line. *Disposition:* partly fixed in Phase 10 (focus lands on the first field that shows an error, of any type; the note is 14 pixels and wraps). The rail order on phones, draft saving, an error summary and the Requester line stay open decisions: each adds behavior or UI.

## Persona red flags

**Jordan, a new hire on a phone.** Two search boxes with different scopes; near-twin card names that a phone shows only two clamped lines of; "Priority" defaults to "-" with no guidance; "PIV" and "MFA" appear without expansion; a failed submit says "Give it a moment and try it again"; My requests is under the name menu.

**Alex, a program manager whose device was just stolen.** Clicks the "Lost/Stolen Device" chip and lands on an article list, not the form; the card is fourth in A to Z and there is no phone number; a repeat requester gets no recent services; keyboard access to a card takes about 20 tab stops; typing in the search pill above an open form discards the form.

**Casey, distracted and one-handed on a phone.** The first card is 978 pixels down and the Knowledge band 3,140; the reassurance and suggestions are below Submit; search puts two collapsed filter accordions above the results heading; nothing is saved if an interruption reloads the page.

**Sam, screen reader and keyboard at 200% zoom.** A catalog search, sort or category change updated "15 services" with no live region (fixed in Phase 10 for search and sort; a category change replaces the count row and may announce less reliably); a failed submit set `aria-invalid` and a red ring but focus stayed on the button (fixed in Phase 10); article and section titles are body-colored with no underline, so a link reads as one by its place in a list, as it did before this work. Credit from the reviewer: the visible focus ring, skip link, reduced-motion handling and `aria-describedby` for hidden card descriptions are solid.

## Detector and browser evidence (Assessment B)

Facts only, from the Impeccable detector and the offline measurements (headless Chrome, 1440 and 390 pixels wide, nine pages, 18 loads), with the baseline re-measured on the commit before the first design change (the recorded baseline numbers agree with the re-measurement except where noted).

**Detector.** The command-line detector reports 46 findings: `styles` 42, `templates` 0, `src/modules` 4 (8 warnings, 38 advisories). Opened in context, 41 of the 42 style findings are in `styles/_usa-banner-generated.scss`, the stock USWDS banner, which must never be restyled (35 color values, four `Public Sans Web` font-family declarations and two font sizes); the 42nd is the training button's width transition (`layout-transition`; the button is fixed, 52 pixels wide at rest and 291 on hover, and Phase 8 measured its cost at 0.67 ms of layout for a whole hover). Of the four in `src/modules`, one is accurate and advisory (a 10 pixel radius in the new request form's generated-answer modal, a page the harness does not render) and three are false positives (a bottom border on an unrounded tab, and two matches on the words `<img>` in code comments). The baseline had four findings (two layout transitions and two colored side borders); both side borders and the `.notification` height transition are gone. The in-page detector reports 138 findings (152 at baseline), 111 of them on hidden elements (script tags and its own injected style), and the 27 on painted elements are the stock banner (15 line-height, 9 padding), two figure captions and one false positive.

| Metric | Baseline | Final |
| --- | --- | --- |
| Loads with horizontal overflow (of 18) | 2 (Device FAQs at 607 pixels, article at 404) | 0 |
| Off-palette color uses, rendered | 497 of 1,392 (35.7%) | 0 of 1,640 (0.0%); 63 of 1,703 (3.7%) when the stock banner's three colors are counted |
| Text pairs below 4.5:1 (3:1 for large text) | 21 elements, 4 pairs (18 and 3 when re-measured) | 0 |
| Placeholders below 4.5:1 | 10 inputs, 2 pairs | 0 |
| Lowest text-over-image ratio, pixel-sampled | 2.30:1 recorded, 1.00:1 re-measured (the Ask AI link) | 16.44:1 |
| Distinct font sizes over all loads | 20 | 9 (12, 14, 16, 18, 20, 24, 25.6, 32, 40) |
| Text nodes under 14 pixels | 288 of 764 (37.7%) | 50 of 1,059 (4.7%) at `857a5b6d`, 49 once the note under Submit became 14 pixels; 45 are the stock banner at 12 pixels and the rest are the search filters' 12 pixel overline headings |
| Smallest rendered font size | 10 pixels | 12 pixels |
| Tab stops with no visible focus change | 10 of 451 (the search inputs) | 0 of 691 |
| Pages with exactly one h1 (of 9) | 7 | 9 |
| axe-core 4.13, states with violations (of 18) | 18 (46 rule hits, 48 nodes) | 0 |
| Targets under 24 pixels and not exempt | 0 | 0 |
| Targets under 44 pixels | 343 of 447 (76.7%) | 530 of 686 (77.3%) |
| HTTP errors in the run notes | 4 (two missing tile images, both widths) | 0 |
| Source color literals off the palette | 185 of 285 in 22 files | 121 of 190 in 3 files: the generated banner (48), the token definitions in `_tokens.scss` (45) and the stock no-results illustration in `search_results.hbs` (28) |

**What looks like a regression, and is not.** Interactive controls rose from 447 to 686 because the footer now lists its links (at 390 wide, 107 of the 217 standalone links under 44 pixels are the footer's two lists, 29 pixels high, which pass the 24 pixel minimum by size) and the stock `.gov` banner adds a control to every page, which is also one more Tab stop and the source of 45 of the 50 small text nodes. The banner button (116 by 14 pixels) and two 16 pixel links pass the 24 pixel minimum only through the spacing or inline exceptions. The focus ring is now a box-shadow beside a transparent outline (so forced colors repaints it), which the script's own test counts as visible on all 691 stops, where the baseline had ten failures. By the scripts' tests no measured value got worse on overflow, contrast, off-palette color, focus visibility, heading counts or axe violations. Limits: the harness pages are synthetic and run without Zendesk's runtime scripts, so none of this covers instant search, real screen-reader output, forced colors on Windows or print.

## Minor observations

| Observation | Disposition |
| --- | --- |
| The Device FAQs labels sat on three different lines (429, 397 and 385 pixels down the page at 1440 wide) | Fixed in Phase 10: one line; the logos did not move |
| The pager's "Next ›" and "»" touch with no gap | Left. The offline stub writes the list items with no whitespace between them; whether Zendesk's own markup has any cannot be checked without a Zendesk environment, so it needs a look in the sandbox |
| The category introduction wraps "ARPA-" and "H." onto separate lines at 390 | Fixed in Phase 10 with `text-wrap: pretty` |
| On the search page at 390 the breadcrumb is centered while it is left-aligned elsewhere | Fixed in Phase 10: the search page's own override removed below the tablet width |
| The "Community" type filter and per-result vote and comment counts add clutter for an IT knowledge base | Left: Zendesk settings and the stock results markup |
| Home and Services are hand-synced template clones | Left: structure, with a refactor risk and no visible gain |
| The footer's nine policy links carry the same weight as the three functional links; short pages leave white space below the footer at tablet heights | Left: the links are required, and the footer structure follows the owner's reference |
| Share-to-social icons (about 11 pixels) on internal how-tos | Left: the `show_article_sharing` setting, on by default, is the owner's |
| The alert banner's raspberry fill for a maintenance notice reads as an error; the default text misspells "inquiries" | The typo is fixed in Phase 10; the fill is an Admin Center setting (the alert keeps its own color settings by design) |
| The 404 keeps the stock "Oops!" tone and has no search or Service Desk route | Left: a copy decision |
| Two request doors: "Submit a request" opens the stock ticket form, "General request" opens a catalog item with a rail | Left: product |
| The item form prints asterisks without a "(*) are required" legend; the rail repeats itself ("Related content appears as you type." above "Start typing in the request form to see related help articles.") | The repeated sentence is fixed in Phase 10 (the subtitle waits for the results, with no copy change); the legend is left, since the fields' labels come from the Zendesk module |
| The catalog search is a 4 pixel rectangle under a pill, and `DESIGN.md` said search fields are pills | Fixed in the documentation: the hero search is the pill and the catalog's service filter is a Garden field with Garden's corners |
| Service icons resolve at runtime from the public [Iconify API](https://iconify.design/docs/api/), a third-party request from a .gov page | Left: the original design with a documented switch (`iconify_api_base`); recorded as an open decision |
| Instant-search suggestions are a Zendesk web component and were not emulated | Needs a look in the sandbox |

## Questions to consider

- What if the hero search returned one answer for one intent, a request and an article side by side ("Lost or stolen device: Request a replacement, or read what to do first")?
- What if Home opened with the person's own status (open requests, approvals) so the greeting earned its place?
- Does ARPA-H need an "Urgent" door that bypasses the catalog entirely: one tap, a phone number, hours?
- If the metaphor is a lit service counter, where is the clerk? Who answers, when, and what do they promise?
- What would Knowledge look like organised around the device in the person's hand (macOS, Windows, iOS), as the Device FAQs tiles already imply, instead of a section tree?
- What should the end of a successful request feel like: a toast, or a receipt with a number, an expected response time and a next step?

## Keep recognizable

All of the baseline's "keep" list is kept: the indigo arc hero with the Poppins greeting, the white pill search with a circular submit (recolored hot pink with a white magnifier at the owner's direction, never reshaped), the translucent popular-search chips, the one rounded white catalog surface beside the category rail, the 16 pixel radius, the outline pill "General request", the light-blue selected state and the skeleton fade-in. Most of the baseline's "go" list is gone: the nested surfaces on the item page, the redundant headings, the decorative step pills and helper trio, the wrapped titles and the void, the truncated placeholder, the hard-coded tiles, pink as the action color and a greeting hidden for up to 2.5 seconds. What remains from it is the desktop hover-only card description, which is an owner decision.

## Recommended actions

1. **[P1] Decide the front door.** Whether the chips should route service intents to the service, and whether results should include services (`clarify`, then `layout`).
2. **[P1] Decide what the shell carries.** A primary navigation, a "Your requests" strip and the alert audience (`layout`, `clarify`).
3. **[P1] Decide the urgent path.** The Service Desk number and hours, a lost-PIV-card service and a locked-out route (`clarify`, `layout`; needs content from the owner).
4. **[P2] The submit moment on phones.** Rail order, a saved draft and an error summary (`harden`, `adapt`).
5. **[P2] The catalog grid.** A most-requested lane and one icon family (`layout`, `distill`; data and product decisions).
