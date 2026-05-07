import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { Lifecycle } from "./LifecycleReact";

const COMP = "Lifecycle";

export const LifecycleMd = createMetadata({
  status: "experimental",
  nonVisual: true,
  description:
    "`Lifecycle` is a non-visual primitive that runs `onMount` once when the " +
    "component is rendered for the first time, runs `onUnmount` when it is " +
    "removed, and (when `keyValue` changes) re-arms the cycle by firing " +
    "`onUnmount` then `onMount`. It is the recommended escape hatch for " +
    "one-shot side effects that do not fit a more specific managed " +
    "component (`<Timer>`, `<DataSource>`, `<APICall>`, `<WebSocket>`, " +
    "`<EventSource>`).",
  props: {
    keyValue: {
      description:
        "When this expression's value changes, the component fires `onUnmount` " +
        "(for the previous value) and then `onMount` (for the new value). " +
        "This is the markup equivalent of a React `useEffect` with a dependency " +
        "array. Omit this prop for the simple mount/unmount-only case.",
      valueType: "any",
    },
  },
  events: {
    mount: {
      description:
        "Fires once when the component is mounted. Also fires on each `keyValue` " +
        "change after the previous `unmount` runs. May be `async` — the awaited " +
        "promise resolves outside the React commit phase.",
      signature: "(): void | Promise<void>",
      parameters: {},
    },
    unmount: {
      description:
        "Fires once when the component is unmounted, and on each `keyValue` " +
        "change before the new `mount`. Must be synchronous (React commits " +
        "unmount synchronously); use a container's `onBeforeDispose` for the " +
        "async-flush case.",
      signature: "(): void",
      parameters: {},
    },
    error: {
      description:
        "Fires when an `onMount` or `onUnmount` handler throws. Receives " +
        "`{ source: \"mount\" | \"unmount\", error: { message, stack? } }`. " +
        "When this event is declared, the global error toast for the " +
        "lifecycle phase is suppressed.",
      signature: "(payload: { source: string; error: { message: string; stack?: string } }): void",
      parameters: {
        payload: "Object containing the failing phase and the captured error.",
      },
    },
  },
});

export const lifecycleComponentRenderer = wrapComponent(COMP, Lifecycle, LifecycleMd, {
  stateful: false,
  events: {
    mount: "onMount",
    unmount: "onUnmount",
    error: "onError",
  },
  customRender: (_props, { node, extractValue, lookupEventHandler }) => (
    <Lifecycle
      keyValue={extractValue(node.props.keyValue)}
      onMount={lookupEventHandler("mount")}
      onUnmount={lookupEventHandler("unmount")}
      onError={lookupEventHandler("error")}
    />
  ),
});
