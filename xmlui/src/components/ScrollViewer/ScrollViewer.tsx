import React from "react";
import styles from "./ScrollViewer.module.scss";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { createMetadata } from "../../components/metadata-helpers";
import { ScrollViewer, defaultProps } from "./ScrollViewerNative";
import { Scroller } from "./Scroller";
export { type ScrollStyle } from "./Scroller";

const COMP = "ScrollViewer";
const SCROLLER = "Scroller";

export const ScrollViewerMd = createMetadata({
  status: "stable",
  description:
    "`ScrollViewer` is a simple layout container that stretches to fill its parent's viewport " +
    "and provides customizable scrollbar styles for scrollable content. It supports four scrollbar " +
    "modes: normal (standard browser scrollbars), overlay (themed scrollbars always visible), " +
    "whenMouseOver (scrollbars appear on hover), and whenScrolling (scrollbars appear during scrolling).",
  props: {
    headerTemplate: {
      description:
        "An optional template that defines content always visible at the top of the `ScrollViewer`, " +
        "outside the scrollable area. The header sticks to the top while the inner content scrolls.",
      valueType: "ComponentDef",
    },
    footerTemplate: {
      description:
        "An optional template that defines content always visible at the bottom of the `ScrollViewer`, " +
        "outside the scrollable area. The footer sticks to the bottom while the inner content scrolls.",
      valueType: "ComponentDef",
    },
    scrollStyle: {
      description:
        "This property determines the scrollbar style and behavior. " +
        "`normal` uses the standard browser scrollbar. " +
        "`overlay` uses themed scrollbars that are always visible and can be customized via theme variables. " +
        "`whenMouseOver` shows overlay scrollbars that appear when the mouse hovers over the scroll area and hide after 200ms when the mouse leaves. " +
        "`whenScrolling` shows overlay scrollbars only during active scrolling and hides them after 400ms of inactivity.",
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description:
        "When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. " +
        "The fade indicators automatically appear/disappear based on the current scroll position. " +
        "Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. " +
        "Only works with overlay scrollbar modes (not with `normal` mode).",
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
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

    // --- Fade overlays
    [`height-fade-${SCROLLER}`]: "The height of the fade overlay gradients at the top and bottom of the scroll container",
    [`backgroundColor-fadeTop-${SCROLLER}`]: "The background gradient for the top fade overlay (typically a gradient from opaque to transparent)",
    [`backgroundColor-fadeBottom-${SCROLLER}`]: "The background gradient for the bottom fade overlay (typically a gradient from transparent to opaque)",
    [`transition-fade-${SCROLLER}`]: "CSS transition for the fade overlays (opacity changes)",

    // --- Auto-hide delays
    [`autoHideDelay-whenMouseOver-${SCROLLER}`]: "Delay in milliseconds before hiding scrollbar after mouse leaves in whenMouseOver mode",
    [`autoHideDelay-whenScrolling-${SCROLLER}`]: "Delay in milliseconds before hiding scrollbar after scrolling stops in whenScrolling mode",
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
    [`border-handle-${SCROLLER}--active`]: "none",
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

    // --- Fade overlays
    [`height-fade-${SCROLLER}`]: "64px",
    [`backgroundColor-fade-${SCROLLER}`]: "rgb(from $color-surface-0 r g b / 0.75)",
    [`transition-fade-${SCROLLER}`]: "opacity 0.3s ease-in-out",

    // --- Auto-hide delays
    [`autoHideDelay-whenMouseOver-${SCROLLER}`]: "400",
    [`autoHideDelay-whenScrolling-${SCROLLER}`]: "400",
  },
});

type ThemedScrollerProps = React.ComponentPropsWithoutRef<typeof Scroller>;

export const ThemedScroller = React.forwardRef<React.ElementRef<typeof Scroller>, ThemedScrollerProps>(
  function ThemedScroller({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(ScrollViewerMd);
    return (
      <Scroller
        {...props}
        className={className}
        containerClassName={themeClass}
        ref={ref}
      />
    );
  },
);

export const scrollViewerComponentRenderer = createComponentRenderer(
  COMP,
  ScrollViewerMd,
  ({ node, extractValue, renderChild, className }) => {
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle);
    const showScrollerFade = extractValue.asOptionalBoolean(node.props.showScrollerFade);
    const header = node.props.headerTemplate ? renderChild(node.props.headerTemplate) : undefined;
    const footer = node.props.footerTemplate ? renderChild(node.props.footerTemplate) : undefined;

    return (
      <ScrollViewer 
        className={className} 
        scrollStyle={scrollStyle as any}
        showScrollerFade={showScrollerFade}
        header={header}
        footer={footer}
      >
        {renderChild(node.children)}
      </ScrollViewer>
    );
  }
);
