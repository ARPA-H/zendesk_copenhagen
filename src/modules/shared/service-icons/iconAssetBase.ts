/**
 * URL prefix for this theme's `assets/` directory.
 *
 * The Service Catalog runs as a bundled ES module and therefore cannot use
 * Curlybars' {{asset}} helper. Instead, the host template derives the assets
 * base URL with {{asset}} and hands it to the module at mount time (see
 * `initIconConfig`). Icon references that point at a committed SVG — e.g.
 * `[icon: arpa-h-logomark.svg]` — are resolved against this base.
 *
 * Kept in its own tiny module (with no @iconify/react import) so the pure icon
 * resolver can be unit-tested without pulling in the Iconify runtime.
 */
let assetBase = "";

export function setIconAssetBase(base: string | null | undefined): void {
  assetBase = (base || "").trim();
}

export function getIconAssetBase(): string {
  return assetBase;
}
