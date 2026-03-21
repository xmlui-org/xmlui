import styles from "./TreeDisplay.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { TreeDisplay, defaultProps } from "./TreeDisplayNative";
import { createMetadata, dContextMenu } from "../metadata-helpers";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "TreeDisplay";

export const TreeDisplayMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component displays hierarchical data in a tree structure. ` +
    `It accepts an indented text format where each line is an entry in the tree, and ` +
    `the number of leading spaces determines the nesting level. The component renders ` +
    `the tree with SVG lines and continuous vertical guides to clearly visualize parent-child relationships in the hierarchy.`,
  props: {
    content: {
      description: "The indented text content to display as a tree structure. Each level of indentation (using spaces) represents one level in the tree hierarchy.",
      valueType: "string",
      defaultValue: defaultProps.content,
    },
    itemHeight: {
      description: "The height of each tree item in pixels.",
      valueType: "number",
      defaultValue: defaultProps.itemHeight,
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  defaultAriaLabel: "Tree",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-CodeBlock",
    [`borderRadius-${COMP}`]: "8px",
    [`padding-${COMP}`]: "$space-4",
    [`paddingLeft-${COMP}`]: "$space-2",
    [`fontSize-${COMP}`]: "$fontSize-code",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontFamily-${COMP}`]: "$fontFamily-monospace",
    [`color-${COMP}`]: "$textColor-primary",
    [`color-connect-${COMP}`]: "$color-surface-200",
    [`boxShadow-${COMP}`]: "none",
    [`border-${COMP}`]: "0.5px solid $borderColor",
  },
});

type ThemedTreeDisplayProps = React.ComponentPropsWithoutRef<typeof TreeDisplay>;

export const ThemedTreeDisplay = React.forwardRef<React.ElementRef<typeof TreeDisplay>, ThemedTreeDisplayProps>(
  function ThemedTreeDisplay({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(TreeDisplayMd);
    return (
      <TreeDisplay
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const treeDisplayComponentRenderer = wrapComponent(
  COMP,
  ThemedTreeDisplay,
  TreeDisplayMd,
);
