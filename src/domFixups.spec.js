import { afterEach, describe, it, expect } from "@jest/globals";
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

  it("leaves a captionless table unnamed on a page in another language", () => {
    document.documentElement.setAttribute("lang", "fr");
    document.body.innerHTML = articleWithTable();
    wrapWideTables();
    const wrapper = document.querySelector(".table-scroll");
    setOverflow(wrapper, true);

    updateScrollableTables();

    expect(wrapper.getAttribute("tabindex")).toBe("0");
    expect(wrapper.hasAttribute("aria-label")).toBe(false);
    expect(wrapper.hasAttribute("role")).toBe(false);
  });

  it("still uses the article's own caption on a page in another language", () => {
    document.documentElement.setAttribute("lang", "fr");
    document.body.innerHTML = articleWithTable(
      "<caption>Certificats</caption>"
    );
    wrapWideTables();
    const wrapper = document.querySelector(".table-scroll");
    setOverflow(wrapper, true);

    updateScrollableTables();

    expect(wrapper.getAttribute("role")).toBe("region");
    expect(wrapper.getAttribute("aria-label")).toBe("Certificats");
  });
});
