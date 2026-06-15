import { createMetadata, dDidChange } from "../metadata-helpers";
import { defaultProps } from "./ChangeListener.defaults";
import { ChangeListener } from "./ChangeListenerReact";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "ChangeListener";

export const ChangeListenerMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`ChangeListener` is an invisible component that watches for changes in values " +
    "and triggers actions in response. It's essential for creating reactive behavior " +
    "when you need to respond to data changes, state updates, or component property " +
    "modifications outside of normal event handlers.",
  props: {
    listenTo: {
      description:
        "Value to the changes of which this component listens. If this property is not set, " +
        "the `ChangeListener` is inactive.",
      valueType: "any",
    },
    listenToSources: {
      description:
        "Named values to watch as independent change sources. Use an object whose property names " +
        "identify the sources. When this property is set, it takes precedence over `listenTo` and " +
        "the `didChange` event receives source-level change details.",
      valueType: "any",
    },
    throttleWaitInMs: {
      description:
        `This property sets a throttling time (in milliseconds) to apply when executing the \`didChange\` ` +
        `event handler. All changes within that throttling time will only fire the \`didChange\` event once.`,
      valueType: "number",
      defaultValue: defaultProps.throttleWaitInMs,
    },
    debounceWaitInMs: {
      description:
        `This property sets a debounce wait time (in milliseconds) to apply when executing the \`didChange\` ` +
        `event handler. The \`didChange\` event will only fire after the listened value has been stable for ` +
        `the specified duration. This is useful for search-as-you-type scenarios where you want to wait ` +
        `until the user stops typing before firing the event. When both \`debounceWaitInMs\` and ` +
        `\`throttleWaitInMs\` are set, debounce takes precedence.`,
      valueType: "number",
      defaultValue: defaultProps.debounceWaitInMs,
    },
  },
  events: {
    didChange: {
      description:
        "This event is triggered when the value specified in `listenTo` changes, or when any value " +
        "specified in `listenToSources` changes.",
      signature: "(change: ChangeListenerChange) => void",
      parameters: {
        change:
          "An object with `prevValue` and `newValue`. When `listenToSources` is used, it also " +
          "contains `changedSources` and `changes` with source-level details.",
      },
    },
  },
});

export const changeListenerComponentRenderer = wrapComponent(
  COMP,
  ChangeListener,
  ChangeListenerMd,
  {
    stateful: false,
    events: { didChange: "onChange" },
  },
);
