import { startApp } from "@components-core/StandaloneApp";
import StandaloneComponentManager from "./StandaloneComponentManager";
import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";

const Xmlui = new StandaloneComponentManager();

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
export default Xmlui;