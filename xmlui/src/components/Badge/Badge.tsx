import styles from "./Badge.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  Badge,
  badgeVariantValues,
  defaultProps,
  isBadgeColors,
  type BadgeColors,
} from "./BadgeNative";
import { createMetadata, dInternal } from "../metadata-helpers";
import { toCssVar } from "../../parsers/style-parser/StyleParser";

const COMP = "Badge";

export const BadgeMd = createMetadata({
  status: "stable",
  description:
    "`Badge` displays small text labels with colored backgrounds, commonly used for " +
    "status indicators, categories, tags, and counts. It supports dynamic color " +
    "mapping based on content values, useful for status systems and data categorization.",
  props: {
    value: {
      description:
        "The text that the component displays. If this is not defined, the component renders " +
        "its children as the content of the badge. If neither text nor any child is defined, " +
        "the component renders a single frame for the badge with a non-breakable space.",
      type: "string",
      isRequired: true,
    },
    variant: {
      description:
        "Modifies the shape of the component. Comes in the regular \`badge\` variant or the \`pill\` variant " +
        "with fully rounded corners.",
      type: "string",
      availableValues: badgeVariantValues,
      defaultValue: defaultProps.variant,
    },
    colorMap: {
      description:
        `The \`${COMP}\` component supports the mapping of a list of colors using the \`value\` prop as the ` +
        `key. If this property is not set, no color mapping is used.`,
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
    [`backgroundColor-${COMP}`]: "rgb(from $color-secondary-500 r g b / 0.6)",
    [`textColor-${COMP}`]: "$const-color-surface-0",
  },
});

export const badgeComponentRenderer = createComponentRenderer(
  COMP,
  BadgeMd,
  ({ node, extractValue, renderChild, className }) => {
    const value = extractValue.asDisplayText(node.props.value);
    const colorMap: Record<string, string | BadgeColors> | undefined = extractValue(
      node.props?.colorMap,
    );
    let colorValue: string | BadgeColors | undefined;
    if (colorMap && value) {
      const resolvedColor = colorMap[value];
      if (typeof resolvedColor === "string") {
        colorValue = resolveColor(resolvedColor);
      } else if (isBadgeColors(resolvedColor)) {
        colorValue = {
          label: resolveColor(resolvedColor.label),
          background: resolveColor(resolvedColor.background),
        };
      }
    }
    return (
      <Badge variant={extractValue(node.props.variant)} color={colorValue} className={className}>
        {value || (node.children && renderChild(node.children)) || String.fromCharCode(0xa0)}
      </Badge>
    );
  },
);

function resolveColor(value: string): string {
  return value.startsWith("$") ? toCssVar(value) : value;
}
