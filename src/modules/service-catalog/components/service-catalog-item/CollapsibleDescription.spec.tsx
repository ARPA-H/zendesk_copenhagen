import { render } from "../../../test/render";
import { act, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CollapsibleDescription } from "./CollapsibleDescription";

describe("CollapsibleDescription", () => {
  const defaultProps = {
    title: "Order a new laptop",
    description: "<p>Request a brand new laptop.</p>",
    thumbnailUrl: "",
  };

  it("renders the title", () => {
    render(<CollapsibleDescription {...defaultProps} />);

    expect(screen.getByText("Order a new laptop")).toBeInTheDocument();
  });

  it("renders safe description markup", () => {
    render(<CollapsibleDescription {...defaultProps} />);

    expect(screen.getByText("Request a brand new laptop.")).toBeInTheDocument();
    expect(
      document.querySelector(".service-catalog-description")
    ).toBeInTheDocument();
  });

  it("does not execute XSS payloads in the description", () => {
    const onError = jest.fn();
    (window as unknown as { __xss?: () => void }).__xss = onError;

    render(
      <CollapsibleDescription
        {...defaultProps}
        description={'<img src=x onerror="window.__xss()">Safe content'}
      />
    );

    expect(onError).not.toHaveBeenCalled();
    expect(document.querySelector("img[onerror]")).toBeNull();
    expect(screen.getByText("Safe content")).toBeInTheDocument();

    delete (window as unknown as { __xss?: () => void }).__xss;
  });

  it("does not render the description container when the sanitized description is empty", () => {
    render(
      <CollapsibleDescription
        {...defaultProps}
        description={"<script>alert(1)</script>"}
      />
    );

    expect(
      document.querySelector(".service-catalog-description")
    ).not.toBeInTheDocument();
  });

  describe("Read more", () => {
    let scrollHeight = 0;
    let boxHeight = 0;
    let fontsLoaded: (() => void) | undefined;
    let resized: (() => void) | undefined;
    const stopListeningForFonts = jest.fn();
    const stopObserving = jest.fn();

    beforeEach(() => {
      scrollHeight = 0;
      boxHeight = 0;
      fontsLoaded = undefined;
      resized = undefined;
      stopListeningForFonts.mockClear();
      stopObserving.mockClear();

      Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get: () => scrollHeight,
      });
      jest
        .spyOn(Element.prototype, "getBoundingClientRect")
        .mockImplementation(() => ({ height: boxHeight }) as DOMRect);
      Object.defineProperty(document, "fonts", {
        configurable: true,
        value: {
          addEventListener: (_: string, listener: () => void) => {
            fontsLoaded = listener;
          },
          removeEventListener: stopListeningForFonts,
        },
      });
      window.ResizeObserver = class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe = jest.fn();
        disconnect = stopObserving;
        unobserve = jest.fn();
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
      delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
      delete (document as { fonts?: unknown }).fonts;
      delete (window as { ResizeObserver?: unknown }).ResizeObserver;
    });

    it("offers it when the description is taller than its clamped box", async () => {
      scrollHeight = 120;
      boxHeight = 60;

      render(<CollapsibleDescription {...defaultProps} />);

      expect(
        await screen.findByRole("button", { name: /Read more/ })
      ).toBeInTheDocument();
    });

    it("does not offer it when the description fits", async () => {
      scrollHeight = 60;
      boxHeight = 60;

      render(<CollapsibleDescription {...defaultProps} />);

      await waitFor(() => expect(fontsLoaded).toBeDefined());
      expect(
        screen.queryByRole("button", { name: /Read more/ })
      ).not.toBeInTheDocument();
    });

    it("takes it away when the web fonts load and the description now fits", async () => {
      scrollHeight = 120;
      boxHeight = 60;
      render(<CollapsibleDescription {...defaultProps} />);
      await screen.findByRole("button", { name: /Read more/ });

      scrollHeight = 60;
      act(() => fontsLoaded?.());

      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: /Read more/ })
        ).not.toBeInTheDocument()
      );
    });

    it("offers it when the box is resized and the description no longer fits", async () => {
      scrollHeight = 60;
      boxHeight = 60;
      render(<CollapsibleDescription {...defaultProps} />);
      await waitFor(() => expect(resized).toBeDefined());

      scrollHeight = 120;
      act(() => resized?.());

      expect(
        await screen.findByRole("button", { name: /Read more/ })
      ).toBeInTheDocument();
    });

    it("stops measuring while expanded, so Read less stays even though an expanded box is not clamped", async () => {
      scrollHeight = 120;
      boxHeight = 60;
      render(<CollapsibleDescription {...defaultProps} />);
      await waitFor(() => expect(resized).toBeDefined());
      stopObserving.mockClear();
      stopListeningForFonts.mockClear();

      await userEvent.click(
        await screen.findByRole("button", { name: /Read more/ })
      );

      expect(
        await screen.findByRole("button", { name: /Read less/ })
      ).toBeInTheDocument();
      expect(stopObserving).toHaveBeenCalled();
      expect(stopListeningForFonts).toHaveBeenCalledWith(
        "loadingdone",
        expect.any(Function)
      );
    });
  });
});
