import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createSlotScope } from "../../runtime/rendering/components";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { ContextMenuMd } from "./ContextMenu";
import { ContextMenuComponent } from "./ContextMenuReact";

const COMP = "ContextMenu";

export const contextMenuRenderer = wrapComponent({
  name: COMP,
  metadata: ContextMenuMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs("content");
    return (
      <ContextMenuComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        menuWidth={adapter.stringProp("menuWidth")}
        registerComponentApi={adapter.registerApi}
      >
        {(context) => adapter.context.renderChildren(
          adapter.node.children,
          createSlotScope(adapter.scope, { $context: context }),
        )}
      </ContextMenuComponent>
    );
  },
});
