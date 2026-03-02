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
// Expose Xmlui globally so component chunks can self-register via registerExtension
// @ts-ignore
window.Xmlui = Xmlui;
// Expose xmlui module exports so extension packages can resolve `import ... from "xmlui"`.
// Also attach `standalone` (the extension manager) so the UMD auto-registration footer
// (`window.xmlui.standalone.registerExtension(...)`) works.
// @ts-ignore
window.xmlui = { ...xmluiExports, standalone: Xmlui };