/*
 * Global DOM fix-ups that were previously inline <script> blocks in
 * templates/document_head.hbs. Kept here so they live in the built script.js
 * (source of truth) instead of the template head.
 *
 * ES2015 only (no async/await) — this file is bundled into script.js.
 */

// ---------------------------------------------------------------------------
// 1. Neutralize the current-page breadcrumb link.
//    Zendesk renders the active breadcrumb as <a href="#" aria-current="page">;
//    clicking it navigates to "#", which blanks the page. It represents the
//    page you are already on, so it should not navigate at all. Removing the
//    href makes navigation impossible for both mouse and keyboard; the matching
//    `pointer-events: none` rule in _breadcrumbs.scss is a visual backstop.
//
//    (Replaces the former inline version, which ran a body-wide
//    MutationObserver forever on every DOM mutation.)
// ---------------------------------------------------------------------------
(function () {
  var SEL = 'nav[aria-label="Breadcrumb"] a, .breadcrumbs a';

  function isDead(a) {
    if (!a) return false;
    var href = a.getAttribute("href");
    return (
      a.getAttribute("aria-current") === "page" ||
      href === "#" ||
      href === "" ||
      href === null
    );
  }

  function neutralize() {
    var links = document.querySelectorAll(SEL);
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!isDead(a)) continue;
      if (a.hasAttribute("href")) {
        a.setAttribute("data-dead-href", a.getAttribute("href"));
        a.removeAttribute("href");
      }
      a.setAttribute("role", "link");
      a.setAttribute("aria-disabled", "true");
    }
  }

  if (document.readyState !== "loading") {
    neutralize();
  } else {
    document.addEventListener("DOMContentLoaded", neutralize);
  }
})();

// ---------------------------------------------------------------------------
// 2. Hide any element whose only text is literally "empty".
//    This is a placeholder that can leak into the rendered page. Adding the
//    `.svc-empty-hidden` class (styled in _svc-tokens.scss) hides it without an
//    inline style.
//    TODO: find and fix the source that emits "empty" so this can be removed.
// ---------------------------------------------------------------------------
(function () {
  function hideEmpty() {
    var els = document.querySelectorAll("a, li, div");
    for (var i = 0; i < els.length; i++) {
      if (els[i].textContent.trim().toLowerCase() === "empty") {
        els[i].classList.add("svc-empty-hidden");
      }
    }
  }

  if (document.readyState !== "loading") {
    hideEmpty();
  } else {
    document.addEventListener("DOMContentLoaded", hideEmpty);
  }
})();

// ---------------------------------------------------------------------------
// 3. Wire the pink search-pill button (templates/search_results.hbs) to
//    submit the native search, matching native <button type="submit"> behavior.
//    Previously an inline <script> in that template; moved here per the
//    "don't re-add inline scripts" rule documented in document_head.hbs.
// ---------------------------------------------------------------------------
(function () {
  function wireSearchPillButton() {
    var btn = document.getElementById("svc-search-pill-btn");
    if (!btn || btn.dataset.svcWired === "1") return;
    var pill = btn.closest(".svc-search-pill");
    if (!pill) return;
    btn.dataset.svcWired = "1";
    btn.addEventListener("click", function () {
      var input = pill.querySelector(
        'input[type="search"], input[type="text"], input:not([type])'
      );
      if (!input) return;
      var form = input.form || input.closest("form");
      if (form) {
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.submit();
      } else {
        input.focus();
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
          })
        );
      }
    });
  }

  if (document.readyState !== "loading") {
    wireSearchPillButton();
  } else {
    document.addEventListener("DOMContentLoaded", wireSearchPillButton);
  }
})();

// ---------------------------------------------------------------------------
// 4. Keep the footer copyright year current. The template renders the year it
//    was last edited so the notice is complete without JavaScript; this swaps
//    in the visitor's current year.
// ---------------------------------------------------------------------------
export function setFooterYear() {
  var years = document.querySelectorAll("[data-footer-year]");
  var year = String(new Date().getFullYear());
  for (var i = 0; i < years.length; i++) {
    years[i].textContent = year;
  }
}

if (document.readyState !== "loading") {
  setFooterYear();
} else {
  document.addEventListener("DOMContentLoaded", setFooterYear);
}

// ---------------------------------------------------------------------------
// 5. Let a table that is wider than its column scroll sideways inside its own
//    region. Without this the page either widens or, where it is clipped, the
//    last columns cannot be reached. Each table in an article body gets a
//    wrapper; the wrapper becomes a focusable region only while the table
//    actually overflows, so keyboard users can scroll it and tables that fit
//    add no tab stop. It is worked out again on load, on resize and whenever a
//    table or its wrapper changes size, so a table in a tab that is shown later
//    becomes a region then. The region is named by the table's caption, which
//    is the article's own text. A table without one gets a fixed English name,
//    and it is numbered when several tables need it so the regions stay
//    distinguishable. On an English page that name is the region's aria-label.
//    On any other page it comes from a hidden element marked lang="en"
//    (aria-labelledby), so the region still has a name and a role there, and
//    the English words are not passed off as the page's own language.
// ---------------------------------------------------------------------------
var SCROLLABLE_TABLE_LABEL = "Scrollable table";
var SCROLLABLE_LABEL_ATTR = "data-table-scroll-label";
var scrollableLabelCount = 0;

function isEnglishPage() {
  var lang = document.documentElement.getAttribute("lang") || "en";
  return /^en(-|$)/i.test(lang);
}

function findFallbackLabel(wrapper) {
  for (var i = 0; i < wrapper.children.length; i++) {
    if (wrapper.children[i].hasAttribute(SCROLLABLE_LABEL_ATTR)) {
      return wrapper.children[i];
    }
  }
  return null;
}

function removeFallbackLabel(wrapper) {
  var label = findFallbackLabel(wrapper);
  if (label) {
    wrapper.removeChild(label);
  }
  wrapper.removeAttribute("aria-labelledby");
}

function setFallbackLabel(wrapper, text) {
  var label = findFallbackLabel(wrapper);
  if (!label) {
    label = document.createElement("span");
    label.hidden = true;
    label.setAttribute("lang", "en");
    label.setAttribute(SCROLLABLE_LABEL_ATTR, "");
    label.id = "table-scroll-label-" + ++scrollableLabelCount;
    wrapper.insertBefore(label, wrapper.firstChild);
  }
  label.textContent = text;
  wrapper.setAttribute("aria-labelledby", label.id);
}

export function wrapWideTables(root) {
  var scope = root || document;
  var tables = scope.querySelectorAll(".article-body table");
  var watched = [];
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    if (
      table.parentNode &&
      table.parentNode.classList.contains("table-scroll")
    ) {
      continue;
    }
    var wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    var caption = table.querySelector("caption");
    var captionText = caption && caption.textContent.trim();
    if (captionText) {
      wrapper.setAttribute("data-label", captionText);
    }
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    watched.push(wrapper, table);
  }
  watchTableSizes(watched);
  updateScrollableTables(scope);
}

// A table in a tab that is not showing has no box, so it measures as not
// overflowing and is not made a region. Showing the tab fires neither load nor
// resize, so the regions are worked out again whenever a wrapper or its table
// changes size: that covers a tab being shown or hidden, and a table that grows
// after load (a late font or image). Setting the attributes changes no size, so
// this cannot loop.
function watchTableSizes(elements) {
  if (!elements.length || typeof ResizeObserver !== "function") {
    return;
  }
  var observer = new ResizeObserver(function () {
    updateScrollableTables();
  });
  for (var i = 0; i < elements.length; i++) {
    observer.observe(elements[i]);
  }
}

export function updateScrollableTables(root) {
  var scope = root || document;
  var wrappers = scope.querySelectorAll(".table-scroll");
  var overflowing = [];
  var unnamed = [];
  for (var i = 0; i < wrappers.length; i++) {
    var wrapper = wrappers[i];
    if (wrapper.scrollWidth > wrapper.clientWidth) {
      overflowing.push(wrapper);
      if (!wrapper.getAttribute("data-label")) {
        unnamed.push(wrapper);
      }
    } else {
      wrapper.removeAttribute("role");
      wrapper.removeAttribute("tabindex");
      wrapper.removeAttribute("aria-label");
      removeFallbackLabel(wrapper);
    }
  }

  var english = isEnglishPage();
  for (var j = 0; j < overflowing.length; j++) {
    var scroller = overflowing[j];
    var label = scroller.getAttribute("data-label");
    var captioned = !!label;
    if (!captioned) {
      label =
        unnamed.length > 1
          ? SCROLLABLE_TABLE_LABEL +
            " " +
            (unnamed.indexOf(scroller) + 1) +
            " of " +
            unnamed.length
          : SCROLLABLE_TABLE_LABEL;
    }
    scroller.setAttribute("tabindex", "0");
    scroller.setAttribute("role", "region");
    if (captioned || english) {
      scroller.setAttribute("aria-label", label);
      removeFallbackLabel(scroller);
    } else {
      scroller.removeAttribute("aria-label");
      setFallbackLabel(scroller, label);
    }
  }
}

if (document.readyState !== "loading") {
  wrapWideTables();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    wrapWideTables();
  });
}
window.addEventListener("load", function () {
  updateScrollableTables();
});
window.addEventListener("resize", function () {
  updateScrollableTables();
});
