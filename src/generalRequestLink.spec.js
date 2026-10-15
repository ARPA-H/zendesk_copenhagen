import { describe, expect, it } from "@jest/globals";
import { readdirSync, readFileSync } from "node:fs";

// The "General request" links are built by hand from the "Other request service ID" theme
// setting, which is blank in the manifest and stays blank on a new Zendesk instance until an
// admin copies an item ID into it (IDs differ between instances). Blank, the link used to be
// /hc/en-us/services/ with nothing after it. A blank setting has to open the standard request
// form instead, the page the footer's "Submit a request" link opens.

const SETTING = "settings.other_request_service_id";
const GUARDED_HREF =
  `{{#if ${SETTING}}}/hc/{{help_center.base_locale}}/services/{{${SETTING}}}` +
  "{{else}}{{page_path 'new_request'}}{{/if}}";

const templates = readdirSync("templates").filter((file) =>
  file.endsWith(".hbs")
);
const read = (file) => readFileSync(`templates/${file}`, "utf8");

describe("the General request links", () => {
  const linking = templates.filter((file) =>
    read(file).includes(`{{${SETTING}}}`)
  );

  it("are on the home, services and service pages", () => {
    expect([...linking].sort()).toEqual([
      "home_page.hbs",
      "service_list_page.hbs",
      "service_page.hbs",
    ]);
  });

  it.each(linking)(
    "on %s open the request form while the ID is blank",
    (file) => {
      const hrefs =
        read(file).match(
          /href="[^"]*settings\.other_request_service_id[^"]*"/g
        ) || [];

      expect(hrefs.length).toBeGreaterThan(0);
      hrefs.forEach((href) => expect(href).toBe(`href="${GUARDED_HREF}"`));
    }
  );
});

describe("a service path built from a theme setting", () => {
  it.each(templates)("on %s has a branch for a blank setting", (file) => {
    const hrefs =
      read(file).match(/href="[^"]*\/services\/\{\{settings\.[^"]*"/g) || [];

    hrefs.forEach((href) => {
      expect(href).toMatch(/^href="\{\{#if settings\.[a-z_]+\}\}/);
      expect(href).toContain("{{else}}");
    });
  });
});
