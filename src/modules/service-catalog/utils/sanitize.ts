import DOMPurify from "dompurify";

/**
 * External embed providers an `<iframe>` may load from, beyond the help
 * center's own origin, keyed by host with the provider's non-redirecting
 * embed path prefix. Item descriptions embed videos, so the known video
 * players are allowed; anything else could frame an arbitrary external site
 * inside the trusted help-center chrome (a credential-phishing frame). The
 * path prefix matters too: allowlisted hosts expose open redirects on other
 * paths (e.g. youtube.com/redirect), which would defeat the host check.
 * Extend this map deliberately when a new embed provider is actually needed.
 */
const TRUSTED_IFRAME_EMBEDS: Record<string, string> = {
  "www.youtube.com": "/embed/",
  "www.youtube-nocookie.com": "/embed/",
  "player.vimeo.com": "/video/",
};

function isTrustedIframeSrc(src: string | null): boolean {
  // A whitespace-only src is truthy but URL-resolves to the page origin, so
  // trim before deciding whether a source is present at all.
  const trimmed = src?.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const url = new URL(trimmed, window.location.origin);
    // Full-origin comparison for same-origin embeds (a hostname-only check
    // would accept scheme or port mismatches).
    if (url.origin === window.location.origin) {
      return true;
    }
    // External embeds must be https on the default port (url.port is ""
    // when the port is the scheme default - a non-default port on a trusted
    // host is a different origin/service) and on the provider's embed path.
    const embedPathPrefix = TRUSTED_IFRAME_EMBEDS[url.hostname];
    return (
      url.protocol === "https:" &&
      url.port === "" &&
      embedPathPrefix !== undefined &&
      url.pathname.startsWith(embedPathPrefix)
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
 * `iframe` is kept (descriptions can embed videos) but restricted to the
 * help center's own origin or the https embed paths in
 * TRUSTED_IFRAME_EMBEDS, and DOMPurify still blocks `javascript:`/`data:`
 * sources, `srcdoc` and event-handler attributes.
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
