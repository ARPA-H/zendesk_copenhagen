import { RequestFormField } from "./RequestFormField";
import { render } from "../test/render";
import type { TicketFieldObject } from "./data-types/TicketFieldObject";

/**
 * Component-level regression coverage for the description render sinks: every
 * field component passes `description` to a `dangerouslySetInnerHTML` hint,
 * so each integration is rendered with a script-bearing description and the
 * output asserted sanitized. The sanitizer itself is unit-tested in
 * sanitizeDescription.spec.ts; this guards the ten sink integrations against
 * a future regression back to raw HTML rendering.
 */
const MALICIOUS_DESCRIPTION =
  '<em>safe hint</em><img src="x" onerror="window.__fieldDescriptionXss = true"><script>window.__fieldDescriptionXss = true</script>';

function makeField(overrides: Partial<TicketFieldObject>): TicketFieldObject {
  return {
    id: 100,
    name: "request[custom_fields][100]",
    value: "",
    error: null,
    label: "Field under test",
    required: false,
    description: MALICIOUS_DESCRIPTION,
    type: "text",
    options: [],
    ...overrides,
  };
}

const baseProps = {
  baseLocale: "en-us",
  defaultOrganizationId: null,
  hasAtMentions: false,
  userRole: "end_user",
  userId: 1,
  brandId: 1,
  visibleFields: [] as TicketFieldObject[],
  handleChange: jest.fn(),
};

const FIELD_CASES: Array<[string, Partial<TicketFieldObject>]> = [
  ["text", { type: "text" }],
  ["partialcreditcard", { type: "partialcreditcard" }],
  ["textarea", { type: "textarea" }],
  ["checkbox", { type: "checkbox" }],
  ["date", { type: "date" }],
  [
    "multiselect",
    { type: "multiselect", options: [{ name: "Option A", value: "a" }] },
  ],
  ["tagger", { type: "tagger", options: [{ name: "Option A", value: "a" }] }],
  ["priority", { type: "priority", options: [{ name: "Low", value: "low" }] }],
  [
    "lookup",
    { type: "lookup", relationship_target_type: "zen:custom_object:testco" },
  ],
  [
    "multi_lookup",
    {
      type: "multi_lookup",
      relationship_target_type: "zen:custom_object:testco",
    },
  ],
];

describe("RequestFormField description sanitization at each render sink", () => {
  beforeEach(() => {
    (globalThis.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ custom_object_records: [] }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (window as unknown as Record<string, unknown>).__fieldDescriptionXss;
  });

  test.each(FIELD_CASES)(
    "%s field renders a sanitized description hint",
    (_type, overrides) => {
      const { container } = render(
        <RequestFormField {...baseProps} field={makeField(overrides)} />
      );

      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("[onerror]")).toBeNull();
      expect(container.innerHTML).toContain("<em>safe hint</em>");
      expect(
        (window as unknown as Record<string, unknown>).__fieldDescriptionXss
      ).toBeUndefined();
    }
  );
});
