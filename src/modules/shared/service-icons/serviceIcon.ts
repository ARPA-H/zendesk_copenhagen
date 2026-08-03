/**
 * Icon resolution for Service Catalog items.
 *
 * Rather than uploading a (often low-resolution) PNG per item, catalog authors
 * can *reference* an icon. A reference is one of, in order of preference:
 *
 *   - an Iconify name, `prefix:name` — e.g. `logos:figma`, `mdi:laptop`. Iconify
 *     serves ~200k open-source icons (and, via its brand sets, most vendor
 *     logos) from a single API; browse at https://icon-sets.iconify.design.
 *   - a direct `https://` URL to an externally-hosted `.svg` file — no code
 *     change needed, just paste a link in the Zendesk admin UI.
 *   - a committed SVG in this theme's assets/ directory, by filename — e.g.
 *     `arpa-h-logomark.svg`. Use this for our own marks, or when neither of
 *     the above is available.
 *
 * Authors set a reference per item by adding a marker anywhere in the item's
 * description (in the Zendesk admin UI):
 *
 *   [icon: logos:figma]
 *
 * The marker is parsed out and never shown to end users. A maintainer-curated
 * map (SERVICE_ICON_MAP) can supply defaults in bulk.
 *
 * Precedence (first match wins):
 *   1. [icon: ...] marker in the item description   (author,     per-item)
 *   2. SERVICE_ICON_MAP entry keyed by item name    (maintainer, curated)
 *   3. the uploaded thumbnail image (thumbnail_url)  (legacy, worst-case fallback)
 *   4. a generic default icon
 */

import { SERVICE_ICON_MAP } from "./serviceIconMap";
import { getIconAssetBase } from "./iconAssetBase";

export type ResolvedItemIcon =
  | { kind: "iconify"; name: string }
  | { kind: "image"; url: string }
  | { kind: "default" };

// [icon: <ref>] — case-insensitive, tolerant of surrounding whitespace.
const ICON_MARKER_REGEX = /\[icon:\s*([^\]]+?)\s*\]/i;

// An Iconify name is "prefix:name", each part lowercase alphanumerics/dashes.
const ICONIFY_NAME_REGEX =
  /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/i;

// A local asset reference is a bare image filename: no path segments (which
// blocks "../" traversal) and no scheme (which blocks remote URLs).
const ASSET_FILENAME_REGEX = /^[\w.-]+\.(?:svg|png|jpe?g|webp|gif)$/i;

// A direct link to an externally-hosted SVG. Restricted to https and a .svg
// path (query/hash allowed) — rendered only as an <img src>, never inlined,
// so this can't execute script even if the SVG content is malicious.
function parseHttpsSvgUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  return url.protocol === "https:" && /\.svg$/i.test(url.pathname)
    ? value
    : null;
}

/** Extract the raw reference from a description's [icon: ...] marker, if any. */
export function parseIconRef(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(ICON_MARKER_REGEX);
  return match && match[1] ? match[1].trim() : null;
}

/** Remove the [icon: ...] marker so it never renders in user-facing text. */
export function stripIconMarker(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(ICON_MARKER_REGEX, "").trim();
}

function normalizeName(name: string | null | undefined): string {
  return (name || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Classify a raw reference string into a renderable icon, or `null` if it
 * doesn't match any recognized reference form. Shared by both the marker and
 * the curated map so they behave identically.
 */
export function classifyIconRef(
  ref: string | null | undefined
): ResolvedItemIcon | null {
  const value = (ref || "").trim();
  if (!value) return null;

  if (ICONIFY_NAME_REGEX.test(value)) {
    return { kind: "iconify", name: value.toLowerCase() };
  }

  const svgUrl = parseHttpsSvgUrl(value);
  if (svgUrl) return { kind: "image", url: svgUrl };

  if (ASSET_FILENAME_REGEX.test(value)) {
    const base = getIconAssetBase();
    // Usable only once the host template has provided the assets base URL.
    return base ? { kind: "image", url: base + value } : null;
  }

  return null;
}

/** Resolve the icon to render for a catalog item. Never throws. */
export function resolveItemIcon(input: {
  name?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
}): ResolvedItemIcon {
  const { name, description, thumbnailUrl } = input;

  // 1. Per-item marker in the description (author-controlled).
  const fromMarker = classifyIconRef(parseIconRef(description));
  if (fromMarker) return fromMarker;

  // 2. Curated map keyed by the item's display name (maintainer-controlled).
  const fromMap = classifyIconRef(SERVICE_ICON_MAP[normalizeName(name)]);
  if (fromMap) return fromMap;

  // 3. Legacy uploaded thumbnail image — worst-case fallback, only reached
  //    when no SVG/Iconify reference is set.
  if (thumbnailUrl && thumbnailUrl.trim()) {
    return { kind: "image", url: thumbnailUrl.trim() };
  }

  // 4. Generic fallback icon.
  return { kind: "default" };
}
