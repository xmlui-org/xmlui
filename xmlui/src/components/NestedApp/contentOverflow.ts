/**
 * Helpers that let a playground box grow to fit its nested app's content.
 *
 * A nested app fills its box, and when its content is taller the app's page-level scroll
 * container (e.g. the App's `appContainer`, or `mainContentArea` with `scrollWholePage="false"`)
 * overflows. The overflow amount is exactly how much the box has to grow to show everything.
 */

import appStyles from "../App/App.module.scss";

/** Growth stops at this fraction of the viewport height; past it the playground scrolls. */
export const MAX_FIT_HEIGHT_VIEWPORT_RATIO = 0.85;

/**
 * The App's structural elements that can be its page-level scroll container, depending on the
 * layout and `scrollWholePage`. Only these count: a scroller inside a component (a List or
 * Table with its own scrolling) must not make the playground grow.
 */
const PAGE_SCROLLER_SELECTOR = [
  appStyles.appContainer,
  appStyles.mainContentRow,
  appStyles.mainContentArea,
  appStyles.pagesContainer,
  appStyles.pageContentContainer,
]
  .filter(Boolean)
  .map((className) => `.${className}`)
  .join(",");

const SCROLLABLE_OVERFLOW = /^(auto|scroll|overlay)$/;

/**
 * Finds the nested App's page-level scroll container: the outermost App layout element under
 * `root` whose vertical overflow scrolls.
 */
export function findPageScroller(root: ParentNode): HTMLElement | null {
  if (!PAGE_SCROLLER_SELECTOR) return null;
  for (const el of Array.from(root.querySelectorAll<HTMLElement>(PAGE_SCROLLER_SELECTOR))) {
    if (SCROLLABLE_OVERFLOW.test(getComputedStyle(el).overflowY)) {
      return el;
    }
  }
  return null;
}

/**
 * Computes the next fitted box height (px) when the content overflows by `overflow` px.
 * The result never shrinks the box, never goes below `reservedHeight`, and never exceeds the
 * viewport-relative cap (unless the box is already taller than the cap).
 */
export function nextFitHeight(
  currentHeight: number,
  overflow: number,
  reservedHeight: number,
  viewportHeight: number,
): number {
  const cap = Math.max(reservedHeight, Math.floor(viewportHeight * MAX_FIT_HEIGHT_VIEWPORT_RATIO));
  const wanted = Math.ceil(currentHeight + Math.max(0, overflow));
  return Math.max(currentHeight, Math.min(wanted, cap));
}

/**
 * Watches the nested app rendered into `root` (a shadow root hosted by `host`) and calls
 * `onOverflow` with the number of pixels its page-level scroll container overflows by.
 * Checks run at most once per animation frame, on DOM changes and on size changes of the host,
 * the scroller and the scroller's children (which catches media that resizes after loading).
 * Returns a function that stops watching.
 */
export function observeContentOverflow(
  root: ShadowRoot,
  host: HTMLElement,
  onOverflow: (overflow: number) => void,
): () => void {
  if (typeof ResizeObserver === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }

  let frame = 0;
  let observedScroller: HTMLElement | null = null;
  const resizeObserver = new ResizeObserver(() => schedule());
  resizeObserver.observe(host);

  const observeScroller = (scroller: HTMLElement | null) => {
    if (scroller === observedScroller) return;
    resizeObserver.disconnect();
    resizeObserver.observe(host);
    observedScroller = scroller;
    if (scroller) {
      resizeObserver.observe(scroller);
      for (const child of Array.from(scroller.children)) {
        resizeObserver.observe(child);
      }
    }
  };

  const check = () => {
    frame = 0;
    const scroller = findPageScroller(root);
    observeScroller(scroller);
    if (!scroller) return;
    const overflow = scroller.scrollHeight - scroller.clientHeight;
    if (overflow > 1) {
      onOverflow(overflow);
    }
  };

  function schedule() {
    if (frame === 0) {
      frame = requestAnimationFrame(check);
    }
  }

  const mutationObserver = new MutationObserver((mutations) => {
    // New direct children of the scroller must be size-observed too.
    if (observedScroller && mutations.some((m) => m.target === observedScroller)) {
      observedScroller = null;
    }
    schedule();
  });
  mutationObserver.observe(root, { childList: true, subtree: true });

  schedule();

  return () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
}
