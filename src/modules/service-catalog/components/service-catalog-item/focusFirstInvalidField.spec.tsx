import { act, screen } from "@testing-library/react";
import { render } from "../../../test/render";
import type { TicketFieldObject } from "../../../ticket-fields/data-types/TicketFieldObject";
import { Checkbox } from "../../../ticket-fields/fields/Checkbox";
import { Input } from "../../../ticket-fields/fields/Input";
import { MultiLookupField } from "../../../ticket-fields/fields/MultiLookupField";
import { Tagger } from "../../../ticket-fields/fields/Tagger";
import { Attachments } from "../../../ticket-fields/fields/attachments/Attachments";
import { focusFirstInvalidField } from "./focusFirstInvalidField";

const REQUIRED = "This field is required.";

function field(overrides: Partial<TicketFieldObject>): TicketFieldObject {
  return {
    id: 1,
    name: "custom_fields_1",
    value: "",
    error: null,
    label: "Field",
    required: true,
    description: "",
    type: "text",
    options: [],
    ...overrides,
  };
}

function renderForm(children: React.ReactNode) {
  render(<form data-testid="form">{children}</form>);
  return screen.getByTestId("form");
}

// These render the real field components, so what the helper looks for is what
// Garden actually puts on the page, not a stand-in for it.
describe("focusFirstInvalidField", () => {
  it("focuses a text input that has an error", () => {
    const form = renderForm(
      <Input
        field={field({ label: "Short summary", error: REQUIRED })}
        onChange={jest.fn()}
      />
    );

    expect(focusFirstInvalidField(form)).toBe(true);
    expect(screen.getByLabelText(/Short summary/)).toHaveFocus();
  });

  it("focuses a required checkbox, which does not mark itself invalid", () => {
    const form = renderForm(
      <Checkbox
        field={field({
          label: "I approve",
          type: "checkbox",
          value: false,
          error: REQUIRED,
        })}
        onChange={jest.fn()}
      />
    );

    expect(focusFirstInvalidField(form)).toBe(true);
    expect(screen.getByRole("checkbox")).toHaveFocus();
  });

  it("focuses a dropdown's trigger and not the hidden input inside it", () => {
    const form = renderForm(
      <Tagger
        field={field({
          label: "Priority",
          type: "tagger",
          error: REQUIRED,
          options: [
            { name: "Low", value: "low" },
            { name: "High", value: "high" },
          ],
        })}
        onChange={jest.fn()}
      />
    );

    expect(focusFirstInvalidField(form)).toBe(true);
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("focuses an attachments drop zone, not the file input behind it", () => {
    const form = renderForm(
      <Attachments
        field={{
          name: "attachments",
          label: "Upload a file",
          description: "",
          error: "Upload a file to continue",
          attachments: [],
          isRequired: true,
        }}
        baseLocale="en-us"
      />
    );

    // react-dropzone updates its state when the drop zone takes focus.
    let focused = false;
    act(() => {
      focused = focusFirstInvalidField(form);
    });

    expect(focused).toBe(true);
    expect(
      form.querySelector('[data-garden-id="forms.file_upload"]')
    ).toHaveFocus();
  });

  // A lookup shows its limit message as an error once more values are selected than it
  // allows: its combobox marks itself invalid and the message is an alert, so it is a field
  // with an error like any other, and here the first one in the form.
  it("counts a lookup that is over its limit, which marks itself as invalid", async () => {
    (globalThis.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            custom_object_records: [
              { name: "Record A", id: "a" },
              { name: "Record B", id: "b" },
            ],
          }),
      })
    );
    const form = renderForm(
      <>
        <MultiLookupField
          field={field({
            id: 1,
            name: "a",
            label: "Systems",
            type: "multi_lookup",
            required: false,
            value: ["a", "b"],
            max_selections: 1,
            relationship_target_type: "zen:custom_object:system",
          })}
          userId={1}
          organizationId={null}
          onChange={jest.fn()}
          visibleFields={[]}
        />
        <Input
          field={field({
            id: 2,
            name: "b",
            label: "Short summary",
            error: REQUIRED,
          })}
          onChange={jest.fn()}
        />
      </>
    );

    await screen.findByText(/reached the limit of 1 values/);

    // Garden hides the lookup's input until it is focused, so the reachable control is its
    // first selected tag; what matters is that focus is inside the lookup.
    const lookup = screen.getByLabelText(/Systems/);
    const lookupField = form.querySelector(
      '[data-garden-id="dropdowns.combobox.field"]'
    );
    expect(lookup).toHaveAttribute("aria-invalid", "true");
    expect(focusFirstInvalidField(form)).toBe(true);
    expect(lookupField).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByLabelText(/Short summary/)).not.toHaveFocus();
  });

  it("goes to the first error in the order the form shows them", () => {
    const form = renderForm(
      <>
        <Input
          field={field({ id: 1, name: "a", label: "Short summary" })}
          onChange={jest.fn()}
        />
        <Checkbox
          field={field({
            id: 2,
            name: "b",
            label: "I approve",
            type: "checkbox",
            value: false,
            error: REQUIRED,
          })}
          onChange={jest.fn()}
        />
        <Input
          field={field({
            id: 3,
            name: "c",
            label: "Affected system",
            error: REQUIRED,
          })}
          onChange={jest.fn()}
        />
      </>
    );

    expect(focusFirstInvalidField(form)).toBe(true);
    expect(screen.getByRole("checkbox")).toHaveFocus();
  });

  it("leaves focus alone when no field shows an error", () => {
    const form = renderForm(
      <Input field={field({ label: "Short summary" })} onChange={jest.fn()} />
    );

    expect(focusFirstInvalidField(form)).toBe(false);
    expect(document.body).toHaveFocus();
  });
});
