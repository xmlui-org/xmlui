import { memo, useEffect, useRef } from "react";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";

export const defaultProps = {
  enabled: true,
  withCredentials: false,
};

type Props = {
  url: string;
  enabled?: boolean;
  withCredentials?: boolean;
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  onClose?: () => void;
};

export const EventSourceConnection = memo(function EventSourceConnection({
  url,
  enabled = defaultProps.enabled,
  withCredentials = defaultProps.withCredentials,
  onOpen,
  onMessage,
  onError,
  onClose,
}: Props) {
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

    const es = new globalThis.EventSource(url, { withCredentials });

    es.addEventListener("open", () => {
      pushXsLog({ kind: "eventsource:connect", ts: Date.now(), url });
      onOpenRef.current?.();
    });

    es.addEventListener("message", (event: MessageEvent) => {
      let data: any = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // keep as string
        }
      }
      pushXsLog({ kind: "eventsource:message", ts: Date.now(), url });
      onMessageRef.current?.(data);
    });

    es.addEventListener("error", (event: Event) => {
      const readyState = (es as any).readyState;
      if (readyState === 2 /* CLOSED */) {
        pushXsLog({ kind: "eventsource:close", ts: Date.now(), url });
        onCloseRef.current?.();
      } else {
        pushXsLog({ kind: "eventsource:error", ts: Date.now(), url });
        onErrorRef.current?.(event);
      }
    });

    return () => {
      es.close();
    };
  }, [url, enabled, withCredentials]);

  return null;
});
