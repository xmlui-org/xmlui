import React, {
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useState,
  useContext,
  useRef,
} from "react";
import { isEqual, noop } from "lodash-es";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { EMPTY_ARRAY } from "../../components-core/constants";

export const defaultProps = {
  idKey: "id",
  selectedItems: EMPTY_ARRAY,
};

type SelectionStoreProps = {
  idKey?: string;
  updateState: UpdateStateFn;
  children: ReactNode;
  selectedItems: any[];
  registerComponentApi?: RegisterComponentApiFn;
};

const EMPTY_SELECTION_STATE = {
  value: EMPTY_ARRAY,
};
export const StandaloneSelectionStore = ({ children }) => {
  const [selection, setSelection] = useState(EMPTY_SELECTION_STATE);
  return (
    <SelectionStore updateState={setSelection} selectedItems={selection.value}>
      {children}
    </SelectionStore>
  );
};

export const SelectionStore = ({
  updateState = noop,
  idKey = defaultProps.idKey,
  children,
  selectedItems = defaultProps.selectedItems,
  registerComponentApi = noop,
}: SelectionStoreProps) => {
  const [items, setItems] = useState<any[]>(selectedItems);
  const valueInitializedRef = useRef(false);
  const currentItemsRef = useRef<any[]>(selectedItems);

  const refreshSelection = useEvent((allItems: any[] = EMPTY_ARRAY) => {
    const safeAllItems = allItems || EMPTY_ARRAY;
    const safeSelectedItems = selectedItems || EMPTY_ARRAY;
    setItems(safeAllItems);
    currentItemsRef.current = safeAllItems; // Update the ref synchronously
    let value = safeAllItems.filter(
      (item) => !!safeSelectedItems.find((si) => si && item && si[idKey] === item[idKey]),
    );
    if (!isEqual(safeSelectedItems, value) || !valueInitializedRef.current) {
      valueInitializedRef.current = true;
      updateState({
        value,
      });
    }
  });

  const setSelectedRowIds = useEvent((rowIds: any) => {
    const safeItems = currentItemsRef.current || EMPTY_ARRAY; // Use ref instead of state
    updateState({ value: safeItems.filter((item) => rowIds.includes(item[idKey])) });
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
const SelectionContext = React.createContext<SelectionState>(null);

// This React hook takes care of retrieving the current selection context
export function useSelectionContext() {
  return useContext(SelectionContext);
}
