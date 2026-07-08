import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { Tooltip } from "./TooltipReact";
import type { TooltipProps } from "./TooltipReact";
export { parseTooltipOptions } from "./TooltipReact";
import { defaultProps } from "./Tooltip.defaults";
import styles from "./Tooltip.module.scss";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "Tooltip";

export const TooltipMd = createMetadata({
  status: "stable",
  description: "A tooltip component that displays text when hovering over trigger content.",
  props: {
    text: {
      description: "The text content to display in the tooltip",
      valueType: "string",
      isRequired: false,
    },
    markdown: {
      description: "The markdown content to display in the tooltip",
      valueType: "string",
      isRequired: false,
    },
    tooltipTemplate: {
      description: "The template for the tooltip content",
      valueType: "ComponentDef",
      isRequired: false,
    },
    delayDuration: {
      description:
        "The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms)",
      valueType: "number",
      defaultValue: defaultProps.delayDuration,
    },
    skipDelayDuration: {
      description:
        "How much time a user has to enter another trigger without incurring a delay again (in ms)",
      valueType: "number",
      defaultValue: defaultProps.skipDelayDuration,
    },
    defaultOpen: {
      description: "The open state of the tooltip when it is initially rendered",
      valueType: "boolean",
      defaultValue: defaultProps.defaultOpen,
    },
    showArrow: {
      description: "Whether to show the arrow pointing to the trigger element",
      valueType: "boolean",
      defaultValue: defaultProps.showArrow,
    },
    side: {
      description: "The preferred side of the trigger to render against when open",
      valueType: "string",
      availableValues: ["top", "right", "bottom", "left"],
      isStrictEnum: true,
      defaultValue: defaultProps.side,
    },
    align: {
      description: "The preferred alignment against the trigger",
      valueType: "string",
      availableValues: ["start", "center", "end"],
      isStrictEnum: true,
      defaultValue: defaultProps.align,
    },
    sideOffset: {
      description: "The distance in pixels from the trigger",
      valueType: "number",
      defaultValue: defaultProps.sideOffset,
    },
    alignOffset: {
      description: "An offset in pixels from the 'start' or 'end' alignment options",
      valueType: "number",
      defaultValue: defaultProps.alignOffset,
    },
    avoidCollisions: {
      description:
        "When true, overrides the side and align preferences to prevent collisions with boundary edges",
      valueType: "boolean",
      defaultValue: defaultProps.avoidCollisions,
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
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderRadius-${COMP}`]: "0.25em",
    [`fontSize-${COMP}`]: "1em",
    [`lineHeight-${COMP}`]: "1",
    [`paddingTop-${COMP}`]: "0.625em",
    [`paddingBottom-${COMP}`]: "0.625em",
    [`paddingLeft-${COMP}`]: "0.9375em",
    [`paddingRight-${COMP}`]: "0.9375em",
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

type ThemedTooltipProps = React.ComponentProps<typeof Tooltip> & { className?: string };
export const ThemedTooltip = React.forwardRef<HTMLDivElement, ThemedTooltipProps>(
  function ThemedTooltip({ className, ...props }: ThemedTooltipProps, ref) {
    const themeClass = useComponentThemeClass(TooltipMd);
    return <Tooltip {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />;
  },
);

export const tooltipComponentRenderer = wrapComponent(
  "Tooltip",
  Tooltip,
  TooltipMd,
  {
    exclude: [
      "text", "markdown", "tooltipTemplate", "delayDuration", "skipDelayDuration",
      "defaultOpen", "showArrow", "side", "align", "sideOffset", "alignOffset", "avoidCollisions",
    ],
    customRender(_props, { node, extractValue, renderChild, layoutContext, classes }) {
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
          classes={classes}
        >
          {renderChild(node.children, layoutContext)}
        </Tooltip>
      );
    },
  },
);

export const tooltipRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: TooltipMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const tooltipTemplate = adapter.renderTemplate("tooltipTemplate");
    const hasTooltipTemplate = adapter.node.children.some(
      (child) =>
        child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "tooltipTemplate",
    );
    const children = adapter.node.children.filter(
      (child) => !(child.kind === "element" && child.type === "property"),
    );

    const trigger = normalizeTooltipTrigger(adapter.renderChildren(children));

    return (
      <Tooltip
        text={adapter.stringProp("text") ?? ""}
        markdown={adapter.stringProp("markdown")}
        tooltipTemplate={hasTooltipTemplate ? tooltipTemplate : undefined}
        delayDuration={adapter.numberProp("delayDuration", defaultProps.delayDuration)}
        skipDelayDuration={adapter.numberProp("skipDelayDuration", defaultProps.skipDelayDuration)}
        defaultOpen={adapter.booleanProp("defaultOpen", defaultProps.defaultOpen)}
        showArrow={adapter.booleanProp("showArrow", defaultProps.showArrow)}
        side={adapter.stringProp("side", defaultProps.side) as TooltipProps["side"]}
        align={adapter.stringProp("align", defaultProps.align) as TooltipProps["align"]}
        sideOffset={adapter.numberProp("sideOffset", defaultProps.sideOffset)}
        alignOffset={adapter.numberProp("alignOffset", defaultProps.alignOffset)}
        avoidCollisions={adapter.booleanProp("avoidCollisions", defaultProps.avoidCollisions)}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      >
        {trigger}
      </Tooltip>
    );
  },
});

function normalizeTooltipTrigger(children: React.ReactNode): React.ReactElement {
  const childArray = React.Children.toArray(children);
  if (
    childArray.length === 1 &&
    React.isValidElement(childArray[0]) &&
    childArray[0].type !== React.Fragment
  ) {
    return childArray[0];
  }
  return <span style={{ display: "inline-flex" }}>{children}</span>;
}
