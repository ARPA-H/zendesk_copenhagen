import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, it, expect } from "@jest/globals";
import {
  PLATFORMS,
  initArticleTabs,
  labelTab,
  labelTabs,
  platformFromName,
} from "./articleTabs";

// What Zendesk's script leaves in the page: a tab bar whose buttons carry the
// names copied from the <summary> elements.
const tab = (name) =>
  `<button type="button" class="wysiwyg-tabs-tab" role="tab">${name}</button>`;

const article = (...names) =>
  `<div class="article-body"><zd-tabs class="wysiwyg-tabs-active"><div class="wysiwyg-tabs-bar" role="tablist">${names
    .map(tab)
    .join("")}</div></zd-tabs></div>`;

const tabs = () => [...document.querySelectorAll(".wysiwyg-tabs-tab")];
const platforms = () => tabs().map((t) => t.getAttribute("data-platform"));
const names = () => tabs().map((t) => t.textContent);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("the platforms", () => {
  // The script names a platform, an asset file holds its icon, and the stylesheet
  // draws that file: all three have to agree or a tab gets a blank square.
  it.each(PLATFORMS)(
    "%s has an icon file and a stylesheet rule",
    (platform) => {
      const styles = readFileSync("styles/_article-tabs.scss", "utf8");

      expect(existsSync(`assets/${platform}.svg`)).toBe(true);
      expect(styles).toContain(`[data-platform="${platform}"]`);
      expect(styles).toContain(`$assets-${platform}-svg`);
    }
  );

  it("name the four icon files", () => {
    expect([...PLATFORMS].sort()).toEqual(["apple", "ios", "macos", "windows"]);
  });
});

describe("platformFromName", () => {
  it.each([
    ["iOS", "ios"],
    ["ios", "ios"],
    ["iPadOS", "ios"],
    ["iPhone and iPad", "ios"],
    ["Set up on iOS", "ios"],
    ["macOS", "macos"],
    ["Mac", "macos"],
    ["Mac OS X", "macos"],
    ["OS X", "macos"],
    ["Windows", "windows"],
    ["Windows 11", "windows"],
    ["iOS and macOS", "apple"],
    ["iOS/macOS", "apple"],
    ["macOS or iOS", "apple"],
    ["iPhone, iPad and Mac", "apple"],
    ["Apple", "apple"],
    ["Apple devices", "apple"],
  ])("gives %p the %s icon", (name, platform) => {
    expect(platformFromName(name)).toBe(platform);
  });

  it.each([
    ["Android"],
    ["Web browser"],
    ["Linux"],
    [""],
    // Words that only contain a platform name.
    ["Bios settings"],
    ["Macro recorder"],
    ["Windowsill"],
    // Windows beside an Apple platform is ambiguous.
    ["iOS and Windows"],
    ["macOS or Windows"],
    ["Apple and Windows"],
  ])("gives %p no icon", (name) => {
    expect(platformFromName(name)).toBe("");
  });
});

describe("labelTab", () => {
  it("sets the platform a name mentions", () => {
    document.body.innerHTML = article("iPhone");

    labelTab(tabs()[0]);

    expect(platforms()).toEqual(["ios"]);
    expect(names()).toEqual(["iPhone"]);
  });

  it("leaves a name with no platform without the attribute", () => {
    document.body.innerHTML = article("Android");

    labelTab(tabs()[0]);

    expect(platforms()).toEqual([null]);
  });

  describe("with a marker in the name", () => {
    it.each([
      ["[icon: ios.svg] Phone", "ios", "Phone"],
      ["[icon: macos.svg] Laptop", "macos", "Laptop"],
      ["[icon: windows.svg] Desktop", "windows", "Desktop"],
      ["[icon: apple.svg] Any Apple device", "apple", "Any Apple device"],
      ["[icon:ios] Phone", "ios", "Phone"],
      ["[ICON:  WINDOWS.SVG  ]Desktop", "windows", "Desktop"],
    ])("reads %p as the %s icon and shows %p", (name, platform, shown) => {
      document.body.innerHTML = article(name);

      labelTab(tabs()[0]);

      expect(platforms()).toEqual([platform]);
      expect(names()).toEqual([shown]);
    });

    it("takes the marker over the name", () => {
      document.body.innerHTML = article("[icon: windows.svg] iOS");

      labelTab(tabs()[0]);

      expect(platforms()).toEqual(["windows"]);
      expect(names()).toEqual(["iOS"]);
    });

    it("shows no icon, and no marker, for a name that is not one of the files", () => {
      document.body.innerHTML = article("[icon: logos:figma] Design");

      labelTab(tabs()[0]);

      expect(platforms()).toEqual([null]);
      expect(names()).toEqual(["Design"]);
    });

    it("also shows no icon for an unknown name beside a platform name", () => {
      document.body.innerHTML = article("[icon: nothing.svg] iOS");

      labelTab(tabs()[0]);

      expect(platforms()).toEqual([null]);
      expect(names()).toEqual(["iOS"]);
    });

    it("removes a marker that sits in the middle or at the end of the name", () => {
      document.body.innerHTML = article(
        "Set up [icon: ios.svg] now",
        "Phone [icon: ios.svg]"
      );

      labelTabs();

      expect(platforms()).toEqual(["ios", "ios"]);
      expect(names()).toEqual(["Set up now", "Phone "]);
    });

    it("removes a marker inside the markup of a name and keeps the markup", () => {
      document.body.innerHTML = article(
        "<strong>[icon: ios.svg] Phone</strong>"
      );

      labelTab(tabs()[0]);

      expect(platforms()).toEqual(["ios"]);
      expect(tabs()[0].innerHTML).toBe("<strong>Phone</strong>");
    });
  });

  it("does not undo a marker's choice when it is run again", () => {
    document.body.innerHTML = article("[icon: ios.svg] Phone");

    labelTab(tabs()[0]);
    labelTab(tabs()[0]);

    expect(platforms()).toEqual(["ios"]);
    expect(names()).toEqual(["Phone"]);
  });
});

describe("labelTabs", () => {
  it("labels every tab in the scope it is given, and only the tabs", () => {
    document.body.innerHTML =
      article("iOS", "macOS", "Windows", "iOS and macOS") +
      '<button class="other">iOS</button>';

    labelTabs();

    expect(platforms()).toEqual(["ios", "macos", "windows", "apple"]);
    expect(document.querySelector(".other").hasAttribute("data-platform")).toBe(
      false
    );
  });
});

describe("initArticleTabs", () => {
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("labels the tabs that are already on the page", () => {
    document.body.innerHTML = article("iOS", "Windows");

    initArticleTabs();

    expect(platforms()).toEqual(["ios", "windows"]);
  });

  it("labels tabs that Zendesk's script adds afterwards", async () => {
    document.body.innerHTML =
      '<div class="article-body"><zd-tabs><details><summary>macOS</summary></details></zd-tabs></div>';
    initArticleTabs();
    expect(tabs()).toHaveLength(0);

    document
      .querySelector("zd-tabs")
      .insertAdjacentHTML(
        "afterbegin",
        '<div class="wysiwyg-tabs-bar">' +
          tab("macOS") +
          tab("iOS and macOS") +
          "</div>"
      );
    await settle();

    expect(platforms()).toEqual(["macos", "apple"]);
  });

  it("leaves tabs outside the article body alone", () => {
    document.body.innerHTML =
      article("iOS") + '<div class="elsewhere">' + tab("Windows") + "</div>";

    initArticleTabs();

    expect(
      document
        .querySelector(".elsewhere .wysiwyg-tabs-tab")
        .hasAttribute("data-platform")
    ).toBe(false);
  });

  it("does nothing on a page without an article body", () => {
    document.body.innerHTML = "<main><p>No article here</p></main>";

    expect(() => initArticleTabs()).not.toThrow();
  });

  it("is not set off by its own changes", async () => {
    document.body.innerHTML = article("[icon: ios.svg] Phone");
    initArticleTabs();
    const before = tabs()[0].innerHTML;

    await settle();
    await settle();

    expect(tabs()[0].innerHTML).toBe(before);
    expect(platforms()).toEqual(["ios"]);
  });
});
