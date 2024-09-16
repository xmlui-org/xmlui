import styles from "./ContentSeparator.module.scss";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { orientationOptionNames } from "@components/abstractions";
import { ContentSeparator } from "./ContentSeparatorNative";

const COMP = "ContentSeparator";

export const ContentSeparatorMd = createMetadata({
  description:
    `A \`${COMP}\` is a component that divides or separates content visually within a layout. ` +
    `It serves as a visual cue to distinguish between different sections or groups of content, ` +
    `helping to improve readability and organization.`,
  props: {
    size: d(
      `This property defines the component's height (if the \`orientation\` is horizontal) ` +
        `or the width (if the \`orientation\` is vertical).`,
    ),
    orientation: d("Sets the main axis of the component", orientationOptionNames),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${COMP}`]: "$color-border",
    [`size-${COMP}`]: "1px",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const contentSeparatorComponentRenderer = createComponentRendererNew(
  COMP,
  ContentSeparatorMd,
  ({ node, layoutCss, layoutNonCss, extractValue }) => {
    return (
      <ContentSeparator
        orientation={layoutNonCss.orientation}
        size={extractValue.asSize(node.props.size)}
        style={layoutCss}
      />
    );
  },
);
