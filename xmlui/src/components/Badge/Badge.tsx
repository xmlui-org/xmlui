import styles from "./Badge.module.scss";

import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Badge, BadgeColors } from "./BadgeNative";

const COMP = "Badge";

export const BadgeMd = createMetadata({
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
    [`padding-horizontal-${COMP}`]: "$space-2",
    [`padding-vertical-${COMP}`]: "$space-0_5",
    [`padding-${COMP}`]: `$padding-vertical-${COMP} $padding-horizontal-${COMP}`,
    [`padding-${COMP}-pill`]: `$padding-vertical-${COMP}-pill $padding-horizontal-${COMP}-pill`,
    [`radius-${COMP}`]: "4px",
    [`font-size-${COMP}`]: "$font-size-normal",
    [`font-size-${COMP}-pill`]: "$font-size-normal",
    [`font-weight-${COMP}`]: "$font-weight-bold",
    [`font-weight-${COMP}-pill`]: "$font-weight-normal",
    light: {
      [`color-bg-${COMP}`]: "$color-primary-500",
      [`color-text-${COMP}`]: "$color-surface-50",
    },
    dark: {
      [`color-bg-${COMP}`]: "$color-primary-500",
      [`color-text-${COMP}`]: "$color-surface-50",
    },
  },
});

export const badgeComponentRenderer = createComponentRendererNew(
  COMP,
  BadgeMd,
  ({ node, extractValue }) => {
    const value = extractValue(node.props.value);
    const colorMap: Record<string, string> | Record<string, BadgeColors> | undefined = extractValue(
      node.props?.colorMap,
    );
    return (
      <Badge variant={extractValue(node.props.variant)} value={value} color={colorMap?.[value]} />
    );
  },
);
