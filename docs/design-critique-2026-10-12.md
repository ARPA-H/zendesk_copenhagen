# Design critique: baseline, 2026-10-12

Method: two independent assessments. Assessment A was a design review that saw only the frozen screenshots, `PRODUCT.md` and the source, never the detector output. Assessment B ran the Impeccable detector and browser measurements. The renders are the theme's real templates with Zendesk helpers stubbed and the API mocked, so content is synthetic and Zendesk's instant-search web component is not evaluated.

Evidence: the renders and measurements come from an offline harness that is not part of this repository. Handlebars 4.7.10 renders the real `templates/*.hbs` with stubbed Zendesk helpers and mocked API responses, Dart Sass 1.66.1 (the version `rollup-plugin-sass` resolves) compiles `styles/index.scss`, and puppeteer 25.13.0 drives headless Chrome with every non-local request blocked, a frozen clock and motion disabled, at 1440, 768 and 390 pixels wide. The harness re-implements Zendesk's helpers and is single-author scratch tooling, so it is deliberately not added to the theme repository; the baseline and after screenshots are attached to the pull request instead, and the harness can be contributed in a follow-up if the owner wants it maintained.

Scope: Service Catalog (home, service item) and Knowledge (category, section, article, search results) plus the shared header and footer, at 1440, 768 and 390 pixels wide.

## Design Health Score

| # | Heuristic | Score | Key issue |
| --- | --- | --- | --- |
| 1 | Visibility of system status | 2 | The alert banner reaches signed-out visitors only; no current-article marker in the sidebar |
| 2 | Match between system and real world | 3 | Plain second person; "Service Hub" drifts from "Service Desk" |
| 3 | User control and freedom | 3 | Breadcrumbs and "General request" give escapes; the results search has no clear or submit |
| 4 | Consistency and standards | 2 | Seven or more button styles; five skins of the search field |
| 5 | Error prevention | 2 | A service cannot be previewed; a half-filled form is not saved |
| 6 | Recognition rather than recall | 2 | Card descriptions are `display: none`; Knowledge is reachable only through search |
| 7 | Flexibility and efficiency | 2 | Popular chips help; no recents, favorites or most-requested sort |
| 8 | Aesthetic and minimalist design | 2 | Nested cards, a decorative stepper, a helper trio, a share row |
| 9 | Error recovery | 2 | The red ring and toast appear on submit only; the 404 is one line and one link |
| 10 | Help and documentation | 3 | Suggested articles and the post-submit card are strong; no phone number |
| | **Total** | **23/40** | **Acceptable** |

## Design specificity verdict

**Service Catalog: authored on top, default underneath.** The hero is ARPA-H's own: a time-aware greeting by first name, the white pill search, popular-search chips for real jobs (PIV renewal, lost PIV card, shared mailboxes) and the arc-wireframe gradient. Below it the catalog is portal default: a category rail and same-size icon-over-title cards. The service item page is a generic form in a card.

**Knowledge: category-interchangeable.** Category, section, article and search are stock Copenhagen with Poppins swapped in: white header, breadcrumb, outlined search, plain link lists. Only the logo says ARPA-H. Catalog and Knowledge read as two products, which contradicts the "one front door" principle in `PRODUCT.md`.

## Overall impression

The home hero is the strongest thing in the portal and the Knowledge pages are the weakest, so the biggest opportunity is carrying one signature through both. The second is a set of plain defects (invisible Ask AI link, wrapped category title, truncated placeholder) that no amount of styling will hide.

## What is working

1. **Home hero.** Greeting, pill search and chips answer "what can I do here?" within two seconds.
2. **Item page rail.** Live suggested articles and "What happens after you submit?" are well-aimed deflection and reassurance.
3. **Search result cards.** Title, category path, snippet, date and votes scan quickly, and the filters collapse to accordions at 390.

## Priority issues

No P0: every core task completes.

1. **[P1] Knowledge pages lose the signature and break their own layout.** At 1440 and 768 the category title wraps to two lines ("IT / Help") because `.page-header` squeezes the h1 beside an italic description; content sits in the right 80% of the page, a void of about 230px that is misaligned with the logo, breadcrumb and search; article lines run 84 to 104 characters; `.current-article` has no style; pagination is two glued boxes. The Device FAQs tiles reference `macOSsmall.png` and `Windows11small.png`, which were removed in commit `7803e6d7` ("chore: remove unused theme assets"), and the tiles use fixed pixel sizes. *Why it matters:* this is where "answers before tickets" happens, and it looks unfinished. *Fix:* one compact indigo band with a one-line Poppins title, a one-line description and the pill search on category, section and search; one 16px surface below; categories as a grid of section groups; sections as divided rows; articles at a 680px measure. *Commands:* `layout`, then `bolder`.
2. **[P1] The front door overpromises and omits doors.** The hero placeholder says "Search by service or keyword", but the native search returns articles; all five chips open article searches, including "Lost/Stolen PIV Card"; nothing on the home page links into Knowledge; the shell has no phone number; the Ask AI link is white on white on the home and services pages (`.svc-home .header .ask-ai span { color: #fff }`). *Why it matters:* the first success criterion is the right service or answer in seconds. *Fix:* label the search for what it covers; send the two "Lost/Stolen" chips to the matching service or a pinned article; give the header real navigation; add a footer with Service Desk contact. *Commands:* `clarify`, then `layout`.
3. **[P1] Service cards hide what tells them apart.** Descriptions are `display: none` and the hover tooltip is off at 768 and below. At 390 the first card starts near y = 732, fifteen single-column cards run about 1,900px and "General request" sits near y = 2,690. *Fix:* two-line descriptions; at 768 and below, divided rows inside the one catalog card; categories as horizontal pills. *Commands:* `adapt`, then `layout`.
4. **[P1] Contrast and color roles fail Section 508 and NEXUS.** Placeholders measure 2.6:1, sidebar counts 2.65:1 on the selected tint, and two search inputs show no focus ring at all. Five different colors act as the action color (pink hero button, pink card hover, navy Submit, a 4px blue Ask AI, navy outline button). *Fix:* one primary (cyan pill with indigo text), pink in the hero artwork only, a focus ring on every control. *Command:* `colorize`, then `harden`.
5. **[P2] The item page competes with its own task.** "How can we help, Jordan?" sits above the real title; two always-active 11px step pills look clickable; three levels of nested surfaces; fields stop at 540px in a 935px panel; at 390 the suggested articles land below Submit, so deflection never reaches the person typing. *Fix:* one h1; remove the banner and steps; a 680px form beside a sticky rail merging suggestions with "What happens after you submit?". *Commands:* `distill`, then `layout`.
6. **[P2] Signed-out and status states are dead ends.** Signed-out home is a 300px empty gradient and a banner; the maintenance banner never reaches signed-in staff. *Fix:* a sentence and a "Sign in" action in the hero; show the banner to everyone. *Command:* `harden`.

## Persona red flags

**Alex, the impatient power user.** Types "VPN access" into the hero and gets articles; the service filter is a second box. No shortcut, no recents, A to Z sort only. About 580px (search, greeting banner, step pills, title) sit above the first field on the item page. Ask AI is invisible on the home page.

**Jordan, the confused first-timer.** "Lost or stolen device" and "Mobile device" share a phone icon and show no description. There is no lost-PIV-card service, only a chip that opens a search. "Affected system" and "Service Hub" go unexplained. The step pills look clickable but are not; "No related articles found yet" reads as failure; signed-out home has no Sign in button.

**Casey, the distracted mobile user.** The hero placeholder truncates to "Search by service or ke"; the chips are about 30px tall in three rows. The item form starts near y = 670 and nothing saves a half-filled form. Device FAQs scrolls sideways (607px wide at 390).

## Detector and browser evidence (Assessment B)

- **Source scan:** four findings: two `layout-transition` (`_notifications.scss:8`, `_svc-service-item.scss:292`) and two `side-tab` (`_svc-home.scss:207`, `_svc-service-item.scss:443`). Both side-tabs are dead CSS (`.svc-res-item`, `.svc-mr-item` appear only in the stylesheets).
- **Rendered pages:** 154 findings across 15 scans; 119 are false positives (non-rendered `<script>` leading, closed popovers, a screen-reader-only heading). The 35 that stand include nested cards on the item page (12), article line length (6 true), and a flat type hierarchy on Device FAQs.
- **Color:** 36.9% of color uses on the rendered pages are off-palette (28 distinct colors); in the source, 205 of 359 color literals are off-palette (87 distinct). The most used off-palette colors are the old link blue `#1954d0`, `#454548`, `#e3e8f0` and `#848f99`.
- **Contrast:** Ask AI measures 1.0:1 (white on white); sidebar counts 2.65:1 and 3.3:1; the help banner subtext 4.48:1; the hero placeholder 2.6:1; the Garden search placeholder 3.3:1. Hero chips are borderline at 390 (5th-percentile 4.09:1).
- **Focus:** no visible ring on the hero search input or the catalog sidebar search input, caused by `outline: none !important` (`_svc-home.scss:146` and the "Kill Garden wrapper focus border" block).
- **Overflow:** Device FAQs is 607px wide at 390 (`img.ios-icon` in a 550px flex row); article is 404px wide at 390 (the breadcrumb list).
- **Targets:** 199 interactive elements are under 24px in one dimension across 18 loads; a geometric check of the spacing and inline exceptions in [WCAG 2.2 SC 2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum) rescues all of them, so none fail that criterion; many are under 44px.
- **Fonts:** Public Sans carries 94.9% of glyphs, Poppins 4.4%; both webfonts load; the font stacks repeat entries.

Not measured: hover and pressed states, the training button (off by default), and Zendesk's instant-search dropdown.

## Minor observations

- Type is the stock scale (body 15px, h1 32px), not NEXUS (16px body, 48px h1); the catalog forces Public Sans on its h2; microtext runs 11 to 13px.
- The header turns into a hamburger at 768px; NEXUS wants inline links at that width.
- The hero's inherited `.section` margin of 60px cancels the catalog card's -56px overlap, leaving a 44px gap instead of a floating card.
- Recently viewed precedes Related on the article page; Facebook, X and LinkedIn share icons (on by default) do not suit an internal federal portal.

## Questions to consider

1. What if the hero were the only search, with its dropdown grouping Services above Articles?
2. Should Knowledge be a peer of the catalog, not something reached only by search?
3. Would anyone with a lost PIV card browse fifteen cards? Pin three urgent tasks above them?
4. What if every article ended in the action it explains (a "Start a PIV renewal request" pill) instead of "Was this helpful?"

## Keep recognizable

**Keep:** the indigo-to-navy arc hero with the Poppins greeting (a shorter version on Knowledge); the white pill search with a circular submit at the right (recolor, do not reshape); the translucent "Popular:" chips; one rounded white catalog surface floating over the hero beside the category rail; 16px radius, the outline pill "General request", the blue-50 selected state and the skeleton fade-in.

**Go:** cards inside the catalog card and the item page's nested surfaces; redundant headings ("How can we help, Jordan?" over "Software request"; "All services" three times; "General request" three times); the decorative step pills, helper trio and share row; wrapped titles and the 230px void; the truncated placeholder and note; hover-only descriptions; the hard-coded OS tiles; pink as the action color, Tailwind grays, the 4px Ask AI; a greeting hidden for up to 2.5 seconds.

## Recommended actions

1. **[P1] `colorize`:** one action color, token layer, accessible placeholders and counts (Phase 1).
2. **[P1] `typeset`:** the NEXUS scale, a 680px article measure (Phase 2).
3. **[P1] `layout`:** the Knowledge band and surfaces, catalog rows on small screens, a calmer item page (Phase 3).
4. **[P1] `harden`:** focus rings, empty and error states, signed-out hero, broken tiles (Phase 4).
5. **[P2] `distill`:** nested surfaces, dead search CSS and widget (Phase 5).
6. **[P2] `clarify`:** what each search covers, "Service Hub" versus "Service Desk" (Phase 6).
7. **[P2] `adapt`, `optimize`, then `polish`.**
