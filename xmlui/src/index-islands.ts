import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

import { startIslands } from "./components-core/StandaloneApp";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import * as xmluiExports from "./index";

const Xmlui = new StandaloneExtensionManager();

document.addEventListener('DOMContentLoaded', function() {
  startIslands( Xmlui);
});

window.React = React;
// @ts-ignore
window.jsxRuntime = jsxRuntime;
window.ReactDOM = ReactDOM;

// Export everything from index.ts plus the standalone extension manager
const standaloneExports = { ...xmluiExports, standalone: Xmlui };
export default standaloneExports;
