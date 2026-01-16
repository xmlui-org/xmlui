import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { MessageListenerNative } from "./MessageListenerNative";

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
      signature: "(data: any) => void",
      parameters: {
        data: "The data sent from the other window via postMessage.",
      },
    },
  },
});

export const messageListenerComponentRenderer = createComponentRenderer(
  COMP,
  MessageListenerMd,
  ({ node, renderChild, lookupEventHandler }) => {
    const onMessageReceived = lookupEventHandler("messageReceived");

    return (
      <MessageListenerNative onMessageReceived={onMessageReceived}>
        {renderChild(node.children)}
      </MessageListenerNative>
    );
  },
);
