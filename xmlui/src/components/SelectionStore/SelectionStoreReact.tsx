import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { defaultProps } from "./SelectionStore.defaults";

export type SelectionStoreApi = {
  clearSelection: () => void;
  setSelectedRowIds: (rowIds: unknown[]) => void;
  refreshSelection: (allItems?: unknown[]) => void;
  value: unknown[];
};

type SelectionStoreProps = {
  idKey?: string;
  selectedItems?: unknown[];
  children?: ReactNode;
  registerApi?: (api: Record<string, unknown>) => void;
  onSelectionChange?: (items: unknown[]) => void | Promise<void>;
};

type SelectionContextValue = {
  selectedItems: unknown[];
  setSelectedRowIds: (rowIds: unknown[]) => void;
  refreshSelection: (allItems?: unknown[]) => void;
  idKey: string;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export const SelectionStoreNative = memo(function SelectionStoreNative({
  idKey = defaultProps.idKey,
  selectedItems = defaultProps.selectedItems,
  children,
  registerApi,
  onSelectionChange,
}: SelectionStoreProps) {
  const [selection, setSelection] = useState<unknown[]>(selectedItems);
  const currentItemsRef = useRef<unknown[]>(selectedItems);

  useEffect(() => {
    setSelection(selectedItems);
  }, [selectedItems]);

  const publishSelection = useCallback((items: unknown[]) => {
    setSelection(items);
    void onSelectionChange?.(items);
  }, [onSelectionChange]);

  const refreshSelection = useCallback((allItems: unknown[] = currentItemsRef.current) => {
    currentItemsRef.current = allItems;
    const selectedIds = new Set(selection.map((item) => itemKey(item, idKey)));
    publishSelection(allItems.filter((item) => selectedIds.has(itemKey(item, idKey))));
  }, [idKey, publishSelection, selection]);

  const setSelectedRowIds = useCallback((rowIds: unknown[]) => {
    const ids = new Set(rowIds.map(String));
    publishSelection(currentItemsRef.current.filter((item) => ids.has(String(itemKey(item, idKey)))));
  }, [idKey, publishSelection]);

  const clearSelection = useCallback(() => {
    publishSelection([]);
  }, [publishSelection]);

  const api = useMemo<SelectionStoreApi>(() => ({
    clearSelection,
    setSelectedRowIds,
    refreshSelection,
    get value() {
      return selection;
    },
  }), [clearSelection, refreshSelection, selection, setSelectedRowIds]);

  useEffect(() => {
    registerApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerApi]);

  const contextValue = useMemo<SelectionContextValue>(() => ({
    selectedItems: selection,
    setSelectedRowIds,
    refreshSelection,
    idKey,
  }), [idKey, refreshSelection, selection, setSelectedRowIds]);

  return <SelectionContext.Provider value={contextValue}>{children}</SelectionContext.Provider>;
});

export function useSelectionContext() {
  return useContext(SelectionContext);
}

function itemKey(item: unknown, idKey: string): unknown {
  if (item !== null && typeof item === "object") {
    return (item as Record<string, unknown>)[idKey];
  }
  return item;
}
