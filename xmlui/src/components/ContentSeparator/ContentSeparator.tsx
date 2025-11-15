import styles from "./ContentSeparator.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { orientationOptionMd } from "../abstractions";
import { ContentSeparator, defaultProps } from "./ContentSeparatorNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "ContentSeparator";

export const ContentSeparatorMd = createMetadata({
  status: "stable",
  description:
    "`ContentSeparator` creates visual dividers between content sections using " +
    "horizontal or vertical lines. It's essential for improving readability by " +
    "breaking up dense content, separating list items, or creating clear boundaries " +
    "between different UI sections.",
  props: {
    thickness: {
      description:
        "This property defines the component's height (if the \`orientation\` is horizontal) " +
        "or the width (if the \`orientation\` is vertical). " +
        "If not defined, the component uses the theme variable \`thickness-ContentSeparator\` (default: 1px).",
      valueType: "any",
    },
    length: {
      description:
        "This property defines the component's width (if the \`orientation\` is horizontal) " +
        "or the height (if the \`orientation\` is vertical). " +
        "If not defined, the component uses the theme variable \`length-ContentSeparator\` (default: 100%).",
      valueType: "any",
    },
    orientation: {
      description: "Sets the main axis of the component",
      availableValues: orientationOptionMd,
      defaultValue: defaultProps.orientation,
      valueType: "string",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-200",
    [`thickness-${COMP}`]: "1px",
    [`length-${COMP}`]: "100%",
    [`marginVertical-${COMP}`]: "0",
    [`marginHorizontal-${COMP}`]: "0",
    [`paddingVertical-${COMP}`]: "0",
    [`paddingHorizontal-${COMP}`]: "0",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const contentSeparatorComponentRenderer = createComponentRenderer(
  COMP,
  ContentSeparatorMd,
  ({ node, className, extractValue }) => {
    const orientation = extractValue(node.props.orientation);
    const length = extractValue.asSize(node.props.length);
    
    // Check if explicit sizing is provided via length prop or layout properties
    const hasExplicitLength = length !== undefined ||
      (orientation === "vertical" && node.props.height !== undefined) ||
      (orientation === "horizontal" && node.props.width !== undefined);
    
    return (
      <ContentSeparator
        orientation={orientation}
        thickness={extractValue.asSize(node.props.thickness)}
        length={length}
        hasExplicitLength={hasExplicitLength}
        className={className}
      />
    );
  },
);
