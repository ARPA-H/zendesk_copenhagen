import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

// The script is an IIFE that runs on import, so each test builds the page
// first and then loads a fresh copy.
async function loadWith(html, { hoverNone = false } = {}) {
  document.body.innerHTML = html;
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: hoverNone && query === "(hover: none)",
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  await jest.isolateModulesAsync(async () => {
    jest.requireActual("./svcCatalogEnhancements");
  });
}

const card = (id, title, description) =>
  `<a href="/hc/en-us/services/${id}" id="card-${id}">` +
  `<div><span>${title}</span></div>` +
  `<div class="description">${description}</div>` +
  `</a>`;

const page = (...cards) =>
  `<div id="service-catalog-main-content">${cards.join("")}` +
  `<div data-test-id="sidebar-category-1"><a href="/hc/en-us/services/9">` +
  `<span>Hardware</span><span>Four items in this category</span></a></div></div>`;

describe("svcCatalogEnhancements card descriptions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("describes a card by its hidden description", async () => {
    await loadWith(
      page(card(1, "VPN access", "Request VPN access for remote work"))
    );

    const link = document.getElementById("card-1");
    const description = link.querySelector(".description");

    expect(description.classList.contains("svc-desc-hidden")).toBe(true);
    expect(description.id).not.toBe("");
    expect(link.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("gives every card its own description id", async () => {
    await loadWith(
      page(
        card(1, "VPN access", "Request VPN access for remote work"),
        card(2, "Laptop", "Order a new laptop or a replacement")
      )
    );

    const ids = [1, 2].map((n) =>
      document.getElementById(`card-${n}`).getAttribute("aria-describedby")
    );

    expect(ids[0]).not.toBe(ids[1]);
  });

  it("leaves a card whose second line is only a count undescribed", async () => {
    await loadWith(page(card(1, "VPN access", "12")));

    expect(document.getElementById("card-1")).not.toHaveAttribute(
      "aria-describedby"
    );
  });

  it("does not add the association where the description is shown in the card", async () => {
    await loadWith(
      page(card(1, "VPN access", "Request VPN access for remote work")),
      { hoverNone: true }
    );

    expect(document.getElementById("card-1")).not.toHaveAttribute(
      "aria-describedby"
    );
  });

  it("leaves the sidebar alone", async () => {
    await loadWith(
      page(card(1, "VPN access", "Request VPN access for remote work"))
    );

    const sidebarLink = document.querySelector(
      '[data-test-id="sidebar-category-1"] a'
    );

    expect(sidebarLink).not.toHaveAttribute("aria-describedby");
  });

  it("keeps the visual tooltip out of the accessibility tree", async () => {
    await loadWith(
      page(card(1, "VPN access", "Request VPN access for remote work"))
    );

    const tip = document.querySelector(".svc-tooltip");

    expect(tip).toHaveAttribute("aria-hidden", "true");
    expect(tip).not.toHaveAttribute("role");
  });
});
