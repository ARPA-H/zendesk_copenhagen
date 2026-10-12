import { render, testTheme } from "../../../test/render";
import { screen } from "@testing-library/react";
import { getColor } from "@zendeskgarden/react-theming";
import ServiceCatalogListItem from "./ServiceCatalogListItem";
import type { ServiceCatalogItem } from "../../data-types/ServiceCatalogItem";

jest.mock("@zendeskgarden/svg-icons/src/16/shapes-fill.svg", () => {
  return function MockShapesIcon() {
    return <div data-testid="atl-nacional" />;
  };
});

describe("ServiceCatalogListItem", () => {
  const mockServiceItem: ServiceCatalogItem = {
    id: 1989,
    name: "Atl Nacional keyboard",
    description: "This is a keyboard &quot;from&quot; Atl Nacional",
    form_id: 456,
    thumbnail_url: "",
    categories: [],
    is_request_on_behalf: false,
    published_at: "2025-01-01T00:00:00Z",
    custom_object_fields: {
      "standard::asset_option": "",
      "standard::asset_type_option": "",
      "standard::attachment_option": "",
    },
  };

  const mockHelpCenterPath = "/hc/en-us";

  beforeEach(() => jest.clearAllMocks());

  describe("Rendering", () => {
    it("should render the service item with correct content", () => {
      render(
        <ServiceCatalogListItem
          serviceItem={mockServiceItem}
          helpCenterPath={mockHelpCenterPath}
        />
      );

      expect(screen.getByText(mockServiceItem.name)).toBeInTheDocument();
      expect(
        screen.getByText('This is a keyboard "from" Atl Nacional')
      ).toBeInTheDocument();
      expect(screen.getByTestId("atl-nacional")).toBeInTheDocument();
    });

    it("should render as a link with correct href", () => {
      render(
        <ServiceCatalogListItem
          serviceItem={mockServiceItem}
          helpCenterPath={mockHelpCenterPath}
        />
      );

      const linkElement = screen.getByRole("link");

      expect(linkElement).toHaveAttribute(
        "href",
        `${mockHelpCenterPath}/services/${mockServiceItem.id}`
      );
    });

    it("should use the theme foreground color as text color", () => {
      render(
        <ServiceCatalogListItem
          serviceItem={mockServiceItem}
          helpCenterPath={mockHelpCenterPath}
        />
      );

      const linkElement = screen.getByRole("link");
      expect(linkElement).toHaveStyle(
        `color: ${getColor({
          theme: testTheme,
          variable: "foreground.default",
        })}`
      );
    });

    it("should show a long name in full instead of clamping it behind a hover-only tooltip", () => {
      const longName =
        "Request an exception to the standard government-furnished laptop configuration for international travel";

      render(
        <ServiceCatalogListItem
          serviceItem={{ ...mockServiceItem, name: longName }}
          helpCenterPath={mockHelpCenterPath}
        />
      );

      const title = screen.getByText(longName);
      expect(title).not.toHaveAttribute("title");
      expect(
        getComputedStyle(title).getPropertyValue("-webkit-line-clamp")
      ).toBe("");

      // Control: the secondary description is still clamped, so an empty value
      // above means "not clamped" rather than "jsdom cannot read the property".
      expect(
        getComputedStyle(
          screen.getByText(/This is a keyboard/)
        ).getPropertyValue("-webkit-line-clamp")
      ).toBe("3");
    });

    it("should render name and description as text without executing HTML payloads", () => {
      const onError = jest.fn();
      (window as unknown as { __xss?: () => void }).__xss = onError;

      render(
        <ServiceCatalogListItem
          serviceItem={{
            ...mockServiceItem,
            name: '<img src=x onerror="window.__xss()">Order a laptop',
            description:
              '<img src=x onerror="window.__xss()">Malicious description',
          }}
          helpCenterPath={mockHelpCenterPath}
        />
      );

      expect(onError).not.toHaveBeenCalled();
      expect(screen.getByText("Order a laptop")).toBeInTheDocument();
      expect(screen.getByText("Malicious description")).toBeInTheDocument();
      expect(document.querySelector("img[onerror]")).toBeNull();

      delete (window as unknown as { __xss?: () => void }).__xss;
    });

    it("should use the primary emphasis border color on hover", async () => {
      render(
        <ServiceCatalogListItem
          serviceItem={mockServiceItem}
          helpCenterPath={mockHelpCenterPath}
        />
      );

      const linkElement = screen.getByRole("link");
      const defaultBorderColor = testTheme.palette.grey?.[300];

      expect(defaultBorderColor).toBeTruthy();
      expect(linkElement).toHaveStyle(`border-color: ${defaultBorderColor}`);

      // jsdom has no visual/layout engine and never applies real CSS
      // `:hover` pseudo-class styles from simulated mouse events, so we
      // can't assert this via computed style after userEvent.hover().
      // Instead assert directly against the compiled styled-components
      // stylesheet for the hover rule.
      const styleTagsText = Array.from(document.querySelectorAll("style"))
        .map((style) => style.textContent)
        .join("\n");

      // The hover color must be a resolved Garden color: interpolating the
      // primaryHue name directly produced the CSS keyword "blue".
      const hoverBorderColor = getColor({
        theme: testTheme,
        variable: "border.primaryEmphasis",
      });

      expect(styleTagsText).toMatch(
        new RegExp(`:hover\\s*\\{[^}]*border-color:\\s*${hoverBorderColor}`)
      );
      expect(styleTagsText).not.toMatch(
        /:hover\s*\{[^}]*border-color:\s*blue\s*[;}]/
      );
    });
  });
});
