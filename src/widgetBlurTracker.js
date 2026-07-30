/*
 * Dynamically hugs a soft 25px blur halo around the ARPA-Help messaging
 * widget's conversation panel iframe as it opens/grows, since the panel's
 * size is animated and viewport/locale-dependent and can't be predicted with
 * static CSS (see styles/_widget-blur.scss for the launcher's static halo,
 * which CAN be static because the closed launcher button never resizes).
 *
 * The widget itself is Zendesk's own cross-origin content (see
 * https://developer.zendesk.com/api-reference/widget-messaging/web/core/ -
 * the widget's public "customization" API covers colors/position/behavior
 * but has no corner-radius or CSS-injection hook), so this only ever reads
 * the iframe ELEMENT's own box geometry on our page (always readable, even
 * cross-origin, since layout geometry of a cross-origin iframe's own box is
 * not subject to the same-origin restriction - only its *content* is) - it
 * never reaches into the iframe's content or its cross-origin document.
 *
 * The Zendesk snippet that actually creates these iframes is configured in
 * Zendesk Admin Center, not in this repo, so its exact DOM (element IDs)
 * isn't something we can read from source control or verify against a local
 * build. Rather than hard-coding a single guessed iframe id (which silently
 * finds nothing - and shows no blur at all - if Zendesk names it
 * differently), this identifies the panel iframe with a few independent,
 * best-effort signals and takes the first match:
 *
 *   1. A known id Zendesk has used historically ("webWidget").
 *   2. Its `src` pointing at a Zendesk widget domain (zdassets.com /
 *      zendesk.com / zopim.com) - readable on any iframe element regardless
 *      of cross-origin restrictions, since `src` is just an attribute of
 *      the outer element in OUR document, not the iframe's cross-origin
 *      content.
 *   3. Its accessible name (title/aria-label) mentioning "messag"/"convers"/
 *      "chat" - matches the launcher's own
 *      `title="Button to launch messaging window..."` pattern.
 *
 * The launcher button itself is explicitly excluded from all of the above so
 * it's never mistaken for the panel.
 *
 * ES2015 only (no async/await, no optional chaining, no arrow functions in
 * places that would need `this`) - bundled into script.js, which ships
 * without a transpiler.
 */
(function () {
  var KNOWN_PANEL_IDS = ["webWidget"];
  var WIDGET_DOMAIN_PATTERN = /zdassets\.com|zendesk\.com|zopim\.com/i;
  var MESSAGING_TEXT_PATTERN = /messag|convers|chat/i;
  var LAUNCHER_TEXT_PATTERN = /launch/i;
  var HALO_MARGIN = 25; // px beyond the tracked iframe's own edges, in any direction
  var LAYER_COUNT = 3;
  var RECHECK_INTERVAL_MS = 1500; // safety net in case the tracked iframe is swapped out

  var haloEl = null;
  var trackedIframe = null;
  var rafId = null;

  function createHalo() {
    var el = document.createElement("div");
    el.className = "widget-blur-backdrop-panel";
    el.setAttribute("aria-hidden", "true");
    for (var i = LAYER_COUNT; i >= 1; i--) {
      var layer = document.createElement("div");
      layer.className =
        "widget-blur-backdrop-layer widget-blur-backdrop-layer-" + i;
      el.appendChild(layer);
    }
    document.body.appendChild(el);
    return el;
  }

  function accessibleText(el) {
    return (
      (el.getAttribute("title") || "") +
      " " +
      (el.getAttribute("aria-label") || "")
    );
  }

  function isLauncherIframe(el) {
    if (el.id === "launcher") return true;
    return LAUNCHER_TEXT_PATTERN.test(accessibleText(el));
  }

  function looksLikeWidgetPanel(el) {
    if (WIDGET_DOMAIN_PATTERN.test(el.getAttribute("src") || "")) return true;
    return MESSAGING_TEXT_PATTERN.test(accessibleText(el));
  }

  function findPanelIframe() {
    for (var i = 0; i < KNOWN_PANEL_IDS.length; i++) {
      var known = document.getElementById(KNOWN_PANEL_IDS[i]);
      if (known && known.tagName === "IFRAME" && !isLauncherIframe(known)) {
        return known;
      }
    }

    var iframes = document.querySelectorAll("iframe");
    for (var j = 0; j < iframes.length; j++) {
      var candidate = iframes[j];
      if (isLauncherIframe(candidate)) continue;
      if (looksLikeWidgetPanel(candidate)) return candidate;
    }

    return null;
  }

  function updateHaloPosition() {
    rafId = null;
    if (!trackedIframe || !haloEl) return;

    var rect = trackedIframe.getBoundingClientRect();
    var hasSize = rect.width > 1 && rect.height > 1;
    if (!hasSize) {
      haloEl.style.display = "none";
      return;
    }

    haloEl.style.display = "block";
    haloEl.style.left = Math.max(0, rect.left - HALO_MARGIN) + "px";
    haloEl.style.top = Math.max(0, rect.top - HALO_MARGIN) + "px";
    haloEl.style.width = rect.width + HALO_MARGIN * 2 + "px";
    haloEl.style.height = rect.height + HALO_MARGIN * 2 + "px";
  }

  function scheduleUpdate() {
    if (rafId !== null) return;
    if (window.requestAnimationFrame) {
      rafId = window.requestAnimationFrame(updateHaloPosition);
    } else {
      updateHaloPosition();
    }
  }

  function startTracking(iframe) {
    trackedIframe = iframe;
    if (!haloEl) haloEl = createHalo();

    if (window.ResizeObserver) {
      // Fires repeatedly while the iframe's box is actively changing size,
      // including mid-way through a CSS transition Zendesk may be running,
      // so the halo tracks smoothly rather than only at the start/end state.
      var ro = new ResizeObserver(scheduleUpdate);
      ro.observe(iframe);
    }

    // Catches position-only changes (e.g. a slide-in) that don't necessarily
    // fire ResizeObserver, since Zendesk animates the panel via inline style.
    var mo = new MutationObserver(scheduleUpdate);
    mo.observe(iframe, { attributes: true, attributeFilter: ["style"] });

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    scheduleUpdate();
  }

  function watchForPanelIframe() {
    var existing = findPanelIframe();
    if (existing) {
      startTracking(existing);
      return;
    }

    var bodyObserver = new MutationObserver(function () {
      var iframe = findPanelIframe();
      if (iframe) {
        bodyObserver.disconnect();
        startTracking(iframe);
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Safety net: browsers without ResizeObserver never get scheduleUpdate
  // called by size changes, and ANY browser could have its tracked iframe
  // silently removed/replaced (widget reset, re-init) without our observers
  // firing. A cheap low-frequency poll re-measures the current iframe and
  // re-attaches to a replacement if the original one leaves the document.
  window.setInterval(function () {
    if (trackedIframe && !document.contains(trackedIframe)) {
      trackedIframe = null;
      var replacement = findPanelIframe();
      if (replacement) startTracking(replacement);
      else if (haloEl) haloEl.style.display = "none";
      return;
    }
    if (!window.ResizeObserver) scheduleUpdate();
  }, RECHECK_INTERVAL_MS);

  if (document.readyState !== "loading") {
    watchForPanelIframe();
  } else {
    document.addEventListener("DOMContentLoaded", watchForPanelIframe);
  }
})();
