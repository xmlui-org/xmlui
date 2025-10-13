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
    size: {
      description:
        "This property defines the component's height (if the \`orientation\` is horizontal) " +
        "or the width (if the \`orientation\` is vertical). " +
        "If not defined, the component uses the entire available width or height.",
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
    [`size-${COMP}`]: "1px",
    [`marginVertical-${COMP}`]: "0",
    [`marginHorizontal-${COMP}`]: "0",
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
    return (
      <ContentSeparator
        orientation={extractValue(node.props.orientation)}
        size={extractValue.asSize(node.props.size)}
        className={className}
      />
    );
  },
);
