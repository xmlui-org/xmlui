import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

import { injectCSS, removeCSS } from "virtual:css-injected-by-js";
import { registerCSSInjection } from "./components-core/cssInjectionRegistry";
import { startApp } from "./components-core/StandaloneApp";
import { activateIslands } from "./components-core/Islands/activateIslands";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import * as xmluiExports from "./index";

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
const standaloneExports = { ...xmluiExports, standalone: Xmlui };
export default standaloneExports;