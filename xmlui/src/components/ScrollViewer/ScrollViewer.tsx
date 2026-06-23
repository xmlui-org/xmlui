import type { CSSProperties } from "react";

import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps, type ScrollStyle } from "./ScrollViewer.defaults";
import { ScrollViewer } from "./ScrollViewerReact";

const COMP = "ScrollViewer";
const SCROLLER = "Scroller";

export const ScrollViewerMd = createMetadata({
  status: "stable",
  description:
    "`ScrollViewer` is a simple layout container that stretches to fill its parent's viewport and provides customizable scrollbar styles for scrollable content.",
  props: {
    headerTemplate: dComponent("Optional content always visible at the top of the ScrollViewer."),
    footerTemplate: dComponent("Optional content always visible at the bottom of the ScrollViewer."),
    scrollStyle: {
      description: "Determines scrollbar style and behavior.",
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      isStrictEnum: true,
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description: "When enabled, displays fade indicators around scrollable content.",
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
    },
    testId: {
      description: "Adds a test identifier to the ScrollViewer root.",
      valueType: "string",
    },
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the ScrollViewer container to the top.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the ScrollViewer container to the bottom.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: {
    [`size-${SCROLLER}`]: "The width or height of the scrollbar.",
    [`padding-perpendicular-${SCROLLER}`]: "Scrollbar padding perpendicular to the scroll direction.",
    [`padding-axis-${SCROLLER}`]: "Scrollbar padding along the scroll direction.",
    [`borderRadius-track-${SCROLLER}`]: "Scrollbar track border radius.",
    [`backgroundColor-track-${SCROLLER}`]: "Scrollbar track background.",
    [`backgroundColor-track-${SCROLLER}--hover`]: "Scrollbar track background when hovered.",
    [`backgroundColor-track-${SCROLLER}--active`]: "Scrollbar track background when active.",
    [`border-track-${SCROLLER}`]: "Scrollbar track border.",
    [`border-track-${SCROLLER}--hover`]: "Scrollbar track border when hovered.",
    [`border-track-${SCROLLER}--active`]: "Scrollbar track border when active.",
    [`borderRadius-handle-${SCROLLER}`]: "Scrollbar handle border radius.",
    [`backgroundColor-handle-${SCROLLER}`]: "Scrollbar handle background.",
    [`backgroundColor-handle-${SCROLLER}--hover`]: "Scrollbar handle background when hovered.",
    [`backgroundColor-handle-${SCROLLER}--active`]: "Scrollbar handle background when active.",
    [`border-handle-${SCROLLER}`]: "Scrollbar handle border.",
    [`border-handle-${SCROLLER}--hover`]: "Scrollbar handle border when hovered.",
    [`border-handle-${SCROLLER}--active`]: "Scrollbar handle border when active.",
    [`minSize-handle-${SCROLLER}`]: "Scrollbar handle minimum size.",
    [`maxSize-handle-${SCROLLER}`]: "Scrollbar handle maximum size.",
    [`size-perpendicularHandle-${SCROLLER}`]: "Scrollbar handle perpendicular size.",
    [`size-perpendicularHandle-${SCROLLER}--hover`]: "Scrollbar handle perpendicular size when hovered.",
    [`size-perpendicularHandle-${SCROLLER}--active`]: "Scrollbar handle perpendicular size when active.",
    [`offset-handleInteractiveArea-${SCROLLER}`]: "Extra interactive offset around the scrollbar handle.",
    [`transition-${SCROLLER}`]: "Scrollbar container transition.",
    [`transition-track-${SCROLLER}`]: "Scrollbar track transition.",
    [`transition-handle-${SCROLLER}`]: "Scrollbar handle transition.",
    [`height-fade-${SCROLLER}`]: "Fade overlay height.",
    [`backgroundColor-fade-${SCROLLER}`]: "Fade overlay background.",
    [`transition-fade-${SCROLLER}`]: "Fade overlay transition.",
    [`autoHideDelay-whenMouseOver-${SCROLLER}`]: "Auto-hide delay for whenMouseOver scrollbars.",
    [`autoHideDelay-whenScrolling-${SCROLLER}`]: "Auto-hide delay for whenScrolling scrollbars.",
  },
  defaultThemeVars: {
    [`size-${SCROLLER}`]: "10px",
    [`padding-perpendicular-${SCROLLER}`]: "2px",
    [`padding-axis-${SCROLLER}`]: "2px",
    [`borderRadius-track-${SCROLLER}`]: "2px",
    [`backgroundColor-track-${SCROLLER}`]: "transparent",
    [`backgroundColor-track-${SCROLLER}--hover`]: "transparent",
    [`backgroundColor-track-${SCROLLER}--active`]: "transparent",
    [`border-track-${SCROLLER}`]: "none",
    [`border-track-${SCROLLER}--hover`]: "none",
    [`border-track-${SCROLLER}--active`]: "none",
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
    [`transition-${SCROLLER}`]: "opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s",
    [`transition-track-${SCROLLER}`]: "opacity 0.15s, background-color 0.15s, border-color 0.15s",
    [`transition-handle-${SCROLLER}`]: "opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s",
    [`height-fade-${SCROLLER}`]: "64px",
    [`backgroundColor-fade-${SCROLLER}`]: "rgb(from $color-surface-0 r g b / 0.75)",
    [`transition-fade-${SCROLLER}`]: "opacity 0.3s ease-in-out",
    [`autoHideDelay-whenMouseOver-${SCROLLER}`]: "400",
    [`autoHideDelay-whenScrolling-${SCROLLER}`]: "400",
  },
});

export const scrollViewerRenderer = wrapComponent({
  name: COMP,
  metadata: ScrollViewerMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <ScrollViewer
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as ScrollStyle}
        showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
        header={adapter.renderTemplate("headerTemplate")}
        footer={adapter.renderTemplate("footerTemplate")}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </ScrollViewer>
    );
  },
});
