import styles from "./Badge.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Badge, badgeVariantValues, type BadgeColors } from "./BadgeNative";
import { dInternal } from "../metadata-helpers";

const COMP = "Badge";

export const BadgeMd = createMetadata({
  status: "stable",
  description: `The \`${COMP}\` is a text label that accepts a color map to define its background color and, optionally, its label color.`,
  props: {
    value: {
      description: "The text that the component displays",
      type: "string",
      isRequired: true,
    },
    variant: {
      description:
        "Modifies the shape of the component. Comes in the regular \`badge\` variant or the \`pill\` variant " +
        "with fully rounded corners.",
      type: "string",
      availableValues: badgeVariantValues,
      defaultValue: "badge",
    },
    colorMap: {
      description:
        `The \`${COMP}\` component supports the mapping of a list of colors using the \`value\` prop as the ` +
        `key. Provide the component with a list or key-value pairs in two ways:`,
    },
    themeColor: dInternal(`(**NOT IMPLEMENTED YET**) The theme color of the component.`),
    indicatorText: dInternal(
      `(**NOT IMPLEMENTED YET**) This property defines the text to display in the indicator. If it is not ` +
        `defined or empty, no indicator is displayed unless the \`forceIndicator\` property is set.`,
    ),
    forceIndicator: dInternal(
      `(**NOT IMPLEMENTED YET**) This property forces the display of the indicator, even if ` +
        `the \`indicatorText\` property is not defined or empty.`,
    ),
    indicatorThemeColor: dInternal(`(**NOT IMPLEMENTED YET**) The theme color of the indicator.`),
    indicatorPosition: dInternal(`(**NOT IMPLEMENTED YET**) The position of the indicator.`),
  },
  events: {},
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-${COMP}`]: `$space-0_5 $space-2`,
    [`border-${COMP}`]: `0px solid $borderColor`,
    [`padding-${COMP}-pill`]: `$space-0_5 $space-2`,
    [`borderRadius-${COMP}`]: "4px",
    [`fontSize-${COMP}`]: "0.8em",
    [`fontSize-${COMP}-pill`]: "0.8em",
    [`backgroundColor-${COMP}`]: "rgba($color-secondary-500-rgb, .6)",
    [`textColor-${COMP}`]: "$const-color-surface-0",
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
