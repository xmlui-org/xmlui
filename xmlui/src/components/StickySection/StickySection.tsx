import styles from "./StickySection.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { StickySection, defaultProps } from "./StickySectionNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "StickySection";

export const StickySectionMd = createMetadata({
  status: "stable",
  description:
    "`StickySection` is a container that keeps itself visible at the edge of the " +
    "scrollable area while the user scrolls. When multiple `StickySection` components " +
    "share the same `stickTo` direction and would all have scrolled out of view, only " +
    "the last one (the one closest to the current scroll position) remains visible — " +
    "earlier ones are hidden beneath it. This makes `StickySection` ideal for " +
    "implementing scrollable content with persistent section headers or footers.",
  props: {
    stickTo: {
      description:
        "Determines the edge of the visible area the section sticks to while scrolling. " +
        "Use `\"top\"` to keep the section anchored to the top of the scrollable area and " +
        "`\"bottom\"` to keep it anchored to the bottom.",
      availableValues: ["top", "bottom"],
      valueType: "string",
      defaultValue: defaultProps.stickTo,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`zIndex-${COMP}`]: "1",
  },
});

export const stickySectionComponentRenderer = createComponentRenderer(
  COMP,
  StickySectionMd,
  ({ node, renderChild, extractValue, className }) => {
    return (
      <StickySection
        uid={node.uid}
        stickTo={extractValue.asOptionalString(node.props?.stickTo)}
        className={className}
      >
        {renderChild(node.children)}
      </StickySection>
    );
  },
);
