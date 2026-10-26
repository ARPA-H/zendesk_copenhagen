import DOMPurify from "dompurify";

/**
 * Small memo cache: descriptions are static per form render, but the form
 * re-renders all fields on every value change, so sanitizing at the render
 * sink would otherwise re-parse every description on each keystroke. Bounded
 * so pathological callers cannot grow it without limit.
 */
const cache = new Map<string, string>();
const CACHE_MAX_ENTRIES = 200;

/**
 * Sanitizes admin-authored ticket-field description HTML immediately before
 * it reaches a `dangerouslySetInnerHTML` sink. Descriptions arrive via the
 * server-rendered `{{json new_request_form}}` payload (Zendesk sanitizes them
 * server-side) or pre-sanitized from the service-catalog module, so this is
 * defense in depth at the sink: script-bearing markup is removed while the
 * formatting and links Zendesk allows are preserved. `target` is kept so
 * links can open in a new tab, matching the service-catalog module's
 * `sanitizeFieldDescription` configuration.
 */
export function sanitizeDescription(description: string): string {
  const cached = cache.get(description);
  if (cached !== undefined) {
    return cached;
  }

  const sanitized = DOMPurify.sanitize(description, { ADD_ATTR: ["target"] });

  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (!oldest.done) {
      cache.delete(oldest.value);
    }
  }
  cache.set(description, sanitized);

  return sanitized;
}
