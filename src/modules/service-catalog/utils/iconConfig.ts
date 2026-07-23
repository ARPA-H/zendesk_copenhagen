/**
 * One-time icon configuration for a Service Catalog view. Called by the render
 * entry points with values the host template supplies.
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
 * Default Iconify API base. Empty string -> Iconify's public API
 * (https://api.iconify.design).
 *
 * To keep all icon traffic in-house (e.g. for a government/enterprise
 * deployment), either set this to your self-hosted Iconify API
 * (https://iconify.design/docs/api/), or promote it to a Guide theme setting
 * by adding an `iconify_api_base` entry to manifest.json (the render entry
 * points already forward `settings.iconify_api_base` when present).
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
