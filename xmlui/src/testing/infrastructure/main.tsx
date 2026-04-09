import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import TestBed from "./TestBed";

const rootEl = document.getElementById("root") as HTMLElement;
const root = createRoot(rootEl);

let renderKey = 0;

function renderTestBed() {
  renderKey++;
  root.render(<TestBed key={renderKey} />);
}

renderTestBed();

// Expose reinit for in-page re-rendering.
// Playwright calls this to swap test content without full page navigation.
(window as any).__XMLUI_REINIT__ = () => {
  // Clear stale toasts from the module-level react-hot-toast store
  // so they don't leak into the next test.
  toast.remove();

  // Remove dynamically-injected <style data-style-hash> tags.  The old
  // StyleRegistry's setTimeout-based cleanup can race with the new tree's
  // useInsertionEffect — the old timer may remove a <style> tag that the
  // new tree just injected (same hash, same querySelector match).  By
  // stripping all dynamic style tags before the new mount, we guarantee
  // the fresh registry re-injects everything cleanly.
  document.head
    .querySelectorAll("style[data-style-hash]")
    .forEach((el) => el.remove());

  renderKey++;
  flushSync(() => {
    root.render(<TestBed key={renderKey} />);
  });
};

(window as any).__XMLUI_READY__ = true;
