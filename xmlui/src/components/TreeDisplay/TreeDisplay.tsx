import styles from "./TreeDisplay.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { TreeDisplay, defaultProps } from "./TreeDisplayNative";

const COMP = "TreeDisplay";

export const TreeDisplayMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component displays hierarchical data in a tree structure. ` +
    `Currently, it simply displays the content as text, but will be extended with more tree display features in the future.`,
  props: {
    content: {
      description: "The content to display in the tree.",
      valueType: "string",
      defaultValue: defaultProps.content,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-${COMP}`]: "$space-4",
    [`fontSize-${COMP}`]: "$fontSize-default",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontFamily-${COMP}`]: "$fontFamily-default",
    [`color-${COMP}`]: "$textColor-primary",
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
      >
        {renderChild(node.children)}
      </TreeDisplay>
    );
  },
);
