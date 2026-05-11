import ReactDOM from "react-dom/client";

import { StyleInjectionTargetContext, StyleProvider } from "../theming/StyleContext";
import StandaloneApp from "../StandaloneApp";
import StandaloneExtensionManager from "../StandaloneExtensionManager";
import { CSS_LAYER_ORDER } from "../../components/NestedApp/NestedAppReact";

export function activateIslands(targets: NodeListOf<Element>): void {
  const extensionManager = new StandaloneExtensionManager();

  targets.forEach((el) => {
    const basePath = (el as HTMLElement).dataset.xmluiSrc;
    if (!basePath) return;

    const shadowRoot = el.attachShadow({ mode: "open" });

    // CSS layer order must be declared before any other styles enter the shadow root,
    // otherwise the browser assigns cascade priority by first-appearance order which
    // can silently break theme overrides.
    const layerStyle = document.createElement("style");
    layerStyle.textContent = CSS_LAYER_ORDER;
    shadowRoot.appendChild(layerStyle);

    // ThemeReact.tsx's RootClasses looks for #nested-app-root inside the shadow root
    // to apply theme class names. Create it here so the query succeeds.
    const appRoot = document.createElement("div");
    appRoot.id = "nested-app-root";
    appRoot.style.cssText = "display:contents";
    shadowRoot.appendChild(appRoot);

    const root = ReactDOM.createRoot(appRoot);
    root.render(
      <StyleInjectionTargetContext.Provider value={shadowRoot}>
        <StyleProvider forceNew={true}>
          <StandaloneApp basePath={basePath} extensionManager={extensionManager} />
        </StyleProvider>
      </StyleInjectionTargetContext.Provider>,
    );
  });
}
