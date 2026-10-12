import { render } from "../../../test/render";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CategoryItem } from "./CategoryItem";
import type { Category } from "../../data-types/Categories";

const category: Category = {
  id: "hardware",
  name: "Hardware",
  items_count: 4,
  updated_at: "2025-01-01T00:00:00Z",
};

function renderItem(selectedCategoryId: string | null, onSelect = jest.fn()) {
  render(
    <CategoryItem
      category={category}
      nestingLevel={0}
      selectedCategoryId={selectedCategoryId}
      onSelect={onSelect}
      expandedCategories={new Set<string>()}
      onToggleExpand={jest.fn()}
    />
  );

  return { onSelect };
}

describe("CategoryItem", () => {
  it("marks the selected category as current for assistive technology", () => {
    renderItem("hardware");

    expect(screen.getByRole("button", { name: /Hardware/ })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  it("does not mark an unselected category as current", () => {
    renderItem("software");

    expect(
      screen.getByRole("button", { name: /Hardware/ })
    ).not.toHaveAttribute("aria-current");
  });

  it("selects the category on click", async () => {
    const { onSelect } = renderItem(null);

    await userEvent.click(screen.getByRole("button", { name: /Hardware/ }));

    expect(onSelect).toHaveBeenCalledWith("hardware");
  });
});
