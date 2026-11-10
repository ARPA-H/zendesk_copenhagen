import { afterEach, describe, it, expect } from "@jest/globals";
import { initGovBanner, setBannerExpanded, toggleBanner } from "./govBanner";

const BANNER = `
  <section class="usa-banner" aria-label="Official website of the United States government">
    <div class="usa-accordion">
      <header class="usa-banner__header">
        <button type="button" class="usa-accordion__button usa-banner__button"
          aria-expanded="false" aria-controls="gov-banner-default">
          <span class="usa-banner__button-text">Here's how you know</span>
        </button>
      </header>
      <div class="usa-banner__content" id="gov-banner-default" hidden>Official websites use .gov</div>
    </div>
  </section>`;

const parts = () => ({
  button: document.querySelector(".usa-banner__button"),
  panel: document.getElementById("gov-banner-default"),
  header: document.querySelector(".usa-banner__header"),
});

describe("govBanner", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.classList.remove("js", "js-ready");
  });

  it("opens the panel and marks the header expanded", () => {
    document.body.innerHTML = BANNER;
    const { button, panel, header } = parts();

    setBannerExpanded(button, true);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);
    expect(header.classList.contains("usa-banner__header--expanded")).toBe(
      true
    );
  });

  it("closes the panel again", () => {
    document.body.innerHTML = BANNER;
    const { button, panel, header } = parts();
    setBannerExpanded(button, true);

    toggleBanner(button);

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
    expect(header.classList.contains("usa-banner__header--expanded")).toBe(
      false
    );
  });

  it("starts collapsed and follows clicks after init", () => {
    document.body.innerHTML = BANNER;
    const { button, panel } = parts();
    panel.hidden = false;

    initGovBanner();
    expect(panel.hidden).toBe(true);

    button.click();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);

    button.click();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hidden).toBe(true);
  });

  it("copes with a button whose panel is missing", () => {
    document.body.innerHTML =
      '<header class="usa-banner__header"><button class="usa-banner__button" aria-expanded="false" aria-controls="nope"></button></header>';
    const button = document.querySelector(".usa-banner__button");

    expect(() => toggleBanner(button)).not.toThrow();
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("does nothing on a page without the banner", () => {
    document.body.innerHTML = "<p>No banner</p>";

    expect(() => initGovBanner()).not.toThrow();
  });

  it("marks the page scripted and ready only after the handlers are installed", () => {
    document.body.innerHTML = BANNER;
    const { button, panel } = parts();
    const attach = button.addEventListener.bind(button);
    let readyWhenWired = null;
    button.addEventListener = (type, handler) => {
      readyWhenWired = document.documentElement.classList.contains("js-ready");
      attach(type, handler);
    };

    initGovBanner();

    expect(readyWhenWired).toBe(false);
    expect(document.documentElement.classList.contains("js")).toBe(true);
    expect(document.documentElement.classList.contains("js-ready")).toBe(true);

    button.click();
    expect(panel.hidden).toBe(false);
  });

  it("does not mark the page ready when the init throws before the handlers", () => {
    document.body.innerHTML = BANNER;
    const failing = {
      querySelectorAll: () => {
        throw new Error("controller unavailable");
      },
    };

    expect(() => initGovBanner(failing)).toThrow("controller unavailable");
    expect(document.documentElement.classList.contains("js-ready")).toBe(false);
  });
});
