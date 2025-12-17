import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { RealTimeAdapter, defaultProps } from "./RealTimeAdapterNative";

const COMP = "RealTimeAdapter";

export const RealTimeAdapterMd = createMetadata({
  status: "experimental",
  description: "`RealTimeAdapter` is a non-visual component that listens to real-time events.",
  props: {
    url: {
      description: `This property specifies the URL to use for long-polling.`,
      defaultValue: defaultProps.url,
    },
  },
  events: {
    eventArrived: {
      description: `This event is raised when data arrives from the backend using long-polling.`,
      signature: "eventArrived(data: any): void",
      parameters: {
        data: "The data received from the backend.",
      },
    },
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
