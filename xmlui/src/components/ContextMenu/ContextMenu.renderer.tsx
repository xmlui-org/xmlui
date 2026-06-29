import { useCallback, useMemo, useState, type ComponentProps, type CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createSlotScope } from "../../runtime/rendering/components";
import { wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { filterMenuSeparators } from "../DropdownMenu/DropdownMenu.renderer";
import { ContextMenuMd } from "./ContextMenu";
import { ContextMenu } from "./ContextMenuReact";

const COMP = "ContextMenu";

export const contextMenuRenderer = wrapComponent({
  name: COMP,
  metadata: ContextMenuMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs("content");
    return (
      <ContextMenuBridge
        {...rootAttrs}
        adapter={adapter}
        hasContent={filterMenuSeparators(adapter.node.children).length > 0}
        style={rootAttrs.style as CSSProperties}
        menuWidth={adapter.stringProp("menuWidth")}
        registerComponentApi={adapter.registerApi}
      />
    );
  },
});

type ContextMenuBridgeProps = ComponentProps<typeof ContextMenu> & {
  adapter: XmluiComponentAdapter;
};

function ContextMenuBridge({ adapter, ...props }: ContextMenuBridgeProps) {
  const [context, setContext] = useState<unknown>();
  const updateContextState = useCallback(
    (state: unknown) => setContext((state as { $context?: unknown }).$context),
    [],
  );
  const filteredChildren = useMemo(
    () => filterMenuSeparators(adapter.node.children),
    [adapter.node.children],
  );
  const contextScope = useMemo(
    () => context === undefined ? adapter.scope : createSlotScope(adapter.scope, { $context: context }),
    [adapter.scope, context],
  );
  return (
    <ContextMenu
      {...props}
      updateState={updateContextState}
    >
      {adapter.context.renderChildren(
        filteredChildren,
        contextScope,
      )}
    </ContextMenu>
  );
}
