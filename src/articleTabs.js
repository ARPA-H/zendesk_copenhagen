/*
 * Platform icons for the tabs of an article.
 *
 * The article editor's Tabs component is turned into a tab bar by Zendesk's own
 * script, which copies each tab's name into a <button class="wysiwyg-tabs-tab">.
 * This file reads each name, works out which platform it is about, and sets
 * data-platform on the tab. styles/_article-tabs.scss draws the matching icon, one of
 * the plain-named SVG files in assets/ (android.svg, apple.svg, ios.svg, macos.svg,
 * web.svg, windows.svg), so nothing is fetched at run time and nothing is inserted into
 * the page. The icons are SVG on purpose: a small raster icon is blurry and, on a phone,
 * illegible, while an SVG is scaled to its box at any size and pixel density.
 *
 * A name is matched by the platforms it mentions:
 *   iOS (also iPadOS, iPhone, iPad)        -> ios
 *   macOS (also Mac, Mac OS X, OS X)       -> macos   ("Mac" only as a capitalized word,
 *                                                       so a "MAC address" is not one)
 *   Windows                                -> windows
 *   Android                                -> android
 *   Web (also Website, Browser)            -> web
 *   iOS and macOS together, or Apple       -> apple
 * A name that mentions more than one of Apple, Windows, Android and Web is ambiguous, and
 * a name that mentions none of them has nothing to show, so neither gets an icon.
 *
 * An author can pick the icon in the name instead, the way a service catalog item does
 * in its description, with a marker such as  [icon: ios.svg] Phone setup . The marker
 * names one of the six files above and is removed from the visible name; the extension
 * is optional, and ".png" is read as ".svg" (the theme also holds ios.png, macos.png and
 * windows.png for the Device FAQs tiles, and a PNG is never drawn as a tab icon). Any
 * other name shows no icon. The marker wins over the name.
 *
 * Zendesk's script can run before or after this one, so tabs already on the page are
 * labelled at once and tabs added later are caught by a MutationObserver.
 *
 * ES2015 only (no async/await); this file is bundled into script.js.
 */

var BODY_SELECTOR = ".article-body";
var TAB_SELECTOR = ".wysiwyg-tabs-tab";
var PLATFORM_ATTRIBUTE = "data-platform";
export var PLATFORMS = ["android", "apple", "ios", "macos", "web", "windows"];

// The marker also takes the whitespace after it, so a name never starts with a gap.
var MARKER = /\[icon:\s*([^\]]*?)\s*\]\s*/i;
var IOS = /\b(?:ios|ipados|iphone|ipad)\b/i;
// The explicit forms match in any case. A bare "Mac" counts only as the capitalized
// product name: "MAC" is the network address, so a tab named "MAC address" is not
// about a Mac, and neither is "Mac address".
var MACOS = /\b(?:macos|mac\s?os(?:\s?x)?|os\s?x)\b/i;
var MAC = /\bMac\b(?!\s+address\b)/;
var WINDOWS = /\bwindows\b/i;
var ANDROID = /\bandroid\b/i;
var WEB = /\b(?:web|website|browser)s?\b/i;
var APPLE = /\bapple\b/i;

export function platformFromName(name) {
  var android = ANDROID.test(name);
  var web = WEB.test(name);
  var windows = WINDOWS.test(name);
  var apple = APPLE.test(name);
  var ios = apple || IOS.test(name);
  var macos = apple || MACOS.test(name) || MAC.test(name);
  var families =
    (android ? 1 : 0) +
    (web ? 1 : 0) +
    (windows ? 1 : 0) +
    (ios || macos ? 1 : 0);

  // None has nothing to show, and more than one is ambiguous.
  if (families !== 1) return "";
  if (android) return "android";
  if (web) return "web";
  if (windows) return "windows";
  if (ios && macos) return "apple";
  return ios ? "ios" : "macos";
}

function platformFromMarker(value) {
  var name = value.toLowerCase().replace(/\.(?:svg|png)$/, "");

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
