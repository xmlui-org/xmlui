import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { ChangeListener } from "./ChangeListenerNative";
import { dDidChange } from "@components/metadata-helpers";

const COMP = "ChangeListener";

export const ChangeListenerMd = createMetadata({
  description:
    `\`${COMP}\` is a functional component (it renders no UI) to trigger an action when a ` +
    `particular value (component property, state, etc.) changes.`,
  props: {
    listenTo: d(`Value to the changes of which this component listens`),
    throttleWaitInMs: d(
      `This variable sets a throttling time (in milliseconds) to apply when executing the \`didChange\` ` +
        `event handler. All changes within that throttling time will only fire the \`didChange\` event once.`,
    ),
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
