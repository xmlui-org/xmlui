import styles from "./ScrollViewer.module.scss";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata } from "../../components/metadata-helpers";
import { ScrollViewer, defaultProps } from "./ScrollViewerNative";

const COMP = "ScrollViewer";
const SCROLLER = "Scroller";

export const ScrollViewerMd = createMetadata({
  status: "stable",
  description:
    "`ScrollViewer` is a simple layout container that stretches to fill its parent's viewport " +
    "and provides customizable scrollbar styles for scrollable content. It supports four scrollbar " +
    "modes: normal (standard browser scrollbars), styled (themed scrollbars always visible), " +
    "whenMouseOver (scrollbars appear on hover), and whenScrolling (scrollbars appear during scrolling).",
  props: {
    scrollStyle: {
      description:
        "This property determines the scrollbar style and behavior. " +
        "`normal` uses the standard browser scrollbar. " +
        "`styled` uses themed scrollbars that are always visible and can be customized via theme variables. " +
        "`whenMouseOver` shows overlay scrollbars that appear when the mouse hovers over the scroll area and hide after 200ms when the mouse leaves. " +
        "`whenScrolling` shows overlay scrollbars only during active scrolling and hides them after 400ms of inactivity.",
      valueType: "string",
      allowedValues: ["normal", "styled", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultProps.scrollStyle,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    // --- Scrollbar sizing
    [`size-${SCROLLER}`]: "The width (for vertical scrollbars) or height (for horizontal scrollbars) of the scrollbar",
    [`padding-perpendicular-${SCROLLER}`]: "The padding perpendicular to the scroll direction (e.g., top/bottom padding for vertical scrollbars)",
    [`padding-axis-${SCROLLER}`]: "The padding along the scroll direction (e.g., left/right padding for vertical scrollbars)",

    // --- Track styling
    [`borderRadius-track-${SCROLLER}`]: "The border radius of the scrollbar track (the background area where the handle moves)",
    [`backgroundColor-track-${SCROLLER}`]: "The background color of the scrollbar track in its default state",
    [`backgroundColor-track-${SCROLLER}--hover`]: "The background color of the scrollbar track when hovered",
    [`backgroundColor-track-${SCROLLER}--active`]: "The background color of the scrollbar track when active/pressed",
    [`border-track-${SCROLLER}`]: "The border of the scrollbar track in its default state",
    [`border-track-${SCROLLER}--hover`]: "The border of the scrollbar track when hovered",
    [`border-track-${SCROLLER}--active`]: "The border of the scrollbar track when active/pressed",

    // --- Handle styling
    [`borderRadius-handle-${SCROLLER}`]: "The border radius of the scrollbar handle (the draggable thumb)",
    [`backgroundColor-handle-${SCROLLER}`]: "The background color of the scrollbar handle in its default state",
    [`backgroundColor-handle-${SCROLLER}--hover`]: "The background color of the scrollbar handle when hovered",
    [`backgroundColor-handle-${SCROLLER}--active`]: "The background color of the scrollbar handle when active/being dragged",
    [`border-handle-${SCROLLER}`]: "The border of the scrollbar handle in its default state",
    [`border-handle-${SCROLLER}--hover`]: "The border of the scrollbar handle when hovered",
    [`border-handle-${SCROLLER}--active`]: "The border of the scrollbar handle when active/being dragged",
    [`minSize-handle-${SCROLLER}`]: "The minimum size (width/height) of the scrollbar handle",
    [`maxSize-handle-${SCROLLER}`]: "The maximum size (width/height) of the scrollbar handle, or 'none' for no limit",
    [`size-perpendicularHandle-${SCROLLER}`]: "The size of the handle perpendicular to scroll direction (e.g., width of handle for vertical scrollbar) in default state",
    [`size-perpendicularHandle-${SCROLLER}--hover`]: "The size of the handle perpendicular to scroll direction when hovered",
    [`size-perpendicularHandle-${SCROLLER}--active`]: "The size of the handle perpendicular to scroll direction when active/being dragged",
    [`offset-handleInteractiveArea-${SCROLLER}`]: "Additional offset for the interactive area around the handle to make it easier to grab",

    // --- Transitions
    [`transition-${SCROLLER}`]: "CSS transition for the scrollbar container (opacity, visibility, position changes)",
    [`transitionTrack-${SCROLLER}`]: "CSS transition for the scrollbar track (opacity, background-color, border-color)",
    [`transitionHandle-${SCROLLER}`]: "CSS transition for the scrollbar handle (opacity, background-color, border-color, size changes)",
  },
  defaultThemeVars: {
    // --- Scrollbar sizing
    [`size-${SCROLLER}`]: "10px",
    [`padding-perpendicular-${SCROLLER}`]: "2px",
    [`padding-axis-${SCROLLER}`]: "2px",

    // --- Track styling
    [`borderRadius-track-${SCROLLER}`]: "2px",
    [`backgroundColor-track-${SCROLLER}`]: "transparent",
    [`backgroundColor-track-${SCROLLER}--hover`]: "transparent",
    [`backgroundColor-track-${SCROLLER}--active`]: "transparent",
    [`border-track-${SCROLLER}`]: "none",
    [`border-track-${SCROLLER}--hover`]: "none",
    [`border-track-${SCROLLER}--active`]: "none",

    // --- Handle styling
    [`borderRadius-handle-${SCROLLER}`]: "10px",
    [`backgroundColor-handle-${SCROLLER}`]: "$color-surface-200",
    [`backgroundColor-handle-${SCROLLER}--hover`]: "$color-surface-400",
    [`backgroundColor-handle-${SCROLLER}--active`]: "$color-surface-400",
    [`border-handle-${SCROLLER}`]: "none",
    [`border-handle-${SCROLLER}--hover`]: "none",
    [`border-handle-${SCROLLER}--active`]: "1px solid red",
    [`minSize-handle-${SCROLLER}`]: "33px",
    [`maxSize-handle-${SCROLLER}`]: "none",
    [`size-perpendicularHandle-${SCROLLER}`]: "100%",
    [`size-perpendicularHandle-${SCROLLER}--hover`]: "100%",
    [`size-perpendicularHandle-${SCROLLER}--active`]: "100%",
    [`offset-handleInteractiveArea-${SCROLLER}`]: "4px",

    // --- Transitions
    [`transition-${SCROLLER}`]:
      "opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s",
    [`transitionTrack-${SCROLLER}`]: "opacity 0.15s, background-color 0.15s, border-color 0.15s",
    [`transitionHandle-${SCROLLER}`]:
      "opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s",
  },
});

export const scrollViewerComponentRenderer = createComponentRenderer(
  COMP,
  ScrollViewerMd,
  ({ node, extractValue, renderChild, className }) => {
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle);

    return (
      <ScrollViewer className={className} scrollStyle={scrollStyle as any}>
        {renderChild(node.children)}
      </ScrollViewer>
    );
  }
);
