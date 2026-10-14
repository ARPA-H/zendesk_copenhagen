/*
 * Platform icons for the tabs of an article.
 *
 * The article editor's Tabs component is turned into a tab bar by Zendesk's own
 * script, which copies each tab's name into a <button class="wysiwyg-tabs-tab">.
 * This file reads each name, works out which platform it is about, and sets
 * data-platform on the tab. styles/_article-tabs.scss draws the matching icon, one of
 * the plain-named files in assets/ (apple.svg, ios.svg, macos.svg, windows.svg), so
 * nothing is fetched at run time and nothing is inserted into the page.
 *
 * A name is matched by the platforms it mentions:
 *   iOS (also iPadOS, iPhone, iPad)        -> ios
 *   macOS (also Mac, Mac OS X, OS X)       -> macos
 *   Windows                                -> windows
 *   iOS and macOS together, or Apple       -> apple
 * A name that mentions Windows beside an Apple platform is ambiguous, and a name that
 * mentions none of them has nothing to show, so neither gets an icon.
 *
 * An author can pick the icon in the name instead, the way a service catalog item does
 * in its description, with a marker such as  [icon: ios.svg] Phone setup . The marker
 * names one of the four files above (the ".svg" is optional) and is removed from the
 * visible name; any other name shows no icon. The marker wins over the name.
 *
 * Zendesk's script can run before or after this one, so tabs already on the page are
 * labelled at once and tabs added later are caught by a MutationObserver.
 *
 * ES2015 only (no async/await); this file is bundled into script.js.
 */

var BODY_SELECTOR = ".article-body";
var TAB_SELECTOR = ".wysiwyg-tabs-tab";
var PLATFORM_ATTRIBUTE = "data-platform";
export var PLATFORMS = ["apple", "ios", "macos", "windows"];

// The marker also takes the whitespace after it, so a name never starts with a gap.
var MARKER = /\[icon:\s*([^\]]*?)\s*\]\s*/i;
var IOS = /\b(?:ios|ipados|iphone|ipad)\b/i;
var MACOS = /\b(?:macos|mac\s?os(?:\s?x)?|os\s?x|mac)\b/i;
var WINDOWS = /\bwindows\b/i;
var APPLE = /\bapple\b/i;

export function platformFromName(name) {
  var windows = WINDOWS.test(name);
  var apple = APPLE.test(name);
  var ios = apple || IOS.test(name);
  var macos = apple || MACOS.test(name);

  if (windows) return ios || macos ? "" : "windows";
  if (ios && macos) return "apple";
  if (ios) return "ios";
  if (macos) return "macos";
  return "";
}

function platformFromMarker(value) {
  var name = value.toLowerCase().replace(/\.svg$/, "");

  return PLATFORMS.indexOf(name) === -1 ? "" : name;
}

function removeMarker(tab) {
  var walker = document.createTreeWalker(tab, NodeFilter.SHOW_TEXT, null);
  var node = walker.nextNode();

  while (node) {
    if (MARKER.test(node.nodeValue)) {
      node.nodeValue = node.nodeValue.replace(MARKER, "");
      return;
    }
    node = walker.nextNode();
  }
}

export function labelTab(tab) {
  // Already labelled. A tab with no platform is checked again, which finds the
  // same nothing, because the marker (if it had one) is gone after the first pass.
  if (tab.hasAttribute(PLATFORM_ATTRIBUTE)) return;

  var marker = MARKER.exec(tab.textContent);
  var platform;

  if (marker) {
    platform = platformFromMarker(marker[1]);
    removeMarker(tab);
  } else {
    platform = platformFromName(tab.textContent);
  }

  if (platform) tab.setAttribute(PLATFORM_ATTRIBUTE, platform);
}

export function labelTabs(root) {
  var tabs = (root || document).querySelectorAll(TAB_SELECTOR);

  for (var i = 0; i < tabs.length; i++) {
    labelTab(tabs[i]);
  }
}

export function initArticleTabs() {
  var body = document.querySelector(BODY_SELECTOR);

  if (!body) return;

  labelTabs(body);

  if (typeof MutationObserver === "function") {
    new MutationObserver(function () {
      labelTabs(body);
    }).observe(body, { childList: true, subtree: true });
  }
}

if (document.readyState !== "loading") {
  initArticleTabs();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    initArticleTabs();
  });
}
