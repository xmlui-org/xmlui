import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

import { injectCSS, removeCSS } from "virtual:css-injected-by-js";
import { registerCSSInjection } from "./components-core/cssInjectionRegistry";
import { CSS_LAYER_ORDER } from "./components-core/cssLayers";
import { startApp } from "./components-core/StandaloneApp";
import { activateIslands } from "./components-core/Islands/activateIslands";
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

let booted = false;

// Boots the app (or activates islands) exactly once.
//
// The guard matters as much as the readyState fallback below: re-dispatching
// DOMContentLoaded is the natural workaround for a bundle that loads late, so
// apps that already adopted it would otherwise boot twice once the fallback
// lands.
function boot() {
  if (booted) {
    return;
  }
  booted = true;

  const islandTargets = document.querySelectorAll("[data-xmlui-src]");
  if (islandTargets.length > 0) {
    activateIslands(islandTargets);
  } else {
    startApp(undefined, undefined, Xmlui);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  // The document already finished parsing, so DOMContentLoaded can never fire
  // again — waiting for it would leave the page silently blank. Any load that
  // is not parser-blocking lands here: dynamic script insertion, defer, or a
  // module with a top-level await.
  boot();
}

window.React = React;
// @ts-ignore
window.jsxRuntime = jsxRuntime;
window.ReactDOM = ReactDOM;

// Export everything from index.ts plus the standalone extension manager
const standaloneExports = { ...xmluiExports, standalone: Xmlui };
export default standaloneExports;
