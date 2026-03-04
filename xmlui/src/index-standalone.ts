import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

import { startApp, startAppIsolated } from "./components-core/StandaloneApp";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import * as xmluiExports from "./index";

const Xmlui = new StandaloneExtensionManager();

// Hide XMLUI's injected styles immediately to prevent flash of restyled content.
// Check for data-shadow on existing root OR on a <script> tag with data-shadow.
// This runs at module init time, before DOMContentLoaded.
function hideXmluiStyles() {
  Array.from(document.head.querySelectorAll("style")).forEach((el) => {
    const text = el.textContent || "";
    if (text.includes("@layer reset") || text.includes("--xmlui-")) {
      (el as HTMLElement).setAttribute("media", "not all");
    }
  });
}
const earlyRoot = document.getElementById("root");
if (earlyRoot?.hasAttribute("data-shadow")) {
  hideXmluiStyles();
} else if (document.currentScript?.parentElement?.hasAttribute("data-shadow")) {
  // Script is inside the root div
  hideXmluiStyles();
}

document.addEventListener('DOMContentLoaded', function() {
  if(!document.getElementById("root")){
    const div = document.createElement('div');
    div.id = 'root';
    document.getElementsByTagName('body')[0].appendChild(div);
  }
  const rootEl = document.getElementById("root");
  if (rootEl?.hasAttribute("data-shadow")) {
    startAppIsolated(undefined, undefined, Xmlui);
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