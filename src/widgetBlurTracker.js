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
 * Zendesk renders the conversation panel in an iframe with id="webWidget"
 * (kept for backward compatibility across the Classic Web Widget and the
 * newer Messaging Web Widget). If Zendesk ever renames it, update
 * WIDGET_PANEL_IFRAME_IDS below.
 *
 * ES2015 only (no async/await, no optional chaining, no arrow functions in
 * places that would need `this`) - bundled into script.js, which ships
 * without a transpiler.
 */
(function () {
  var WIDGET_PANEL_IFRAME_IDS = ["webWidget"];
  var HALO_MARGIN = 25; // px beyond the tracked iframe's own edges, in any direction
  var LAYER_COUNT = 3;

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

  function findPanelIframe() {
    for (var i = 0; i < WIDGET_PANEL_IFRAME_IDS.length; i++) {
      var el = document.getElementById(WIDGET_PANEL_IFRAME_IDS[i]);
      if (el && el.tagName === "IFRAME") return el;
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
    } else {
      // Fallback for browsers without ResizeObserver: cheap low-frequency
      // poll, only while a panel iframe is present on the page.
      window.setInterval(scheduleUpdate, 200);
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
    bodyObserver.observe(document.body, { childList: true, subtree: false });
  }

  if (document.readyState !== "loading") {
    watchForPanelIframe();
  } else {
    document.addEventListener("DOMContentLoaded", watchForPanelIframe);
  }
})();
