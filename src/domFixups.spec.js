import { afterEach, describe, it, expect } from "@jest/globals";
import { setFooterYear } from "./domFixups";

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
