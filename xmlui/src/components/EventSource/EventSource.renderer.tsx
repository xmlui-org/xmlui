import { useEffect } from "react";

import { runEvent } from "../../runtime/rendering/bindings";
import { useBooleanProp, useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const eventSourceRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const url = useStringProp(node, scope, "url", "");
  const enabled = useBooleanProp(node, scope, "enabled", true);
  const withCredentials = useBooleanProp(node, scope, "withCredentials", false);

  useEffect(() => {
    if (!enabled || !url) {
      return;
    }
    const source = new globalThis.EventSource(url, { withCredentials });
    const onOpen = () => void runEvent(node.parsed?.events?.open, scope);
    const onMessage = (event: MessageEvent) => {
      void runEvent(node.parsed?.events?.message, scope, [parseMessageData(event.data)]);
    };
    const onError = (event: Event) => {
      if ((source as EventSource).readyState === 2) {
        void runEvent(node.parsed?.events?.close, scope);
      } else {
        void runEvent(node.parsed?.events?.error, scope, [event]);
      }
    };

    source.addEventListener("open", onOpen);
    source.addEventListener("message", onMessage as EventListener);
    source.addEventListener("error", onError);
    source.addEventListener("close", () => void runEvent(node.parsed?.events?.close, scope));

    return () => source.close();
  }, [
    enabled,
    node.parsed?.events?.close,
    node.parsed?.events?.error,
    node.parsed?.events?.message,
    node.parsed?.events?.open,
    scope,
    url,
    withCredentials,
  ]);

  return null;
};

export function parseMessageData(data: unknown): unknown {
  if (typeof data !== "string") {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
