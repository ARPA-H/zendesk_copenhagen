# Copenhagen Theme (ARPA-H fork) — Development Plan

Tracks stack decisions, in-flight work, and non-obvious findings for this
repo. Prefer adding to this file over agent memory for anything that should
survive a Codespace rebuild or be visible in review/merge.

## Session: 2026-08-04 — service-catalog icon stuck at 16x16

### Root cause

`styles/_svc-home.scss`'s "SERVICE ICONS — NEVER CLIP" block (originally
added to stop uploaded logo images from being clipped/stretched inside the
circular Avatar) applied `width: auto !important; height: auto !important;`
to **both** `img` and `svg` under any
`.service-catalog-main-content [data-garden-id="avatars.avatar"] ...`
selector. This has the *exact same CSS specificity* as
`ItemThumbnail.tsx`'s own `&& > svg { width/height: ...px !important }`
sizing rule, so source order decided the winner — and `auto` on an inline
`<svg>` falls back to its own `width="1em"`/`height="1em"` presentation
attributes (1em ≈ 16px), which is why the icons looked stuck at 16x16 no
matter what was changed in the React component.

**Fix** (commit `24531212`): split that block's selectors into a separate
`img` ruleset (keeps `width/height:auto` — needed so non-square uploaded
thumbnails don't stretch) and a separate `svg` ruleset (drops
`width/height:auto`, keeps `max-width/max-height:100%` + `object-fit:contain`
+ `overflow:visible` as a clip safety net only). Also bumped
`ItemThumbnail.tsx`'s own `&& > svg` sizing to `!important` (commit
`6925ada6`) — necessary but not sufficient on its own; the `_svc-home.scss`
override was the real blocker.

**Lesson:** when a plain global CSS `!important` rule and a styled-components
`!important` rule have equal specificity, don't assume injection/source order
— check `styles/_svc-home.scss` (loaded in `<head>`, has several broad
`.service-catalog-main-content ...` resets) for conflicting selectors before
chasing specificity in the React component alone. Ask for the DevTools
**Styles** panel (not just Computed) to see every competing rule and its
source when a CSS fix doesn't take effect after a rebuild+redeploy.

**Follow-up (commit `692f64df`):** once unblocked, icons still looked much
smaller than uploaded PNGs at the same avatar size. Cause: `ItemThumbnail.tsx`
additionally shrunk the svg to ~60% of the avatar box on top of the padding
Iconify sets (uil, mdi, etc.) already bake into their 24x24 viewBox — double
shrinkage. Fixed by sizing the svg to `width/height: 100% !important` (same
as Garden's own `img` fill rule) instead of a fixed px fraction.

## Session: 2026-08-04 — `update_theme` CI failure

### Completed

- [x] Diagnosed `update_theme` GitHub Actions job failure (run `30865002513`):
      Zendesk API rejected the theme zip with `FileNotSupported` for
      `assets/service-catalog-icon-base.svg`. Root cause: the file started
      with an HTML comment (`<!-- ... -->`) before the `<svg>` root — the
      only SVG in `assets/` not starting with `<svg`/`<?xml` as its first
      bytes. Zendesk's importer appears to sniff file type from the leading
      bytes and rejects SVGs that don't start with one of those.
- [x] Fix (commit `b0805fb8` on `sandbox`): moved the explanatory comment to
      *inside* the `<svg>` root as a child comment instead of before it —
      still invisible/inert, but the file now starts with `<svg`.
- [ ] Push `b0805fb8` to `origin/sandbox` (holding for confirmation since
      `sandbox` triggers a live theme deploy via `update.yml`).

**Convention going forward:** any new committed SVG asset must start the file
with `<svg` or `<?xml` — never a leading comment — or the Zendesk theme
importer will reject it.

## Session: 2026-08-03 — `feat/all-the-icons` icon-support refactor

### Context

Branch `feat/all-the-icons` adds icon support (Iconify or local SVGs instead
of PNGs) to the service catalog. It was rebased onto `origin/sandbox` on
2026-08-03 and force-pushed (new hash `a1ec0c5b`, was `c293f8fd`). It is only
1 commit ahead of `sandbox` — **not yet merged**, no PR opened yet. Check
`git log --oneline origin/sandbox..feat/all-the-icons` before continuing.

### Established repo convention (commit `632f8a83`, 2026-08-02)

`src/modules/service-catalog` is meant to stay as close to a zero-diff
mirror of `zendesk/copenhagen_theme` upstream as possible — it receives
frequent upstream feature updates. New ARPA-H-specific behavior should go in
`src/modules/svc-page-utils` (a separate ES module glue layer imported
directly by `.hbs` templates) or in the templates themselves, **not** by
editing files inside `src/modules/service-catalog`.

`feat/all-the-icons` initially went against this (directly edited
`ItemThumbnail.tsx`, `CollapsibleDescription.tsx`, `ServiceCatalogListItem.tsx`,
`renderServiceCatalogItem.tsx`, `renderServiceCatalogPage.tsx`, plus new files
inside `service-catalog` — ~520 extra lines of upstream diff).

### Refactor done to reduce upstream-merge risk (2026-08-03)

- `renderServiceCatalogPage.tsx` / `renderServiceCatalogItem.tsx` restored to
  byte-for-byte match with `origin/sandbox` (zero diff) — removed the
  `initIconConfig` call and `iconAssetBase` param from both.
- All icon-resolution files (`iconAssetBase.ts`, `iconConfig.ts`,
  `serviceIcon.ts` + spec, `serviceIconMap.ts`) moved from
  `service-catalog/{utils,constants}` to `src/modules/shared/service-icons/`
  (git mv, own barrel `index.ts`, re-exported from `shared/index.ts`) —
  service-catalog components now import icon helpers via `"../../../shared"`.
- Added `src/modules/svc-page-utils/initIconSupport.ts` (thin wrapper calling
  shared's `initIconConfig`), exported from `svc-page-utils`' index. Templates
  now call `initIconSupport(...)` themselves before invoking
  `renderServiceCatalogPage`/`renderServiceCatalogItem`.
- Replaced the `arpa-h-logomark.svg`-piggybacking asset-base hack with a
  dedicated, purpose-named committed asset: `assets/service-catalog-icon-base.svg`
  (tiny inert 1x1 SVG) — both templates derive `iconAssetBase` from that
  instead of the branding logo. (See 2026-08-04 fix above re: leading comment.)
- Residual, unavoidable diff still inside `src/modules/service-catalog`:
  `ItemThumbnail.tsx`, `CollapsibleDescription.tsx`
  (`components/service-catalog-item/`), `ServiceCatalogListItem.tsx`
  (`components/service-catalog-list/`) — these render per-item icons / strip
  the `[icon: ...]` marker inline and genuinely can't be done via external DOM
  post-processing without fighting React's own reconciliation. Accepted,
  minimized trade-off.
- Validated: `yarn eslint src` (0 errors, only pre-existing warnings),
  `yarn tsc --noEmit` (no new errors), `yarn jest src/modules/service-catalog`
  (175 passed) + `yarn jest src/modules/svc-page-utils` (9 passed), `yarn build`
  (exit 0; regenerates `service-catalog-bundle.js`/`shared-bundle.js`/
  `svc-page-utils-bundle.js` plus cosmetic-only minified-identifier churn in
  the other bundles from the shared chunk's export list growing).
- Not yet committed as of the original note — was sitting as uncommitted
  changes on `feat/all-the-icons`. Re-verify status before resuming.

### Known follow-ups / issues on this branch

- `Settings.iconify_api_base` was added to
  `src/modules/shared/garden-theme/createTheme.ts` but is **not** registered
  as a setting in `manifest.json` — currently dead/unreachable since
  `{{json settings}}` only serializes manifest-defined settings.
- Rebase conflict-resolution decisions to remember if re-rebasing:
  - `CollapsibleDescription.tsx`: compose sandbox's `sanitizeHtml` with the
    icon branch's `stripIconMarker` — `sanitizeHtml(stripIconMarker(description))`.
  - `ServiceCatalogListItem.tsx`: use sandbox's safer `htmlToText` (inert
    `DOMParser`) instead of the icon branch's local `decodeToText` (innerHTML
    on a live element), combined with `stripIconMarker` for the description.
  - `ItemThumbnail.tsx` must always receive the RAW `description` prop (with
    the `[icon: ...]` marker still present) — `resolveItemIcon`/`parseIconRef`
    need the marker; only the *displayed* text should have it stripped.
  - `package.json`/`yarn.lock`: kept sandbox's newer
    `@zendesk/help-center-wysiwyg` (1.1.2) plus added `@iconify/react` from the
    icon branch; ran `yarn install` to regenerate the lockfile rather than
    hand-resolving conflicts.
  - `assets/*-bundle.js` are generated/committed — don't hand-merge conflict
    markers; resolve to either side then run `yarn build` and re-stage.
- The `iconAssetBase` hack in `templates/service_list_page.hbs` and
  `templates/service_page.hbs` exists because `generate-import-map.mjs`/
  Curlybars `{{asset}}` only works with a static, literal filename known at
  build time (assets get CDN-fingerprinted on deploy) — deriving a generic
  "assets base URL" at runtime requires reusing some real committed asset's
  `{{asset}}` call.

## Standing notes / gotchas

- **`useItemFormFields` (src/modules/service-catalog)**: keeps the FULL field
  list in state (`allRequestFields`) but exposes only the currently-visible
  subset as `requestFields`, via `getVisibleFields(allRequestFields,
  endUserConditions)`. The hook's `setRequestFields` is the raw
  `setAllRequestFields` setter over the FULL list — never call it with a
  plain array built from `requestFields` (the visible subset), since that
  wipes any field hidden by a conditional rule at that moment. Always use a
  functional updater that merges onto the previous full list
  (`setRequestFields(prev => prev.map(...))`), per the fix in
  `ServiceCatalogItem.tsx`'s `validateForm()`/`handleValidationErrors()`
  (2026-08-01). Root cause of a real bug: submit would silently drop
  conditionally-hidden fields from state, causing a later required-field
  check to go over the network, get a 422, fail to map the error back to a
  (now-missing) field, and jam the form until a full page reload. Tests mock
  `useItemFormFields` entirely in `ServiceCatalogItem.spec.tsx`, so this class
  of bug isn't caught unless the test explicitly includes a field absent from
  the mocked `requestFields` array.
  **The `handleValidationErrors()` half of this is now upstream-owned** —
  contributed back as zendesk/copenhagen_theme#851 and released in v4.50.3.
  On future upstream merges, take *upstream's* side for that block and drop
  the fork's duplicate copy (including the duplicated
  `"should merge field errors onto the full field list…"` spec). Only the
  `validateForm()` merge remains an ARPA-H-only customization.
- **Build/test tooling**: Yarn 4 via Corepack; `yarn jest` needs `yarn install`
  first if `node_modules` state file is missing. `yarn build` (rollup) has
  been observed both to exit 129 on the ES-module/assets bundling step and to
  succeed cleanly on the same unmodified checkout across different sessions —
  treat exit 129 as environment-flaky, not proof of a broken change. If it
  fails, fall back to `yarn eslint` + `tsc --noEmit` + targeted `yarn test`.
- **Sidebar layout**: `ServiceCatalogCategoriesSidebar.tsx` renders a fixed
  `SIDEBAR_WIDTH` (250px, in `utils/categoryTreeUtils.ts`) styled-components
  `Container` next to `.service-catalog-list` inside
  `.service-catalog-main-content` (flex row, `styles/_service_catalog.scss`).
  On mobile (<=768px) it collapses into a full-width dropdown-style toggle
  button (`.svc-cat-sidebar-toggle`) with the tree hidden until tapped
  (`isMobileOpen` state), and `.service-catalog-main-content` switches to
  `flex-direction: column` so the grid in `.service-catalog-list` gets full
  width below it (2026-08-02 fix for "categories sidebar halving the mobile
  grid width").
- **CodeQL `js/xss-through-dom`** ("DOM text reinterpreted as HTML") alerts on
  `new DOMParser().parseFromString(html, "text/html")` used purely to extract
  `.textContent`/query for tags (e.g. `src/forms.js` `isEmptyHtml`,
  `src/modules/service-catalog/utils/sanitize.ts` `htmlToText`) are false
  positives: the parsed doc is detached/inert, so `<img>`/`<script>` never
  fetch or execute, and nothing from it is ever written back into the live
  DOM as HTML. Established, intentional pattern (documented inline at each
  call site) — don't rewrite to regex-based parsing. `gh api
  code-scanning/alerts` endpoints return 403 in this sandbox (no permission
  to inspect/dismiss).
- **Fork/upstream posture**: `origin` = `ARPA-H/zendesk_copenhagen`,
  `upstream` = `zendesk/copenhagen_theme`. `origin/main` is ~285 files /
  ~29k lines diverged from `upstream/master` — a heavily customized fork, not
  a thin bolt-on. Upstream is still merged in periodically via real
  `git merge upstream/master` into `sandbox` (see commit `0514cd4e`), and
  `templates/service_list_page.hbs` is a known recurring conflict hotspot
  (commit `c2ac1472`).
