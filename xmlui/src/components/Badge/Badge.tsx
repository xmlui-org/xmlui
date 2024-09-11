import styles from "./Badge.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { ComponentThemeColor } from "@components/abstractions";
import { Badge, BadgeColors, BadgeVariant } from "./BadgeNative";

const COMP = "Badge";

/**
 * The \`Badge\` is a text label that accepts a color map to define its background color and, optionally, its label color.
 */
export interface BadgeComponentDef extends ComponentDef<"Badge"> {
  props: {
    /** 
     * The text that the component displays.
     * @descriptionRef 
     */
    value: string | number;
    /**
     * Modifies the shape of the component. Comes in the regular \`badge\` variant or the \`pill\` variant 
     * with fully rounded corners.
     * @descriptionRef
     * @defaultValue \`badge\`
     */
    variant?: BadgeVariant;
    /**
     * The \`Badge\` component supports the mapping of a list of colors using the \`value\` prop as the 
     * key. Provide the component with a list or key-value pairs in two ways:
     * @descriptionRef 
     */
    colorMap?: Record<string, string> | Record<string, BadgeColors>;
    /**
     * (**NOT IMPLEMENTED YET**) The theme color of the component.
     * @descriptionRef
     */
    themeColor?: ComponentThemeColor;
    /**
     * (**NOT IMPLEMENTED YET**) This property defines the text to display in the indicator. If it is not 
     * defined or empty, no indicator is displayed unless the \`forceIndicator\` property is set.
     */
    indicatorText?: string;

    /**
     * (**NOT IMPLEMENTED YET**) This property forces the display of the indicator, even if 
     * the \`indicatorText\` property is not defined or empty.
     */
    forceIndicator?: boolean;

    /**
     * (**NOT IMPLEMENTED YET**) The theme color of the indicator.
     */
    indicatorThemeColor?: ComponentThemeColor;

    /**
     * (**NOT IMPLEMENTED YET**) The position of the indicator.
     */
    indicatorPosition?: "start" | "end" | "top-start" | "top-end" | "bottom-start" | "bottom-end";
  };
}

export const BadgeMd = {
  displayName: "Badge",
  description: "A label that accepts a color map the defines its background (and optionally, its label) color",
  props: {
    value: desc("The label value"),
    variant: desc("The style variant of the component"),
    colorMap: desc(
      "A key-value collection, where the value is either a color for the background" +
        "or for both the background and the label as well. If provided and accessed, it takes " +
        "precedence of both default values and theme overrides.",
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "padding-horizontal-Badge": "$space-2",
    "padding-vertical-Badge": "$space-0_5",
    "padding-Badge": "$padding-vertical-Badge $padding-horizontal-Badge",
    "padding-Badge-pill": "$padding-vertical-Badge-pill $padding-horizontal-Badge-pill",
    "radius-Badge": "4px",
    "font-size-Badge": "$font-size-normal",
    "font-size-Badge-pill": "$font-size-normal",
    "font-weight-Badge": "$font-weight-bold",
    "font-weight-Badge-pill": "$font-weight-normal",
    light: {
      "color-bg-Badge": "$color-primary-500",
      "color-text-Badge": "$color-surface-50",
    },
    dark: {
      "color-bg-Badge": "$color-primary-500",
      "color-text-Badge": "$color-surface-50",
    },
  },
};

export const badgeComponentRenderer = createComponentRenderer<BadgeComponentDef>(
  "Badge",
  ({ node, extractValue }) => {
    const value = extractValue(node.props.value);
    const colorMap: Record<string, string> | Record<string, BadgeColors> | undefined = extractValue(
      node.props?.colorMap,
    );
    return <Badge variant={extractValue(node.props.variant)} value={value} color={colorMap?.[value]} />;
  },
  BadgeMd,
);
