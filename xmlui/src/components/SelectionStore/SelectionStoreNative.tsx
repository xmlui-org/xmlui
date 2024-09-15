import React, { type ReactNode, useLayoutEffect, useMemo, useState, useContext } from "react";
import { noop } from "lodash-es";
import { useEvent } from "@components-core/utils/misc";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { EMPTY_ARRAY } from "@components-core/constants";

type SelectionStoreProps = {
  idKey: string;
  updateState: UpdateStateFn;
  children: ReactNode;
  selectedItems: any[];
  registerComponentApi: RegisterComponentApiFn;
};

export const SelectionStore = ({
  updateState = noop,
  idKey = "id",
  children,
  selectedItems = EMPTY_ARRAY,
  registerComponentApi,
}: SelectionStoreProps) => {
  const [items, setItems] = useState<any[]>(selectedItems);

  const refreshSelection = useEvent((allItems: any[] = EMPTY_ARRAY) => {
    setItems(allItems);
    updateState({
      value: allItems.filter((item) => !!selectedItems.find((si) => si[idKey] === item[idKey])),
    });
  });

  const setSelectedRowIds = useEvent((rowIds: any) => {
    updateState({ value: items.filter((item) => rowIds.includes(item[idKey])) });
  });

  const clearSelection = useEvent(() => {
    setSelectedRowIds(EMPTY_ARRAY);
  });

  useLayoutEffect(() => {
    registerComponentApi({
      clearSelection,
      setSelectedRowIds,
      refreshSelection,
    });
  }, [clearSelection, setSelectedRowIds, registerComponentApi, refreshSelection]);

  // --- Pass this selection context to the provider
  const contextValue = useMemo(() => {
    return {
      selectedItems,
      setSelectedRowIds,
      refreshSelection,
      idKey,
    };
  }, [refreshSelection, selectedItems, setSelectedRowIds, idKey]);

  return <SelectionContext.Provider value={contextValue}>{children}</SelectionContext.Provider>;
};

// Defines the elements of the current selection tracking
interface SelectionState {
  selectedItems: any[];
  setSelectedRowIds: React.Dispatch<React.SetStateAction<string[]>>;
  refreshSelection: (allItems: any[]) => void;
  idKey: string;
}

// Represents the default selection context
const SelectionContext = React.createContext<SelectionState>({
  selectedItems: [],
  setSelectedRowIds: noop,
  refreshSelection: noop,
  idKey: "id",
});

// This React hook takes care of retrieving the current selection context
export function useSelectionContext() {
  return useContext(SelectionContext);
}
