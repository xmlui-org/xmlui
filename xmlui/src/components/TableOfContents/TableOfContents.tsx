import styles from "./TableOfContents.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { TableOfContents, defaultProps } from "./TableOfContentsNative";
import { useIndexerContext } from "../App/IndexerContext";
import { createMetadata } from "../metadata-helpers";

const COMP = "TableOfContents";
const COMP_CHILD = "TableOfContentsItem";

export const TableOfContentsMd = createMetadata({
  status: "stable",
  description:
    "`TableOfContents` component collects [Heading](/components/Heading) and " +
    "[Bookmark](/components/Bookmark) within the current page and displays them in a navigable tree.",
  props: {
    smoothScrolling: {
      description:
        `This property indicates that smooth scrolling is used while scrolling the selected table ` +
        `of contents items into view.`,
      valueType: "boolean",
      defaultValue: defaultProps.smoothScrolling,
    },
    maxHeadingLevel: {
      description:
        "Defines the maximum heading level (1 to 6) to include in the table of contents. " +
        "For example, if it is 2, then `H1` and `H2` are displayed, but lower levels " +
        "(`H3` to `H6`) are not.",
      valueType: "number",
      defaultValue: defaultProps.maxHeadingLevel,
    },
    omitH1: {
      description:
        "If true, the `H1` heading is not included in the table of contents. " +
        "This is useful when the `H1` is used for the page title and you want to avoid duplication.",
      valueType: "boolean",
      defaultValue: false,
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
    [`paddingLeft-${COMP_CHILD}`]: "$space-1",
    [`paddingLeft-${COMP_CHILD}-level-2`]: "$space-3",
    [`paddingLeft-${COMP_CHILD}-level-3`]: "$space-5",
    [`paddingLeft-${COMP_CHILD}-level-4`]: "$space-6",
    [`paddingLeft-${COMP_CHILD}-level-5`]: "$space-6",
    [`paddingLeft-${COMP_CHILD}-level-6`]: "$space-6",
    [`fontWeight-${COMP_CHILD}`]: "$fontWeight-bold",
    [`fontWeight-${COMP_CHILD}-level-3`]: "normal",
    [`fontWeight-${COMP_CHILD}-level-4`]: "normal",
    [`fontWeight-${COMP_CHILD}-level-5`]: "normal",
    [`fontWeight-${COMP_CHILD}-level-6`]: "normal",

    [`fontStyle-${COMP_CHILD}-level-6`]: "italic",

    [`color-${COMP_CHILD}--active`]: "$color-primary-500",
  },
});

function IndexAwareTableOfContents(props) {
  const { indexing } = useIndexerContext();
  if (indexing) {
    return null;
  }
  return <TableOfContents {...props} />;
}

export const tableOfContentsRenderer = createComponentRenderer(
  COMP,
  TableOfContentsMd,
  ({ className, node, extractValue }) => {
    return (
      <IndexAwareTableOfContents
        className={className}
        smoothScrolling={extractValue.asOptionalBoolean(node.props?.smoothScrolling)}
        maxHeadingLevel={extractValue.asOptionalNumber(node.props?.maxHeadingLevel)}
        omitH1={extractValue.asOptionalBoolean(node.props?.omitH1)}
      />
    );
  },
);
