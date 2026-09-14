import DOMPurify from "dompurify";

/**
 * Hosts an embedded `<iframe>` may load from, beyond the help center's own
 * origin. Item descriptions embed videos, so the known video players are
 * allowed; anything else could frame an arbitrary external site inside the
 * trusted help-center chrome (a credential-phishing frame). Extend this list
 * deliberately when a new embed provider is actually needed.
 */
const TRUSTED_IFRAME_HOSTS = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
];

function isTrustedIframeSrc(src: string | null): boolean {
  if (!src) {
    return false;
  }
  try {
    const url = new URL(src, window.location.origin);
    // Same-origin embeds inherit the page protocol (HSTS enforces https in
    // production); external embeds must be https from a trusted host.
    return (
      url.hostname === window.location.hostname ||
      (url.protocol === "https:" && TRUSTED_IFRAME_HOSTS.includes(url.hostname))
    );
  } catch {
    return false;
  }
}

// Constrain which iframes survive sanitization. DOMPurify strips iframes
// entirely unless a config allowlists the tag (only `sanitizeHtml` below
// does), so this module-level hook only ever affects those embeds.
DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe") {
    const src = node instanceof Element ? node.getAttribute("src") : null;
    if (!isTrustedIframeSrc(src)) {
      node.parentNode?.removeChild(node);
    }
  }
});

/**
 * Sanitizes rich-text HTML for safe rendering via `dangerouslySetInnerHTML`.
 * `iframe` is kept (descriptions can embed videos) but restricted to
 * https embeds from the help center's own origin or TRUSTED_IFRAME_HOSTS,
 * and DOMPurify still blocks `javascript:`/`data:` sources, `srcdoc` and
 * event-handler attributes.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "target",
      "title",
    ],
  });
}

export function sanitizeFieldDescription(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target"],
  });
}

/**
 * Converts a possibly-HTML string to plain text using an inert `DOMParser`
 * document, so resources are never fetched and handlers like `onerror` never
 * fire (unlike assigning to `innerHTML`).
 */
export function htmlToText(html: string): string {
  if (!html) {
    return "";
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}
