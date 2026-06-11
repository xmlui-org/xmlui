import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import TestBed from "./TestBed";
import { StyleRegistry } from "../../components-core/theming/StyleRegistry";
import { queryClient } from "../../components-core/rendering/AppRoot";

const rootEl = document.getElementById("root") as HTMLElement;
const root = createRoot(rootEl);

let renderKey = 0;

// A single StyleRegistry instance shared across all TestBed renders.
// When TestBed is remounted with a new key, the new tree's StyleProvider
// (inside AppRoot) inherits this registry via the outer StyleProvider wrapper
// in TestBed. Both old and new trees therefore decrement/increment the SAME
// ref-counts, preventing the race where the old tree's deferred cleanup
// setTimeout removes style tags just injected by the new tree.
const stableStyleRegistry = new StyleRegistry();

function renderTestBed() {
  renderKey++;
  root.render(<TestBed key={renderKey} styleRegistry={stableStyleRegistry} />);
}

renderTestBed();

// Expose reinit for in-page re-rendering.
// Playwright calls this to swap test content without full page navigation.
(window as any).__XMLUI_REINIT__ = async () => {
  // The test bed reuses one browser page per worker. React Query's client is a
  // module singleton, so cached data and in-flight refetches from the previous
  // app can otherwise update the next app after a fast in-page remount.
  await queryClient.cancelQueries();
  queryClient.clear();

  // Clear stale toasts from the module-level react-hot-toast store
  // so they don't leak into the next test.
  toast.remove();

  // Snapshot the current top-level <body> nodes BEFORE the remount. React-owned
  // portals from the previous tree are removed during the flushSync unmount
  // below, so any node captured here that is STILL connected afterwards is a
  // stray element a test appended directly to document.body (e.g. SkipLink's
  // raw "Main target" button). Those leak into subsequent tests in the same
  // worker — duplicate buttons/inputs break getByRole() strict-mode locators —
  // so we remove them. New portals created by the next tree are not in this
  // set, so they are left untouched.
  const bodyNodesBefore = Array.from(document.body.childNodes);

  renderKey++;
  flushSync(() => {
    root.render(<TestBed key={renderKey} styleRegistry={stableStyleRegistry} />);
  });
  toast.remove();

  for (const node of bodyNodesBefore) {
    if (!node.isConnected || node === rootEl) {
      continue;
    }
    // Preserve the bootstrap <script> tag(s); remove everything else that
    // survived the remount (i.e. nodes React does not own).
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") {
      continue;
    }
    node.parentNode?.removeChild(node);
  }
};

(window as any).__XMLUI_READY__ = true;
