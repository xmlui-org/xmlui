import classnames from "@components-core/utils/classnames";

import styles from "./Badge.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// ====================================================================================================================
// React Badge component implementation

type Props = {
  value: string;
  variant?: BadgeVariant;
  color?: string | BadgeColors;
};

const Badge = ({ value, color, variant = "badge" }: Props) => {
  return (
    <div
      className={classnames({ [styles.badge]: variant === "badge", [styles.pill]: variant === "pill" })}
      style={
        color
          ? typeof color === "string"
            ? { backgroundColor: color }
            : { backgroundColor: color.background, color: color.label }
          : undefined
      }
    >
      {value}
    </div>
  );
};

type BadgeColors = {
  label: string;
  background: string;
};

type BadgeVariant = "badge" | "pill";

// ====================================================================================================================
// XMLUI Badge definition

/**
 * The \`Badge\` is a text label that accepts a color map to define its background color and, optionally, its label color.
 */
export interface BadgeComponentDef extends ComponentDef<"Badge"> {
  props: {
    /** @descriptionRef */
    value: string | number;
    /** 
     * @descriptionRef
     * @defaultValue \`badge\`
     */
    variant?: BadgeVariant;
    /** @descriptionRef */
    colorMap?: Record<string, string> | Record<string, BadgeColors>;
  };
}

const metadata: ComponentDescriptor<BadgeComponentDef> = {
  displayName: "Badge",
  description: "A label that accepts a color map the defines its background (and optionally, its label) color",
  props: {
    value: desc("The label value"),
    variant: desc("The style variant of the component"),
    colorMap: desc(
      "A key-value collection, where the value is either a color for the background" +
        "or for both the background and the label as well. If provided and accessed, it takes " +
        "precedence of both default values and theme overrides."
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
    }
  },
};

export const badgeComponentRenderer = createComponentRenderer<BadgeComponentDef>(
  "Badge",
  ({ node, extractValue }) => {
    const value = extractValue(node.props.value);
    const colorMap: Record<string, string> | Record<string, BadgeColors> | undefined = extractValue(
      node.props?.colorMap
    );
    return <Badge variant={extractValue(node.props.variant)} value={value} color={colorMap?.[value]} />;
  },
  metadata
);
