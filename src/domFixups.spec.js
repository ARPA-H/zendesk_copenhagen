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
  });

  const articleWithTable = (caption = "") =>
    `<div class="article-body"><table>${caption}<tr><td>cell</td></tr></table></div>`;

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
});
