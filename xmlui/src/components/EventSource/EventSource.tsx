import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { EventSourceConnection, defaultProps } from "./EventSourceReact";

const COMP = "EventSource";

export const EventSourceMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`EventSource` is a non-visual component that manages a Server-Sent Events (SSE) " +
    "connection declaratively. The connection opens when the component mounts (or when " +
    "`enabled` changes to `true`) and is automatically closed when the component unmounts. " +
    "Use this component instead of the banned raw `EventSource` constructor to satisfy the " +
    "DOM-API sandbox.",
  props: {
    url: {
      description: "The SSE endpoint URL to connect to.",
      valueType: "string",
    },
    enabled: {
      description: "When `false` the connection is not opened.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    withCredentials: {
      description:
        "When `true`, CORS requests are sent with credentials (cookies, HTTP authentication).",
      valueType: "boolean",
      defaultValue: defaultProps.withCredentials,
    },
  },
  events: {
    open: {
      description: "Fires when the SSE connection is established.",
      signature: "(): void",
      parameters: {},
    },
    message: {
      description:
        "Fires when a server-sent message arrives. JSON payloads are pre-parsed and passed " +
        "as objects; plain strings are passed as-is.",
      signature: "(data: any) => void",
      parameters: {
        data: "The parsed message payload.",
      },
    },
    error: {
      description: "Fires when the connection encounters an error (but remains open for retry).",
      signature: "(event: Event) => void",
      parameters: {
        event: "The native EventSource error event.",
      },
    },
    close: {
      description: "Fires when the SSE connection is permanently closed (ReadyState CLOSED).",
      signature: "(): void",
      parameters: {},
    },
  },
});

export const eventSourceComponentRenderer = wrapComponent(COMP, EventSourceConnection, EventSourceMd, {
  stateful: false,
  events: {
    open: "onOpen",
    message: "onMessage",
    error: "onError",
    close: "onClose",
  },
  customRender: (_props, { node, extractValue, lookupEventHandler }) => (
    <EventSourceConnection
      url={extractValue.asOptionalString(node.props.url) ?? ""}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      withCredentials={extractValue.asOptionalBoolean(node.props.withCredentials)}
      onOpen={lookupEventHandler("open")}
      onMessage={lookupEventHandler("message")}
      onError={lookupEventHandler("error")}
      onClose={lookupEventHandler("close")}
    />
  ),
});
