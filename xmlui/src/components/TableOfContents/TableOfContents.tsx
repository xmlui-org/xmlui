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
    [`font-size-${COMP}Item`]: "$font-size-smaller",
    [`font-weight-${COMP}Item`]: "$font-weight-normal",
    [`font-family-${COMP}Item`]: "$font-family",
    [`border-radius-${COMP}Item`]: "0",
    [`border-width-${COMP}Item`]: "$space-0_5",
    [`border-style-${COMP}Item`]: "solid",
    [`border-radius-${COMP}Item--active`]: "0",
    [`border-width-${COMP}Item--active`]: "$space-0_5",
    [`border-style-${COMP}Item--active`]: "solid",
    [`font-weight-${COMP}Item--active`]: "$font-weight-bold",
    [`color-bg-${COMP}`]: "transparent",
    [`padding-horizontal-${COMP}`]: "$space-8",
    [`padding-vertical-${COMP}`]: "$space-4",
    [`padding-horizontal-${COMP}Item`]: "$space-2",
    [`padding-vertical-${COMP}Item`]: "$space-2",
    [`padding-horizontal-${COMP}Item-level-1`]: "unset",
    [`padding-horizontal-${COMP}Item-level-2`]: "unset",
    [`padding-horizontal-${COMP}Item-level-3`]: "unset",
    [`padding-horizontal-${COMP}Item-level-4`]: "unset",
    [`padding-horizontal-${COMP}Item-level-5`]: "unset",
    [`padding-horizontal-${COMP}Item-level-6`]: "unset",
    [`margin-top-${COMP}`]: "0",
    [`margin-bottom-${COMP}`]: "0",
    [`border-radius-${COMP}`]: "0",
    [`border-width-${COMP}`]: "0",
    [`border-color-${COMP}`]: "transparent",
    [`border-style-${COMP}`]: "solid",
    [`transform-${COMP}Item`]: "none",
    [`align-vertical-${COMP}Item`]: "baseline",
    [`letter-spacing-${COMP}Item`]: "0",
    light: {
      [`color-${COMP}Item`]: "$color-text-primary",
      [`border-color-${COMP}Item`]: "$color-border",
      [`border-color-${COMP}Item--active`]: "$color-primary-500",
      [`color-${COMP}Item--active`]: "$color-primary-500",
    },
    dark: {
      [`color-${COMP}Item`]: "$color-text-primary",
      [`border-color-${COMP}Item`]: "$color-border",
      [`border-color-${COMP}Item--active`]: "$color-primary-500",
      [`color-${COMP}Item--active`]: "$color-text-secondary",
    },
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
