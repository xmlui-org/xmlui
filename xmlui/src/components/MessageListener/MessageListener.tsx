import { wrapComponent } from "../../components-core/wrapComponent";
import { useCallback } from "react";
import { createMetadata } from "../metadata-helpers";
import { MessageListenerReact } from "./MessageListenerReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "MessageListener";

export const MessageListenerMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "The `MessageListener` component listens for messages sent via the window.postMessage API " +
    "from other windows or iframes. It does not render any UI of its own and passes through " +
    "its children without adding wrapper elements, making it ideal for adding message listening " +
    "capabilities without disrupting layout.",
  props: {},
  events: {
    messageReceived: {
      description: `This event fires when the \`${COMP}\` component receives a message from another window or iframe via the window.postMessage API.`,
      signature: "(data: any, event: MessageEvent<any>) => void",
      parameters: {
        data: "The data sent from the other window via postMessage.",
        event: "The MessageEvent object containing the message and additional metadata.",
      },
    },
  },
});

export const messageListenerComponentRenderer = wrapComponent(COMP, MessageListenerReact, MessageListenerMd, {});

export const messageListenerRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: MessageListenerMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const messageReceived = adapter.event("messageReceived");
    const onMessageReceived = useCallback((data: any, event: MessageEvent<any>) => {
      queueMicrotask(() => {
        void messageReceived(data, event);
      });
    }, [messageReceived]);

    return (
      <MessageListenerReact onMessageReceived={onMessageReceived}>
        {adapter.renderChildren()}
      </MessageListenerReact>
    );
  },
});
