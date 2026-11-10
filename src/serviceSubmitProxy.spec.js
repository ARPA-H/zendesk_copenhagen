import { readFileSync } from "node:fs";
import { beforeEach, describe, it, expect, jest } from "@jest/globals";

// The service item page proxies its visible Submit button to the form module's real one with
// an inline script in templates/service_page.hbs. It is read from the template and run here,
// so these tests cover what ships. The script only touches `document`, `MutationObserver`,
// `window.addEventListener("load")` and `setTimeout`, and the last two are handed in so the
// test can fire the page load and the five second safety net itself. Jest runs from the
// repository root, so the path is relative to it.
const template = readFileSync("templates/service_page.hbs", "utf8");
const marker =
  "{{!-- Custom submit: hide the native action area and proxy the click --}}";
const start = template.indexOf("<script>", template.indexOf(marker));
const source = template.slice(
  start + "<script>".length,
  template.indexOf("</script>", start)
);

const REASON = "Submitting requests is disabled while previewing a draft";

const nativeButton = ({ disabled = false, title = "" } = {}) =>
  `<button type="submit" data-svc-native-submit${disabled ? " disabled" : ""}${
    title ? ` title="${title}"` : ""
  }>Submit request</button>`;

let timeouts;

// Lets the MutationObserver callbacks run.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function mount(native = "") {
  document.body.innerHTML = `
    <div id="service-catalog-item"><form>${native}</form></div>
    <div class="svc-custom-submit-wrap">
      <button type="button" id="svc-custom-submit">Submit a request</button>
    </div>`;

  let onLoad;
  timeouts = [];
  new Function("window", "setTimeout", source)(
    {
      addEventListener: (type, listener) => {
        if (type === "load") onLoad = listener;
      },
    },
    (callback, delay) => timeouts.push({ callback, delay })
  );
  onLoad();
}

const proxy = () => document.getElementById("svc-custom-submit");
const real = () => document.querySelector("[data-svc-native-submit]");

it("reads the script from the template", () => {
  expect(start).toBeGreaterThan(-1);
  expect(source).toContain("function wireCustomSubmit()");
});

describe("the submit proxy", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("while the real button is enabled", () => {
    it("is enabled and has no title", async () => {
      mount(nativeButton());
      await flush();

      expect(proxy().disabled).toBe(false);
      expect(proxy().hasAttribute("title")).toBe(false);
      expect(proxy().textContent).toBe("Submit a request");
    });

    it("starts a submission when clicked", () => {
      mount(nativeButton());
      real().click = jest.fn();

      proxy().click();

      expect(real().click).toHaveBeenCalledTimes(1);
      expect(proxy().textContent).toBe("Submitting\u2026");
      expect(proxy().disabled).toBe(true);
    });

    it("is restored when the real button is back at once, as for a validation failure", async () => {
      mount(nativeButton());
      // React disables and enables the real button inside the click itself.
      real().click = jest.fn(() => {
        real().disabled = true;
        real().disabled = false;
      });

      proxy().click();
      await flush();

      expect(proxy().textContent).toBe("Submit a request");
      expect(proxy().disabled).toBe(false);
    });

    it("waits for the real button while a request is on its way", async () => {
      mount(nativeButton());
      real().click = jest.fn(() => {
        real().disabled = true;
      });

      proxy().click();
      await flush();
      expect(proxy().textContent).toBe("Submitting\u2026");
      expect(proxy().disabled).toBe(true);

      real().disabled = false;
      await flush();
      expect(proxy().textContent).toBe("Submit a request");
      expect(proxy().disabled).toBe(false);
    });

    it("stays disabled past the safety net while the real button still is", async () => {
      mount(nativeButton());
      real().click = jest.fn(() => {
        real().disabled = true;
      });

      proxy().click();
      await flush();
      expect(timeouts.map((t) => t.delay)).toEqual([5000]);
      timeouts[0].callback();

      expect(proxy().textContent).toBe("Submit a request");
      expect(proxy().disabled).toBe(true);

      real().disabled = false;
      await flush();
      expect(proxy().disabled).toBe(false);
    });

    it("leaves the label alone when the safety net fires after the real button is back", async () => {
      mount(nativeButton());
      real().click = jest.fn(() => {
        real().disabled = true;
        real().disabled = false;
      });

      proxy().click();
      await flush();
      timeouts[0].callback();

      expect(proxy().textContent).toBe("Submit a request");
      expect(proxy().disabled).toBe(false);
    });

    it("ignores a click that arrives before it has caught up with a disabled real button", () => {
      mount(nativeButton());
      real().click = jest.fn();
      real().disabled = true;

      proxy().click();

      expect(real().click).not.toHaveBeenCalled();
      expect(proxy().textContent).toBe("Submit a request");
      expect(timeouts).toEqual([]);
    });
  });

  describe("in a draft preview, where the real button is disabled for good", () => {
    it("is disabled from the start and says why", async () => {
      mount(nativeButton({ disabled: true, title: REASON }));
      await flush();

      expect(proxy().disabled).toBe(true);
      expect(proxy().getAttribute("title")).toBe(REASON);
      expect(proxy().textContent).toBe("Submit a request");
    });

    it("follows a real button that the module renders later", async () => {
      mount();
      await flush();
      expect(proxy().disabled).toBe(false);

      document
        .querySelector("form")
        .insertAdjacentHTML(
          "beforeend",
          nativeButton({ disabled: true, title: REASON })
        );
      await flush();

      expect(proxy().disabled).toBe(true);
      expect(proxy().getAttribute("title")).toBe(REASON);
    });

    it("drops the title when the real button loses it", async () => {
      mount(nativeButton({ disabled: true, title: REASON }));
      await flush();

      real().removeAttribute("title");
      real().disabled = false;
      await flush();

      expect(proxy().disabled).toBe(false);
      expect(proxy().hasAttribute("title")).toBe(false);
    });
  });

  it("does nothing when the module rendered no submit button", async () => {
    mount();
    await flush();

    expect(() => proxy().click()).not.toThrow();
    expect(proxy().textContent).toBe("Submit a request");
    expect(proxy().disabled).toBe(false);
  });
});
