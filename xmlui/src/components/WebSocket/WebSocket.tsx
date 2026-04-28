import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { WebSocketConnection, defaultProps } from "./WebSocketReact";

const COMP = "WebSocket";

export const WebSocketMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`WebSocket` is a non-visual component that manages a WebSocket connection " +
    "declaratively. The connection opens when the component mounts (or when `enabled` " +
    "changes to `true`) and closes when it unmounts. Optionally reconnects after " +
    "a configurable delay. Use this component instead of the banned raw `WebSocket` " +
    "constructor to satisfy the DOM-API sandbox.",
  props: {
    url: {
      description: "The WebSocket server URL (`ws://` or `wss://`).",
      valueType: "string",
    },
    enabled: {
      description: "When `false` the connection is not opened. Changing this prop opens or closes the socket.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    reconnect: {
      description: "When `true`, the component automatically reconnects after the connection closes.",
      valueType: "boolean",
      defaultValue: defaultProps.reconnect,
    },
    reconnectDelayMs: {
      description: "Milliseconds to wait before attempting to reconnect when `reconnect` is `true`.",
      valueType: "number",
      defaultValue: defaultProps.reconnectDelayMs,
    },
  },
  events: {
    open: {
      description: "Fires when the WebSocket connection is established.",
      signature: "(): void",
      parameters: {},
    },
    message: {
      description:
        "Fires when a message is received. If the payload is a JSON string it is pre-parsed " +
        "and passed as an object; otherwise the raw string is passed.",
      signature: "(data: any) => void",
      parameters: {
        data: "The received message payload (parsed from JSON if possible).",
      },
    },
    error: {
      description: "Fires when a connection error occurs.",
      signature: "(event: Event) => void",
      parameters: {
        event: "The native WebSocket error event.",
      },
    },
    close: {
      description: "Fires when the connection is closed.",
      signature: "(event: CloseEvent) => void",
      parameters: {
        event: "The native WebSocket close event.",
      },
    },
  },
});

export const webSocketComponentRenderer = wrapComponent(COMP, WebSocketConnection, WebSocketMd, {
  stateful: false,
  events: {
    open: "onOpen",
    message: "onMessage",
    error: "onError",
    close: "onClose",
  },
  customRender: (_props, { node, extractValue, lookupEventHandler }) => (
    <WebSocketConnection
      url={extractValue.asOptionalString(node.props.url) ?? ""}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      reconnect={extractValue.asOptionalBoolean(node.props.reconnect)}
      reconnectDelayMs={extractValue.asOptionalNumber(node.props.reconnectDelayMs)}
      onOpen={lookupEventHandler("open")}
      onMessage={lookupEventHandler("message")}
      onError={lookupEventHandler("error")}
      onClose={lookupEventHandler("close")}
    />
  ),
});
