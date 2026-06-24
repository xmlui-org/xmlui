import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { StickySectionMd } from "./StickySection";
import { defaultProps } from "./StickySection.defaults";
import { StickySection } from "./StickySectionReact";

const COMP = "StickySection";

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
