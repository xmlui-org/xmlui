import { createMetadata } from "../../component-core/metadata/helpers";

export const MessageListenerMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`MessageListener` listens for messages sent with `window.postMessage` and renders its children without a wrapper.",
  events: {
    messageReceived: {
      description: "Fires when a window message is received.",
      signature: "messageReceived(data: any, event: MessageEvent): void",
    },
  },
});
