import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { DrawerMd } from "./Drawer";
import { defaultProps } from "./Drawer.defaults";
import { DrawerComponent } from "./DrawerReact";

const COMP = "Drawer";

export const drawerRenderer = wrapComponent({
  name: COMP,
  metadata: DrawerMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const hasHeaderTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "headerTemplate",
    );
    return (
      <DrawerComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        position={adapter.stringProp("position", defaultProps.position) as "left" | "right" | "top" | "bottom"}
        hasBackdrop={adapter.booleanProp("hasBackdrop", defaultProps.hasBackdrop)}
        initiallyOpen={adapter.booleanProp("initiallyOpen", defaultProps.initiallyOpen)}
        closeButtonVisible={adapter.booleanProp("closeButtonVisible", defaultProps.closeButtonVisible)}
        closeOnClickAway={adapter.booleanProp("closeOnClickAway", defaultProps.closeOnClickAway)}
        headerTemplate={hasHeaderTemplate ? adapter.renderTemplate("headerTemplate") : undefined}
        onOpen={() => { void adapter.event("open")(); }}
        onClose={() => { void adapter.event("close")(); }}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </DrawerComponent>
    );
  },
});
