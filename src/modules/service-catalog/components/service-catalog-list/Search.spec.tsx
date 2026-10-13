import { render } from "../../../test/render";
import { screen } from "@testing-library/react";
import { Search } from "./Search";

describe("Search", () => {
  it("carries the class the print stylesheet hides", () => {
    render(
      <Search searchInputValue="" isLoading={false} onChange={jest.fn()} />
    );

    expect(
      screen.getByRole("searchbox").closest(".service-catalog-search")
    ).toBeInTheDocument();
  });
});
