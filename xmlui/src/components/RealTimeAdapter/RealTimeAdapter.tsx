import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { RealTimeAdapter } from "./RealTimeAdapterNative";

const COMP = "RealTimeAdapter";

export const RealTimeAdapterMd = createMetadata({
  status: "experimental",
  description: `\`${COMP}\` is a non-visual component that listens to real-time events through long-polling.`,
  props: {
    url: d(`This property specifies the URL to use for long-polling.`),
  },
  events: {
    eventArrived: d(`This event is raised when data arrives from the backend using long-polling.`),
  },
});

export const realTimeAdapterComponentRenderer = createComponentRenderer(
  COMP,
  RealTimeAdapterMd,
  ({ node, lookupEventHandler, extractValue }) => {
    return (
      <RealTimeAdapter
        url={extractValue(node.props.url)}
        onEvent={lookupEventHandler("eventArrived")}
      />
    );
  },
);
