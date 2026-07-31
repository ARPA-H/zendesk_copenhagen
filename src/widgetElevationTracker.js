/*
 * Dynamically sizes/positions a plain box-shadow "backer" element behind
 * the ARPA-Help messaging widget's conversation panel iframe as it
 * opens/grows, since the panel's size is animated and viewport/locale-
 * dependent and can't be predicted with static CSS (see
 * styles/_widget-elevation.scss for the launcher's static shadow, which CAN
 * be static because the closed launcher button never resizes).
 *
 * IMPORTANT: confirmed via live inspection of the actual site that Zendesk
 * mounts its widget iframes (both the launcher AND the conversation panel)
 * inside an *open* Shadow DOM tree, not directly in the page's light DOM. A
 * plain `document.querySelectorAll('iframe')` finds nothing at all; the
 * iframes only turn up by recursively walking into every element's
 * `.shadowRoot`. This affects both how we find the panel iframe and how we
 * watch for it appearing later, since a light-DOM `MutationObserver` does
 * not observe mutations happening inside a separate shadow tree.
 *
 * This only ever reads the iframe ELEMENT's own box geometry (always
 * readable, even cross-origin, since layout geometry of an iframe's own box
 * is not subject to the cross-origin restriction - only its *content* is)
 * - it never reaches into the iframe's content or its cross-origin
 * document. Reading into an *open* shadow root (as opposed to
 * `mode: 'closed'`) is standard, fully public DOM API - it's deliberately
 * inspectable by any page script, same as browser devtools can see it.
 *
 * The Zendesk snippet that actually creates these iframes is configured in
 * Zendesk Admin Center, not in this repo, so its exact DOM (element IDs)
 * isn't something we can read from source control or verify against a local
 * build. Rather than hard-coding a single guessed iframe id (which silently
 * finds nothing if Zendesk names it differently), this identifies the panel
 * iframe with a few independent, best-effort signals and takes the first
 * match:
 *
 *   1. A known id Zendesk has used historically ("webWidget").
 *   2. Its `src` pointing at a Zendesk widget domain (zdassets.com /
 *      zendesk.com / zopim.com).
 *   3. Its accessible name (`title`, `aria-label`, or `name`) mentioning
 *      "messag"/"convers"/"chat" - matches the real, confirmed
 *      `title="Messaging window"` / `name="Messaging window"` pair Zendesk
 *      sets on the panel iframe (and the launcher's own
 *      `title="Button to launch messaging window..."` pattern).
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
  var RECHECK_INTERVAL_MS = 1500; // safety net in case the tracked iframe is swapped out

  var shadowEl = null;
  var trackedIframe = null;
  var rafId = null;
  var watchedShadowRoots = []; // ShadowRoot objects we've already attached a MutationObserver to, so we don't double-attach

  function createShadowEl() {
    var el = document.createElement("div");
    el.className = "widget-elevation-backdrop-panel";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    return el;
  }

  function accessibleText(el) {
    return (
      (el.getAttribute("title") || "") +
      " " +
      (el.getAttribute("aria-label") || "") +
      " " +
      (el.name || "")
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

  // Recursively collects every <iframe> in `root`, descending into any open
  // shadow root it finds along the way (this is what actually reaches
  // Zendesk's widget iframes - see file header). Also starts watching any
  // newly-discovered shadow root going forward, so content added inside it
  // later (e.g. the panel iframe appearing after the launcher's shadow root
  // already exists) is still caught.
  function collectIframesDeep(root) {
    var iframes = [];
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === "IFRAME") iframes.push(el);
      if (el.shadowRoot) {
        watchShadowRoot(el.shadowRoot);
        iframes = iframes.concat(collectIframesDeep(el.shadowRoot));
      }
    }
    return iframes;
  }

  function watchShadowRoot(shadowRoot) {
    if (watchedShadowRoots.indexOf(shadowRoot) !== -1) return;
    watchedShadowRoots.push(shadowRoot);
    var observer = new MutationObserver(handlePotentialPanelChange);
    observer.observe(shadowRoot, { childList: true, subtree: true });
  }

  function findPanelIframe() {
    for (var i = 0; i < KNOWN_PANEL_IDS.length; i++) {
      var known = document.getElementById(KNOWN_PANEL_IDS[i]);
      if (known && known.tagName === "IFRAME" && !isLauncherIframe(known)) {
        return known;
      }
    }

    var candidates = collectIframesDeep(document);
    for (var j = 0; j < candidates.length; j++) {
      var candidate = candidates[j];
      if (isLauncherIframe(candidate)) continue;
      if (looksLikeWidgetPanel(candidate)) return candidate;
    }

    return null;
  }

  function updatePosition() {
    rafId = null;
    if (!trackedIframe || !shadowEl) return;

    var rect = trackedIframe.getBoundingClientRect();
    var hasSize = rect.width > 1 && rect.height > 1;
    if (!hasSize) {
      shadowEl.style.display = "none";
      return;
    }

    shadowEl.style.display = "block";
    shadowEl.style.left = rect.left + "px";
    shadowEl.style.top = rect.top + "px";
    shadowEl.style.width = rect.width + "px";
    shadowEl.style.height = rect.height + "px";
  }

  function scheduleUpdate() {
    if (rafId !== null) return;
    if (window.requestAnimationFrame) {
      rafId = window.requestAnimationFrame(updatePosition);
    } else {
      updatePosition();
    }
  }

  function startTracking(iframe) {
    trackedIframe = iframe;
    if (!shadowEl) shadowEl = createShadowEl();

    if (window.ResizeObserver) {
      // Fires repeatedly while the iframe's box is actively changing size,
      // including mid-way through a CSS transition Zendesk may be running,
      // so the shadow tracks smoothly rather than only at the start/end
      // state. Works the same whether the iframe lives in the light DOM or
      // inside a shadow root - ResizeObserver operates on the element
      // reference itself, not on its position in the tree.
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

  function handlePotentialPanelChange() {
    if (trackedIframe && trackedIframe.isConnected) return;
    var iframe = findPanelIframe();
    if (iframe) startTracking(iframe);
  }

  function watchForPanelIframe() {
    var existing = findPanelIframe();
    if (existing) {
      startTracking(existing);
      return;
    }

    // Catches the widget's outermost host element(s) being added to the
    // page at all (e.g. before any shadow root exists yet). Once that
    // happens, the next handlePotentialPanelChange call's findPanelIframe()
    // walk will discover its shadow root and call watchShadowRoot() on it,
    // extending coverage into content added later inside that shadow tree.
    var bodyObserver = new MutationObserver(handlePotentialPanelChange);
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Safety net: browsers without ResizeObserver never get scheduleUpdate
  // called by size changes, and ANY browser could have its tracked iframe
  // silently removed/replaced (widget reset, re-init) without our observers
  // firing. A cheap low-frequency poll re-measures the current iframe and
  // re-attaches to a replacement if the original one leaves the document.
  // `isConnected` (unlike `document.contains()`) correctly reports true for
  // nodes inside a shadow tree, which is required here since the tracked
  // iframe lives inside one - see file header.
  window.setInterval(function () {
    if (trackedIframe && !trackedIframe.isConnected) {
      trackedIframe = null;
      var replacement = findPanelIframe();
      if (replacement) startTracking(replacement);
      else if (shadowEl) shadowEl.style.display = "none";
      return;
    }
    if (!trackedIframe) handlePotentialPanelChange();
    if (!window.ResizeObserver) scheduleUpdate();
  }, RECHECK_INTERVAL_MS);

  if (document.readyState !== "loading") {
    watchForPanelIframe();
  } else {
    document.addEventListener("DOMContentLoaded", watchForPanelIframe);
  }
})();
