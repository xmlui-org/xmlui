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
    [`padding-${COMP}`]: "$space-2",
    [`textColor-${COMP_CHILD}`]: "$color-secondary-500",
    [`textColor-${COMP_CHILD}--hover`]: "$textColor-primary",
    [`fontSize-${COMP_CHILD}`]: "$fontSize-small",
    [`wordWrap-${COMP_CHILD}`]: "break-word",

    [`paddingVertical-${COMP_CHILD}`]: "$space-1",
    [`paddingHorizontal-${COMP_CHILD}`]: "$space-1",
    [`fontWeight-${COMP_CHILD}`]: "$fontWeight-bold",
    [`fontStyle-${COMP_CHILD}-level-6`]: "italic",

    [`color-${COMP_CHILD}--active`]: "$color-primary-500",
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
