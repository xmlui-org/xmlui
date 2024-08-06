import React, { type ReactNode, useContext, useLayoutEffect, useMemo, useState } from "react";
import { noop } from "lodash-es";
import { useEvent } from "@components-core/utils/misc";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

// =====================================================================================================================
// React SelectionStore component implementation

type SelectionStoreProps = {
  idKey: string;
  updateState: UpdateStateFn;
  children: ReactNode;
  selectedItems: any[];
  registerComponentApi: RegisterComponentApiFn;
};

const SelectionStore = ({
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

// =====================================================================================================================
// XMLUI SelectionStore component definition

/** 
 * The \`SelectionStore\` is a non-visual component that may wrap components (items)
 * and manage their selection state to accommodate the usage of other actions.
 * 
 * For an example that covers all props, and API methods and values,
 * see the [\`Selection-Aware Components\`](#selection-aware-components) section.
 * @descriptionRef
 */
export interface SelectionStoreComponentDef extends ComponentDef<"SelectionStore"> {
  props: {
    /** 
     * The selected items in the selection store needs to have a unique ID to use as an unambiguous key for that particular item.
     * This property uniquely identifies the selected object item via a given property.
     * By default, the key attribute is \`"id"\`.
     */
    idKey: string;
  };
  api: {
    /** Enables the access of the list of selected items. */
    value: any[];
    /** This method clears the selection store by unselecting all previously selected items. */
    clearSelection: () => void;
    /** 
     * This method refreshes the selection by passing all underlying items as the method's `allItems` parameter.
     * The store calculates the intersection of the selected item IDs in its context and the item IDs in `allItems`.
     * As a result, the selection store will release the items that are not in `allItems` anymore.
     */
    refreshSelection: (allItems: any[]) => void;
    /** 
     * This method returns an array holding the unique IDs of the selected items (according to the store's state).
     */
    setSelectedRowIds: (rowIds: string[]) => void;
  };
}

const metadata: ComponentDescriptor<SelectionStoreComponentDef> = {
  displayName: "SelectionStore",
  description: "A component providing services to store the selection state of items in a list",
  props: {
    idKey: desc("The name of the property holding the unique ID of an item"),
  },
};

export const selectionStoreComponentRenderer = createComponentRenderer<SelectionStoreComponentDef>(
  "SelectionStore",
  (rendererContext) => {
    const { node, state, updateState, renderChild, registerComponentApi } = rendererContext;

    return (
      <SelectionStore
        updateState={updateState}
        idKey={node.props.idKey}
        selectedItems={state?.value}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </SelectionStore>
    );
  },
  metadata
);

// This React hook takes care of retrieving the current selection context
export function useSelectionContext() {
  return useContext(SelectionContext);
}
