/*
 * Disclosure behavior for the USWDS "official government website" banner
 * (templates/header.hbs, styles/_usa-banner.scss). It mirrors the USWDS banner
 * script (packages/usa-banner/src/index.js in @uswds/uswds): the button flips
 * aria-expanded, the panel it controls is shown or hidden, and the header gets
 * the expanded modifier class that hides the "Here's how you know" prompt.
 *
 * ES2015 only (no async/await); this file is bundled into script.js.
 */

var BUTTON_SELECTOR = ".usa-banner__button";
var HEADER_SELECTOR = ".usa-banner__header";
var EXPANDED_CLASS = "usa-banner__header--expanded";

export function setBannerExpanded(button, expanded) {
  var panel = document.getElementById(button.getAttribute("aria-controls"));
  var header = button.closest(HEADER_SELECTOR);

  button.setAttribute("aria-expanded", expanded ? "true" : "false");
  if (panel) panel.hidden = !expanded;
  if (header) header.classList.toggle(EXPANDED_CLASS, expanded);
}

export function toggleBanner(button) {
  setBannerExpanded(button, button.getAttribute("aria-expanded") !== "true");
}

export function initGovBanner(root) {
  var scope = root || document;
  var buttons = scope.querySelectorAll(BUTTON_SELECTOR);

  for (var i = 0; i < buttons.length; i++) {
    (function (button) {
      setBannerExpanded(
        button,
        button.getAttribute("aria-expanded") === "true"
      );
      button.addEventListener("click", function () {
        toggleBanner(button);
      });
    })(buttons[i]);
  }
}

if (document.readyState !== "loading") {
  initGovBanner();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    initGovBanner();
  });
}
