import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { dDidChange } from "../metadata-helpers";
import { ChangeListener, defaultProps } from "./ChangeListenerNative";

const COMP = "ChangeListener";

export const ChangeListenerMd = createMetadata({
  description:
    `\`${COMP}\` is a functional component (it renders no UI) to trigger an action when a ` +
    `particular value (component property, state, etc.) changes.`,
  props: {
    listenTo: {
      description: `Value to the changes of which this component listens.`,
      valueType: "any",
    },
    throttleWaitInMs: {
      description: `This variable sets a throttling time (in milliseconds) to apply when executing the \`didChange\` ` +
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
