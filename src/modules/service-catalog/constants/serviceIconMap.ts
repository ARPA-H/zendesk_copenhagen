/**
 * Curated, maintainer-owned icon defaults: item display name (lowercased) ->
 * icon reference.
 *
 * This is entirely optional. It lets you brand the most common services in
 * bulk, in one reviewable place, without touching every catalog item. A
 * per-item `[icon: ...]` marker set by a catalog author in the Zendesk UI
 * always takes precedence over an entry here.
 *
 * References use the same syntax as the markers:
 *   - "logos:figma", "mdi:laptop"  -> any Iconify icon
 *                                     (browse at https://icon-sets.iconify.design)
 *   - "arpa-h-logomark.svg"        -> a committed SVG in this theme's assets/ dir
 *
 * Keys are compared case-insensitively against the item's exact display name.
 */
export const SERVICE_ICON_MAP: Record<string, string> = {
  // Vendor products — multi-color brand marks from Iconify's "logos" set:
  figma: "logos:figma",
  "adobe photoshop": "logos:adobe-photoshop",
  "adobe illustrator": "logos:adobe-illustrator",
  "adobe acrobat": "logos:adobe-acrobat",
  "microsoft word": "logos:microsoft-word",
  "microsoft excel": "logos:microsoft-excel",
  "microsoft powerpoint": "logos:microsoft-powerpoint",
  "microsoft teams": "logos:microsoft-teams",
  "microsoft outlook": "logos:microsoft-outlook",
  zoom: "logos:zoom-icon",
  slack: "logos:slack-icon",
  github: "logos:github-icon",

  // Generic IT services — monochrome icons, tinted via currentColor:
  "vpn access": "mdi:vpn",
  "wi-fi": "mdi:wifi",
  "new laptop": "mdi:laptop",
  "lost or stolen device": "mdi:cellphone-remove",

  // Your own brand SVGs — drop the file in assets/ and reference it by filename:
  // "grace platform": "arpa-h-logomark.svg",
};
