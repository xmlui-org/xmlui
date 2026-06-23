import { useEffect } from "react";

import { runEvent } from "../../runtime/rendering/bindings";
import { useBooleanProp, useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { parseMessageData } from "../EventSource/EventSource.renderer";

export const webSocketRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const url = useStringProp(node, scope, "url", "");
  const enabled = useBooleanProp(node, scope, "enabled", true);
  const reconnect = useBooleanProp(node, scope, "reconnect", false);
  const reconnectDelayMs = Number(useEvaluatedProp(node, scope, "reconnectDelayMs", 1000) ?? 1000);

  useEffect(() => {
    if (!enabled || !url) {
      return;
    }
    let socket: globalThis.WebSocket | undefined;
    let reconnectTimer: number | undefined;
    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }
      socket = new globalThis.WebSocket(url);
      socket.addEventListener("open", () => void runEvent(node.parsed?.events?.open, scope));
      socket.addEventListener("message", (event) => {
        void runEvent(node.parsed?.events?.message, scope, [parseMessageData(event.data)]);
      });
      socket.addEventListener("error", (event) => void runEvent(node.parsed?.events?.error, scope, [event]));
      socket.addEventListener("close", (event) => {
        void runEvent(node.parsed?.events?.close, scope, [event]);
        if (reconnect && !cancelled) {
          reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
        }
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [
    enabled,
    node.parsed?.events?.close,
    node.parsed?.events?.error,
    node.parsed?.events?.message,
    node.parsed?.events?.open,
    reconnect,
    reconnectDelayMs,
    scope,
    url,
  ]);

  return null;
};
