import styles from "./TreeDisplay.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { TreeDisplay, defaultProps } from "./TreeDisplayNative";

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
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-primary-50",
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

export const treeDisplayComponentRenderer = createComponentRenderer(
  COMP,
  TreeDisplayMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <TreeDisplay
        style={layoutCss}
        content={extractValue.asOptionalString(node.props.content)}
        itemHeight={extractValue.asOptionalNumber(node.props.itemHeight)}
      >
        {renderChild(node.children)}
      </TreeDisplay>
    );
  },
);
