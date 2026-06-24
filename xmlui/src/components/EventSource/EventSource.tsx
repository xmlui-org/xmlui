import { createMetadata } from "../../component-core/metadata/helpers";

export const EventSourceMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`EventSource` manages a Server-Sent Events connection declaratively.",
  props: {
    url: { description: "The SSE endpoint URL.", valueType: "string" },
    enabled: { description: "Whether the connection is enabled.", valueType: "boolean", defaultValue: true },
    withCredentials: { description: "Whether credentials are sent with the request.", valueType: "boolean", defaultValue: false },
  },
  events: {
    open: { description: "Fires when the connection opens.", signature: "open(): void" },
    message: { description: "Fires when a message arrives.", signature: "message(data: any): void" },
    error: { description: "Fires when a non-closing error occurs.", signature: "error(event: Event): void" },
    close: { description: "Fires when the connection closes permanently.", signature: "close(): void" },
  },
});
