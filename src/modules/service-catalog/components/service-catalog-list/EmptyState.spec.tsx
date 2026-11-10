import { render } from "../../../test/render";
import { screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("explains an empty catalog and offers the homepage", () => {
    render(<EmptyState helpCenterPath="/hc/en-us" searchInputValue="" />);

    expect(screen.getByText("No services in sight")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Once services are added to catalog, you'll find them here."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to the homepage" })
    ).toBeInTheDocument();
  });

  it("tells someone whose search found nothing how to recover", () => {
    render(<EmptyState helpCenterPath="/hc/en-us" searchInputValue="zzzz" />);

    expect(
      screen.getByText(
        "Try a different keyword, or clear the search to see all services."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Enter your keywords/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Go to the homepage" })
    ).not.toBeInTheDocument();
  });
});
