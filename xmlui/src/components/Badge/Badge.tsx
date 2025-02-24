import styles from "./Badge.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Badge, type BadgeColors } from "./BadgeNative";

const COMP = "Badge";

export const BadgeMd = createMetadata({
  status: "stable",
  description: `The \`${COMP}\` is a text label that accepts a color map to define its background color and, optionally, its label color.`,
  props: {
    value: d("The text that the component displays"),
    variant: d(
      `Modifies the shape of the component. Comes in the regular \`badge\` variant or the \`pill\` variant ` +
        `with fully rounded corners.`,
    ),
    colorMap: d(
      `The \`${COMP}\` component supports the mapping of a list of colors using the \`value\` prop as the ` +
        `key. Provide the component with a list or key-value pairs in two ways:`,
    ),
    themeColor: d(`(**NOT IMPLEMENTED YET**) The theme color of the component.`),
    indicatorText: d(
      `(**NOT IMPLEMENTED YET**) This property defines the text to display in the indicator. If it is not ` +
        `defined or empty, no indicator is displayed unless the \`forceIndicator\` property is set.`,
    ),
    forceIndicator: d(
      `(**NOT IMPLEMENTED YET**) This property forces the display of the indicator, even if ` +
        `the \`indicatorText\` property is not defined or empty.`,
    ),
    indicatorThemeColor: d(`(**NOT IMPLEMENTED YET**) The theme color of the indicator.`),
    indicatorPosition: d(`(**NOT IMPLEMENTED YET**) The position of the indicator.`),
  },
  events: {},
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-${COMP}`]: `$space-0_5 $space-2`,
    [`border-${COMP}`]: `0px solid $color-border`,
    [`padding-${COMP}-pill`]: `$space-0_5 $space-2`,
    [`radius-${COMP}`]: "4px",
    [`font-size-${COMP}`]: "0.8em",
    [`font-size-${COMP}-pill`]: "0.8em",
    light: {
      [`color-bg-${COMP}`]: "rgba($color-secondary-500-rgb, .6)",
      [`color-text-${COMP}`]: "white",
    },
    dark: {
      [`color-bg-${COMP}`]: "rgba($color-secondary-500-rgb, .6)",
      [`color-text-${COMP}`]: "$color-surface-50",
    },
  },
});

export const badgeComponentRenderer = createComponentRenderer(
  COMP,
  BadgeMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    const value = extractValue.asDisplayText(node.props.value);
    const colorMap: Record<string, string> | Record<string, BadgeColors> | undefined = extractValue(
      node.props?.colorMap,
    );
    return (
      <Badge variant={extractValue(node.props.variant)} color={colorMap?.[value]} style={layoutCss}>
        {value || renderChild(node.children)}
      </Badge>
    );
  },
);
