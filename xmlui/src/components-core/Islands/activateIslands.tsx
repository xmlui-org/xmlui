import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";

import { StyleInjectionTargetContext, StyleProvider } from "../theming/StyleContext";
import StandaloneApp from "../StandaloneApp";
import StandaloneExtensionManager from "../StandaloneExtensionManager";
import { CSS_LAYER_ORDER } from "../cssLayers";

export interface IslandHandle {
  /** Unmount the React tree. The shadow root and its scaffolding stay in place
   * so the same target can be re-mounted via mountIsland without reattaching. */
  unmount(): void;
  /** The React root, exposed for advanced callers (e.g., testing). */
  root: Root;
}

export interface MountIslandOptions {
  /** Base path the StandaloneApp uses to fetch Main.xmlui, config.json, etc.
   * Falls back to the target's data-xmlui-src attribute. */
  basePath?: string;
  /** Share an extension manager across multiple islands. A fresh manager is
   * created when omitted. */
  extensionManager?: StandaloneExtensionManager;
}

/**
 * Mount a single XMLUI island into the given element programmatically.
 *
 * Mirrors the DOMContentLoaded scanner's per-element setup so callers that
 * need to mount islands *after* DOMContentLoaded (e.g., when basePath comes
 * from an async source) get the same behavior. Idempotent: a subsequent call
 * after unmount reuses the existing shadow root.
 */
export function mountIsland(target: Element, options: MountIslandOptions = {}): IslandHandle {
  const basePath = options.basePath ?? (target as HTMLElement).dataset.xmluiSrc;
  if (!basePath) {
    throw new Error(
      "mountIsland: basePath is required (set data-xmlui-src on the element or pass options.basePath)",
    );
  }
  const extensionManager = options.extensionManager ?? new StandaloneExtensionManager();

  let shadowRoot = target.shadowRoot;
  let appRoot: HTMLElement | null;

  if (!shadowRoot) {
    shadowRoot = target.attachShadow({ mode: "open" });

    // CSS layer order must be declared before any other styles enter the shadow root,
    // otherwise the browser assigns cascade priority by first-appearance order which
    // can silently break theme overrides.
    const layerStyle = document.createElement("style");
    layerStyle.textContent = CSS_LAYER_ORDER;
    shadowRoot.appendChild(layerStyle);

    // ThemeReact.tsx's RootClasses looks for #nested-app-root inside the shadow root
    // to apply theme class names. Create it here so the query succeeds.
    appRoot = document.createElement("div");
    appRoot.id = "nested-app-root";
    appRoot.style.cssText = "display:contents";
    shadowRoot.appendChild(appRoot);
  } else {
    appRoot = shadowRoot.querySelector<HTMLElement>("#nested-app-root");
    if (!appRoot) {
      throw new Error(
        "mountIsland: target already has a shadow root but it is missing #nested-app-root",
      );
    }
  }

  const root = ReactDOM.createRoot(appRoot);
  root.render(
    <StyleInjectionTargetContext.Provider value={shadowRoot}>
      <StyleProvider forceNew={true}>
        <StandaloneApp basePath={basePath} extensionManager={extensionManager} />
      </StyleProvider>
    </StyleInjectionTargetContext.Provider>,
  );

  return {
    root,
    unmount() {
      root.unmount();
    },
  };
}

export function activateIslands(targets: NodeListOf<Element>): void {
  const extensionManager = new StandaloneExtensionManager();
  targets.forEach((el) => {
    if (!(el as HTMLElement).dataset.xmluiSrc) return;
    mountIsland(el, { extensionManager });
  });
}
