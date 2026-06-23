import { createMetadata } from "../../component-core/metadata/helpers";

export const WebSocketMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`WebSocket` manages a WebSocket connection declaratively.",
  props: {
    url: { description: "The WebSocket URL.", valueType: "string" },
    enabled: { description: "Whether the connection is enabled.", valueType: "boolean", defaultValue: true },
    reconnect: { description: "Whether to reconnect after close.", valueType: "boolean", defaultValue: false },
    reconnectDelayMs: { description: "Delay before reconnecting.", valueType: "number", defaultValue: 1000 },
  },
  events: {
    open: { description: "Fires when the socket opens.", signature: "open(): void" },
    message: { description: "Fires when a message arrives.", signature: "message(data: any): void" },
    error: { description: "Fires when an error occurs.", signature: "error(event: Event): void" },
    close: { description: "Fires when the socket closes.", signature: "close(event: CloseEvent): void" },
  },
});
