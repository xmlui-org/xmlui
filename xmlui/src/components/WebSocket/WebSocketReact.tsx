import { memo, useEffect, useRef } from "react";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";

export const defaultProps = {
  enabled: true,
  reconnect: false,
  reconnectDelayMs: 3000,
};

type Props = {
  url: string;
  enabled?: boolean;
  reconnect?: boolean;
  reconnectDelayMs?: number;
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
};

export const WebSocketConnection = memo(function WebSocketConnection({
  url,
  enabled = defaultProps.enabled,
  reconnect = defaultProps.reconnect,
  reconnectDelayMs = defaultProps.reconnectDelayMs,
  onOpen,
  onMessage,
  onError,
  onClose,
}: Props) {
  // Keep callback refs stable so the effect doesn't reconnect on every re-render
  const onOpenRef = useRef(onOpen);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onCloseRef = useRef(onClose);
  onOpenRef.current = onOpen;
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!enabled || !url) return;

    let ws: globalThis.WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      ws = new globalThis.WebSocket(url);

      ws.addEventListener("open", () => {
        pushXsLog({ kind: "ws:connect", ts: Date.now(), url });
        onOpenRef.current?.();
      });

      ws.addEventListener("message", (event) => {
        let data: any = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            // keep as string
          }
        }
        pushXsLog({ kind: "ws:message", ts: Date.now(), url });
        onMessageRef.current?.(data);
      });

      ws.addEventListener("error", (event) => {
        pushXsLog({ kind: "ws:error", ts: Date.now(), url });
        onErrorRef.current?.(event);
      });

      ws.addEventListener("close", (event) => {
        pushXsLog({ kind: "ws:close", ts: Date.now(), url, code: event.code, reason: event.reason });
        onCloseRef.current?.(event);
        if (reconnect && !cancelled) {
          reconnectTimer = setTimeout(connect, reconnectDelayMs);
        }
      });
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== null) clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, [url, enabled, reconnect, reconnectDelayMs]);

  return null;
});
