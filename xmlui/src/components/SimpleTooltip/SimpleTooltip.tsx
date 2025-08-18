import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { SimpleTooltip, defaultProps } from "./SimpleTooltipNative";
import type { SimpleTooltipProps } from "./SimpleTooltipNative";

const COMP = "SimpleTooltip";

export const SimpleTooltipMd = createMetadata({
  status: "stable",
  description: "A simple tooltip component that displays text when hovering over trigger content.",
  props: {
    text: {
      description: "The text content to display in the tooltip",
      type: "string",
      isRequired: true,
    },
    delayDuration: {
      description: "The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms)",
      type: "number",
      defaultValue: defaultProps.delayDuration,
    },
    skipDelayDuration: {
      description: "How much time a user has to enter another trigger without incurring a delay again (in ms)",
      type: "number",
      defaultValue: defaultProps.skipDelayDuration,
    },
    defaultOpen: {
      description: "The open state of the tooltip when it is initially rendered",
      type: "boolean",
      defaultValue: defaultProps.defaultOpen,
    },
    showArrow: {
      description: "Whether to show the arrow pointing to the trigger element",
      type: "boolean",
      defaultValue: defaultProps.showArrow,
    },
    side: {
      description: "The preferred side of the trigger to render against when open",
      type: "string",
      availableValues: ["top", "right", "bottom", "left"],
      defaultValue: defaultProps.side,
    },
    align: {
      description: "The preferred alignment against the trigger",
      type: "string",
      availableValues: ["start", "center", "end"],
      defaultValue: defaultProps.align,
    },
    sideOffset: {
      description: "The distance in pixels from the trigger",
      type: "number",
      defaultValue: defaultProps.sideOffset,
    },
    alignOffset: {
      description: "An offset in pixels from the 'start' or 'end' alignment options",
      type: "number",
      defaultValue: defaultProps.alignOffset,
    },
    avoidCollisions: {
      description: "When true, overrides the side and align preferences to prevent collisions with boundary edges",
      type: "boolean",
      defaultValue: defaultProps.avoidCollisions,
    },
  },
  events: {},
  apis: {},
  contextVars: {},
});

export const simpleTooltipComponentRenderer = createComponentRenderer(
  "SimpleTooltip",
  SimpleTooltipMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    // If there are no children, do not render anything
    if (!node.children || node.children.length === 0) {
      return null;
    }

    // Extract all prop values
    const text = extractValue.asOptionalString(node.props.text);
    const delayDuration = extractValue.asOptionalNumber(node.props.delayDuration, defaultProps.delayDuration);
    const skipDelayDuration = extractValue.asOptionalNumber(node.props.skipDelayDuration, defaultProps.skipDelayDuration);
    const defaultOpen = extractValue.asOptionalBoolean(node.props.defaultOpen, defaultProps.defaultOpen);
    const showArrow = extractValue.asOptionalBoolean(node.props.showArrow, defaultProps.showArrow);
    const side = extractValue.asOptionalString(node.props.side, defaultProps.side) as SimpleTooltipProps["side"];
    const align = extractValue.asOptionalString(node.props.align, defaultProps.align) as SimpleTooltipProps["align"];
    const sideOffset = extractValue.asOptionalNumber(node.props.sideOffset, defaultProps.sideOffset);
    const alignOffset = extractValue.asOptionalNumber(node.props.alignOffset, defaultProps.alignOffset);
    const avoidCollisions = extractValue.asOptionalBoolean(node.props.avoidCollisions, defaultProps.avoidCollisions);

    // If text is not provided, do not render anything
    if (!text) {
      return null;
    }

    // Use the first child as the tooltip trigger and ignore the other children
    const triggerChild = node.children[0];

    return (
      <SimpleTooltip
        text={text}
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        defaultOpen={defaultOpen}
        showArrow={showArrow}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
      >
        {renderChild(triggerChild, layoutContext)}
      </SimpleTooltip>
    );
  },
);
