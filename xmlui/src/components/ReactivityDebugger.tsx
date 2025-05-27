import React, { useRef } from "react";

const ReactivityDebugger = (props: any) => {
  const logReactivity = typeof window !== 'undefined' && (window as any).logReactivity;
  const renderCount = useRef(0);
  renderCount.current++;
  
  const id = props.id || 'unnamed';
  const type = 'ReactivityDebugger';
  
  if (logReactivity) {
    return `[${type}] id:${id} - Logging Enabled - Renders: ${renderCount.current}`;
  } else {
    return `[${type}] id:${id} - Logging Disabled - Renders: ${renderCount.current}`;
  }
};

export const reactivityDebuggerComponentRenderer = {
  type: "ReactivityDebugger",
  renderer: ReactivityDebugger,
};