import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import { TileGridMd } from "./TileGrid";
import { defaultProps } from "./TileGrid.defaults";
import { TileGridNative } from "./TileGridReact";

const COMP = "TileGrid";

export const tileGridRenderer = wrapComponent({
  name: COMP,
  metadata: TileGridMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const data = normalizeData(adapter.prop("data"));
    const idKey = adapter.stringProp("idKey", defaultProps.idKey) ?? defaultProps.idKey;
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
    const rootAttrs = adapter.rootAttrs();
    return (
      <TileGridNative
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        itemWidth={adapter.stringProp("itemWidth", defaultProps.itemWidth)}
        itemHeight={adapter.stringProp("itemHeight", defaultProps.itemHeight)}
        gap={adapter.stringProp("gap", defaultProps.gap)}
        stretchItems={adapter.booleanProp("stretchItems", defaultProps.stretchItems)}
        loading={adapter.booleanProp("loading", defaultProps.loading)}
        items={data.map((item, index) => {
          const selected = false;
          const itemScope = createRuntimeScope({
            store: adapter.scope.store,
            parent: adapter.scope,
            props: adapter.scope.props,
            contextValues: {
              $item: item,
              $itemIndex: index,
              $isFirst: index === 0,
              $isLast: index === data.length - 1,
              $selected: selected,
            },
            references: adapter.scope.references,
            slots: adapter.scope.slots,
            emitEvent: adapter.scope.emitEvent,
          });
          return {
            key: itemKey(item, idKey, index),
            selected,
            content: adapter.context.renderChildren(itemTemplate, itemScope),
            onDoubleClick: () => void adapter.event("itemDoubleClick")(item, index),
            onContextMenu: (event) => {
              event.preventDefault();
              void adapter.event("contextMenu")(item, index, event);
            },
          };
        })}
      />
    );
  },
});

function normalizeData(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function itemKey(item: unknown, idKey: string, index: number): string | number {
  if (item && typeof item === "object" && idKey in item) {
    const key = (item as Record<string, unknown>)[idKey];
    if (typeof key === "string" || typeof key === "number") {
      return key;
    }
  }
  return index;
}
