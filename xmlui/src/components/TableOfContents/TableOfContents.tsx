import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { defaultProps } from "./TableOfContents.defaults";
import { TableOfContents } from "./TableOfContentsReact";
import styles from "./TableOfContents.module.scss";

const COMP = "TableOfContents";
const COMP_CHILD = "TableOfContentsItem";

const tocStylesSource = `
$backgroundColor-TableOfContents: createThemeVar("backgroundColor-TableOfContents");
$width-TableOfContents: createThemeVar("width-TableOfContents");
$height-TableOfContents: createThemeVar("height-TableOfContents");
$padding-TableOfContents: createThemeVar("padding-TableOfContents");
$borderWidth-TableOfContents: createThemeVar("borderWidth-TableOfContents");
$borderColor-TableOfContents: createThemeVar("borderColor-TableOfContents");
$borderStyle-TableOfContents: createThemeVar("borderStyle-TableOfContents");
$backgroundColor-TableOfContentsItem--hover: createThemeVar("backgroundColor-TableOfContentsItem--hover");
$backgroundColor-TableOfContentsItem--active: createThemeVar("backgroundColor-TableOfContentsItem--active");
$textColor-TableOfContentsItem: createThemeVar("textColor-TableOfContentsItem");
$textColor-TableOfContentsItem--hover: createThemeVar("textColor-TableOfContentsItem--hover");
$textColor-TableOfContentsItem--active: createThemeVar("textColor-TableOfContentsItem--active");
$fontSize-TableOfContentsItem: createThemeVar("fontSize-TableOfContentsItem");
$wordWrap-TableOfContentsItem: createThemeVar("wordWrap-TableOfContentsItem");
$padding-TableOfContentsItem: createThemeVar("padding-TableOfContentsItem");
$paddingVertical-TableOfContentsItem: createThemeVar("paddingVertical-TableOfContentsItem");
$paddingLeft-TableOfContentsItem: createThemeVar("paddingLeft-TableOfContentsItem");
$padding-TableOfContentsItem-level-1: createThemeVar("padding-TableOfContentsItem-level-1");
$padding-TableOfContentsItem-level-2: createThemeVar("padding-TableOfContentsItem-level-2");
$padding-TableOfContentsItem-level-3: createThemeVar("padding-TableOfContentsItem-level-3");
$padding-TableOfContentsItem-level-4: createThemeVar("padding-TableOfContentsItem-level-4");
$padding-TableOfContentsItem-level-5: createThemeVar("padding-TableOfContentsItem-level-5");
$padding-TableOfContentsItem-level-6: createThemeVar("padding-TableOfContentsItem-level-6");
$paddingLeft-TableOfContentsItem-level-2: createThemeVar("paddingLeft-TableOfContentsItem-level-2");
$paddingLeft-TableOfContentsItem-level-3: createThemeVar("paddingLeft-TableOfContentsItem-level-3");
$paddingLeft-TableOfContentsItem-level-4: createThemeVar("paddingLeft-TableOfContentsItem-level-4");
$paddingLeft-TableOfContentsItem-level-5: createThemeVar("paddingLeft-TableOfContentsItem-level-5");
$paddingLeft-TableOfContentsItem-level-6: createThemeVar("paddingLeft-TableOfContentsItem-level-6");
$fontWeight-TableOfContentsItem: createThemeVar("fontWeight-TableOfContentsItem");
$fontWeight-TableOfContentsItem--hover: createThemeVar("fontWeight-TableOfContentsItem--hover");
$fontWeight-TableOfContentsItem--active: createThemeVar("fontWeight-TableOfContentsItem--active");
$fontSize-TableOfContentsItem-level-1: createThemeVar("fontSize-TableOfContentsItem-level-1");
$fontSize-TableOfContentsItem-level-2: createThemeVar("fontSize-TableOfContentsItem-level-2");
$fontSize-TableOfContentsItem-level-3: createThemeVar("fontSize-TableOfContentsItem-level-3");
$fontSize-TableOfContentsItem-level-4: createThemeVar("fontSize-TableOfContentsItem-level-4");
$fontSize-TableOfContentsItem-level-5: createThemeVar("fontSize-TableOfContentsItem-level-5");
$fontSize-TableOfContentsItem-level-6: createThemeVar("fontSize-TableOfContentsItem-level-6");
$fontWeight-TableOfContentsItem-level-1: createThemeVar("fontWeight-TableOfContentsItem-level-1");
$fontWeight-TableOfContentsItem-level-2: createThemeVar("fontWeight-TableOfContentsItem-level-2");
$fontWeight-TableOfContentsItem-level-3: createThemeVar("fontWeight-TableOfContentsItem-level-3");
$fontWeight-TableOfContentsItem-level-4: createThemeVar("fontWeight-TableOfContentsItem-level-4");
$fontWeight-TableOfContentsItem-level-5: createThemeVar("fontWeight-TableOfContentsItem-level-5");
$fontWeight-TableOfContentsItem-level-6: createThemeVar("fontWeight-TableOfContentsItem-level-6");
$textColor-TableOfContentsItem-level-1: createThemeVar("textColor-TableOfContentsItem-level-1");
$textColor-TableOfContentsItem-level-2: createThemeVar("textColor-TableOfContentsItem-level-2");
$textColor-TableOfContentsItem-level-3: createThemeVar("textColor-TableOfContentsItem-level-3");
$textColor-TableOfContentsItem-level-4: createThemeVar("textColor-TableOfContentsItem-level-4");
$textColor-TableOfContentsItem-level-5: createThemeVar("textColor-TableOfContentsItem-level-5");
$textColor-TableOfContentsItem-level-6: createThemeVar("textColor-TableOfContentsItem-level-6");
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
  themeVars: {
    ...extractScssThemeVars(tocStylesSource),
    ...parseScssVar(styles.themeVars),
  },
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`width-${COMP}`]: "auto",
    [`height-${COMP}`]: "auto",
    [`padding-${COMP}`]: "$space-2",
    [`borderWidth-${COMP}`]: "0",
    [`borderColor-${COMP}`]: "transparent",
    [`borderStyle-${COMP}`]: "none",
    [`backgroundColor-${COMP_CHILD}--hover`]: "transparent",
    [`backgroundColor-${COMP_CHILD}--active`]: "transparent",
    [`textColor-${COMP_CHILD}`]: "$color-secondary-500",
    [`textColor-${COMP_CHILD}--hover`]: "$textColor-primary",
    [`textColor-${COMP_CHILD}--active`]: "$color-primary-400",
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
    [`fontWeight-${COMP_CHILD}--hover`]: "$fontWeight-bold",
    [`fontWeight-${COMP_CHILD}--active`]: "$fontWeight-bold",
    [`borderLeft-${COMP_CHILD}`]: "2px solid $color-surface-100",
    [`fontStyle-${COMP_CHILD}-level-6`]: "italic",
    [`width-indicator-${COMP}`]: "2px",
    [`color-indicator-${COMP}`]: "$color-surface-100",
    [`color-indicator-${COMP}--active`]: "$color-surface-900",
  },
});

export const tableOfContentsRenderer = wrapComponent({
  name: COMP,
  metadata: TableOfContentsMd,
  renderer: ({ adapter }) => (
    <TableOfContents
      {...adapter.rootAttrs()}
      smoothScrolling={adapter.booleanProp("smoothScrolling", defaultProps.smoothScrolling)}
      maxHeadingLevel={adapter.numberProp("maxHeadingLevel", defaultProps.maxHeadingLevel)}
      omitH1={adapter.booleanProp("omitH1", defaultProps.omitH1)}
      scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as any}
      showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
    />
  ),
});
