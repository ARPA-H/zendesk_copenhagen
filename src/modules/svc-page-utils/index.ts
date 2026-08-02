/*
 * The theme's sanctioned extension point for wiring theme-specific UI
 * (skeletons, greetings) around the vendored src/modules/service-catalog
 * package from the outside, WITHOUT modifying that package.
 *
 * src/modules/service-catalog mirrors zendesk/copenhagen_theme upstream and
 * receives frequent feature updates (see CHANGELOG.md) — keep it byte-for-
 * byte mergeable. All theme-specific behavior must be layered here or in
 * templates instead.
 *
 * whenReady()'s `isComplete` callers currently depend on these vendored DOM
 * contracts — re-verify them whenever service-catalog is resynced upstream:
 *   - service_list_page.hbs: an `a[href*="/services/"]` link exists once the
 *     catalog list has real items rendered (ServiceCatalogListItem.tsx).
 *   - service_page.hbs: an `input, textarea, select,
 *     button[type="submit"], [role="textbox"]` exists once the item form
 *     has rendered its real fields (ItemRequestForm.tsx).
 */
export { whenReady } from "./whenReady";
export { fetchDisplayFirstName } from "./fetchDisplayFirstName";
