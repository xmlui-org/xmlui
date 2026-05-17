import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

import { injectCSS, removeCSS } from "virtual:css-injected-by-js";
import { registerCSSInjection } from "./components-core/cssInjectionRegistry";
import { CSS_LAYER_ORDER } from "./components-core/cssLayers";
import { startApp } from "./components-core/StandaloneApp";
import { activateIslands, mountIsland } from "./components-core/Islands/activateIslands";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import * as xmluiExports from "./index";

const CSS_LAYER_ORDER_STYLE_ID = "xmlui-css-layer-order";

function ensureCssLayerOrder() {
  if (typeof document === "undefined" || document.getElementById(CSS_LAYER_ORDER_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = CSS_LAYER_ORDER_STYLE_ID;
  style.textContent = CSS_LAYER_ORDER;
  document.head.insertBefore(style, document.head.firstChild);
}

ensureCssLayerOrder();
registerCSSInjection({ injectCSS, removeCSS });

const Xmlui = new StandaloneExtensionManager();

document.addEventListener("DOMContentLoaded", function () {
  const islandTargets = document.querySelectorAll("[data-xmlui-src]");
  if (islandTargets.length > 0) {
    activateIslands(islandTargets);
  } else {
    startApp(undefined, undefined, Xmlui);
  }
});

window.React = React;
// @ts-ignore
window.jsxRuntime = jsxRuntime;
window.ReactDOM = ReactDOM;

// Export everything from index.ts plus the standalone extension manager
// and the programmatic island mount API.
const standaloneExports = { ...xmluiExports, standalone: Xmlui, mountIsland };
export default standaloneExports;
