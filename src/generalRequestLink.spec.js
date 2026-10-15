import { describe, expect, it } from "@jest/globals";
import { readdirSync, readFileSync } from "node:fs";

// The "General request" button (home and services pages) and the "Submit a general request" link
// (service pages) are built by hand from three theme settings, because item IDs differ between
// Zendesk instances:
//   - "Other request service ID" (other_request_service_id) is read first;
//   - "General request service ID" (general_request_service_id) is read while that is blank;
//   - "General request category ID" (general_request_category_id) is added as ?category_id= to
//     whichever item link is used.
// With neither service ID set the link opens the standard request form, the page the footer's
// "Submit a request" link opens, and not /hc/en-us/services/ with nothing after it. The manifest
// once kept the second and third settings while the templates read only the first, so an admin who
// filled them in got no effect. These specs hold the two sides together.

const OTHER = "other_request_service_id";
const GENERAL = "general_request_service_id";
const CATEGORY = "general_request_category_id";
const SETTINGS = [OTHER, GENERAL, CATEGORY];

const templates = readdirSync("templates").filter((file) =>
  file.endsWith(".hbs")
);
const read = (file) => readFileSync(`templates/${file}`, "utf8");
const linking = templates.filter((file) =>
  read(file).includes(`settings.${OTHER}`)
);

const hrefOf = (file) => {
  const match = read(file).match(
    /href="([^"]*settings\.other_request_service_id[^"]*)"/
  );
  expect(match).not.toBeNull();
  return match[1];
};

// Renders the part of Curlybars these links use: {{path}}, {{page_path 'new_request'}} and nested
// {{#if path}}...{{else}}...{{/if}}. A blank or missing value is false: Curlybars' to_bool treats an
// empty string as false, as Handlebars does.
const render = (template, context) => {
  const tokens = template.split(/(\{\{[^}]*\}\})/).filter(Boolean);
  const value = (path) =>
    path
      .split(".")
      .reduce(
        (scope, key) => (scope == null ? undefined : scope[key]),
        context
      );
  let at = 0;

  const run = () => {
    let out = "";
    while (at < tokens.length) {
      const token = tokens[at];
      if (token === "{{else}}" || token === "{{/if}}") return out;
      at += 1;
      const open = token.match(/^\{\{#if ([\w.]+)\}\}$/);
      if (open) {
        const whenTrue = run();
        let whenFalse = "";
        if (tokens[at] === "{{else}}") {
          at += 1;
          whenFalse = run();
        }
        at += 1;
        out += value(open[1]) ? whenTrue : whenFalse;
      } else if (token === "{{page_path 'new_request'}}") {
        out += "/hc/en-us/requests/new";
      } else if (/^\{\{[\w.]+\}\}$/.test(token)) {
        out += value(token.slice(2, -2)) ?? "";
      } else {
        out += token;
      }
    }
    return out;
  };

  return run();
};

describe.each(linking)("the General request link on %s", (file) => {
  const href = hrefOf(file);
  const open = (settings) =>
    render(href, { settings, help_center: { base_locale: "en-us" } });

  it("opens the item named by Other request service ID", () => {
    expect(open({ [OTHER]: "ITEM_A" })).toBe("/hc/en-us/services/ITEM_A");
  });

  it("opens General request service ID while the other is blank", () => {
    expect(open({ [OTHER]: "", [GENERAL]: "ITEM_B" })).toBe(
      "/hc/en-us/services/ITEM_B"
    );
    expect(open({ [GENERAL]: "ITEM_B" })).toBe("/hc/en-us/services/ITEM_B");
  });

  it("reads Other request service ID first when both are set", () => {
    expect(open({ [OTHER]: "ITEM_A", [GENERAL]: "ITEM_B" })).toBe(
      "/hc/en-us/services/ITEM_A"
    );
  });

  it.each([
    [OTHER, "ITEM_A"],
    [GENERAL, "ITEM_B"],
  ])("adds the category to the item link from %s", (setting, id) => {
    expect(open({ [setting]: id, [CATEGORY]: "CAT_1" })).toBe(
      `/hc/en-us/services/${id}?category_id=CAT_1`
    );
  });

  it("opens the standard request form while both IDs are blank", () => {
    expect(open({})).toBe("/hc/en-us/requests/new");
    expect(open({ [OTHER]: "", [GENERAL]: "" })).toBe("/hc/en-us/requests/new");
  });

  it("does not add a category to the request form", () => {
    expect(open({ [CATEGORY]: "CAT_1" })).toBe("/hc/en-us/requests/new");
  });
});

describe("the General request settings", () => {
  const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
  const declared = manifest.settings.flatMap((group) => group.variables);
  const strings = JSON.parse(readFileSync("translations/en-us.json", "utf8"));

  it("are used on the home, services and service pages", () => {
    expect([...linking].sort()).toEqual([
      "home_page.hbs",
      "service_list_page.hbs",
      "service_page.hbs",
    ]);
  });

  it.each(SETTINGS)(
    "include %s, declared with a label and a description",
    (id) => {
      const setting = declared.find((variable) => variable.identifier === id);

      expect(setting).toBeDefined();
      expect(strings[setting.label]).toBeTruthy();
      expect(strings[setting.description]).toBeTruthy();
    }
  );

  it.each(SETTINGS)("are all read by every General request link (%s)", (id) => {
    linking.forEach((file) => expect(hrefOf(file)).toContain(`settings.${id}`));
  });
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
