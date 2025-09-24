import { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { union, uniq } from "lodash-es";

import { useEvent } from "../../components-core/utils/misc";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { usePrevious } from "../../components-core/utils/hooks";
import { useSelectionContext } from "../SelectionStore/SelectionStoreNative";

/**
 * An interval of selected items
 */
type SelectionInterval = {
  from: string;
  to: string;
};

/**
 * Represents an item that has an ID unique in its context
 */
type Item = any;

/**
 * This type defines the event options of a toggle event we consider to change the current selection
 */
type ToggleOptions = {
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  singleItem?: boolean;
};

type SelectionApi = {
  getSelectedItems: () => any[];
  getSelectedIds: () => any[];
  clearSelection: () => void;
  selectAll: () => void;
  selectId: (id: any | Array<any>) => void;
};

/**
 * This type defines an object with properties and operations to manage the selection
 */
type RowSelectionOperations = {
  /**
   * Operation to handle the keydown event
   */
  onKeyDown: KeyboardEventHandler;

  /**
   * The currently focused index (row number)
   */
  focusedIndex: number;

  /**
   * Operation to toggle the specified index
   * @param targetIndex Index to toggle
   * @param options Key options (state of SHIFT, CTRL, and META keys)
   */
  toggleRowIndex: (targetIndex: number, options: ToggleOptions | undefined) => void;

  /**
   * Operation to toggle the item with a particular ID
   * @param targetId Item identifier
   * @param options Key options (state of SHIFT, CTRL, and META keys)
   */
  toggleRow: (row: any, options: ToggleOptions | undefined) => void;

  /**
   * Operation to check or uncheck all rows
   * @param checked True to check, false to uncheck all rows
   */
  checkAllRows: (checked: boolean) => void;

  /**
   * A hash object that indicates if a particular row ID is selected or not
   */
  selectedRowIdMap: Record<string, boolean>;

  /**
   * The list of selected row IDs
   */
  selectedItems: any[];

  idKey: string;

  selectionApi: SelectionApi;
};

export default function useRowSelection({
  items = EMPTY_ARRAY,
  visibleItems = items,
  rowsSelectable,
  enableMultiRowSelection,
  rowDisabledPredicate,
  onSelectionDidChange,
  initiallySelected = EMPTY_ARRAY,
  syncWithAppState,
}: {
  items: Item[];
  visibleItems: Item[];
  rowsSelectable: boolean;
  enableMultiRowSelection: boolean;
  rowDisabledPredicate?: (item: any) => boolean;
  onSelectionDidChange?: (newSelection: Item[]) => Promise<void>;
  initiallySelected?: string[];
  syncWithAppState?: any;
}): RowSelectionOperations {
  // --- The focused index in the row source (if there is any)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  // --- The current selection interval
  const [selectionInterval, setSelectionInterval] = useState<SelectionInterval | null>(null);
  // --- Access the selection context that stores the current state of selection
  const { selectedItems, setSelectedRowIds, refreshSelection, idKey } = useSelectionContext();
  // --- Refresh the list of item IDs whenever the items in the selection change
  const walkableList: string[] = useMemo(() => {
    return visibleItems.map((item) => item[idKey]);
  }, [idKey, visibleItems]);

  // --- Track if initial selection has been applied
  const [initialSelectionApplied, setInitialSelectionApplied] = useState(false);

  // --- If the items change, refresh the selectable items (if the rows are selectable)
  useEffect(() => {
    refreshSelection(rowsSelectable ? items : EMPTY_ARRAY);
  }, [refreshSelection, items, rowsSelectable]);

  // --- Handle AppState synchronization
  // This implements bidirectional sync between Table selection and AppState.
  // The approach uses React's useEffect pattern which is appropriate for React-to-React communication.
  // The new AppState didUpdate event is more useful for non-React integrations.
  const appStateSelection = syncWithAppState?.value?.selectedIds;
  const prevAppStateSelection = usePrevious(appStateSelection);

  // --- Track if we're currently updating to prevent loops
  const [updatingFromAppState, setUpdatingFromAppState] = useState(false);
  const updatingFromAppStateRef = useRef(false);

  // --- Use refs to track the last known selections to prevent update loops
  const lastAppStateSelectionRef = useRef<any[]>();
  const lastTableSelectionRef = useRef<any[]>();
  const isUpdatingToAppStateRef = useRef(false);

  // --- Sync from AppState to table selection (when AppState changes externally)
  useEffect(() => {
    // Skip if not selectable, no sync, no selection, or we're currently updating FROM the table TO AppState
    if (
      !rowsSelectable ||
      !syncWithAppState ||
      !appStateSelection ||
      updatingFromAppState ||
      isUpdatingToAppStateRef.current
    ) {
      return;
    }

    // Only update if AppState selection actually changed and is different from our last update
    const appStateChanged = appStateSelection !== prevAppStateSelection;
    const isDifferentFromLastKnown =
      JSON.stringify([...(appStateSelection || [])].sort()) !==
      JSON.stringify([...(lastAppStateSelectionRef.current || [])].sort());

    if (appStateChanged && isDifferentFromLastKnown && items.length > 0) {
      const validIds = appStateSelection.filter((id: string) =>
        items.some((item) => item[idKey] === id),
      );

      const idsToSelect = enableMultiRowSelection ? validIds : validIds.slice(0, 1);

      // Track what we're setting to prevent loop
      lastAppStateSelectionRef.current = [...appStateSelection];
      lastTableSelectionRef.current = [...idsToSelect];

      // Set flag to prevent immediate feedback loop
      updatingFromAppStateRef.current = true;
      setSelectedRowIds(idsToSelect);
      setInitialSelectionApplied(true);

      // Reset the flag after React has processed the update
      setTimeout(() => {
        updatingFromAppStateRef.current = false;
      }, 50);
    }
  }, [
    appStateSelection,
    prevAppStateSelection,
    items,
    rowsSelectable,
    syncWithAppState,
    idKey,
    enableMultiRowSelection,
    setSelectedRowIds,
    updatingFromAppState,
  ]);

  // --- Sync from table selection to AppState (when user interacts with table)
  useEffect(() => {
    // Skip if not selectable, no sync, currently updating from AppState, or if we're in the middle of an AppState update
    if (
      !rowsSelectable ||
      !syncWithAppState ||
      updatingFromAppState ||
      updatingFromAppStateRef.current
    ) {
      return;
    }

    const currentSelectionIds = selectedItems.map((item) => item[idKey]);
    const appStateSelectionIds = appStateSelection || [];

    // Only update if table selection is different from AppState and different from our last update
    const tableChanged =
      JSON.stringify([...currentSelectionIds].sort()) !==
      JSON.stringify([...(lastTableSelectionRef.current || [])].sort());
    const isDifferentFromAppState =
      JSON.stringify([...currentSelectionIds].sort()) !==
      JSON.stringify([...appStateSelectionIds].sort());

    if (tableChanged && isDifferentFromAppState) {
      // Track what we're updating to prevent loop
      lastTableSelectionRef.current = [...currentSelectionIds];
      lastAppStateSelectionRef.current = [...currentSelectionIds];

      // Set flag to prevent immediate feedback from AppState
      isUpdatingToAppStateRef.current = true;
      setUpdatingFromAppState(true);

      syncWithAppState.update?.({ selectedIds: currentSelectionIds });

      // Reset the flags after React has processed the update
      setTimeout(() => {
        setUpdatingFromAppState(false);
        isUpdatingToAppStateRef.current = false;
      }, 100);
    }
  }, [
    selectedItems,
    syncWithAppState,
    appStateSelection,
    idKey,
    rowsSelectable,
    updatingFromAppState,
  ]);

  // --- Set initial selection when component mounts and items are available
  // Use a separate effect that runs after the refresh to ensure timing is correct
  useEffect(() => {
    // If we have AppState sync, don't use initiallySelected
    if (syncWithAppState) {
      return;
    }

    if (
      !rowsSelectable ||
      !initiallySelected ||
      initiallySelected.length === 0 ||
      initialSelectionApplied
    ) {
      return;
    }

    // Only set initial selection when items are available and we haven't applied it yet
    if (items.length > 0) {
      // Use setTimeout to ensure this runs after the refreshSelection effect
      const timeoutId = setTimeout(() => {
        // Filter initiallySelected to only include IDs that exist in current items
        const validIds = initiallySelected.filter((id) => items.some((item) => item[idKey] === id));

        if (validIds.length > 0) {
          // If multi-row selection is disabled, only select the first valid ID
          const idsToSelect = enableMultiRowSelection ? validIds : [validIds[0]];
          setSelectedRowIds(idsToSelect);
          setInitialSelectionApplied(true);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [
    items,
    initiallySelected,
    rowsSelectable,
    idKey,
    enableMultiRowSelection,
    setSelectedRowIds,
    initialSelectionApplied,
    selectedItems,
    syncWithAppState,
  ]);

  // --- If the multi-row selection switches to disabled, keep only the first selected item
  const prevEnableMultiRowSelection = usePrevious(enableMultiRowSelection);
  useEffect(() => {
    if (prevEnableMultiRowSelection && !enableMultiRowSelection) {
      if (selectedItems.length > 1) {
        setSelectedRowIds([selectedItems[0][idKey]]);
      }
    }
  }, [
    enableMultiRowSelection,
    idKey,
    prevEnableMultiRowSelection,
    selectedItems,
    setSelectedRowIds,
  ]);

  // --- If the focused item is not available set the focus to the first item
  useEffect(() => {
    if (!rowsSelectable) {
      return;
    }
    if (focusedIndex !== -1 && !walkableList[focusedIndex] && walkableList[0]) {
      setFocusedIndex(0);
    }
  }, [focusedIndex, rowsSelectable, setFocusedIndex, walkableList]);

  // --- Handle the user event to change the current selection. The event function handles the SHIFT, CTRL,
  // --- and META keys to decide how to change or extend the existing selection
  const toggleRowIndex = useEvent(
    // targetIndex: the item affected by an event
    // options: key event options
    (targetIndex: number, options: ToggleOptions = {}) => {
      if (!rowsSelectable) {
        return;
      }

      const targetId = walkableList[targetIndex];
      const { shiftKey, metaKey, ctrlKey } = options;

      const singleItem = !enableMultiRowSelection || (!shiftKey && !metaKey && !ctrlKey);

      // --- This variable will hold the newest selection interval
      let newSelectionInterval: SelectionInterval;
      let newSelectedRowsIdsInOrder = [...selectedItems.map((item) => item[idKey])];

      if (singleItem) {
        newSelectionInterval = {
          from: targetId,
          to: targetId,
        };
        newSelectedRowsIdsInOrder = [targetId];
      } else {
        if (shiftKey) {
          // --- SHIFT is pressed, extend the current selection
          let normalizedFromIdx: number;
          let normalizedToIdx: number;
          let from: string;
          let to: string;

          if (selectionInterval) {
            // --- Get the selection boundaries and normalize them (from is less than or equal than to)
            let oldFromIdx = walkableList.indexOf(selectionInterval.from);
            let oldToIdx = walkableList.indexOf(selectionInterval.to);

            let normalizedOldFromIdx = Math.min(oldFromIdx, oldToIdx);
            let normalizedOldToIdx = Math.max(oldFromIdx, oldToIdx);

            // --- Get the slice of selected IDs
            const slice = walkableList.slice(normalizedOldFromIdx, normalizedOldToIdx + 1);
            newSelectedRowsIdsInOrder = newSelectedRowsIdsInOrder.filter(
              (item) => !slice.includes(item),
            );
            from = selectionInterval.from;
            to = targetId;
            let fromIdx = walkableList.indexOf(from);
            let toIdx = walkableList.indexOf(to);
            normalizedFromIdx = Math.min(fromIdx, toIdx);
            normalizedToIdx = Math.max(fromIdx, toIdx);
          } else {
            from = targetId;
            to = targetId;
            normalizedFromIdx = targetIndex;
            normalizedToIdx = targetIndex;
          }

          const sl = walkableList.slice(normalizedFromIdx, normalizedToIdx + 1);
          newSelectedRowsIdsInOrder = union(newSelectedRowsIdsInOrder, sl);
          newSelectionInterval = {
            from: from,
            to: to,
          };
        } else {
          // --- SHIFT is not pressed, set the new interval to the newly focused item
          newSelectionInterval = {
            from: targetId,
            to: targetId,
          };

          if (metaKey || ctrlKey) {
            // --- If META key (Mac) or CTRL (Windows) is pressed, toggle the selection of the targeted item
            if (newSelectedRowsIdsInOrder.includes(targetId)) {
              newSelectedRowsIdsInOrder = newSelectedRowsIdsInOrder.filter(
                (item) => item !== targetId,
              );
            } else {
              newSelectedRowsIdsInOrder.push(targetId);
            }
          } else {
            // --- The targeted item remains the only selection
            newSelectedRowsIdsInOrder = [targetId];
          }
        }
      }

      // --- Update the state variables of the selection
      setFocusedIndex(targetIndex);
      setSelectedRowIds(uniq(newSelectedRowsIdsInOrder));
      setSelectionInterval(newSelectionInterval);
    },
  );

  // --- This function handles the user event to change the current selection according to the row ID
  // --- affected by the event
  const toggleRow = useEvent((item: any, options?: ToggleOptions) => {
    if (!rowsSelectable) {
      return;
    }
    const targetIndex = walkableList.indexOf(item[idKey]);
    toggleRowIndex(targetIndex, options);
  });

  // --- Handle the key events that may change the current selection
  const onKeyDown: KeyboardEventHandler = useEvent((event) => {
    if (!rowsSelectable) {
      return;
    }
    if (event.key === "ArrowDown") {
      // --- Move/extend the selection to the item below the focused one
      event.preventDefault();
      let newFocusIndex = Math.min(visibleItems.length - 1, focusedIndex + 1);
      if (focusedIndex !== visibleItems.length - 1) {
        toggleRowIndex(newFocusIndex, event);
      }
    }
    if (event.key === "PageDown") {
      // --- Move/extend the selection to the item 8 items below the focused one
      event.preventDefault();
      const newFocusIndex = Math.min(visibleItems.length - 1, focusedIndex + 8);
      toggleRowIndex(newFocusIndex, event);
    }
    if (event.key === "ArrowUp") {
      // --- Move/extend the selection to the item above the focused one
      event.preventDefault();
      let newFocusIndex = Math.max(0, focusedIndex - 1);
      if (focusedIndex >= 0) {
        toggleRowIndex(newFocusIndex, event);
      }
    }
    if (event.key === "PageUp") {
      // --- Move/extend the selection to the item 8 items above the focused one
      event.preventDefault();
      const newFocusIndex = Math.max(0, focusedIndex - 8);
      toggleRowIndex(newFocusIndex, event);
    }
  });

  useEffect(() => {
    // console.log("selection DID CHANGE?");
    onSelectionDidChange?.(selectedItems);
  }, [selectedItems, onSelectionDidChange]);

  /**
   * This operation checks or clears all rows
   */
  const checkAllRows = useEvent((checked: boolean) => {
    if (!rowsSelectable) {
      return;
    }
    if (!enableMultiRowSelection && checked) {
      return;
    }
    setSelectedRowIds(
      checked
        ? items
            .filter((item) => (rowDisabledPredicate ? !rowDisabledPredicate(item) : true))
            .map((item) => item[idKey])
        : [],
    );
  });

  /**
   * This operation creates a hash object that indicates the selected status of selected row IDs
   */
  const selectedRowIdMap = useMemo(() => {
    let rows: Record<string, boolean> = {};
    selectedItems.forEach((item) => {
      rows[item[idKey]] = true;
    });
    return rows;
  }, [idKey, selectedItems]);

  const getSelectedItems = useCallback(() => {
    return selectedItems;
  }, [selectedItems]);

  const getSelectedIds = useCallback(() => {
    return selectedItems.map((item) => item[idKey]);
  }, [idKey, selectedItems]);

  const clearSelection = useCallback(() => {
    checkAllRows(false);
  }, [checkAllRows]);

  const selectAll = useCallback(() => {
    checkAllRows(true);
  }, [checkAllRows]);

  const selectId = useCallback(
    (id: any | Array<any>) => {
      if (!rowsSelectable) {
        return;
      }
      let ids = Array.isArray(id) ? id : [id];
      if (ids.length > 1 && !enableMultiRowSelection) {
        ids = [ids[0]];
      }
      setSelectedRowIds(ids);
    },
    [enableMultiRowSelection, rowsSelectable, setSelectedRowIds],
  );

  const api = useMemo(() => {
    return {
      getSelectedItems,
      getSelectedIds,
      clearSelection,
      selectAll,
      selectId,
    };
  }, [clearSelection, getSelectedIds, getSelectedItems, selectAll, selectId]);

  // --- Retrieve the selection management object
  return {
    onKeyDown,
    focusedIndex,
    toggleRowIndex,
    toggleRow,
    checkAllRows,
    selectedRowIdMap,
    selectedItems,
    idKey,
    selectionApi: api,
  };
}
