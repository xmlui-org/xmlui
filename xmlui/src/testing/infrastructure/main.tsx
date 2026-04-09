import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import TestBed from "./TestBed";
import { StyleRegistry } from "../../components-core/theming/StyleRegistry";

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
(window as any).__XMLUI_REINIT__ = () => {
  // Clear stale toasts from the module-level react-hot-toast store
  // so they don't leak into the next test.
  toast.remove();

  renderKey++;
  flushSync(() => {
    root.render(<TestBed key={renderKey} styleRegistry={stableStyleRegistry} />);
  });
};

(window as any).__XMLUI_READY__ = true;

