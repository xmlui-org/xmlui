import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

import { startApp } from "./components-core/StandaloneApp";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import * as xmluiExports from "./index";

const Xmlui = new StandaloneExtensionManager();

document.addEventListener('DOMContentLoaded', function() {
  if(!document.getElementById("root")){
    // Your existing code unmodified...
    const div = document.createElement('div');
    div.id = 'root';
    document.getElementsByTagName('body')[0].appendChild(div);
  }
  startApp(undefined, undefined, Xmlui);
});

window.React = React;
// @ts-ignore
window.jsxRuntime = jsxRuntime;
window.ReactDOM = ReactDOM;

// Export everything from index.ts plus the standalone extension manager
const standaloneExports = { ...xmluiExports, standalone: Xmlui };
export default standaloneExports;