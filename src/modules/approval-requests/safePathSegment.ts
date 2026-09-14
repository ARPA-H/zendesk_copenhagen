/**
 * Approval ids are opaque tokens (ULIDs / numeric ids). Restricting them to
 * this charset at the module boundary is what actually prevents API-route
 * restructuring: `encodeURIComponent` alone is NOT sufficient because it
 * leaves `.` unescaped, so a value like ".." would survive encoding and be
 * normalized away by the browser, shifting the request to another route.
 */
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9_-]+$/;

/**
 * Returns `value` unchanged when it is a plain opaque id token, otherwise
 * throws. Use for every URL path segment that originates outside the module
 * (e.g. ids extracted from `window.location`).
 */
export function safePathSegment(value: string): string {
  if (!SAFE_PATH_SEGMENT.test(value)) {
    throw new Error(`Refusing to build an API path from unsafe id: ${value}`);
  }
  return value;
}
