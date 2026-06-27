import type { CSSProperties } from "react";

import type { XmluiNode } from "../../compiler/ir";
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
    const hasHeaderTemplate = hasTemplate(adapter.node.children, "headerTemplate");
    const hasFooterTemplate = hasTemplate(adapter.node.children, "footerTemplate");
    return (
      <ScrollViewer
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as ScrollStyle}
        showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
        header={hasHeaderTemplate ? adapter.renderTemplate("headerTemplate") : undefined}
        footer={hasFooterTemplate ? adapter.renderTemplate("footerTemplate") : undefined}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </ScrollViewer>
    );
  },
});

function hasTemplate(children: XmluiNode[], name: string): boolean {
  return children.some((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name
  );
}
