import { createComponentRenderer, createMetadata } from "xmlui";
import { ViewPageSource, defaultProps } from "./ViewPageSourceNative";

const ViewPageSourceMd = createMetadata({
  description:
    "`ViewPageSource` displays a button that shows the source code of the current page component.",
  status: "experimental",
  props: {
    label: {
      description: "The label text for the button.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.label,
    },
    icon: {
      description: "The icon to display on the button.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.icon,
    },
    variant: {
      description: "The button variant style.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.variant,
    },
    size: {
      description: "The button size.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.size,
    },
  },
  events: {
    onClick: {
      description: "Triggered when the button is clicked.",
      type: "function",
    },
  },
});

export const viewPageSourceComponentRenderer = createComponentRenderer(
  "ViewPageSource",
  ViewPageSourceMd,

  ({ node, extractValue, lookupEventHandler, className }) => {
    return (
      <ViewPageSource
        label={extractValue.asOptionalString(node.props?.label)}
        icon={extractValue.asOptionalString(node.props?.icon)}
        variant={extractValue.asOptionalString(node.props?.variant)}
        size={extractValue.asOptionalString(node.props?.size)}
        onClick={lookupEventHandler("onClick")}
        className={className}
      />
    );
  },
);
