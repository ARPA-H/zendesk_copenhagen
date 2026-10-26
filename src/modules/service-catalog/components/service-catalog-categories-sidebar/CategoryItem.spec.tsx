import { render } from "../../../test/render";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CategoryItem } from "./CategoryItem";
import type { Category } from "../../data-types/Categories";

// The toggle's name-bearing message exists only in the English locale file.
const ENGLISH = {
  "service-catalog-sidebar.subcategories-named": "{{name}} subcategories",
};

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

  function renderParent(
    expanded: boolean,
    translations: Record<string, string> = ENGLISH
  ) {
    render(
      <CategoryItem
        category={parent}
        nestingLevel={0}
        selectedCategoryId={null}
        onSelect={jest.fn()}
        expandedCategories={new Set<string>(expanded ? ["hardware"] : [])}
        onToggleExpand={jest.fn()}
      />,
      translations
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
      />,
      ENGLISH
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Hardware subcategories" })
    );

    expect(onToggleExpand).toHaveBeenCalledWith("hardware");
    expect(onSelect).not.toHaveBeenCalled();
  });

  describe("in a locale without the English toggle name", () => {
    it("uses the locale's own Expand message and the category's name when collapsed", () => {
      renderParent(false, {
        "service-catalog-sidebar.expand-category": "Élargir",
        "service-catalog-sidebar.collapse-category": "Réduire",
      });

      const toggle = screen.getByRole("button", { name: "Élargir Hardware" });

      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("button", { name: /subcategories/ })
      ).not.toBeInTheDocument();
    });

    it("uses the locale's own Collapse message when expanded", () => {
      renderParent(true, {
        "service-catalog-sidebar.expand-category": "Élargir",
        "service-catalog-sidebar.collapse-category": "Réduire",
      });

      expect(
        screen.getByRole("button", { name: "Réduire Hardware" })
      ).toHaveAttribute("aria-expanded", "true");
    });

    it("never announces the English phrase", () => {
      renderParent(false, {});

      expect(
        screen.queryByRole("button", { name: "Hardware subcategories" })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Expand Hardware" })
      ).toBeInTheDocument();
    });
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
        />,
        ENGLISH
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
