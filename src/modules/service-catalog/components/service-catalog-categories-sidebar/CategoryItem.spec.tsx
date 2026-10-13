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

describe("CategoryItem with subcategories", () => {
  const parent: Category = {
    ...category,
    children: [
      {
        id: "laptops",
        name: "Laptops",
        items_count: 2,
        updated_at: "2025-01-01T00:00:00Z",
      },
    ],
  };

  function renderParent(expanded: boolean) {
    render(
      <CategoryItem
        category={parent}
        nestingLevel={0}
        selectedCategoryId={null}
        onSelect={jest.fn()}
        expandedCategories={new Set<string>(expanded ? ["hardware"] : [])}
        onToggleExpand={jest.fn()}
      />
    );
  }

  it("names the toggle after its category and reports that it is collapsed", () => {
    renderParent(false);

    expect(
      screen.getByRole("button", { name: "Hardware subcategories" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the toggle's name when expanded and points it at the subcategories", () => {
    renderParent(true);

    const toggle = screen.getByRole("button", {
      name: "Hardware subcategories",
    });

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const controlled = document.getElementById(
      toggle.getAttribute("aria-controls") ?? ""
    );
    expect(controlled).toContainElement(
      screen.getByRole("button", { name: "Laptops 2" })
    );
  });

  it("names the row after the category and its count, not after the toggle", () => {
    renderParent(false);

    expect(
      screen.getByRole("button", { name: "Hardware 4" })
    ).toBeInTheDocument();
  });

  it("does not nest the toggle inside the row's button", () => {
    renderParent(false);

    const toggle = screen.getByRole("button", {
      name: "Hardware subcategories",
    });
    const row = screen.getByRole("button", { name: "Hardware 4" });

    expect(row).not.toContainElement(toggle);
    expect(toggle).not.toContainElement(row);
  });

  it("toggles without selecting when the toggle is clicked", async () => {
    const onSelect = jest.fn();
    const onToggleExpand = jest.fn();

    render(
      <CategoryItem
        category={parent}
        nestingLevel={0}
        selectedCategoryId={null}
        onSelect={onSelect}
        expandedCategories={new Set<string>()}
        onToggleExpand={onToggleExpand}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Hardware subcategories" })
    );

    expect(onToggleExpand).toHaveBeenCalledWith("hardware");
    expect(onSelect).not.toHaveBeenCalled();
  });

  describe("with the keyboard", () => {
    function renderWithSpies() {
      const onSelect = jest.fn();
      const onToggleExpand = jest.fn();

      render(
        <CategoryItem
          category={parent}
          nestingLevel={0}
          selectedCategoryId={null}
          onSelect={onSelect}
          expandedCategories={new Set<string>()}
          onToggleExpand={onToggleExpand}
        />
      );

      return { onSelect, onToggleExpand };
    }

    it.each([
      ["Enter", "{Enter}"],
      ["Space", " "],
    ])(
      "expands from the toggle on %s without selecting the row",
      async (_name, key) => {
        const { onSelect, onToggleExpand } = renderWithSpies();

        screen.getByRole("button", { name: "Hardware subcategories" }).focus();
        await userEvent.keyboard(key);

        expect(onToggleExpand).toHaveBeenCalledWith("hardware");
        expect(onSelect).not.toHaveBeenCalled();
      }
    );

    it.each([
      ["Enter", "{Enter}"],
      ["Space", " "],
    ])(
      "selects the category from the row on %s without toggling it",
      async (_name, key) => {
        const { onSelect, onToggleExpand } = renderWithSpies();

        screen.getByRole("button", { name: "Hardware 4" }).focus();
        await userEvent.keyboard(key);

        expect(onSelect).toHaveBeenCalledWith("hardware");
        expect(onToggleExpand).not.toHaveBeenCalled();
      }
    );
  });
});
