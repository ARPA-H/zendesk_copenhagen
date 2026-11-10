/**
 * Restrict a URL to a safe scheme before it is inserted via innerHTML.
 * Defense in depth per the OWASP DOM-based XSS Prevention Cheat Sheet
 * (https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html):
 * entity-escaping neutralizes markup breakout but not a `javascript:` URI, so
 * the scheme itself must also be validated. Relative URLs (no scheme, e.g.
 * "/hc/en-us/services/123") are always allowed; absolute URLs are allowed
 * only for http:/https:. Anything else (javascript:, data:, vbscript:, etc.)
 * falls back to `fallback` (default "#").
 */
export function safeHref(url, fallback) {
  var fb = fallback || "#";
  if (url == null) return fb;
  var str = String(url).trim();
  if (!str) return fb;
  // Strip control/whitespace characters that can be used to smuggle a scheme
  // past naive checks (e.g. "java\tscript:").
  // eslint-disable-next-line no-control-regex
  var stripped = str.replace(/[\x00-\x1f\x7f]/g, "");
  var schemeMatch = stripped.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) return str; // no scheme => relative URL, safe
  var scheme = schemeMatch[1].toLowerCase();
  return scheme === "http" || scheme === "https" ? str : fb;
}

// service_page.hbs reads this from `window` for the training button and the
// suggested-article links. script.js is a classic script, so a page's inline
// <script> cannot import it.
if (typeof window !== "undefined") {
  window.svcSafeHref = safeHref;
}
