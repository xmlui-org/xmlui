import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Tooltip.defaults";
import { TooltipComponent } from "./TooltipReact";

const COMP = "Tooltip";
const tooltipStylesSource = `
  createThemeVar("padding-Tooltip");
  createThemeVar("paddingTop-Tooltip");
  createThemeVar("paddingRight-Tooltip");
  createThemeVar("paddingBottom-Tooltip");
  createThemeVar("paddingLeft-Tooltip");
  createThemeVar("border-Tooltip");
  createThemeVar("borderRadius-Tooltip");
  createThemeVar("backgroundColor-Tooltip");
  createThemeVar("textColor-Tooltip");
  createThemeVar("fontSize-Tooltip");
  createThemeVar("lineHeight-Tooltip");
  createThemeVar("boxShadow-Tooltip");
  createThemeVar("fill-arrow-Tooltip");
  createThemeVar("stroke-arrow-Tooltip");
  createThemeVar("strokeWidth-arrow-Tooltip");
  createThemeVar("animationDuration-Tooltip");
  createThemeVar("animation-Tooltip");
`;

export const TooltipMd = createMetadata({
  status: "in progress",
  description: "A tooltip component that displays text when hovering over trigger content.",
  props: {
    text: {
      description: "The text content to display in the tooltip.",
      valueType: "string",
    },
    markdown: {
      description: "The markdown content to display in the tooltip.",
      valueType: "string",
    },
    tooltipTemplate: dComponent("The template for the tooltip content."),
    delayDuration: {
      description: "The duration from when the mouse enters a tooltip trigger until the tooltip opens, in milliseconds.",
      valueType: "number",
      defaultValue: defaultProps.delayDuration,
    },
    skipDelayDuration: {
      description: "How much time a user has to enter another trigger without incurring a delay again, in milliseconds.",
      valueType: "number",
      defaultValue: defaultProps.skipDelayDuration,
    },
    defaultOpen: {
      description: "The open state of the tooltip when it is initially rendered.",
      valueType: "boolean",
      defaultValue: defaultProps.defaultOpen,
    },
    showArrow: {
      description: "Whether to show the arrow pointing to the trigger element.",
      valueType: "boolean",
      defaultValue: defaultProps.showArrow,
    },
    side: {
      description: "The preferred side of the trigger to render against when open.",
      valueType: "string",
      availableValues: ["top", "right", "bottom", "left"],
      isStrictEnum: true,
      defaultValue: defaultProps.side,
    },
    align: {
      description: "The preferred alignment against the trigger.",
      valueType: "string",
      availableValues: ["start", "center", "end"],
      isStrictEnum: true,
      defaultValue: defaultProps.align,
    },
    sideOffset: {
      description: "The distance in pixels from the trigger.",
      valueType: "number",
      defaultValue: defaultProps.sideOffset,
    },
    alignOffset: {
      description: "An offset in pixels from the start or end alignment options.",
      valueType: "number",
      defaultValue: defaultProps.alignOffset,
    },
    avoidCollisions: {
      description: "When true, overrides side and align preferences to prevent collisions with boundary edges.",
      valueType: "boolean",
      defaultValue: defaultProps.avoidCollisions,
    },
    testId: {
      description: "Adds a test identifier to the tooltip content element.",
      valueType: "string",
    },
  },
  events: {},
  apis: {},
  contextVars: {},
  themeVars: extractScssThemeVars(tooltipStylesSource),
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
  },
});

export const ThemedTooltip = TooltipComponent;
