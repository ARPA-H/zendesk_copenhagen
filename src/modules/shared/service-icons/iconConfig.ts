/**
 * One-time icon configuration for a Service Catalog view. Called via
 * svc-page-utils' initIconSupport(), which templates invoke with values the
 * host template supplies, before the (unmodified, upstream-mirrored)
 * service-catalog module renders.
 */
import { addAPIProvider } from "@iconify/react";
import { setIconAssetBase } from "./iconAssetBase";

export interface IconConfig {
  /**
   * URL prefix for this theme's assets/ directory (derived from the {{asset}}
   * helper), used to resolve `[icon: file.svg]` references.
   */
  assetBase?: string | null;
  /**
   * Base URL of a self-hosted Iconify API (https://iconify.design/docs/api/).
   * When set, all icon data is fetched from there instead of Iconify's public
   * API — handy for keeping a government/enterprise deployment self-contained.
   * When empty, the public Iconify API is used.
   */
  iconApiBase?: string | null;
}

/**
 * Default Iconify API base. Empty string -> Iconify's own default resource
 * list (https://api.iconify.design, with https://api.simplesvg.com and
 * https://api.unisvg.com as automatic load-balanced fallback hosts), applied
 * by @iconify/react itself with no `addAPIProvider` call needed.
 *
 * To keep all icon traffic in-house (e.g. for a government/enterprise
 * deployment), set the `iconify_api_base` Guide theme setting to your
 * self-hosted Iconify API (https://iconify.design/docs/api/) — forwarded here
 * as `iconApiBase` by svc-page-utils' initIconSupport().
 */
const DEFAULT_ICONIFY_API_BASE = "";

export function initIconConfig({ assetBase, iconApiBase }: IconConfig): void {
  setIconAssetBase(assetBase);

  const api = (iconApiBase || DEFAULT_ICONIFY_API_BASE)
    .trim()
    .replace(/\/+$/, "");
  if (api) {
    // Redirect the default (unprefixed) Iconify provider to the self-hosted API.
    addAPIProvider("", { resources: [api] });
  }
}
