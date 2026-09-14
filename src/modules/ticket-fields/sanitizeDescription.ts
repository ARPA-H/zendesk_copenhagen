import DOMPurify from "dompurify";

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
  return DOMPurify.sanitize(description, { ADD_ATTR: ["target"] });
}
