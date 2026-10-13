import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, describe, it, expect } from "@jest/globals";

// The check that swaps the catalog's skeleton for the page is inline in the
// home and services templates, so this spec lifts its selector out of each one
// and runs it against what the catalog module renders in each state. Jest runs
// from the repository root, so the paths are relative to it.
const SELECTOR =
  /isComplete: \(main\) =>\s*!!main\.querySelector\(\s*('[^']*')\s*\)/;

describe.each(["templates/home_page.hbs", "templates/service_list_page.hbs"])(
  "the catalog's completion check in %s",
  (file) => {
    const selector = runInNewContext(
      readFileSync(file, "utf8").match(SELECTOR)[1]
    );

    afterEach(() => {
      document.body.innerHTML = "";
    });

    const isComplete = (html) => {
      document.body.innerHTML = `<div id="main">${html}</div>`;
      return !!document.getElementById("main").querySelector(selector);
    };

    const countStatus = (text) =>
      `<span role="status" data-service-count>${text}</span>`;

    it("is not complete while the catalog is loading", () => {
      expect(isComplete(`${countStatus("")}<div class="skeleton"></div>`)).toBe(
        false
      );
    });

    it("is complete once service links have rendered", () => {
      expect(
        isComplete(
          `${countStatus("1 service")}<a href="/hc/en-us/services/101">Laptop</a>`
        )
      ).toBe(true);
    });

    it("is complete for a catalog that loaded with no services in it", () => {
      expect(
        isComplete(
          `${countStatus("0 services")}<p>No services in sight</p><button>Go to the homepage</button>`
        )
      ).toBe(true);
    });

    it("is complete when the error screen takes the catalog's place", () => {
      expect(isComplete('<div role="alert">Something went wrong</div>')).toBe(
        true
      );
    });

    it("is complete when the module could not load and the fallback was written", () => {
      expect(
        isComplete(
          '<p class="svc-catalog-fallback">View the full <a href="/hc/en-us/services">Service Catalog</a>.</p>'
        )
      ).toBe(true);
    });

    it("ignores a status region that is not the count", () => {
      expect(
        isComplete(
          '<div role="status">Loading</div><div class="skeleton"></div>'
        )
      ).toBe(false);
    });
  }
);
