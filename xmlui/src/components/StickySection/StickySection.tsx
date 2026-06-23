import type { CSSProperties } from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./StickySection.defaults";
import { StickySection } from "./StickySectionReact";

const COMP = "StickySection";
const stickySectionStylesSource = `
  createThemeVar("zIndex-StickySection");
`;

export const StickySectionMd = createMetadata({
  status: "stable",
  description:
    "`StickySection` is a container that keeps itself visible at the edge of the scrollable area while the user scrolls.",
  props: {
    stickTo: {
      description:
        "Determines the edge of the visible area the section sticks to while scrolling.",
      availableValues: ["top", "bottom"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: defaultProps.stickTo,
    },
    testId: {
      description: "Adds a test identifier to the StickySection root.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(stickySectionStylesSource),
  defaultThemeVars: {
    [`zIndex-${COMP}`]: "1",
  },
});

export const stickySectionRenderer = wrapComponent({
  name: COMP,
  metadata: StickySectionMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const stickTo = adapter.stringProp("stickTo", defaultProps.stickTo);
    return (
      <StickySection
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        stickTo={stickTo === "bottom" ? "bottom" : "top"}
      >
        {adapter.renderChildren()}
      </StickySection>
    );
  },
});
