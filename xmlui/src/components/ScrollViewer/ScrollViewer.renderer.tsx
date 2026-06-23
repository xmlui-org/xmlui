import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { ScrollViewerMd } from "./ScrollViewer";
import { defaultProps, type ScrollStyle } from "./ScrollViewer.defaults";
import { ScrollViewer } from "./ScrollViewerReact";

const COMP = "ScrollViewer";

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
