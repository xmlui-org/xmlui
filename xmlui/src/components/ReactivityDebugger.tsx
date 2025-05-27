import React from "react";

const ReactivityDebugger = () => {
  const logReactivity = typeof window !== 'undefined' && (window as any).logReactivity;
  
  if (logReactivity) {
    return "Reactivity Debug Active - Logging Enabled";
  } else {
    return "Reactivity Debug Active - Logging Disabled";
  }
};

export const reactivityDebuggerComponentRenderer = {
  type: "ReactivityDebugger",
  renderer: ReactivityDebugger,
};