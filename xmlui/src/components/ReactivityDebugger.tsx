import React, { useRef } from "react";

const ReactivityDebugger = (props: any) => {
  const logReactivity = typeof window !== 'undefined' && (window as any).logReactivity;
  const renderCount = useRef(0);
  renderCount.current++;
  
  const id = props.id || 'unnamed';
  const type = 'ReactivityDebugger';
  
  // Enable logging when this component is rendered
  if (typeof window !== 'undefined') {
    (window as any).logReactivity = true;
  }
  
  if (logReactivity) {
    console.log(`[${type}] id:${id} - Logging Enabled - Renders: ${renderCount.current}`);
    return `[${type}] id:${id} - Logging Enabled - Renders: ${renderCount.current}`;
  } else {
    return `[${type}] id:${id} - Logging Disabled - Renders: ${renderCount.current}`;
  }
};

export const reactivityDebuggerComponentRenderer = {
  type: "ReactivityDebugger",
  renderer: ReactivityDebugger,
};