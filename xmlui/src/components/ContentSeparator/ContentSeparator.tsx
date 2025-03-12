import styles from "./ContentSeparator.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { orientationOptionMd } from "../abstractions";
import { ContentSeparator, defaultProps } from "./ContentSeparatorNative";

const COMP = "ContentSeparator";

export const ContentSeparatorMd = createMetadata({
  description:
    `A \`${COMP}\` is a component that divides or separates content visually within a layout. ` +
    `It serves as a visual cue to distinguish between different sections or groups of content, ` +
    `helping to improve readability and organization.`,
  props: {
    size: {
      description: `This property defines the component's height (if the \`orientation\` is horizontal) ` +
        `or the width (if the \`orientation\` is vertical).`,
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
    [`backgroundColor-${COMP}`]: "$borderColor",
    [`size-${COMP}`]: "1px",
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
  ({ node, layoutCss, extractValue }) => {
    return (
      <ContentSeparator
        orientation={extractValue(node.props.orientation)}
        size={extractValue.asSize(node.props.size)}
        style={layoutCss}
      />
    );
  },
);
