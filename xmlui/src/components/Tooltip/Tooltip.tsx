import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Tooltip } from "./TooltipNative";
import type { TooltipProps } from "./TooltipNative";
import styles from "./Tooltip.module.scss";

const COMP = "Tooltip";

export const TooltipMd = createMetadata({
  status: "stable",
  description: "A tooltip component that displays text when hovering over trigger content.",
  props: {
    text: {
      description: "The text content to display in the tooltip",
      type: "string",
      isRequired: false,
    },
    markdown: {
      description: "The markdown content to display in the tooltip",
      type: "string",
      isRequired: false,
    },
    tooltipTemplate: {
      description: "The template for the tooltip content",
      type: "Component",
      isRequired: false,
    },
    delayDuration: {
      description:
        "The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms)",
      type: "number",
      defaultValue: 700,
    },
    skipDelayDuration: {
      description:
        "How much time a user has to enter another trigger without incurring a delay again (in ms)",
      type: "number",
      defaultValue: 300,
    },
    defaultOpen: {
      description: "The open state of the tooltip when it is initially rendered",
      type: "boolean",
      defaultValue: false,
    },
    showArrow: {
      description: "Whether to show the arrow pointing to the trigger element",
      type: "boolean",
      defaultValue: false,
    },
    side: {
      description: "The preferred side of the trigger to render against when open",
      type: "string",
      availableValues: ["top", "right", "bottom", "left"],
      defaultValue: "top",
    },
    align: {
      description: "The preferred alignment against the trigger",
      type: "string",
      availableValues: ["start", "center", "end"],
      defaultValue: "center",
    },
    sideOffset: {
      description: "The distance in pixels from the trigger",
      type: "number",
      defaultValue: 4,
    },
    alignOffset: {
      description: "An offset in pixels from the 'start' or 'end' alignment options",
      type: "number",
      defaultValue: 0,
    },
    avoidCollisions: {
      description:
        "When true, overrides the side and align preferences to prevent collisions with boundary edges",
      type: "boolean",
      defaultValue: true,
    },
  },
  events: {},
  apis: {},
  contextVars: {},
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`border-${COMP}`]: "none",
    [`textColor-${COMP}`]: "$textcolor-primary",
    [`borderRadius-${COMP}`]: "4px",
    [`fontSize-${COMP}`]: "15px",
    [`lineHeight-${COMP}`]: "1",
    [`paddingTop-${COMP}`]: "10px",
    [`paddingBottom-${COMP}`]: "10px",
    [`paddingLeft-${COMP}`]: "15px",
    [`paddingRight-${COMP}`]: "15px",
    [`boxShadow-${COMP}`]:
      "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
    [`fill-arrow-${COMP}`]: "$color-surface-200",
    [`stroke-arrow-${COMP}`]: "$color-surface-200",
    [`strokeWidth-arrow-${COMP}`]: "0",
    [`animationDuration-${COMP}`]: "400ms",
    [`animation-${COMP}`]: "cubic-bezier(0.16, 1, 0.3, 1)",
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-200",
    },
  },
});

export const tooltipComponentRenderer = createComponentRenderer(
  "Tooltip",
  TooltipMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    // If there are no children, do not render anything
    if (!node.children || node.children.length === 0) {
      return null;
    }

    // If text is not provided, do not render anything
    const text = extractValue.asOptionalString(node.props.text);
    const markdown = extractValue.asOptionalString(node.props.markdown);
    const tooltipTemplate = node.props.tooltipTemplate;

    return (
      <Tooltip
        text={text}
        markdown={markdown}
        tooltipTemplate={renderChild(tooltipTemplate)}
        delayDuration={extractValue.asOptionalNumber(node.props.delayDuration)}
        skipDelayDuration={extractValue.asOptionalNumber(node.props.skipDelayDuration)}
        defaultOpen={extractValue.asOptionalBoolean(node.props.defaultOpen)}
        showArrow={extractValue.asOptionalBoolean(node.props.showArrow)}
        side={extractValue.asOptionalString(node.props.side) as TooltipProps["side"]}
        align={extractValue.asOptionalString(node.props.align) as TooltipProps["align"]}
        sideOffset={extractValue.asOptionalNumber(node.props.sideOffset)}
        alignOffset={extractValue.asOptionalNumber(node.props.alignOffset)}
        avoidCollisions={extractValue.asOptionalBoolean(node.props.avoidCollisions)}
      >
        {renderChild(node.children, layoutContext)}
      </Tooltip>
    );
  },
);
