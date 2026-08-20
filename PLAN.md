# Copenhagen Theme (ARPA-H fork) — Development Plan

Tracks stack decisions, in-flight work, and non-obvious findings for this repo.
Prefer adding to this file over agent memory for anything that should survive a
Codespace rebuild or be visible in review/merge.

`origin` = `ARPA-H/zendesk_copenhagen` (this fork), `upstream` =
`zendesk/copenhagen_theme`. `main` is the fork's default/production branch;
`sandbox` is where day-to-day ARPA-H work happens before periodically being
merged into `main`. The session log below is reverse-chronological (newest
first) and is backported from every merge reachable from `origin/main`, not just
`sandbox` (audited via `git log origin/main --merges` and
`git log upstream/master..origin/main --first-parent` back to the fork's
2024-01-31 inception).

**Why this fork exists:** ARPA-H runs its internal IT service catalog / staff
self-service portal on Zendesk Guide, using this theme. It's rebranded to
ARPA-H's visual identity and extended with an agency-specific Service Catalog
(request forms, a chat launcher, an "Ask AI" link) rather than Copenhagen's
stock community/article-focused layout.

## What diverges from upstream (independent ARPA-H features)

- **Service Catalog**: Iconify/local-SVG icon support for catalog items,
  category sidebar (collapses to a mobile toggle), inline field-validation UX
  (accessible invalid-field styling, submit-gated), help-center path
  normalization (`normalizeHelpCenterPath`) to stop `/hc/<locale>/hc/services`
  duplication, requester-based (not Zendesk-user-based) field defaults,
  manifest-driven training FAB and general/other-request service+category IDs
  (no more hardcoded literals), and a shared `src/svcSearch.js` live-search
  widget (extracted out of both service-catalog templates).
- **Redesign remediation (2026-07-23)**: the original 2024 ARPA-H redesign had
  accumulated in generated `style.css`/inline `<style>` blocks; moved ~1,500
  lines into proper SCSS partials, fixed a hide-then-reveal FOUC guard,
  self-hosted Public Sans instead of a third-party Google Fonts CDN `@import`,
  de-hardcoded instance URLs/locale, and added session-level caching for the
  service-catalog fetch.
- **Header/search/home-page CSS fixes**: mobile menu button color, search box
  border/font-size cleanup, home page "Services" nav link commented out, manual
  `style.css` overrides moved into SCSS partials.
- **CI/CD (`.github/workflows/`)**: bespoke import+publish deploy pipeline
  (replaces upstream's simple theme-update workflow) — semver theme naming,
  prod/sandbox branch+theme support, an authorized-reviewer gate, automatic
  pruning of old themes to stay under Zendesk's 10-theme limit, `BRAND_ID` as a
  repo **var** rather than a secret, all Action refs pinned to SHAs,
  `paths-ignore` so non-theme file changes (docs, CI meta) don't trigger a live
  deploy, and `dependabot.yml` scoped to `sandbox`.
- **Security / dependency hardening**: CWE-116 fix (inert `<template>` for
  WYSIWYG empty-check instead of live DOM parsing), CWE-079 fix (removed a
  `DOMParser`-based XSS vector flagged by CodeQL), a `safeHref()`
  scheme-allowlist helper (relative/`http:`/`https:` only) applied to every
  API-sourced href inserted via `innerHTML` in the service-catalog live-search
  widget (defense-in-depth per the OWASP DOM XSS cheat sheet), `axios` -> native
  `fetch` in the deploy scripts, scoped `yarn resolutions` pinning
  transitive-dep CVEs, a dedicated "eliminate known vulnerabilities" dependency
  sweep ([PR #130](https://github.com/ARPA-H/zendesk_copenhagen/pull/130),
  minor/patch + targeted major bumps), and an eslint 9 migration. See
  "Dependency updates ahead of upstream" below for the full package-by-package
  list, and "Standing notes / gotchas" for the live pinning conventions this
  produced (known unpatchable advisories, etc).
- **Manifest cleanup**: removed per-environment service-catalog IDs from
  `manifest.json` (deploy now uses Zendesk's Theme Update Job instead of the
  Import Job, so per-env IDs are no longer needed); Community follow/sharing/
  scoped-search features (`show_follow_post`, `show_post_sharing`,
  `scoped_community_search`) disabled by default since 2026-01-22.
- **Tooling**: devcontainer/Codespaces setup (see repo memory
  `devcontainer-notes.md`).

## Dependency updates ahead of upstream

Every version below is `upstream/master`'s current `package.json` value on the
left, this fork's current value on the right — i.e. work Zendesk hasn't picked
up yet. Sourced from a direct `package.json` diff
(`git show upstream/master:package.json` vs. our `package.json`) plus the
originating commit messages for the "why".

### CVE / security-advisory-driven

| Package                                                                                                     | Upstream   | Current                           | Why                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `js-yaml` (devDep)                                                                                          | `^4.1.1`   | `^4.3.1`                          | CVE-2026-59870 (HIGH): quadratic-CPU DoS in `!!omap` resolution                                                                                                                      |
| `puppeteer`                                                                                                 | `24.9.0`   | `25.7.0`                          | Removes `extract-zip` entirely (HIGH: unvalidated symlink path traversal) — puppeteer 25's `@puppeteer/browsers` no longer bundles it                                                |
| `eslint`                                                                                                    | `8.35.0`   | `9.39.5`                          | Clears eslint's own EOL/unsupported-version notice plus 3 MODERATE advisories in `@humanwhocodes/config-array`/`object-schema` (both replaced internally by `@eslint/*` in eslint 9) |
| `@shopify/eslint-plugin`                                                                                    | `^44.0.0`  | `50.0.0`                          | Required to move `eslint` to 9.x (only majors ≥49 support eslint 9's peer range)                                                                                                     |
| `eslint-plugin-react-hooks`                                                                                 | `^4.6.0`   | `7.1.1`                           | Required to move `eslint` to 9.x (old major's peer tops out at eslint `^8`)                                                                                                          |
| `dompurify`                                                                                                 | `3.4.0`    | `3.4.13`                          | Includes GHSA-c2j3 (3.4.11 → 3.4.12)                                                                                                                                                 |
| `adm-zip` (resolution)                                                                                      | not pinned | `^0.6.0`                          | GHSA-xcpc                                                                                                                                                                            |
| `shell-quote` (resolution)                                                                                  | not pinned | `^1.10.0`                         | GHSA-395f                                                                                                                                                                            |
| `tar` (resolution)                                                                                          | not pinned | `^7.5.22`                         | GHSA-23hp, -8x88, -gvwx, -w8wr, -r292                                                                                                                                                |
| `undici` (resolution)                                                                                       | not pinned | `^6.28.0`                         | 3× MODERATE: response desync, CRLF injection, cookie-attribute injection                                                                                                             |
| `postcss/nanoid` (resolution)                                                                               | not pinned | `^3.3.18`                         | HIGH: infinite loop on zero size                                                                                                                                                     |
| `ajv/fast-uri` (resolution)                                                                                 | not pinned | `^3.1.5`                          | HIGH: host confusion via backslash authority (includes earlier GHSA-v2hh step)                                                                                                       |
| `minimatch@npm:3.1.5\|5.1.8\|10.2.4/brace-expansion` (3 resolutions)                                        | not pinned | `^1.1.16` / `^2.1.2` / `^5.0.9`   | GHSA-3jxr, -f886, -mh99                                                                                                                                                              |
| `eslint/js-yaml`, `@eslint/eslintrc/js-yaml`, `i18next-parser/js-yaml`, `cosmiconfig/js-yaml` (resolutions) | not pinned | `^4.3.1`                          | Same CVE-2026-59870 / GHSA-52cp family, pinned per-consumer since each has an independent transitive range                                                                           |
| `@oclif/core/js-yaml`, `@istanbuljs/load-nyc-config/js-yaml` (resolutions)                                  | not pinned | `^3.15.1`                         | GHSA-52cp (older js-yaml major line used by these consumers specifically)                                                                                                            |
| `eslint/ajv`, `@eslint/eslintrc/ajv`, `@commitlint/config-validator/ajv` (resolutions)                      | not pinned | `^6.14.0` / `^6.14.0` / `^8.18.0` | Defensive pin alongside the `ajv/fast-uri` fix above (same dependency family)                                                                                                        |

### Currency / consistency (no specific CVE — done to reduce Dependabot noise, unblock peer ranges, or stay off unmaintained majors)

| Package(s)                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Upstream                                | Current                                 | Why                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react`, `react-dom`, `react-is`                                                                                                                                                                                                                                                                                                                                                                                                                               | `^17.0.2`                               | `^19.2.8`                               | Major currency; `@types/react`/`@types/react-dom` bumped alongside                                                                                                   |
| `styled-components`                                                                                                                                                                                                                                                                                                                                                                                                                                            | `^5.3.11`                               | `^6.5.3`                                | Major currency; `@types/styled-components` bumped alongside                                                                                                          |
| 18× `@zendeskgarden/react-*` packages                                                                                                                                                                                                                                                                                                                                                                                                                          | `9.15.6`                                | `9.15.7`                                | Align all Garden packages on one patch version (were split 9.15.6/9.15.7)                                                                                            |
| `@zendeskgarden/svg-icons`, `container-grid`, `container-utilities`                                                                                                                                                                                                                                                                                                                                                                                            | `8.0.0` / `^3.0.14` / `^2.0.2`          | `8.4.0` / `^3.0.21` / `^2.0.5`          | Kept in step with the Garden bump above                                                                                                                              |
| `jest`, `@jest/globals`, `jest-environment-jsdom`                                                                                                                                                                                                                                                                                                                                                                                                              | `^29.x`                                 | `30.4.2` / `30.4.1` / `^30.4.1`         | Fixes a latent mismatch (`jest-environment-jsdom` was already pinned to `^30.4.1` while `jest` sat on 29); zero net advisory change but removes the version skew     |
| `@testing-library/dom`                                                                                                                                                                                                                                                                                                                                                                                                                                         | `^9.3.1`                                | `^10.4.1`                               | Fixes a latent peer mismatch (`@testing-library/react@16.3.2` already requires `dom ^10.0.0`)                                                                        |
| `@testing-library/jest-dom`                                                                                                                                                                                                                                                                                                                                                                                                                                    | `^5.16.5`                               | `^7.0.1`                                | Unblocked by the `dom` bump above (`jest-dom` requires `@testing-library/dom >=10 <11`)                                                                              |
| `@testing-library/react`                                                                                                                                                                                                                                                                                                                                                                                                                                       | `^12.1.5`                               | `^16.3.2`                               | Major currency                                                                                                                                                       |
| `@testing-library/react-hooks`                                                                                                                                                                                                                                                                                                                                                                                                                                 | `7.0.2`                                 | _(removed)_                             | Superseded by `@testing-library/react`'s own hook-testing support                                                                                                    |
| `husky`                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `8.0.2`                                 | `9.1.7`                                 | Major currency; migrated `.husky/commit-msg` to the v9 hook format                                                                                                   |
| `rollup`                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `3.30.0`                                | `4.62.4`                                | Major currency; all installed plugins already declared a rollup `^4` peer                                                                                            |
| `@rollup/plugin-node-resolve`, `-replace`, `-typescript`                                                                                                                                                                                                                                                                                                                                                                                                       | `^15.1.0` / `^5.0.2` / `^11.1.2`        | `^16.0.3` / `^6.0.3` / `^12.3.0`        | Kept in step with the `rollup` major above                                                                                                                           |
| `@rollup/plugin-commonjs`, `-dynamic-import-vars`                                                                                                                                                                                                                                                                                                                                                                                                              | `^25.0.2` / `^2.1.2`                    | `^29.0.3` / `^2.1.5`                    | Currency                                                                                                                                                             |
| `@semantic-release/changelog`, `-git`, `-exec`, `semantic-release`                                                                                                                                                                                                                                                                                                                                                                                             | `6.0.2` / `10.0.1` / `6.0.3` / `19.0.5` | `7.0.0` / `11.0.1` / `7.1.0` / `25.0.9` | Currency; last open Dependabot majors on the release pipeline                                                                                                        |
| `node-fetch`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `2.6.9`                                 | _(removed)_                             | Two call sites only used the plain `fetch()`/`.json()` API — replaced with Node 24's built-in global `fetch`, since `.nvmrc` already pins Node 24                    |
| `dotenv`                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `16.0.3`                                | `17.4.2`                                | Currency (v17 defaults `quiet` to `false`; call site updated to pass `{ quiet: true }` explicitly to preserve prior console output)                                  |
| `glob`                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `^12.0.0`                               | `13.0.6`                                | Currency; verified against real usage in `bin/extract-strings.mjs`                                                                                                   |
| `typescript`, `ts-jest`                                                                                                                                                                                                                                                                                                                                                                                                                                        | `^5.1.6` / `^29.2.4`                    | `^5.9.3` / `^29.4.12`                   | Currency                                                                                                                                                             |
| `@typescript-eslint/eslint-plugin`, `-parser`                                                                                                                                                                                                                                                                                                                                                                                                                  | `^6.1.0`                                | `^8.67.0`                               | Currency, required alongside the eslint 9 move                                                                                                                       |
| `eslint-plugin-jest`, `-react`, `-import`, `-prettier`, `-check-file`, `eslint-import-resolver-typescript`, `eslint-config-prettier`                                                                                                                                                                                                                                                                                                                           | various                                 | various                                 | Currency, kept in step with the eslint 9 move                                                                                                                        |
| `i18next`, `react-i18next`, `i18next-parser`                                                                                                                                                                                                                                                                                                                                                                                                                   | `^23.10.1` / `^14.1.0` / `^9.3.0`       | `^26.3.6` / `^17.0.11` / `^9.4.0`       | Currency                                                                                                                                                             |
| `react-dropzone`                                                                                                                                                                                                                                                                                                                                                                                                                                               | `^14.2.3`                               | `^20.1.0`                               | Currency                                                                                                                                                             |
| `lighthouse`, `sass`, `rollup-plugin-sass`, `concurrently`, `wait-on`, `prettier`, `@commitlint/cli`/`config-conventional`, `@zendesk/zcli`, `@zendesk/help-center-wysiwyg`                                                                                                                                                                                                                                                                                    | various                                 | various                                 | Routine Dependabot currency bumps, no cited advisory                                                                                                                 |
| `basic-ftp`, `tmp`, `@tootallnate/once`, `flatted`, `@babel/core`, `@babel/plugin-transform-modules-systemjs`, `lodash-es`, `socks`, `ip-address`, `cross-spawn`, `form-data`, `qs`, `@opentelemetry/core`, `@typescript-eslint/typescript-estree/minimatch`, `@zendesk/zcli-apps/uuid`\|`morgan`, `express/path-to-regexp`, `cosmiconfig/yaml`, `lighthouse/ws`, `@zendesk/zcli-themes/ws`, `jsdom/ws`, `libnpmdiff/diff`, `vite/esbuild` (all `resolutions`) | not pinned                              | various                                 | Defensive transitive-dependency pins added alongside the security sweep, no specific advisory tied to each — supply-chain hygiene / silencing `yarn npm audit` noise |

Not a version bump: `@iconify/react` is a genuinely new dependency (for the
icon-support feature, see "What diverges from upstream" above), not present in
upstream at all.

## Session: 2026-08-17 — dependency/security sweep ([PR #130](https://github.com/ARPA-H/zendesk_copenhagen/pull/130))

`chore/dependency-security-updates`
([PR #130](https://github.com/ARPA-H/zendesk_copenhagen/pull/130), merge-based
into both `main` and `sandbox`, commit
[`abbb8698`](https://github.com/ARPA-H/zendesk_copenhagen/commit/abbb8698))
landed 3 commits: all available minor/patch bumps, targeted major-version bumps
to close remaining known vulnerabilities, and a final pass on major-only dev
deps (`dotenv`, `glob`, `@semantic-release/changelog`). This is the same PR
referenced in "Standing notes" below re: pinning conventions.

## Session: 2026-08-04 — service-catalog icon stuck at 16x16

### Root cause

`styles/_svc-home.scss`'s "SERVICE ICONS — NEVER CLIP" block (originally added
to stop uploaded logo images from being clipped/stretched inside the circular
Avatar) applied `width: auto !important; height: auto !important;` to **both**
`img` and `svg` under any
`.service-catalog-main-content [data-garden-id="avatars.avatar"] ...` selector.
This has the _exact same CSS specificity_ as `ItemThumbnail.tsx`'s own
`&& > svg { width/height: ...px !important }` sizing rule, so source order
decided the winner — and `auto` on an inline `<svg>` falls back to its own
`width="1em"`/`height="1em"` presentation attributes (1em ≈ 16px), which is why
the icons looked stuck at 16x16 no matter what was changed in the React
component.

**Fix** (commit
[`24531212`](https://github.com/ARPA-H/zendesk_copenhagen/commit/24531212)):
split that block's selectors into a separate `img` ruleset (keeps
`width/height:auto` — needed so non-square uploaded thumbnails don't stretch)
and a separate `svg` ruleset (drops `width/height:auto`, keeps
`max-width/max-height:100%`, `object-fit:contain`, and `overflow:visible` as a
clip safety net only). Also bumped `ItemThumbnail.tsx`'s own `&& > svg` sizing
to `!important` (commit
[`6925ada6`](https://github.com/ARPA-H/zendesk_copenhagen/commit/6925ada6)) —
necessary but not sufficient on its own; the `_svc-home.scss` override was the
real blocker.

**Lesson:** when a plain global CSS `!important` rule and a styled-components
`!important` rule have equal specificity, don't assume injection/source order —
check `styles/_svc-home.scss` (loaded in `<head>`, has several broad
`.service-catalog-main-content ...` resets) for conflicting selectors before
chasing specificity in the React component alone. Ask for the DevTools
**Styles** panel (not just Computed) to see every competing rule and its source
when a CSS fix doesn't take effect after a rebuild+redeploy.

**Follow-up (commit
[`692f64df`](https://github.com/ARPA-H/zendesk_copenhagen/commit/692f64df)):**
once unblocked, icons still looked much smaller than uploaded PNGs at the same
avatar size. Cause: `ItemThumbnail.tsx` additionally shrunk the svg to ~60% of
the avatar box on top of the padding Iconify sets (uil, mdi, etc.) already bake
into their 24x24 viewBox — double shrinkage. Fixed by sizing the svg to
`width/height: 100% !important` (same as Garden's own `img` fill rule) instead
of a fixed px fraction.

## Session: 2026-08-04 — `update_theme` CI failure

### Completed

- [x] Diagnosed `update_theme` GitHub Actions job failure (run
      [`30865002513`](https://github.com/ARPA-H/zendesk_copenhagen/actions/runs/30865002513)):
      Zendesk API rejected the theme zip with `FileNotSupported` for
      `assets/service-catalog-icon-base.svg`. Root cause: the file started with
      an HTML comment (`<!-- ... -->`) before the `<svg>` root — the only SVG in
      `assets/` not starting with `<svg`/`<?xml` as its first bytes. Zendesk's
      importer appears to sniff file type from the leading bytes and rejects
      SVGs that don't start with one of those.
- [x] Fix (commit
      [`b0805fb8`](https://github.com/ARPA-H/zendesk_copenhagen/commit/b0805fb8)
      on `sandbox`): moved the explanatory comment to _inside_ the `<svg>` root
      as a child comment instead of before it — still invisible/inert, but the
      file now starts with `<svg`.
- [x] Push
      [`b0805fb8`](https://github.com/ARPA-H/zendesk_copenhagen/commit/b0805fb8)
      to `origin/sandbox` — confirmed pushed and deployed.

**Convention going forward:** any new committed SVG asset must start the file
with `<svg` or `<?xml` — never a leading comment — or the Zendesk theme importer
will reject it.

## Session: 2026-08-03 — `feat/all-the-icons` icon-support refactor

### What the feature does

Catalog authors reference an icon by adding a marker anywhere in an item's
description in the Zendesk admin UI: `[icon: <ref>]` (parsed out, never shown to
end users). `<ref>` is one of, in order of preference: an Iconify name
(`prefix:name`, e.g. `logos:figma` — Iconify serves ~200k open-source icons and
most vendor logos from one API), a direct `https://` URL to an externally-hosted
`.svg`, or a committed SVG filename in this theme's `assets/`. Resolution
precedence: the `[icon: ...]` marker, then a maintainer-curated
`SERVICE_ICON_MAP` keyed by item name, then the uploaded thumbnail image (legacy
fallback), then a generic default icon. This replaces the old system where every
catalog item needed its own (often low-resolution) uploaded PNG. The
`iconify_api_base` Guide theme setting (see 2026-08-04 fix below) lets a
self-hosted Iconify API be used instead of the public one, for deployments that
want to keep icon traffic in-house.

### Established repo convention (commit [`632f8a83`](https://github.com/ARPA-H/zendesk_copenhagen/commit/632f8a83), 2026-08-02)

`src/modules/service-catalog` is meant to stay as close to a zero-diff mirror of
`zendesk/copenhagen_theme` upstream as possible — it receives frequent upstream
feature updates. New ARPA-H-specific behavior should go in
`src/modules/svc-page-utils` (a separate ES module glue layer imported directly
by `.hbs` templates) or in the templates themselves, **not** by editing files
inside `src/modules/service-catalog`.

`feat/all-the-icons` initially went against this (directly edited
`ItemThumbnail.tsx`, `CollapsibleDescription.tsx`, `ServiceCatalogListItem.tsx`,
`renderServiceCatalogItem.tsx`, `renderServiceCatalogPage.tsx`, plus new files
inside `service-catalog` — ~520 extra lines of upstream diff).

### Refactor done to reduce upstream-merge risk (2026-08-03)

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
  dedicated, purpose-named committed asset:
  `assets/service-catalog-icon-base.svg` (tiny inert 1x1 SVG) — both templates
  derive `iconAssetBase` from that instead of the branding logo. (See 2026-08-04
  fix above re: leading comment.)
- Residual, unavoidable diff still inside `src/modules/service-catalog`:
  `ItemThumbnail.tsx`, `CollapsibleDescription.tsx`
  (`components/service-catalog-item/`), `ServiceCatalogListItem.tsx`
  (`components/service-catalog-list/`) — these render per-item icons / strip the
  `[icon: ...]` marker inline and genuinely can't be done via external DOM
  post-processing without fighting React's own reconciliation. Accepted,
  minimized trade-off.
- Validated: `yarn eslint src` (0 errors, only pre-existing warnings),
  `yarn tsc --noEmit` (no new errors), `yarn jest src/modules/service-catalog`
  (175 passed) + `yarn jest src/modules/svc-page-utils` (9 passed), `yarn build`
  (exit 0; regenerates `service-catalog-bundle.js`/`shared-bundle.js`/
  `svc-page-utils-bundle.js` plus cosmetic-only minified-identifier churn in the
  other bundles from the shared chunk's export list growing).

### Known follow-ups / issues on this branch

- `Settings.iconify_api_base` was added to
  `src/modules/shared/garden-theme/createTheme.ts` but is **not** registered as
  a setting in `manifest.json` — currently dead/unreachable since
  `{{json settings}}` only serializes manifest-defined settings. **Fixed
  2026-08-04** (commit
  [`0f010cb3`](https://github.com/ARPA-H/zendesk_copenhagen/commit/0f010cb3),
  merged to `main`): `iconify_api_base` is now a real text setting in the
  `service_catalog` manifest group, so admins can point icon lookups at a
  self-hosted Iconify API; leaving it blank still uses Iconify's own
  load-balanced default hosts.
- Current architecture invariants from when this feature was built (kept here
  since they explain non-obvious code choices, not because a rebase is still
  pending — the branch merged same-day, see above):
  - `CollapsibleDescription.tsx`: compose sandbox's `sanitizeHtml` with the icon
    branch's `stripIconMarker` — `sanitizeHtml(stripIconMarker(description))`.
  - `ServiceCatalogListItem.tsx`: use sandbox's safer `htmlToText` (inert
    `DOMParser`) instead of the icon branch's local `decodeToText` (innerHTML on
    a live element), combined with `stripIconMarker` for the description.
  - `ItemThumbnail.tsx` must always receive the RAW `description` prop (with the
    `[icon: ...]` marker still present) — `resolveItemIcon`/`parseIconRef` need
    the marker; only the _displayed_ text should have it stripped.
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

## Session: 2026-07-30 — service-catalog field validation + security sweep

- **[`service-catalog-field-validation`](https://github.com/ARPA-H/zendesk_copenhagen/pull/101)**,
  5 sequential commits
  ([#91](https://github.com/ARPA-H/zendesk_copenhagen/pull/91),
  [#96](https://github.com/ARPA-H/zendesk_copenhagen/pull/96)/[#94](https://github.com/ARPA-H/zendesk_copenhagen/pull/94),
  [#97](https://github.com/ARPA-H/zendesk_copenhagen/pull/97),
  [#98](https://github.com/ARPA-H/zendesk_copenhagen/pull/98),
  [#100](https://github.com/ARPA-H/zendesk_copenhagen/pull/100),
  [#101](https://github.com/ARPA-H/zendesk_copenhagen/pull/101)): added
  accessible inline invalid-field styling -> extended it to required
  dropdown/combobox fields -> fixed required-dropdown validation for non-empty
  sentinel defaults -> gated invalid styling strictly on submit attempt (not
  just interaction) -> flag _any_ required-and-empty field on submit, not just
  asset fields. ([#96](https://github.com/ARPA-H/zendesk_copenhagen/pull/96)
  "resolve-pr-94-conflicts" was conflict resolution for merging **upstream's**
  MultiLookupField feature,
  CD-4026/[#823](https://github.com/zendesk/copenhagen_theme/pull/823) —
  unrelated to the validation work landing in the same PR chain.)
- **[`security-alert-remediation`](https://github.com/ARPA-H/zendesk_copenhagen/pull/103)**
  ([#103](https://github.com/ARPA-H/zendesk_copenhagen/pull/103), single
  commit): "patch vulnerable deps and address CodeQL findings" — touched
  `package.json`/`yarn.lock`, `src/forms.js`, `bin/theme-upload.js`, and CI
  workflow permissions.

## Session: 2026-07-29 — header/search CSS churn, manifest env-id cleanup

- [`fix-help-center-path-normalize`](https://github.com/ARPA-H/zendesk_copenhagen/pull/75)
  ([#75](https://github.com/ARPA-H/zendesk_copenhagen/pull/75)) +
  [`header-css-fix`](https://github.com/ARPA-H/zendesk_copenhagen/pull/86)
  ([#76](https://github.com/ARPA-H/zendesk_copenhagen/pull/76),
  [#77](https://github.com/ARPA-H/zendesk_copenhagen/pull/77),
  [#79](https://github.com/ARPA-H/zendesk_copenhagen/pull/79),
  [#86](https://github.com/ARPA-H/zendesk_copenhagen/pull/86)) interleaved
  across the day: landed `normalizeHelpCenterPath`
  ([#80](https://github.com/ARPA-H/zendesk_copenhagen/pull/80) is the final
  state) alongside several small header CSS iterations (mobile menu button color
  on `service_list_page`, search box border/font-size).
- [`remove-manifest-env-ids`](https://github.com/ARPA-H/zendesk_copenhagen/pull/82)
  ([#81](https://github.com/ARPA-H/zendesk_copenhagen/pull/81),
  [#82](https://github.com/ARPA-H/zendesk_copenhagen/pull/82)): removed
  per-environment service catalog IDs from `manifest.json`, switched the deploy
  workflow from Zendesk's Import Job to the Theme Update Job, and bumped the
  ephemeral theme version on deploy so the Update Job is accepted.
- [`fix/CSS-search-update`](https://github.com/ARPA-H/zendesk_copenhagen/pull/74)
  ([#74](https://github.com/ARPA-H/zendesk_copenhagen/pull/74)): moved manual
  `style.css` overrides into SCSS partials, removed unused catalog search-box
  CSS, minor grammar fix, and made `update.yml` build theme assets before
  deploy.

## Session: 2026-07-28 — service catalog UI/search fixes + upstream sync conflict resolution

- [`fix/ui-and-search`](https://github.com/ARPA-H/zendesk_copenhagen/pull/69)
  ([#69](https://github.com/ARPA-H/zendesk_copenhagen/pull/69)): restored
  `STRINGS` centralization for article suggestions, refactored search component
  styles (removed borders, fixed font size), restored the manifest-driven
  training FAB (`show_training_fab`/`training_url`) that had been dropped in an
  earlier merge, rebuilt `script.js`, fixed an unsafe URL fallback in
  `renderArticles`, and replaced a hardcoded "Submit request" button label /
  blind 3s timeout with a localized label + `MutationObserver`-based
  submit-state mirroring (15s safety fallback).
- [`sandbox-standards-audit`](https://github.com/ARPA-H/zendesk_copenhagen/pull/70)
  ([#70](https://github.com/ARPA-H/zendesk_copenhagen/pull/70)): "address
  Copenhagen theme standards divergences vs upstream" — mostly translation-file
  formatting/whitespace normalization across `translations/*.json`.
- [`fix/sandbox-upstream-merge-ancestry`](https://github.com/ARPA-H/zendesk_copenhagen/pull/73)
  ([#73](https://github.com/ARPA-H/zendesk_copenhagen/pull/73)): merged
  `upstream/master` in to fix branch ancestry, pulling in upstream's `PDSC-954`
  (query-string prefill for service-catalog item forms) and
  `PDSC-943`/4.47.3-4.48.0 releases; added one new spec file for
  `submitServiceItemRequest`. This is a git-history-hygiene fix, not a new
  ARPA-H feature.

## Session: 2026-07-27 — resolve-pr-65-conflicts (upstream query-string-prefill merge)

[`resolve-pr-65-conflicts`](https://github.com/ARPA-H/zendesk_copenhagen/pull/66)
([#66](https://github.com/ARPA-H/zendesk_copenhagen/pull/66)): conflict
resolution for merging `upstream/master`'s query-string prefill feature for
service-catalog item forms into `sandbox` — brought in
`applyPrefillToFields.ts`, `parseQueryStringPrefill.ts`,
`useQueryStringPrefill.tsx`, and `utils/sanitize.ts` (all upstream-authored; the
ARPA-H work here was purely conflict resolution, not the feature itself).

## Session: 2026-07-27 — PR #63 review findings: svcSearch extraction, XSS hardening, a11y, manifest settings

Commit
[`8986d5bd`](https://github.com/ARPA-H/zendesk_copenhagen/commit/8986d5bd)
"address PR #63 review findings" (merged 2026-07-28 via
[PR #63](https://github.com/ARPA-H/zendesk_copenhagen/pull/63)
"SC>Sandbox-sync--AM"):

- **Training FAB**: replaced a hardcoded `REPLACE_WITH_TRAINING_URL` placeholder
  with real manifest settings (`show_training_fab` checkbox, `training_url`
  text), hidden by default until an admin configures a URL.
- **De-duplicated hardcoded service/category IDs**:
  `general_request_service_id`/`general_request_category_id` (plus
  `other_request_service_id`) are now manifest settings referenced from both
  `service_page.hbs` and `service_list_page.hbs` instead of duplicated literals.
- **Extracted ~300 lines** of duplicated live-search widget JS (synonyms map,
  escaping/tag-stripping, `fetchJSON`, scoring, dropdown rendering, keyboard
  nav) out of both service-catalog templates into `src/svcSearch.js`, bundled
  via `src/index.js` (same pattern as `domFixups.js`), parameterized per page.
- **a11y**: search comboboxes now assign stable ids to each result option, set
  `aria-selected`, and update `aria-activedescendant` on the input as keyboard
  navigation moves, per the WAI-ARIA APG combobox pattern.
- **XSS hardening**: added a `safeHref()` helper (scheme allowlist: relative,
  `http:`, `https:`) applied everywhere an API-sourced href is inserted via
  `innerHTML` in the live-search widget, as defense-in-depth alongside existing
  HTML-entity escaping, per the OWASP DOM-based XSS Prevention Cheat Sheet.
  Covered by `src/svcSearch.spec.js`.

## Session: 2026-07-24 — help-center path duplication root-cause fix

`fix(service-catalog): guard against relative helpCenterPath causing duplicated /hc segment`
(commit
[`eea61fba`](https://github.com/ARPA-H/zendesk_copenhagen/commit/eea61fba)) —
`page_path('help_center')` is expected to always return an absolute path; if it
ever came back relative, catalog links built by string-concatenation onto it
would resolve against the wrong parent directory, producing
`/hc/<locale>/hc/services` instead of `/hc/<locale>/services`. Added
`normalizeHelpCenterPath()` and applied it at both service-catalog render entry
points. This is the fix that the `fix-help-center-path-normalize` PR chain (see
2026-07-29 above) landed as its final state.

## Session: 2026-07-23 — service-catalog redesign moved out of generated artifacts; FOUC/a11y/font/hardcoding fixes

Commit
[`c420e0f9`](https://github.com/ARPA-H/zendesk_copenhagen/commit/c420e0f9)
"refactor(theme): move custom CSS/JS to source; fix FOUC, a11y, fonts,
hardcoding" (also landed via
[PR #63](https://github.com/ARPA-H/zendesk_copenhagen/pull/63)) — remediated the
original service-catalog redesign so it follows normal Copenhagen theme
conventions instead of living in generated artifacts and inline blocks:

- **CSS**: relocated ~1,500 lines of custom styles out of the generated
  `style.css` and inline `<style>` blocks into SCSS partials
  (`styles/_svc-*.scss`), rebuilding `style.css` from source so the redesign
  survives `yarn build` (previously it was one build away from being wiped).
  Removed all inline `style=""` attributes/`<style>` tags.
- **FOUC**: dropped the hide-everything-then-reveal-with-JS guard (plus
  `<noscript>` and failsafe timers) — the hero now renders immediately, and only
  the async catalog uses a skeleton + one-class `.svc-cat-ready` reveal.
- **Fonts**: self-hosted Public Sans (the USWDS/ARPA-H standard) via
  `@font-face` + `assets/public-sans-*.woff2`, removing the third-party Google
  Fonts CDN `@import` (also privacy-relevant — no more calling out to a
  third-party font CDN on every page load).
- **JS**: moved the breadcrumb neutralizer + "empty" text hider out of inline
  `document_head` scripts into `src/domFixups.js` (plus a CSS pointer-events
  backstop); added navigation null-checks at the source in `src/navigation.js`.
- **De-hardcoded** instance URLs to root-relative/location-derived, and locale
  to `{{help_center.base_locale}}`.
- **a11y/i18n**: OS-tile `<img alt>` restored accessible names; reused the
  built-in `{{t 'search'}}` key for search aria-labels instead of a literal.
- **Perf**: session-cached the service-catalog fetch (once per session, shared
  across pages) instead of refetching the whole catalog on every page load.
- Fixed the `service_page` top-bar logo to render an `<img>` instead of the raw
  asset URL as text.

## Session: 2026-07-02 — dependabot.yml added

Added `dependabot.yml` targeting the `sandbox` branch (rather than `main`), so
automated dependency-update PRs land where day-to-day work happens.

## Session: 2026-06-18 — workflow scope fix + article author attribution

- Added `paths-ignore` to the Update Theme workflow so non-theme file changes
  (docs, CI meta) don't trigger a live theme deploy.
- Disabled article author attribution (`show_article_author: false`).

## Session: 2026-06-09 — restore ARPA-H styling lost in an upstream merge + security fixes

A prior upstream merge had silently dropped several ARPA-H-specific style
overrides; this session was a dedicated restoration pass plus a batch of
security/dependency fixes:

- Restored: blocks-item styling (12px radius, grid layout, image hover,
  uppercase titles), nav button / alert banner / request form custom styles,
  hero "submit a request" button styling (white bg, navy border, bevel), search
  bar width/icon positioning in the header, and removed leftover "safetykleen"
  test styles that were causing a red header background. A final "restore all
  remaining ARPA-H custom styles" commit closed out the sweep.
- Security: CWE-116 fix (inert `<template>` element for the WYSIWYG empty-check
  instead of a live-DOM parse), CWE-079 fix (removed `DOMParser` usage that
  CodeQL flagged as an XSS vector), added `yarn resolutions` to force patched
  versions of transitive deps, replaced `axios` with native `fetch` in
  `importTheme.js`.
- CI/tooling: pinned GitHub Action SHAs, added explicit workflow permissions,
  moved `brandId` to an env var, removed the unused root `scripts` package.json,
  bumped `import_theme.yml` to Node 24, rebuilt generated assets/styles.
- Theme-limit management: prune the oldest themes before publish to stay under
  Zendesk's 10-theme cap, and keep only 4 non-live themes (down from 5) for
  extra headroom.

## Session: 2026-06-08 — import+publish deploy workflow rewrite

Rewrote the theme deploy pipeline: switched to an import-then-publish workflow
with semver theme naming, changed the publish call to `POST`, moved `BRAND_ID`
to a repo **var** instead of a secret, fixed the workflow to preserve existing
Zendesk theme settings across an update (previously an update could silently
reset them), and removed unused theme assets/updated theme settings images and
thumbnail. Also merged dependabot
[PR #17](https://github.com/ARPA-H/zendesk_copenhagen/pull/17).

## Session: 2026-06-07 — sandbox brought up to date with main ([PR #14](https://github.com/ARPA-H/zendesk_copenhagen/pull/14))

Merged `main` into `sandbox` (v4.23.8 -> v4.41.2): kept sandbox's custom theme
name ("Copenhagen 12-30.2"), accepted `main`'s generated assets and newer
templates (`document_head.hbs` request-list translations, `header.hbs` ARPA-H
customizations + "Ask AI" link, newer `renderServiceCatalogPage` API with
preview-mode support). Also commented out the home page "Services" nav link.

## Session: 2026-04-10 — CI hardening (`kev-changes`, [PR #8](https://github.com/ARPA-H/zendesk_copenhagen/pull/8)/[#9](https://github.com/ARPA-H/zendesk_copenhagen/pull/9))

- [PR #8](https://github.com/ARPA-H/zendesk_copenhagen/pull/8): removed npm
  dependencies from the CI workflow.
- [PR #9](https://github.com/ARPA-H/zendesk_copenhagen/pull/9): hardened the CI
  workflow — redact credentials from logs, upgrade Actions to newer versions.

## Session: 2026-01-22 — sandbox theme re-sync

Synced the repo to the current live sandbox theme state and bumped the theme
version/thumbnail. This sync (commit
[`ecdfe744`](https://github.com/ARPA-H/zendesk_copenhagen/commit/ecdfe744)) also
set `scoped_community_search`, `show_follow_post`, and `show_post_sharing` to
`false` — as of this commit the Community follow/sharing/scoped-search features
are disabled by default in this fork.

## Session: 2025-12-15 — sandbox sync + reviewer gate ([PR #5](https://github.com/ARPA-H/zendesk_copenhagen/pull/5))

Merged [PR #5](https://github.com/ARPA-H/zendesk_copenhagen/pull/5)
(`kev-sandbox-sync`, "current state of live theme in the sandbox") and added an
authorized-reviewer check to the deploy workflow.

## Session: 2025-12-11 — CI bootstrap v2: prod/sandbox branch+theme support

Reworked the original 2024 CI bootstrap (see below) to support both a `prod` and
a `sandbox` branch/theme pair, enforced that the theme version must be
incremented on each deploy, updated the thumbnail, bumped `upload-artifact` to a
newer version, and merged upstream `main` into a `zendesk-main` tracking branch.

## Session: 2024-05-24 — workflow trigger fix

Fixed the deploy workflow to run on a merged PR or manual trigger (it previously
wasn't firing reliably).

## Session: 2024-02-12 — first upstream merge

First recorded merge of `upstream/master` into the fork after its initial
bootstrap — establishing the periodic upstream-sync pattern this fork still
follows today.

## Session: 2024-02-05 — original CI bootstrap (Import Theme Action, from scratch)

Built the fork's first deploy pipeline from nothing, over many small iterative
commits the same day: created `package.json` and added dependencies, wrote the
"Import theme action" and its `updateTheme.js`/`importTheme.js` scripts
(repeatedly revised — file-structure investigation, auth changes, several direct
`update.yml` edits), then increased the theme version to push a new logo image
(2024-02-06). This is the ancestor of everything in the "CI/CD" bullet at the
top of this file.

## Session: 2024-01-31 — fork inception: original ARPA-H redesign

[`e95ac1ec`](https://github.com/ARPA-H/zendesk_copenhagen/commit/e95ac1ec)
"Update with ARPA-H current theme as of 30 Jan 2024" — the commit that
established this fork's baseline theme (forked from an upstream
`zendesk/copenhagen_theme` commit at that point in time). Landed as one large
already-designed snapshot rather than incremental commits, so there's no earlier
granular history to backport, but the diff itself is a real redesign, not just
plumbing:

- **Rebrand**: renamed the theme to "Copenhagen (ARPA-H customized)"; brand and
  hover-link color changed to ARPA-H navy (`rgba(0, 27, 94, 1)`), link color to
  blue (`rgba(25, 84, 208, 1)`), heading font to Helvetica Neue, plus a
  `"Poppins", "Public Sans", "Arial"` stack layered on top of the
  manifest-driven fonts in `style.css`; new `logo.png`/`favicon.png`, and new
  homepage/community background images.
- **Category icons**: added 5 ARPA-H-branded SVG icons (community, handshake,
  one other, magnifying glass, org chart) and mapped them to specific category
  IDs on the home page (`{{#is id ...}}`), turning the plain category list into
  icon+title+description cards.
- **Home page hero**: replaced the hero search box with a signed-in-only "submit
  a request" link, and added a new alert banner (desktop + mobile variants,
  gated on `settings.display_alert_banner`) shown to signed-out visitors.
- **Header**: moved the search box up into the header itself (new
  `.search-wrapper`), and gated the community/sign-in nav links on signed-in
  state.
- 274 lines of new/changed `style.css` supported all of the above; the ~40
  per-locale `translations/*.json` changes in this commit were trivial
  (trailing-newline only), not real string edits.

This is the fork's oldest recorded commit — everything else in this log happened
since.

## Standing notes / gotchas

- **`useItemFormFields` (src/modules/service-catalog)**: keeps the FULL field
  list in state (`allRequestFields`) but exposes only the currently-visible
  subset as `requestFields`, via
  `getVisibleFields(allRequestFields, endUserConditions)`. The hook's
  `setRequestFields` is the raw `setAllRequestFields` setter over the FULL list
  — never call it with a plain array built from `requestFields` (the visible
  subset), since that wipes any field hidden by a conditional rule at that
  moment. Always use a functional updater that merges onto the previous full
  list (`setRequestFields(prev => prev.map(...))`), per the fix in
  `ServiceCatalogItem.tsx`'s `validateForm()`/`handleValidationErrors()`
  (2026-08-01). Root cause of a real bug: submit would silently drop
  conditionally-hidden fields from state, causing a later required-field check
  to go over the network, get a 422, fail to map the error back to a
  (now-missing) field, and jam the form until a full page reload. Tests mock
  `useItemFormFields` entirely in `ServiceCatalogItem.spec.tsx`, so this class
  of bug isn't caught unless the test explicitly includes a field absent from
  the mocked `requestFields` array. **The `handleValidationErrors()` half of
  this is now upstream-owned** — contributed back as
  [zendesk/copenhagen_theme#851](https://github.com/zendesk/copenhagen_theme/pull/851)
  and released in v4.50.3. On future upstream merges, take _upstream's_ side for
  that block and drop the fork's duplicate copy (including the duplicated
  `"should merge field errors onto the full field list…"` spec). Only the
  `validateForm()` merge remains an ARPA-H-only customization.
- **Build/test tooling**: Yarn 4 via Corepack; `yarn jest` needs `yarn install`
  first if `node_modules` state file is missing. `yarn build` (rollup) has been
  observed both to exit 129 on the ES-module/assets bundling step and to succeed
  cleanly on the same unmodified checkout across different sessions — treat exit
  129 as environment-flaky, not proof of a broken change. If it fails, fall back
  to `yarn eslint` + `tsc --noEmit` + targeted `yarn test`.
- **Dependency updates**: keep each dep's existing range style — many are pinned
  exactly on purpose (all `@zendeskgarden/react-*`, `dompurify`, `lighthouse`,
  `@zendesk/zcli`, `concurrently`), so don't blanket-caret them. Transitive CVEs
  are pinned via scoped `resolutions` entries (`"<parent>/<dep>": "^x.y.z"`);
  prefer a scoped entry over a blanket one so a fix for one consumer can't
  downgrade another. Two known traps: `@testing-library/jest-dom@6.10.0` is a
  bad release (ships breaking changes in a minor — requires Node >=22 and a
  `@testing-library/dom` >=10 peer) and carries its own advisory, so stay on
  6.9.1 for the 6.x line; and `extract-zip@2.0.1` (dev-only, via puppeteer) has
  a HIGH advisory with no patched version published, so it can't be resolved
  away.
- **eslint 9 major bump (2026-08-17)**: `.eslintrc.js` (legacy eslintrc format)
  still works under eslint 9 — flat config is only the _default_, not mandatory
  yet — but requires `ESLINT_USE_FLAT_CONFIG=false` on every invocation (set in
  the `yarn eslint` script). eslint 10 has none of this compatibility shim and
  is a dead end regardless: `@shopify/eslint-plugin` (even at its latest major,
  50.0.0) caps out at `eslint@^9.27.0`, so eslint 10 isn't reachable until
  Shopify's plugin catches up. Bumping also required `eslint-plugin-react-hooks`
  4.6.2 -> 7.1.1 (its old major doesn't declare eslint 9 in its peer range),
  whose rewritten `recommended` config added new React-Compiler-era rules as
  errors. Two of them fire on real, pre-existing patterns:
  `react-hooks/set-state-in-effect` (19 call sites) and `react-hooks/refs` (8
  call sites) are downgraded to `warn` in `.eslintrc.js` pending a dedicated
  cleanup pass — don't re-enable as `error` without fixing those call sites
  first.
- **i18next-parser -> i18next-cli migration (deferred, own PR)**: worth doing
  eventually (i18next-parser is unmaintained and drags in the old
  `broccoli-plugin`/`quick-temp`/`rimraf@2.7.1` chain — see the dependency
  security-update session below), but **not a drop-in swap**. Node version isn't
  a blocker (i18next-cli needs >=22; `.nvmrc`/CI are already on 24). What
  actually blocks it:
  - `bin/extract-strings.mjs` imports i18next-parser's `transform` and pipes it
    through a custom `vinyl-fs`/`Vinyl` stream into a bespoke YAML shape
    (`- translation: {key, title, screenshot, value}`) for Zendesk's internal
    translation review tool. i18next-cli has no equivalent composable stream —
    its programmatic API (`runExtractor(config)`) owns file I/O end-to-end
    against its own config, so this needs an `onEnd` plugin hook rewrite, not a
    config swap.
  - `--mark-obsolete`, `--module`, and warn-on-value-mismatch are custom
    behavior in the current script with no 1:1 i18next-cli equivalent (closest
    are `removeUnusedKeys`/`ignoreNamespaces`, not identical). Scope this as its
    own branch/PR — don't fold it into dependency-update work.
- **Sidebar layout**: `ServiceCatalogCategoriesSidebar.tsx` renders a fixed
  `SIDEBAR_WIDTH` (250px, in `utils/categoryTreeUtils.ts`) styled-components
  `Container` next to `.service-catalog-list` inside
  `.service-catalog-main-content` (flex row, `styles/_service_catalog.scss`). On
  mobile (<=768px) it collapses into a full-width dropdown-style toggle button
  (`.svc-cat-sidebar-toggle`) with the tree hidden until tapped (`isMobileOpen`
  state), and `.service-catalog-main-content` switches to
  `flex-direction: column` so the grid in `.service-catalog-list` gets full
  width below it (2026-08-02 fix for "categories sidebar halving the mobile grid
  width").
- **CodeQL `js/xss-through-dom`** ("DOM text reinterpreted as HTML") alerts on
  `new DOMParser().parseFromString(html, "text/html")` used purely to extract
  `.textContent`/query for tags (e.g. `src/forms.js` `isEmptyHtml`,
  `src/modules/service-catalog/utils/sanitize.ts` `htmlToText`) are false
  positives: the parsed doc is detached/inert, so `<img>`/`<script>` never fetch
  or execute, and nothing from it is ever written back into the live DOM as
  HTML. Established, intentional pattern (documented inline at each call site) —
  don't rewrite to regex-based parsing. `gh api code-scanning/alerts` endpoints
  return 403 in this sandbox (no permission to inspect/dismiss).
- **Fork/upstream posture**: `origin` = `ARPA-H/zendesk_copenhagen`, `upstream`
  = `zendesk/copenhagen_theme`. `origin/main` is ~285 files / ~29k lines
  diverged from `upstream/master` — a heavily customized fork, not a thin
  bolt-on. Upstream is still merged in periodically via real
  `git merge upstream/master` into `sandbox` (see commit
  [`0514cd4e`](https://github.com/ARPA-H/zendesk_copenhagen/commit/0514cd4e)),
  and `templates/service_list_page.hbs` is a known recurring conflict hotspot
  (commit
  [`c2ac1472`](https://github.com/ARPA-H/zendesk_copenhagen/commit/c2ac1472)).
