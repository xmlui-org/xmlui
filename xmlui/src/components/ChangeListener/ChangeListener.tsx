import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, dDidChange } from "../metadata-helpers";
import { ChangeListener, defaultProps } from "./ChangeListenerNative";

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
    throttleWaitInMs: {
      description:
        `This variable sets a throttling time (in milliseconds) to apply when executing the \`didChange\` ` +
        `event handler. All changes within that throttling time will only fire the \`didChange\` event once.`,
      valueType: "number",
      defaultValue: defaultProps.throttleWaitInMs,
    },
  },
  events: {
    didChange: dDidChange(COMP),
  },
});

export const changeListenerComponentRenderer = createComponentRenderer(
  COMP,
  ChangeListenerMd,
  ({ node, lookupEventHandler, extractValue }) => {
    return (
      <ChangeListener
        listenTo={extractValue(node.props.listenTo)}
        throttleWaitInMs={extractValue(node.props.throttleWaitInMs)}
        onChange={lookupEventHandler("didChange")}
      />
    );
  },
);
