import { useRef, useSyncExternalStore, type CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { runEvent } from "../../runtime/rendering/bindings";
import { createRuntimeScope, readLocal, writeLocal, type RuntimeScope, type StateSlotKey } from "../../runtime/state";
import { TileGridMd } from "./TileGrid";
import { defaultProps } from "./TileGrid.defaults";
import { TileGridNative, type CheckboxPosition } from "./TileGridReact";
import { StandaloneSelectionStore } from "../SelectionStore/SelectionStoreReact";

const COMP = "TileGrid";

export const tileGridRenderer = wrapComponent({
  name: COMP,
  metadata: TileGridMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const data = normalizeData(adapter.prop("data"));
    const idKey = adapter.stringProp("idKey", defaultProps.idKey) ?? defaultProps.idKey;
    const refreshOnValue = adapter.prop("refreshOn");
    const frozenScopeRef = useRef<{ refreshOnValue: unknown; scope: RuntimeScope }>();
    if (refreshOnValue !== undefined && (
      !frozenScopeRef.current ||
      frozenScopeRef.current.refreshOnValue !== refreshOnValue
    )) {
      frozenScopeRef.current = {
        refreshOnValue,
        scope: frozenRuntimeReadScope(adapter.scope),
      };
    }
    const itemParentScope = refreshOnValue === undefined
      ? adapter.scope
      : (frozenScopeRef.current?.scope ?? adapter.scope);
    const syncWithVar = adapter.stringProp("syncWithVar");
    const syncSlot = syncWithVar && validRuntimeIdentifier(syncWithVar)
      ? resolveRuntimeSyncSlot(adapter.scope, syncWithVar)
      : undefined;
    useSyncExternalStore(
      (listener) => syncSlot ? adapter.scope.store.subscribeToSlot(syncSlot, listener) : () => {},
      () => syncSlot ? adapter.scope.store.getSnapshot() : 0,
      () => syncSlot ? adapter.scope.store.getSnapshot() : 0,
    );
    const itemTemplate = templateChildren(adapter.node, "itemTemplate") ?? nonPropertyChildren(adapter.node.children);
    const rootAttrs = adapter.rootAttrs();
    const emitContextEvent = (name: string, contextValues: Record<string, unknown>, args: unknown[]) => {
      const eventScope = createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
        props: adapter.scope.props,
        contextValues,
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        routing: adapter.scope.routing,
        toast: adapter.scope.toast,
        emitEvent: adapter.scope.emitEvent,
        extensionFunctions: adapter.scope.extensionFunctions,
      });
      return runEvent(adapter.node.parsed?.events?.[name], eventScope, args);
    };
    const syncAdapter =
      syncWithVar && syncSlot
        ? {
            value: readLocal(adapter.scope, syncWithVar),
            update: ({ selectedIds }: { selectedIds: unknown[] }) => {
              const currentValue = readLocal(adapter.scope, syncWithVar);
              if (!shouldWriteSyncSelection(currentValue, selectedIds)) {
                return;
              }
              writeLocal(adapter.scope, syncWithVar, { selectedIds });
            },
          }
        : undefined;

    return (
      <StandaloneSelectionStore idKey={idKey}>
      <TileGridNative
        {...rootAttrs}
        key={refreshOnValue === undefined ? undefined : stableRuntimeKey(refreshOnValue)}
        style={tileGridStyle(rootAttrs.style as CSSProperties | undefined, data.length, adapter.booleanProp("loading", defaultProps.loading), adapter.stringProp("itemHeight", defaultProps.itemHeight))}
        itemWidth={adapter.stringProp("itemWidth", defaultProps.itemWidth)}
        itemHeight={adapter.stringProp("itemHeight", defaultProps.itemHeight)}
        gap={adapter.stringProp("gap", defaultProps.gap)}
        stretchItems={adapter.booleanProp("stretchItems", defaultProps.stretchItems)}
        loading={adapter.booleanProp("loading", defaultProps.loading)}
        itemsSelectable={adapter.booleanProp("itemsSelectable", defaultProps.itemsSelectable)}
        enableMultiSelection={adapter.booleanProp("enableMultiSelection", defaultProps.enableMultiSelection)}
        toggleSelectionOnClick={adapter.booleanProp("toggleSelectionOnClick", defaultProps.toggleSelectionOnClick)}
        checkboxPosition={adapter.stringProp("checkboxPosition", defaultProps.checkboxPosition) as CheckboxPosition}
        hideSelectionCheckboxes={adapter.booleanProp("hideSelectionCheckboxes", defaultProps.hideSelectionCheckboxes)}
        itemUserSelect={adapter.stringProp("itemUserSelect", defaultProps.itemUserSelect)}
        syncWithAppState={syncAdapter}
        testId={adapter.stringProp("testId")}
        data={data}
        itemRenderer={(item, index, _count, selected) => {
          const itemScope = createRuntimeScope({
            store: itemParentScope.store,
            parent: itemParentScope,
            props: itemParentScope.props,
            contextValues: {
              $item: item,
              $itemIndex: index,
              $isFirst: index === 0,
              $isLast: index === data.length - 1,
              $selected: selected,
            },
            references: itemParentScope.references,
            slots: itemParentScope.slots,
            routing: itemParentScope.routing,
            toast: itemParentScope.toast,
            emitEvent: itemParentScope.emitEvent,
            extensionFunctions: itemParentScope.extensionFunctions,
          });
          return adapter.context.renderChildren(itemTemplate, itemScope);
        }}
        onSelectionDidChange={async (...args) => { await adapter.event("selectionDidChange")(...args); }}
        onItemDoubleClick={async (item, index) => { await adapter.event("itemDoubleClick")(item, index); }}
        onCutAction={async (...args) => { await adapter.event("cutAction")(...args); }}
        onCopyAction={async (...args) => { await adapter.event("copyAction")(...args); }}
        onPasteAction={async (...args) => { await adapter.event("pasteAction")(...args); }}
        onDeleteAction={async (...args) => { await adapter.event("deleteAction")(...args); }}
        onSelectAllAction={async (...args) => { await adapter.event("selectAllAction")(...args); }}
        onContextMenuItem={(item, index, event) => {
          event.preventDefault();
          void emitContextEvent("contextMenu", { $item: item, $itemIndex: index }, [item, index, event]);
        }}
        registerComponentApi={adapter.registerApi}
      />
      </StandaloneSelectionStore>
    );
  },
});

function normalizeData(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function tileGridStyle(
  style: CSSProperties | undefined,
  itemCount: number,
  loading: boolean,
  itemHeight: string | undefined,
): CSSProperties | undefined {
  if (!loading && itemCount > 0) {
    return style;
  }
  return {
    ...style,
    minHeight: style?.minHeight ?? itemHeight,
  };
}

function validRuntimeIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function resolveRuntimeSyncSlot(scope: RuntimeScope | undefined, name: string): StateSlotKey | undefined {
  if (!scope) {
    return undefined;
  }
  if (scope.store.hasLocal(scope.localOwnerId, name)) {
    return { kind: "local", ownerId: scope.localOwnerId, name };
  }
  return resolveRuntimeSyncSlot(scope.parent, name) ?? (
    scope.store.hasGlobal(name) ? { kind: "global", name } : undefined
  );
}

function shouldWriteSyncSelection(currentValue: unknown, selectedIds: unknown[]): boolean {
  if (selectedIds.length > 0) {
    return true;
  }
  return (
    currentValue !== null &&
    typeof currentValue === "object" &&
    Object.prototype.hasOwnProperty.call(currentValue, "selectedIds")
  );
}

function frozenRuntimeReadScope(scope: RuntimeScope): RuntimeScope {
  const localSnapshots = new Map<string, Record<string, unknown>>();
  for (let current: RuntimeScope | undefined = scope; current; current = current.parent) {
    if (current.localOwnerId && !localSnapshots.has(current.localOwnerId)) {
      localSnapshots.set(current.localOwnerId, current.store.getLocalSnapshot(current.localOwnerId));
    }
  }
  const globalSnapshot = scope.store.getGlobalSnapshot();
  const store = scope.store;
  const frozenStore = new Proxy(store, {
    get(target, property, receiver) {
      if (property === "hasLocal") {
        return (ownerId: string | undefined, name: string) =>
          (!!ownerId && Object.prototype.hasOwnProperty.call(localSnapshots.get(ownerId), name)) ||
          target.hasLocal(ownerId, name);
      }
      if (property === "readLocal") {
        return (ownerId: string | undefined, name: string) => {
          if (ownerId && Object.prototype.hasOwnProperty.call(localSnapshots.get(ownerId), name)) {
            return localSnapshots.get(ownerId)?.[name];
          }
          return target.readLocal(ownerId, name);
        };
      }
      if (property === "hasGlobal") {
        return (name: string) =>
          Object.prototype.hasOwnProperty.call(globalSnapshot, name) || target.hasGlobal(name);
      }
      if (property === "readGlobal") {
        return (name: string) =>
          Object.prototype.hasOwnProperty.call(globalSnapshot, name)
            ? globalSnapshot[name]
            : target.readGlobal(name);
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  return {
    ...scope,
    store: frozenStore,
    parent: scope.parent ? frozenRuntimeReadScope(scope.parent) : undefined,
  };
}

function stableRuntimeKey(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value !== "object") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
