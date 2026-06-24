import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { StickyBoxMd } from "./StickyBox";
import { defaultProps } from "./StickyBox.defaults";
import { StickyBox } from "./StickyBoxReact";

const COMP = "StickyBox";

export const stickyBoxRenderer = wrapComponent({
  name: COMP,
  metadata: StickyBoxMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const to = adapter.stringProp("to", defaultProps.to);
    return (
      <StickyBox
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        to={to === "bottom" ? "bottom" : "top"}
      >
        {adapter.renderChildren()}
      </StickyBox>
    );
  },
});
