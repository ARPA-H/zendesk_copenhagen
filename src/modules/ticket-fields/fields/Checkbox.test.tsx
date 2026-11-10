import { screen } from "@testing-library/react";
import { Checkbox } from "./Checkbox";
import type { TicketFieldObject } from "../data-types/TicketFieldObject";
import { render } from "../../test/render";

const baseField: TicketFieldObject = {
  id: 123,
  name: "custom_fields_123",
  value: false,
  error: null,
  label: "I approve",
  required: true,
  description: "",
  type: "checkbox",
  options: [],
};

describe("Checkbox", () => {
  it("is not marked invalid until it has an error", () => {
    render(<Checkbox field={baseField} onChange={jest.fn()} />);

    expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-invalid");
  });

  it("is marked invalid and described by its error message", () => {
    render(
      <Checkbox
        field={{ ...baseField, error: "This field is required." }}
        onChange={jest.fn()}
      />
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAccessibleDescription("This field is required.");
  });
});
