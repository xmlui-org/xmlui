import { useEffect } from "react";

import { runEvent } from "../../runtime/rendering/bindings";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const messageListenerRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      void runEvent(node.parsed?.events?.messageReceived, scope, [event.data, event]);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [node.parsed?.events?.messageReceived, scope]);

  return <>{context.renderChildren(node.children, scope)}</>;
};
