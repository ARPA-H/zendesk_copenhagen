import { screen } from "@testing-library/react";
import { render } from "../../test/render";
import { ErrorScreen } from "./ErrorScreen";

describe("ErrorScreen", () => {
  it("announces the failure to assistive technology", () => {
    render(<ErrorScreen helpCenterPath="/hc/en-us" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong."
    );
  });

  it("offers a way home only when the help center path is known", () => {
    const { unmount } = render(<ErrorScreen helpCenterPath="/hc/en-us" />);
    expect(
      screen.getByRole("button", { name: "Go to the homepage" })
    ).toBeInTheDocument();

    unmount();
    render(<ErrorScreen />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
