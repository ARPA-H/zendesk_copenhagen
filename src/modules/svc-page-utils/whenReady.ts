/*
 * Ported from src/svcReveal.js (formerly window.initSvcRevealOnComplete).
 * Same MutationObserver + settle-timer + hard-timeout + bfcache pattern,
 * now a real ES module import instead of a `window.*` global bridged via
 * setInterval polling for script.js's load order.
 */

export interface WhenReadyOptions {
  /** id of the element to observe for completion */
  targetId: string;
  /** id of the skeleton placeholder to hide/remove */
  skeletonId?: string;
  /** class added to the skeleton element right before it's removed */
  skeletonHideClass?: string;
  /** classes added to <html> once revealed */
  readyClasses?: string[];
  /** returns true once `el` has its real (non-skeleton) content */
  isComplete: (el: HTMLElement) => boolean;
  /** debounce after isComplete() first passes, so we don't reveal mid-render */
  settleMs?: number;
  /** reveal unconditionally by this point even if isComplete() never passes */
  hardCapMs?: number;
  /** extra callback once revealed */
  onReveal?: () => void;
}

export function whenReady(options: WhenReadyOptions): void {
  const root = document.documentElement;
  const target = document.getElementById(options.targetId);
  if (!target) return;
  const skel = options.skeletonId
    ? document.getElementById(options.skeletonId)
    : null;

  let done = false;
  function reveal() {
    if (done) return;
    done = true;
    (options.readyClasses || []).forEach((c) => root.classList.add(c));
    if (skel) {
      skel.classList.add(options.skeletonHideClass || "svc-skel-hide");
      setTimeout(() => {
        if (skel && skel.parentNode) skel.parentNode.removeChild(skel);
      }, 320);
    }
    options.onReveal?.();
  }

  let settleTimer: ReturnType<typeof setTimeout> | null = null;
  function armSettle() {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(reveal, options.settleMs || 400);
  }
  function check() {
    if (!done && options.isComplete(target as HTMLElement)) armSettle();
  }

  check();
  const mo = new MutationObserver(check);
  mo.observe(target, { childList: true, subtree: true });
  (function stop() {
    if (done) mo.disconnect();
    else setTimeout(stop, 300);
  })();

  setTimeout(reveal, options.hardCapMs || 6000);

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) reveal();
  });
}
