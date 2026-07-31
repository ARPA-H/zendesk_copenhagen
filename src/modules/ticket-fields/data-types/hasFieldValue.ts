import type { TicketFieldObject } from "./TicketFieldObject";

/**
 * Determines whether a ticket field currently holds a value that should
 * count as satisfying a "required" constraint.
 *
 * Checkbox fields store a boolean `value`, where `false` means
 * "unchecked" -- that must NOT be treated the same as having a value, or
 * a required checkbox left unchecked would silently pass validation (and
 * clear any previously-flagged required-field error). All other field
 * types fall back to the generic empty/undefined/null/"" check.
 */
export function hasFieldValue(field: TicketFieldObject): boolean {
  const { value } = field;

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value !== undefined && value !== null && value !== "";
}
