import styles from "./TableOfContents.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { TableOfContents } from "./TableOfContentsNative";

const COMP = "TableOfContents";
const COMP_CHILD = "TableOfContentsItem";

export const TableOfContentsMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component collects headings and bookmarks within the current page ` +
    `and displays them in a tree representing their hierarchy. When you select an item ` +
    `in this tree, the component navigates the page to the selected position.`,
  props: {
    smoothScrolling: {
      description:
        `This property indicates that smooth scrolling is used while scrolling the selected table ` +
        `of contents items into view.`,
      valueType: "boolean",
      defaultValue: "false",
    },
    maxHeadingLevel: {
      description:
        "Defines the maximum heading level (1 to 6) to include in the table of contents. " +
        "For example, if it is 2, then `H1` and `H2` are displayed, but lower levels " +
        "(`H3` to `H6`) are not.",
      valueType: "number",
      defaultValue: "6",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingHorizontal-${COMP}`]: "$space-8",
    [`paddingVertical-${COMP}`]: "$space-4",

    [`fontSize-${COMP_CHILD}`]: "$fontSize-small",
    [`wordWrap-${COMP_CHILD}`]: "break-word",
    [`paddingTop-${COMP_CHILD}`]: "$space-1_5",
    [`paddingBottom-${COMP_CHILD}`]: "$space-1_5",
    [`fontWeight-${COMP_CHILD}-level-1`]: "bold",
    [`paddingLeft-${COMP_CHILD}-level-2`]: "$space-2_5",
    [`paddingLeft-${COMP_CHILD}-level-3`]: "$space-3_5",
    [`paddingLeft-${COMP_CHILD}-level-4`]: "$space-4",
    [`paddingLeft-${COMP_CHILD}-level-5`]: "$space-5",
    [`paddingLeft-${COMP_CHILD}-level-6`]: "$space-5",
    [`fontStyle-${COMP_CHILD}-level-6`]: "italic",
    [`color-${COMP_CHILD}--active`]: "$color-primary-500",
    [`fontWeight-${COMP_CHILD}--active`]: "bold",
    [`textColor-${COMP_CHILD}--hover`]: "$color-primary-400",
  },
});

export const tableOfContentsRenderer = createComponentRenderer(
  COMP,
  TableOfContentsMd,
  ({ layoutCss, node, extractValue }) => {
    return (
      <TableOfContents
        style={layoutCss}
        smoothScrolling={extractValue.asOptionalBoolean(node.props?.smoothScrolling)}
        maxHeadingLevel={extractValue.asOptionalNumber(node.props?.maxHeadingLevel)}
      />
    );
  },
);
