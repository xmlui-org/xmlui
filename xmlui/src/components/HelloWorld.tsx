import React from "react";
import { createComponentRenderer } from "../components-core/renderers";

export const reactivityDebuggerComponentRenderer = createComponentRenderer(
  "ReactivityDebugger",
  undefined,
  () => <div>Reactivity Debugger</div>
);
