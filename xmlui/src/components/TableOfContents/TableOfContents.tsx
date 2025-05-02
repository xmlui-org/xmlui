import styles from "./TableOfContents.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { TableOfContents } from "./TableOfContentsNative";

const COMP = "TableOfContents";

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
    [`width-${COMP}`]: "auto",
    [`height-${COMP}`]: "auto",
    [`fontSize-${COMP}Item`]: "$fontSize-smaller",
    [`fontWeight-${COMP}Item`]: "$fontWeight-normal",
    [`fontFamily-${COMP}Item`]: "$fontFamily",
    [`borderRadius-${COMP}Item`]: "0",
    [`border-width-${COMP}Item`]: "$space-0_5",
    [`border-style-${COMP}Item`]: "solid",
    [`borderRadius-${COMP}Item--active`]: "0",
    [`border-width-${COMP}Item--active`]: "$space-0_5",
    [`border-style-${COMP}Item--active`]: "solid",
    [`fontWeight-${COMP}Item--active`]: "$fontWeight-bold",
    [`backgroundColor-${COMP}`]: "transparent",
    [`paddingHorizontal-${COMP}`]: "$space-8",
    [`paddingVertical-${COMP}`]: "$space-4",
    [`paddingHorizontal-${COMP}Item`]: "$space-2",
    [`paddingVertical-${COMP}Item`]: "$space-2",
    [`paddingHorizontal-${COMP}Item-level-1`]: "unset",
    [`paddingHorizontal-${COMP}Item-level-2`]: "unset",
    [`paddingHorizontal-${COMP}Item-level-3`]: "unset",
    [`paddingHorizontal-${COMP}Item-level-4`]: "unset",
    [`paddingHorizontal-${COMP}Item-level-5`]: "unset",
    [`paddingHorizontal-${COMP}Item-level-6`]: "unset",
    [`marginTop-${COMP}`]: "0",
    [`marginBottom-${COMP}`]: "0",
    [`borderRadius-${COMP}`]: "0",
    [`border-width-${COMP}`]: "0",
    [`borderColor-${COMP}`]: "transparent",
    [`border-style-${COMP}`]: "solid",
    [`paddingLeft-${COMP}Item`]: "$space-1",
    [`textTransform-${COMP}Item`]: "none",
    [`verticalAlign-${COMP}Item`]: "baseline",
    [`letterSpacing-${COMP}Item`]: "0",
    [`color-${COMP}Item`]: "$textColor-primary",
    [`borderColor-${COMP}Item`]: "$borderColor",
    [`borderColor-${COMP}Item--active`]: "$color-primary-500",
    [`color-${COMP}Item--active`]: "$color-primary-500",
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
