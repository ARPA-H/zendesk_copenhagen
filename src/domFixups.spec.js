import { afterEach, beforeEach, describe, it, expect } from "@jest/globals";
import {
  setFooterYear,
  wrapWideTables,
  updateScrollableTables,
} from "./domFixups";

describe("setFooterYear", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("replaces the year rendered in the template with the current year", () => {
    document.body.innerHTML =
      '<p class="footer-copyright">&copy; <span data-footer-year>1999</span> ARPA-H</p>';

    setFooterYear();

    expect(document.querySelector("[data-footer-year]").textContent).toBe(
      String(new Date().getFullYear())
    );
  });

  it("leaves a page without a footer year alone", () => {
    document.body.innerHTML = "<p>No footer here</p>";

    setFooterYear();

    expect(document.body.textContent).toBe("No footer here");
  });
});

describe("wrapWideTables", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("lang");
  });

  const articleWithTable = (caption = "") =>
    `<div class="article-body"><table>${caption}<tr><td>cell</td></tr></table></div>`;

  const setOverflow = (wrapper, overflows) => {
    Object.defineProperty(wrapper, "scrollWidth", {
      value: overflows ? 600 : 300,
      configurable: true,
    });
    Object.defineProperty(wrapper, "clientWidth", {
      value: 300,
      configurable: true,
    });
  };

  it("wraps each article table once", () => {
    document.body.innerHTML = articleWithTable();

    wrapWideTables();
    wrapWideTables();

    const wrappers = document.querySelectorAll(".table-scroll");
    expect(wrappers).toHaveLength(1);
    expect(wrappers[0].firstElementChild.tagName).toBe("TABLE");
  });

  it("ignores tables outside an article body", () => {
    document.body.innerHTML = "<table><tr><td>cell</td></tr></table>";

    wrapWideTables();

    expect(document.querySelector(".table-scroll")).toBeNull();
  });

  it("adds no tab stop while the table fits", () => {
    document.body.innerHTML = articleWithTable();

    wrapWideTables();

    const wrapper = document.querySelector(".table-scroll");
    expect(wrapper.hasAttribute("tabindex")).toBe(false);
    expect(wrapper.hasAttribute("role")).toBe(false);
  });

  it("makes an overflowing table a labelled, focusable region", () => {
    document.body.innerHTML = articleWithTable(
      "<caption>Certificates</caption>"
    );
    wrapWideTables();
    const wrapper = document.querySelector(".table-scroll");
    Object.defineProperty(wrapper, "scrollWidth", { value: 600 });
    Object.defineProperty(wrapper, "clientWidth", { value: 300 });

    updateScrollableTables();

    expect(wrapper.getAttribute("role")).toBe("region");
    expect(wrapper.getAttribute("tabindex")).toBe("0");
    expect(wrapper.getAttribute("aria-label")).toBe("Certificates");
  });

  it("falls back to a generic label without a caption", () => {
    document.body.innerHTML = articleWithTable();
    wrapWideTables();
    const wrapper = document.querySelector(".table-scroll");
    Object.defineProperty(wrapper, "scrollWidth", { value: 600 });
    Object.defineProperty(wrapper, "clientWidth", { value: 300 });

    updateScrollableTables();

    expect(wrapper.getAttribute("aria-label")).toBe("Scrollable table");
  });

  it("numbers the fallback label when several captionless tables overflow", () => {
    document.body.innerHTML =
      articleWithTable() +
      articleWithTable("<caption>Certificates</caption>") +
      articleWithTable() +
      articleWithTable();
    wrapWideTables();
    const wrappers = [...document.querySelectorAll(".table-scroll")];
    wrappers.forEach((wrapper) => setOverflow(wrapper, true));

    updateScrollableTables();

    expect(
      wrappers.map((wrapper) => wrapper.getAttribute("aria-label"))
    ).toEqual([
      "Scrollable table 1 of 3",
      "Certificates",
      "Scrollable table 2 of 3",
      "Scrollable table 3 of 3",
    ]);
  });

  it("counts only the captionless tables that overflow", () => {
    document.body.innerHTML =
      articleWithTable() + articleWithTable() + articleWithTable();
    wrapWideTables();
    const wrappers = [...document.querySelectorAll(".table-scroll")];
    setOverflow(wrappers[0], true);
    setOverflow(wrappers[1], false);
    setOverflow(wrappers[2], true);

    updateScrollableTables();

    expect(wrappers[0].getAttribute("aria-label")).toBe(
      "Scrollable table 1 of 2"
    );
    expect(wrappers[1].hasAttribute("aria-label")).toBe(false);
    expect(wrappers[1].hasAttribute("role")).toBe(false);
    expect(wrappers[2].getAttribute("aria-label")).toBe(
      "Scrollable table 2 of 2"
    );
  });

  it("drops the number when the other table stops overflowing", () => {
    document.body.innerHTML = articleWithTable() + articleWithTable();
    wrapWideTables();
    const wrappers = [...document.querySelectorAll(".table-scroll")];
    wrappers.forEach((wrapper) => setOverflow(wrapper, true));
    updateScrollableTables();
    expect(wrappers[0].getAttribute("aria-label")).toBe(
      "Scrollable table 1 of 2"
    );

    setOverflow(wrappers[1], false);
    updateScrollableTables();

    expect(wrappers[0].getAttribute("aria-label")).toBe("Scrollable table");
    expect(wrappers[1].hasAttribute("tabindex")).toBe(false);
  });

  it("names a captionless table on any English page", () => {
    document.documentElement.setAttribute("lang", "en-GB");
    document.body.innerHTML = articleWithTable();
    wrapWideTables();
    const wrapper = document.querySelector(".table-scroll");
    setOverflow(wrapper, true);

    updateScrollableTables();

    expect(wrapper.getAttribute("aria-label")).toBe("Scrollable table");
  });

  describe("on a page in another language", () => {
    beforeEach(() => {
      document.documentElement.setAttribute("lang", "fr");
    });

    // The accessible name comes from a hidden element marked as English, so it
    // is not passed off as the page's own language.
    const hiddenLabel = (wrapper) =>
      document.getElementById(wrapper.getAttribute("aria-labelledby"));

    it("names a captionless table through a hidden English label", () => {
      document.body.innerHTML = articleWithTable();
      wrapWideTables();
      const wrapper = document.querySelector(".table-scroll");
      setOverflow(wrapper, true);

      updateScrollableTables();

      expect(wrapper.getAttribute("tabindex")).toBe("0");
      expect(wrapper.getAttribute("role")).toBe("region");
      expect(wrapper.hasAttribute("aria-label")).toBe(false);
      const label = hiddenLabel(wrapper);
      expect(label.textContent).toBe("Scrollable table");
      expect(label.getAttribute("lang")).toBe("en");
      expect(label.hidden).toBe(true);
      expect(wrapper.contains(label)).toBe(true);
    });

    it("numbers the hidden labels when several captionless tables overflow", () => {
      document.body.innerHTML =
        articleWithTable() +
        articleWithTable("<caption>Certificats</caption>") +
        articleWithTable();
      wrapWideTables();
      const wrappers = [...document.querySelectorAll(".table-scroll")];
      wrappers.forEach((wrapper) => setOverflow(wrapper, true));

      updateScrollableTables();

      expect(hiddenLabel(wrappers[0]).textContent).toBe(
        "Scrollable table 1 of 2"
      );
      expect(wrappers[1].getAttribute("aria-label")).toBe("Certificats");
      expect(wrappers[1].hasAttribute("aria-labelledby")).toBe(false);
      expect(hiddenLabel(wrappers[2]).textContent).toBe(
        "Scrollable table 2 of 2"
      );
      expect(hiddenLabel(wrappers[0]).id).not.toBe(hiddenLabel(wrappers[2]).id);
    });

    it("keeps one hidden label per table however often it is measured", () => {
      document.body.innerHTML = articleWithTable() + articleWithTable();
      wrapWideTables();
      const wrappers = [...document.querySelectorAll(".table-scroll")];
      wrappers.forEach((wrapper) => setOverflow(wrapper, true));

      updateScrollableTables();
      updateScrollableTables();
      updateScrollableTables();
      expect(
        document.querySelectorAll("[data-table-scroll-label]")
      ).toHaveLength(2);

      setOverflow(wrappers[1], false);
      updateScrollableTables();

      expect(hiddenLabel(wrappers[0]).textContent).toBe("Scrollable table");
      expect(
        document.querySelectorAll("[data-table-scroll-label]")
      ).toHaveLength(1);
    });

    it("takes the region and its label away when the table stops overflowing", () => {
      document.body.innerHTML = articleWithTable();
      wrapWideTables();
      const wrapper = document.querySelector(".table-scroll");
      setOverflow(wrapper, true);
      updateScrollableTables();
      expect(wrapper.hasAttribute("aria-labelledby")).toBe(true);

      setOverflow(wrapper, false);
      updateScrollableTables();

      expect(wrapper.hasAttribute("aria-labelledby")).toBe(false);
      expect(wrapper.hasAttribute("role")).toBe(false);
      expect(wrapper.hasAttribute("tabindex")).toBe(false);
      expect(wrapper.querySelector("[data-table-scroll-label]")).toBeNull();
    });

    it("still uses the article's own caption", () => {
      document.body.innerHTML = articleWithTable(
        "<caption>Certificats</caption>"
      );
      wrapWideTables();
      const wrapper = document.querySelector(".table-scroll");
      setOverflow(wrapper, true);

      updateScrollableTables();

      expect(wrapper.getAttribute("role")).toBe("region");
      expect(wrapper.getAttribute("aria-label")).toBe("Certificats");
      expect(wrapper.querySelector("[data-table-scroll-label]")).toBeNull();
    });
  });

  it("adds no hidden label on an English page", () => {
    document.documentElement.setAttribute("lang", "en-GB");
    document.body.innerHTML = articleWithTable();
    wrapWideTables();
    const wrapper = document.querySelector(".table-scroll");
    setOverflow(wrapper, true);

    updateScrollableTables();

    expect(wrapper.getAttribute("aria-label")).toBe("Scrollable table");
    expect(wrapper.hasAttribute("aria-labelledby")).toBe(false);
    expect(wrapper.querySelector("[data-table-scroll-label]")).toBeNull();
  });

  it("wraps tables where ResizeObserver does not exist", () => {
    expect(typeof window.ResizeObserver).toBe("undefined");
    document.body.innerHTML = articleWithTable();

    expect(() => wrapWideTables()).not.toThrow();

    expect(document.querySelectorAll(".table-scroll")).toHaveLength(1);
  });

  describe("when a table changes size", () => {
    let observers;

    beforeEach(() => {
      observers = [];
      window.ResizeObserver = class {
        constructor(callback) {
          this.callback = callback;
          this.targets = [];
          observers.push(this);
        }
        observe(target) {
          this.targets.push(target);
        }
        unobserve() {}
        disconnect() {}
      };
    });

    afterEach(() => {
      delete window.ResizeObserver;
    });

    // A tab that is not showing has no box: both widths are 0.
    const setNoBox = (wrapper) => {
      Object.defineProperty(wrapper, "scrollWidth", {
        value: 0,
        configurable: true,
      });
      Object.defineProperty(wrapper, "clientWidth", {
        value: 0,
        configurable: true,
      });
    };

    // What a browser reports when a box appears, goes or changes size.
    const reportResize = (...targets) => {
      observers.forEach((observer) =>
        observer.callback(targets.map((target) => ({ target })))
      );
    };

    const tabPanelWithTable = (caption = "") =>
      `<div class="tab-panel" hidden><table>${caption}<tr><td>cell</td></tr></table></div>`;

    it("watches each wrapper and its table, once however often tables are wrapped", () => {
      document.body.innerHTML = articleWithTable();

      wrapWideTables();
      wrapWideTables();

      const wrapper = document.querySelector(".table-scroll");
      expect(observers).toHaveLength(1);
      expect(observers[0].targets).toHaveLength(2);
      expect(observers[0].targets[0]).toBe(wrapper);
      expect(observers[0].targets[1]).toBe(wrapper.querySelector("table"));
    });

    it("makes a table a region when the tab holding it is shown", () => {
      document.body.innerHTML = `<div class="article-body">${tabPanelWithTable(
        "<caption>Ports and protocols</caption>"
      )}</div>`;
      wrapWideTables();
      const wrapper = document.querySelector(".table-scroll");
      expect(wrapper.hasAttribute("role")).toBe(false);
      expect(wrapper.hasAttribute("tabindex")).toBe(false);

      document.querySelector(".tab-panel").hidden = false;
      setOverflow(wrapper, true);
      reportResize(wrapper);

      expect(wrapper.getAttribute("role")).toBe("region");
      expect(wrapper.getAttribute("tabindex")).toBe("0");
      expect(wrapper.getAttribute("aria-label")).toBe("Ports and protocols");
    });

    it("takes the region away again when its tab is hidden", () => {
      document.body.innerHTML = `<div class="article-body">${tabPanelWithTable()}</div>`;
      wrapWideTables();
      const panel = document.querySelector(".tab-panel");
      const wrapper = document.querySelector(".table-scroll");
      panel.hidden = false;
      setOverflow(wrapper, true);
      reportResize(wrapper);
      expect(wrapper.getAttribute("role")).toBe("region");

      panel.hidden = true;
      setNoBox(wrapper);
      reportResize(wrapper);

      expect(wrapper.hasAttribute("role")).toBe(false);
      expect(wrapper.hasAttribute("tabindex")).toBe(false);
      expect(wrapper.hasAttribute("aria-label")).toBe(false);
    });

    it("numbers every captionless region again, not only the one that changed", () => {
      document.body.innerHTML = `<div class="article-body"><table><tr><td>cell</td></tr></table>${tabPanelWithTable()}</div>`;
      wrapWideTables();
      const [showing, inTab] = document.querySelectorAll(".table-scroll");
      setOverflow(showing, true);
      reportResize(showing);
      expect(showing.getAttribute("aria-label")).toBe("Scrollable table");

      document.querySelector(".tab-panel").hidden = false;
      setOverflow(inTab, true);
      reportResize(inTab);

      expect(showing.getAttribute("aria-label")).toBe(
        "Scrollable table 1 of 2"
      );
      expect(inTab.getAttribute("aria-label")).toBe("Scrollable table 2 of 2");
    });

    it("does nothing for a table that still fits", () => {
      document.body.innerHTML = `<div class="article-body">${tabPanelWithTable()}</div>`;
      wrapWideTables();
      const wrapper = document.querySelector(".table-scroll");

      document.querySelector(".tab-panel").hidden = false;
      setOverflow(wrapper, false);
      reportResize(wrapper);

      expect(wrapper.hasAttribute("role")).toBe(false);
      expect(wrapper.hasAttribute("tabindex")).toBe(false);
    });
  });
});
