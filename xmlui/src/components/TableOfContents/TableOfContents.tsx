import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./TableOfContents.defaults";
import { TableOfContentsNative } from "./TableOfContentsReact";

const COMP = "TableOfContents";
const COMP_CHILD = "TableOfContentsItem";

const tocStylesSource = `
$height-TableOfContents: createThemeVar("height-TableOfContents");
$padding-TableOfContents: createThemeVar("padding-TableOfContents");
$textColor-TableOfContentsItem: createThemeVar("textColor-TableOfContentsItem");
$textColor-TableOfContentsItem--hover: createThemeVar("textColor-TableOfContentsItem--hover");
$fontSize-TableOfContentsItem: createThemeVar("fontSize-TableOfContentsItem");
$wordWrap-TableOfContentsItem: createThemeVar("wordWrap-TableOfContentsItem");
$paddingVertical-TableOfContentsItem: createThemeVar("paddingVertical-TableOfContentsItem");
$paddingLeft-TableOfContentsItem: createThemeVar("paddingLeft-TableOfContentsItem");
$paddingLeft-TableOfContentsItem-level-2: createThemeVar("paddingLeft-TableOfContentsItem-level-2");
$paddingLeft-TableOfContentsItem-level-3: createThemeVar("paddingLeft-TableOfContentsItem-level-3");
$paddingLeft-TableOfContentsItem-level-4: createThemeVar("paddingLeft-TableOfContentsItem-level-4");
$paddingLeft-TableOfContentsItem-level-5: createThemeVar("paddingLeft-TableOfContentsItem-level-5");
$paddingLeft-TableOfContentsItem-level-6: createThemeVar("paddingLeft-TableOfContentsItem-level-6");
$fontWeight-TableOfContentsItem: createThemeVar("fontWeight-TableOfContentsItem");
$fontWeight-TableOfContentsItem-level-2: createThemeVar("fontWeight-TableOfContentsItem-level-2");
$fontWeight-TableOfContentsItem-level-3: createThemeVar("fontWeight-TableOfContentsItem-level-3");
$fontWeight-TableOfContentsItem-level-4: createThemeVar("fontWeight-TableOfContentsItem-level-4");
$fontWeight-TableOfContentsItem-level-5: createThemeVar("fontWeight-TableOfContentsItem-level-5");
$fontWeight-TableOfContentsItem-level-6: createThemeVar("fontWeight-TableOfContentsItem-level-6");
$fontStyle-TableOfContentsItem-level-6: createThemeVar("fontStyle-TableOfContentsItem-level-6");
`;

export const TableOfContentsMd = createMetadata({
  status: "experimental",
  description: "`TableOfContents` collects headings within the current page and displays navigable links.",
  props: {
    smoothScrolling: { description: "Whether heading links use smooth scrolling.", valueType: "boolean", defaultValue: defaultProps.smoothScrolling },
    maxHeadingLevel: { description: "Maximum heading level to include.", valueType: "number", defaultValue: defaultProps.maxHeadingLevel },
    omitH1: { description: "Whether H1 headings are omitted.", valueType: "boolean", defaultValue: defaultProps.omitH1 },
    scrollStyle: { description: "Scrollbar style.", valueType: "string", defaultValue: defaultProps.scrollStyle },
    showScrollerFade: { description: "Whether scroller fade is shown.", valueType: "boolean", defaultValue: defaultProps.showScrollerFade },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  themeVars: extractScssThemeVars(tocStylesSource),
  defaultThemeVars: {
    [`height-${COMP}`]: "auto",
    [`padding-${COMP}`]: "$space-2",
    [`textColor-${COMP_CHILD}`]: "$color-secondary-500",
    [`textColor-${COMP_CHILD}--hover`]: "$textColor-primary",
    [`fontSize-${COMP_CHILD}`]: "$fontSize-sm",
    [`wordWrap-${COMP_CHILD}`]: "break-word",
    [`paddingVertical-${COMP_CHILD}`]: "$space-1",
    [`paddingLeft-${COMP_CHILD}`]: "$space-1",
    [`paddingLeft-${COMP_CHILD}-level-2`]: "$space-3",
    [`paddingLeft-${COMP_CHILD}-level-3`]: "$space-5",
    [`paddingLeft-${COMP_CHILD}-level-4`]: "$space-6",
    [`paddingLeft-${COMP_CHILD}-level-5`]: "$space-6",
    [`paddingLeft-${COMP_CHILD}-level-6`]: "$space-6",
    [`fontWeight-${COMP_CHILD}`]: "$fontWeight-bold",
    [`fontWeight-${COMP_CHILD}-level-2`]: "$fontWeight-medium",
    [`fontWeight-${COMP_CHILD}-level-3`]: "$fontWeight-normal",
    [`fontWeight-${COMP_CHILD}-level-4`]: "$fontWeight-normal",
    [`fontWeight-${COMP_CHILD}-level-5`]: "$fontWeight-normal",
    [`fontWeight-${COMP_CHILD}-level-6`]: "$fontWeight-normal",
    [`fontStyle-${COMP_CHILD}-level-6`]: "italic",
  },
});

export const tableOfContentsRenderer = wrapComponent({
  name: COMP,
  metadata: TableOfContentsMd,
  renderer: ({ adapter }) => (
    <TableOfContentsNative
      {...adapter.rootAttrs()}
      smoothScrolling={adapter.booleanProp("smoothScrolling", defaultProps.smoothScrolling)}
      maxHeadingLevel={adapter.numberProp("maxHeadingLevel", defaultProps.maxHeadingLevel)}
      omitH1={adapter.booleanProp("omitH1", defaultProps.omitH1)}
    />
  ),
});
