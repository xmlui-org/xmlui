import styles from "./ContentSeparator.module.scss";
import type { CSSProperties } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import classnames from "@components-core/utils/classnames";
import { orientationOptionNames } from "@components/abstractions";

// =====================================================================================================================
// React ContentSeparator component implementation

type ContentSeparatorProps = {
  size?: number | string;
  orientation?: string;
  style?: CSSProperties;
};

export const ContentSeparator = ({ orientation = "horizontal", size, style }: ContentSeparatorProps) => {
  return (
    <div
      className={classnames(styles.separator, {
        [styles.horizontal]: orientation === "horizontal",
        [styles.vertical]: orientation === "vertical",
      })}
      style={{
        height: orientation === "horizontal" ? size : undefined,
        width: orientation === "horizontal" ? "100%" : size,
        ...style,
      }}
    />
  );
};

// =====================================================================================================================
// XMLUI ContentSeparator component definition

/**
 * A \`ContentSeparator\` is a component that divides or separates content visually within a layout.
 * It serves as a visual cue to distinguish between different sections or groups of content,
 * helping to improve readability and organization.
 */
export interface ContentSeparatorComponentDef extends ComponentDef<"ContentSeparator"> {
  props: {
    /**
     * This property defines the component's height (if the \`orientation\` is horizontal) or the width
     * (if the \`orientation\` is vertical).
     * @descriptionRef
     */
    size?: number | string;
    /**
     * Sets the main axis of the component.
     * @descriptionRef
     * @defaultValue \`horizontal\`
     */
    orientation?: string; // NOTE: This prop is necessary so that the documentation generator script picks it up
  };
}

export const ContentSeparatorMd: ComponentDescriptor<ContentSeparatorComponentDef> = {
  displayName: "ContentSeparator",
  description: "A component that indicates a separation between adjacent components",
  props: {
    size: desc("Width or height of the separator, depending on it orientation"),
    orientation: { description: "Sets the main axis of the component", availableValues: orientationOptionNames },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-ContentSeparator": "$color-border",
    "size-ContentSeparator": "1px",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

export const contentSeparatorComponentRenderer = createComponentRenderer<ContentSeparatorComponentDef>(
  "ContentSeparator",
  ({ node, layoutCss, layoutNonCss, extractValue }) => {
    return (
      <ContentSeparator
        orientation={layoutNonCss.orientation}
        size={extractValue.asSize(node.props.size)}
        style={layoutCss}
      />
    );
  },
  ContentSeparatorMd,
);
