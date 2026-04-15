import React, {
  createContext,
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  get,
  groupBy as groupByFunc,
  noop,
  omit,
  orderBy as lodashOrderBy,
  sortBy,
  uniq,
} from "lodash-es";
import type { RegisterComponentApiFn, RenderChildFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import type { FieldOrderBy, ScrollAnchoring } from "../abstractions";
import { ThemedCard as Card } from "../Card/Card";
import type { CustomItemComponent, CustomItemComponentProps, VirtualizerHandle } from "virtua";
import { Virtualizer } from "virtua";
import {
  useHasExplicitHeight,
  useIsomorphicLayoutEffect,
  useScrollParent,
  useStartMargin,
} from "../../components-core/utils/hooks";
import { composeRefs } from "@radix-ui/react-compose-refs";
import styles from "./List.module.scss";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useEvent } from "../../components-core/utils/misc";
import { ThemedSpinner as Spinner } from "../Spinner/Spinner";
import { ThemedText as Text } from "../Text/Text";
import { ThemedToggle } from "../Checkbox/Checkbox";
import { MemoizedItem } from "../container-helpers";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import useRowSelection from "../Table/useRowSelection";
import {
  parseKeyBinding,
  matchesKeyEvent,
  type ParsedKeyBinding,
} from "../../parsers/keybinding-parser/keybinding-parser";

export const selectionCheckboxPositionValues = ["before", "overlay"] as const;
export type SelectionCheckboxPosition = (typeof selectionCheckboxPositionValues)[number];

export const selectionCheckboxAnchorValues = ["top-left", "top-right", "bottom-left", "bottom-right", "center-left", "center-right"] as const;
export type SelectionCheckboxAnchor = (typeof selectionCheckboxAnchorValues)[number];

// Default props for List component
export const defaultProps = {
  idKey: "id",
  scrollAnchor: "top" as ScrollAnchoring,
  hideEmptyGroups: true,
  borderCollapse: true,
  groupsInitiallyExpanded: true,
  rowsSelectable: false,
  enableMultiRowSelection: true,
  initiallySelected: EMPTY_ARRAY,
  hideSelectionCheckboxes: false,
  selectionCheckboxPosition: "before" as SelectionCheckboxPosition,
  selectionCheckboxAnchor: "left-center" as SelectionCheckboxAnchor,
  selectionCheckboxOffsetX: "$space-2",
  selectionCheckboxOffsetY: "$space-2",
  keyBindings: {
    selectAll: "CmdOrCtrl+A",
    cut: "CmdOrCtrl+X",
    copy: "CmdOrCtrl+C",
    paste: "CmdOrCtrl+V",
    delete: "Delete",
  },
};

interface IExpandableListContext {
  isExpanded: (id: any) => boolean;
  toggleExpanded: (id: any, isExpanded: boolean) => void;
}

export const ListContext = React.createContext<IExpandableListContext>({
  isExpanded: (id: any) => false,
  toggleExpanded: (id: any, isExpanded: boolean) => {},
});

type OrderBy = FieldOrderBy | Array<FieldOrderBy>;

enum RowType {
  SECTION = "SECTION",
  SECTION_FOOTER = "SECTION_FOOTER",
  ITEM = "ITEM",
}

type GroupByValue = string | ((item: any) => any);

type ListData = {
  groupsInitiallyExpanded?: boolean;
  defaultGroups?: Array<string>;
  expanded?: Record<any, boolean>;
  items: any[];
  limit?: number;
  groupBy?: GroupByValue;
  orderBy?: OrderBy;
  availableGroups?: string[];
};

export function useListData({
  groupsInitiallyExpanded = true,
  expanded = EMPTY_OBJECT,
  items,
  limit,
  groupBy,
  orderBy,
  availableGroups,
  defaultGroups = EMPTY_ARRAY,
}: ListData) {
  // Filter out null and undefined items
  const validItems = useMemo(() => {
    return items.filter((item) => item != null);
  }, [items]);

  const sortedItems = useMemo(() => {
    if (!orderBy) {
      return validItems;
    }
    let arrayOrderBy = orderBy;
    if (!Array.isArray(orderBy)) {
      arrayOrderBy = [orderBy];
    }

    const fieldSelectorsToOrderBy = (arrayOrderBy as Array<FieldOrderBy>).map((ob) => {
      return (item: any) => {
        return get(item, ob.field);
      };
    });
    const fieldDirectionsToOrderBy = (arrayOrderBy as Array<FieldOrderBy>).map(
      (ob) => ob.direction,
    );
    return lodashOrderBy(validItems, fieldSelectorsToOrderBy, fieldDirectionsToOrderBy);
  }, [validItems, orderBy]);

  const cappedItems = useMemo(() => {
    if (!limit) {
      return sortedItems;
    }
    return sortedItems.slice(0, limit);
  }, [sortedItems, limit]);

  const sectionedItems: Record<string, any> = useMemo(() => {
    if (groupBy === undefined) {
      return EMPTY_OBJECT;
    }
    const iteratee =
      typeof groupBy === "function" ? groupBy : (item: any) => item[groupBy];
    return groupByFunc(cappedItems, iteratee);
  }, [cappedItems, groupBy]);

  const sections: string[] = useMemo(() => {
    if (groupBy === undefined) {
      return EMPTY_ARRAY;
    }
    let foundSectionKeys = uniq([...defaultGroups, ...Object.keys(sectionedItems)]);
    if (availableGroups) {
      foundSectionKeys = sortBy(foundSectionKeys, (item) => {
        return availableGroups.indexOf(item);
      });
    }
    return foundSectionKeys;
  }, [groupBy, sectionedItems, defaultGroups, availableGroups]);

  const rows = useMemo(() => {
    if (groupBy === undefined) {
      return cappedItems;
    }
    const ret: any[] = [];
    sections.forEach((section) => {
      ret.push({
        id: section,
        items: sectionedItems[section],
        _row_type: RowType.SECTION,
        key: section,
      });
      if (expanded[section] || (expanded[section] === undefined && groupsInitiallyExpanded)) {
        ret.push(...(sectionedItems[section] || []));
        ret.push({
          id: `${section}_footer`,
          items: sectionedItems[section],
          _row_type: RowType.SECTION_FOOTER,
          key: section,
        });
      }
    });
    return ret;
  }, [groupBy, sections, cappedItems, expanded, groupsInitiallyExpanded, sectionedItems]);

  return {
    rows,
    sectionedItems,
    sections,
  };
}

type PageInfo = {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isFetchingPrevPage: boolean;
  isFetchingNextPage: boolean;
};

const defaultItemRenderer = (item: any, id: any) => {
  if (!item) {
    return null;
  }
  let title: string | undefined;
  let subtitle: string | undefined;
  if (typeof item === "object") {
    const values = Object.values(omit(item, "id"));
    if (!values.length) {
      return null;
    }
    title = values[0] as string;
    subtitle = undefined;
    if (values.length > 1) {
      subtitle = values[1] as string;
    }
  } else if (typeof item === "string" || typeof item === "number") {
    title = item + "";
    subtitle = undefined;
  } else {
    return null;
  }

  return <Card title={title} subtitle={subtitle} />;
};

type DynamicHeightListProps = {
  items: any[];
  itemRenderer?: (item: any, id: any, index: number, count: number, isSelected: boolean) => ReactNode;
  sectionRenderer?: (group: any, id: any) => ReactNode;
  sectionFooterRenderer?: (group: any, id: any) => ReactNode;
  loading?: boolean;
  limit?: number;
  groupBy?: string;
  orderBy?: OrderBy;
  availableGroups?: string[];
  scrollAnchor?: ScrollAnchoring;
  onContextMenu?: any;
  requestFetchPrevPage?: () => any;
  requestFetchNextPage?: () => any;
  pageInfo?: PageInfo;
  idKey?: string;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  emptyListPlaceholder?: ReactNode;
  groupsInitiallyExpanded?: boolean;
  defaultGroups: Array<string>;
  registerComponentApi?: RegisterComponentApiFn;
  borderCollapse?: boolean;
  fixedItemSize?: boolean;
  // Selection props
  rowsSelectable?: boolean;
  enableMultiRowSelection?: boolean;
  initiallySelected?: string[];
  syncWithAppState?: any; // Internal: used by syncWithVar
  rowUnselectablePredicate?: (item: any) => boolean;
  hideSelectionCheckboxes?: boolean;
  selectionCheckboxPosition?: SelectionCheckboxPosition;
  selectionCheckboxAnchor?: SelectionCheckboxAnchor;
  selectionCheckboxOffsetX?: string;
  selectionCheckboxOffsetY?: string;
  selectionCheckboxSize?: string;
  onSelectionDidChange?: AsyncFunction;
  onSelectAllAction?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  rowDoubleClick?: (item: any) => void;
  keyBindings?: Record<string, string>;
};

// --- Selection context for List items
type ListSelectionContextValue = {
  rowsSelectable: boolean;
  selectedRowIdMap: Record<string, boolean>;
  focusedIndex: number;
  getRowId: (index: number) => string | undefined;
  getRowItem: (index: number) => any;
  onRowClick: (index: number, event: React.MouseEvent) => void;
  onRowDoubleClick: (index: number) => void;
  hideSelectionCheckboxes: boolean;
  enableMultiRowSelection: boolean;
  toggleRow: (item: any, options?: any) => void;
  checkAllRows: (checked: boolean) => void;
  selectionCheckboxPosition: SelectionCheckboxPosition;
  selectionCheckboxAnchor: SelectionCheckboxAnchor;
  selectionCheckboxOffsetX: string;
  selectionCheckboxOffsetY: string;
  selectionCheckboxSize: string | undefined;
  rowUnselectablePredicate?: (item: any) => boolean;
};

const ListSelectionContext = createContext<ListSelectionContextValue>({
  rowsSelectable: false,
  selectedRowIdMap: {},
  focusedIndex: -1,
  getRowId: () => undefined,
  getRowItem: () => undefined,
  onRowClick: () => {},
  onRowDoubleClick: () => {},
  hideSelectionCheckboxes: false,
  enableMultiRowSelection: true,
  toggleRow: () => {},
  checkAllRows: () => {},
  selectionCheckboxPosition: "before",
  selectionCheckboxAnchor: "top-left",
  selectionCheckboxOffsetX: "8px",
  selectionCheckboxOffsetY: "8px",
  selectionCheckboxSize: undefined,
});

/**
 * Context information about a specific row in the list
 */
type ListRowContext = {
  item: any;
  rowIndex: number;
  rowId: string;
  isSelected: boolean;
  isFocused: boolean;
};

/**
 * Helper function to build action context parameters from current list state.
 */
function buildListActionContext(
  selectedItems: any[],
  selectedRowIdMap: Record<string, boolean>,
  focusedIndex: number,
  data: any[],
  idKey: string,
): [ListRowContext | null, any[], string[]] {
  const selectedIds = Object.keys(selectedRowIdMap).filter((id) => selectedRowIdMap[id]);

  let row: ListRowContext | null = null;
  if (focusedIndex >= 0 && focusedIndex < data.length) {
    const item = data[focusedIndex];
    row = {
      item,
      rowIndex: focusedIndex,
      rowId: String(item[idKey]),
      isSelected: selectedRowIdMap[String(item[idKey])] ?? false,
      isFocused: true,
    };
  }

  return [row, selectedItems, selectedIds];
}

/**
 * Custom hook to handle keyboard actions for the List component
 */
function useListKeyboardActions({
  keyBindings,
  onSelectAllAction,
  onCutAction,
  onCopyAction,
  onPasteAction,
  onDeleteAction,
  selectedItems,
  selectedRowIdMap,
  focusedIndex,
  data,
  idKey,
  rowsSelectable,
  selectionApi,
}: {
  keyBindings: Record<string, string>;
  onSelectAllAction?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  selectedItems: any[];
  selectedRowIdMap: Record<string, boolean>;
  focusedIndex: number;
  data: any[];
  idKey: string;
  rowsSelectable: boolean;
  selectionApi: any;
}) {
  const mergedBindings = useMemo(() => {
    return {
      ...defaultProps.keyBindings,
      ...keyBindings,
    };
  }, [keyBindings]);

  const parsedBindings = useMemo(() => {
    const parsed: Record<string, { binding: ParsedKeyBinding; action: string }> = {};
    const keyToActions: Record<string, string[]> = {};

    Object.entries(mergedBindings).forEach(([action, keyString]) => {
      if (!keyString) return;
      try {
        const binding = parseKeyBinding(keyString);
        parsed[action] = { binding, action };
        const keySignature = keyString.toLowerCase().trim();
        if (!keyToActions[keySignature]) {
          keyToActions[keySignature] = [];
        }
        keyToActions[keySignature].push(action);
      } catch (error) {
        console.warn(`Failed to parse key binding for action '${action}': ${keyString}`, error);
      }
    });

    Object.entries(keyToActions).forEach(([key, actions]) => {
      if (actions.length > 1) {
        console.warn(
          `Key binding conflict: '${key}' is bound to multiple actions: [${actions.join(", ")}]. Using: ${actions[actions.length - 1]}`,
        );
      }
    });

    return parsed;
  }, [mergedBindings]);

  const handleKeyboardActions = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      for (const { binding, action } of Object.values(parsedBindings)) {
        if (matchesKeyEvent(event.nativeEvent, binding)) {
          let handled = false;
          switch (action) {
            case "selectAll":
              if (rowsSelectable) {
                selectionApi.selectAll();
                const allSelectedRowIdMap: Record<string, boolean> = {};
                data.forEach((item: any) => {
                  allSelectedRowIdMap[String(item[idKey])] = true;
                });
                const [row, allItems, allIds] = buildListActionContext(
                  data,
                  allSelectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                if (onSelectAllAction) {
                  onSelectAllAction(row, allItems, allIds);
                }
                handled = true;
              }
              break;
            case "cut":
              if (rowsSelectable && onCutAction) {
                const [row, items, ids] = buildListActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onCutAction(row, items, ids);
                handled = true;
              }
              break;
            case "copy":
              if (rowsSelectable && onCopyAction) {
                const [row, items, ids] = buildListActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onCopyAction(row, items, ids);
                handled = true;
              }
              break;
            case "paste":
              if (onPasteAction) {
                const [row, items, ids] = buildListActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onPasteAction(row, items, ids);
                handled = true;
              }
              break;
            case "delete":
              if (rowsSelectable && onDeleteAction) {
                const [row, items, ids] = buildListActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onDeleteAction(row, items, ids);
                handled = true;
              }
              break;
          }

          if (handled) {
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
        }
      }

      return false;
    },
    [
      parsedBindings,
      onSelectAllAction,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      selectedItems,
      selectedRowIdMap,
      focusedIndex,
      data,
      idKey,
      rowsSelectable,
      selectionApi,
    ],
  );

  return handleKeyboardActions;
}

// eslint-disable-next-line react/display-name
const Item = forwardRef(
  ({ children, style, index }: CustomItemComponentProps, forwardedRef: any) => {
    const getItemType = useContext(ListItemTypeContext);
    const selCtx = useContext(ListSelectionContext);
    const itemType = getItemType(index) || RowType.ITEM;

    const isRegularItem = itemType === RowType.ITEM;
    const rowId = isRegularItem ? selCtx.getRowId(index) : undefined;
    const isSelected = rowId != null ? !!selCtx.selectedRowIdMap[rowId] : false;
    const isFocused = isRegularItem ? selCtx.focusedIndex === index : false;
    const showCheckbox = isRegularItem && selCtx.rowsSelectable && !selCtx.hideSelectionCheckboxes;
    const isOverlay = selCtx.selectionCheckboxPosition === "overlay";

    // Check if the row is unselectable
    const rowItem = isRegularItem ? selCtx.getRowItem(index) : undefined;
    const isUnselectable = rowItem && selCtx.rowUnselectablePredicate?.(rowItem);

    const checkboxInput = showCheckbox ? (
      <div
        className={classnames(styles.checkboxWrapper, {
          [styles.checkboxOverlay]: isOverlay,
          [styles.checkboxAnchorTopRight]: isOverlay && selCtx.selectionCheckboxAnchor === "top-right",
          [styles.checkboxAnchorBottomLeft]: isOverlay && selCtx.selectionCheckboxAnchor === "bottom-left",
          [styles.checkboxAnchorBottomRight]: isOverlay && selCtx.selectionCheckboxAnchor === "bottom-right",
          [styles.checkboxDisabled]: isUnselectable,
        })}
        style={isOverlay ? {
          ...(selCtx.selectionCheckboxAnchor.includes("center")
            ? { top: "50%", bottom: undefined, transform: "translateY(-50%)" }
            : selCtx.selectionCheckboxAnchor.includes("top")
              ? { top: selCtx.selectionCheckboxOffsetY, bottom: undefined }
              : { bottom: selCtx.selectionCheckboxOffsetY, top: undefined }),
          ...(selCtx.selectionCheckboxAnchor.includes("left")
            ? { left: selCtx.selectionCheckboxOffsetX, right: undefined }
            : { right: selCtx.selectionCheckboxOffsetX, left: undefined }),
        } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <ThemedToggle
          value={isSelected}
          enabled={!isUnselectable}
          onDidChange={() => {
            selCtx.onRowClick(index, { shiftKey: false, metaKey: true, ctrlKey: false } as React.MouseEvent);
          }}
          style={selCtx.selectionCheckboxSize ? {
            width: selCtx.selectionCheckboxSize,
            height: selCtx.selectionCheckboxSize,
          } : undefined}
        />
      </div>
    ) : null;

    return (
      <div
        style={style}
        ref={forwardedRef}
        className={classnames({
          [styles.row]: isRegularItem,
          [styles.selected]: isRegularItem && isSelected,
          [styles.focused]: isRegularItem && isFocused,
          [styles.selectable]: isRegularItem && selCtx.rowsSelectable,
          [styles.hasCheckboxes]: showCheckbox && !isOverlay,
          [styles.hasOverlayCheckbox]: showCheckbox && isOverlay,
          [styles.section]: itemType === RowType.SECTION,
          [styles.sectionFooter]: itemType === RowType.SECTION_FOOTER,
        })}
        data-list-item-type={itemType}
        data-index={index}
        data-selected={isRegularItem && isSelected ? true : undefined}
        onClick={
          isRegularItem && selCtx.rowsSelectable
            ? (e) => {
                if (e.detail >= 2) return;
                selCtx.onRowClick(index, e);
              }
            : undefined
        }
        onDoubleClick={
          isRegularItem
            ? (e) => {
                e.preventDefault();
                selCtx.onRowDoubleClick(index);
              }
            : undefined
        }
      >
        {showCheckbox && !isOverlay && checkboxInput}
        {children}
        {showCheckbox && isOverlay && checkboxInput}
      </div>
    );
  },
);

const ListItemTypeContext = createContext<(index: number) => RowType>((index) => RowType.ITEM);

/**
 * Virtua's `shift` prop helps maintain scroll position when prepending items (like message history).
 * Unfortunately it's finicky and must only be `true` when the beginning of the list changes, otherwise
 * rendering gets broken (see: https://github.com/inokawa/virtua/issues/284).
 *
 * Virtua also requires `shift` to be correct on the same render pass when items are updated — so we can't
 * just use `useEffect` and `useState` to monitor items and update `shift` since those will update _after_ the
 * render pass. Instead, we use refs to check if the underlying data has changed on each render pass, and
 * update a `shift` ref in the same pass.
 *
 * That's all encapsulated in this handy hook, to keep the logic out of the component.
 */
const useShift = (listData: any[], idKey: any) => {
  const previousListData = useRef<any[] | undefined>();
  const shouldShift = useRef<boolean>();
  if (listData !== previousListData.current) {
    if (listData?.[0]?.[idKey] !== previousListData.current?.[0]?.[idKey]) {
      shouldShift.current = true;
    } else {
      shouldShift.current = false;
    }
    previousListData.current = listData;
  }
  return shouldShift.current;
};

export const ListNative = forwardRef(function DynamicHeightList2(
  {
    items = EMPTY_ARRAY,
    itemRenderer = defaultItemRenderer,
    sectionRenderer,
    sectionFooterRenderer,
    loading,
    limit,
    groupBy,
    orderBy,
    availableGroups,
    scrollAnchor = defaultProps.scrollAnchor,
    onContextMenu,
    requestFetchPrevPage = noop,
    requestFetchNextPage = noop,
    pageInfo,
    idKey = defaultProps.idKey,
    style,
    className,
    classes,
    emptyListPlaceholder,
    groupsInitiallyExpanded = true,
    defaultGroups = EMPTY_ARRAY,
    registerComponentApi,
    borderCollapse = defaultProps.borderCollapse,
    fixedItemSize,
    // Selection props
    rowsSelectable = defaultProps.rowsSelectable,
    enableMultiRowSelection = defaultProps.enableMultiRowSelection,
    initiallySelected = defaultProps.initiallySelected,
    syncWithAppState,
    rowUnselectablePredicate,
    hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
    selectionCheckboxPosition = defaultProps.selectionCheckboxPosition,
    selectionCheckboxAnchor = defaultProps.selectionCheckboxAnchor,
    selectionCheckboxOffsetX,
    selectionCheckboxOffsetY,
    selectionCheckboxSize,
    onSelectionDidChange,
    onSelectAllAction,
    onCutAction,
    onCopyAction,
    onPasteAction,
    onDeleteAction,
    rowDoubleClick,
    keyBindings = defaultProps.keyBindings,
    ...rest
  }: DynamicHeightListProps,
  ref,
) {
  const virtualizerRef = useRef<VirtualizerHandle>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rootRef = ref ? composeRefs(parentRef, ref) : parentRef;
  
  // State and ref for measuring first item size when fixedItemSize is enabled
  const firstItemRef = useRef<HTMLDivElement>(null);

  const scrollParent = useScrollParent(parentRef.current?.parentElement);
  const scrollRef = useRef(scrollParent);
  scrollRef.current = scrollParent;

  const hasHeight = useHasExplicitHeight(parentRef);
  const hasOutsideScroll = scrollRef.current && !hasHeight;

  // Create a ref for the Virtualizer's scroll container
  // When using outside scroll, we need a ref that points to the scroll parent
  const scrollElementRef = hasOutsideScroll ? scrollRef : parentRef;

  const shouldStickToBottom = useRef(scrollAnchor === "bottom");
  const [expanded, setExpanded] = useState<Record<any, boolean>>(EMPTY_OBJECT);
  const toggleExpanded = useCallback((id: any, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
  }, []);

  const expandContextValue = useMemo(() => {
    return {
      isExpanded: (id: any) =>
        expanded[id] || (expanded[id] === undefined && groupsInitiallyExpanded),
      toggleExpanded,
    };
  }, [expanded, groupsInitiallyExpanded, toggleExpanded]);

  const { rows } = useListData({
    groupsInitiallyExpanded,
    defaultGroups,
    expanded,
    items,
    limit,
    groupBy,
    orderBy,
    availableGroups,
  });

  const shift = useShift(rows, idKey);

  // --- Safe items array for selection operations
  const safeItems = Array.isArray(items) ? items : EMPTY_ARRAY;

  // --- Get visible items (non-section items from rows) for selection
  const visibleItems = useMemo(() => {
    return rows.filter((row) => row._row_type === undefined);
  }, [rows]);

  // --- Row selection hook
  const {
    toggleRow,
    toggleRowIndex,
    checkAllRows,
    focusedIndex,
    onKeyDown: selectionKeyDown,
    selectedRowIdMap,
    selectedItems: selectionSelectedItems,
    idKey: selectionIdKey,
    selectionApi,
  } = useRowSelection({
    items: safeItems,
    visibleItems,
    rowsSelectable,
    enableMultiRowSelection,
    rowUnselectablePredicate,
    onSelectionDidChange,
    initiallySelected,
    syncWithAppState,
  });

  // --- Keyboard actions (selectAll, cut, copy, paste, delete)
  const handleKeyboardActions = useListKeyboardActions({
    keyBindings,
    onSelectAllAction,
    onCutAction,
    onCopyAction,
    onPasteAction,
    onDeleteAction,
    selectedItems: selectionApi.getSelectedItems(),
    selectedRowIdMap,
    focusedIndex,
    data: safeItems,
    idKey: selectionIdKey,
    rowsSelectable,
    selectionApi,
  });

  // --- Composite keyboard handler combining actions and navigation
  const compositeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const actionHandled = handleKeyboardActions(event);
      if (!actionHandled) {
        selectionKeyDown(event);
      }
    },
    [handleKeyboardActions, selectionKeyDown],
  );

  // --- Build a map from row index (in the `rows` array) to visible item index
  const rowIndexToVisibleIndex = useMemo(() => {
    const map: Record<number, number> = {};
    let visIdx = 0;
    rows.forEach((row, idx) => {
      if (row._row_type === undefined) {
        map[idx] = visIdx;
        visIdx++;
      }
    });
    return map;
  }, [rows]);

  // --- Get row ID from row index
  const getRowId = useCallback(
    (index: number) => {
      const row = rows[index];
      if (!row || row._row_type !== undefined) return undefined;
      return String(row[idKey]);
    },
    [rows, idKey],
  );

  const getRowItem = useCallback(
    (index: number) => {
      const row = rows[index];
      if (!row || row._row_type !== undefined) return undefined;
      return row;
    },
    [rows],
  );

  // --- Handle a click on a list row
  const onRowClick = useEvent((index: number, event: React.MouseEvent) => {
    if (!rowsSelectable) return;
    const row = rows[index];
    if (!row || row._row_type !== undefined) return;

    // Focus the wrapper to enable keyboard shortcuts
    parentRef.current?.focus();

    // Map from row index to visible item index for toggleRowIndex
    const visIdx = rowIndexToVisibleIndex[index];
    if (visIdx === undefined) return;

    toggleRowIndex(visIdx, {
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
    });
  });

  // --- Handle double-click on a list row
  const onRowDoubleClick = useEvent((index: number) => {
    const row = rows[index];
    if (!row || row._row_type !== undefined) return;
    if (rowDoubleClick && typeof rowDoubleClick === "function") {
      try {
        rowDoubleClick(row);
      } catch (e) {
        console.error("Error in rowDoubleClick handler:", e);
      }
    }
  });

  // --- Selection context value for the Item component
  // Always provide a non-null context so that onDoubleClick is registered regardless of rowsSelectable.
  // Click-based selection still respects rowsSelectable via the rowsSelectable field.
  const selectionContextValue = useMemo<ListSelectionContextValue>(() => {
    return {
      rowsSelectable,
      selectedRowIdMap,
      focusedIndex: (() => {
        // Convert focused visible item index to row index
        for (const [rowIdx, visIdx] of Object.entries(rowIndexToVisibleIndex)) {
          if (visIdx === focusedIndex) return Number(rowIdx);
        }
        return -1;
      })(),
      getRowId,
      getRowItem,
      onRowClick,
      onRowDoubleClick,
      hideSelectionCheckboxes,
      enableMultiRowSelection,
      toggleRow,
      checkAllRows,
      selectionCheckboxPosition,
      selectionCheckboxAnchor,
      selectionCheckboxOffsetX,
      selectionCheckboxOffsetY,
      selectionCheckboxSize,
      rowUnselectablePredicate,
    };
  }, [
    rowsSelectable,
    selectedRowIdMap,
    focusedIndex,
    rowIndexToVisibleIndex,
    getRowId,
    getRowItem,
    onRowClick,
    onRowDoubleClick,
    hideSelectionCheckboxes,
    enableMultiRowSelection,
    toggleRow,
    checkAllRows,
    selectionCheckboxPosition,
    selectionCheckboxAnchor,
    selectionCheckboxOffsetX,
    selectionCheckboxOffsetY,
    selectionCheckboxSize,
    rowUnselectablePredicate,
  ]);

  const initiallyScrolledToBottom = useRef(false);
  useEffect(() => {
    if (rows.length && scrollAnchor === "bottom" && !initiallyScrolledToBottom.current) {
      initiallyScrolledToBottom.current = true;
      requestAnimationFrame(() => {
        virtualizerRef.current?.scrollToIndex(rows.length - 1, {
          align: "end",
        });
      });
    }
  }, [rows.length, scrollAnchor]);

  useEffect(() => {
    if (!virtualizerRef.current) return;
    if (!shouldStickToBottom.current) return;
    requestAnimationFrame(() => {
      virtualizerRef.current?.scrollToIndex(rows.length - 1, {
        align: "end",
      });
    });
  }, [rows]);

  const isFetchingPrevPage = useRef(false);
  const tryToFetchPrevPage = useCallback(() => {
    if (
      virtualizerRef.current &&
      typeof virtualizerRef.current.findItemIndex === 'function' &&
      virtualizerRef.current.findItemIndex(virtualizerRef.current.scrollOffset) < 10 &&
      pageInfo &&
      pageInfo.hasPrevPage &&
      !pageInfo.isFetchingPrevPage &&
      !isFetchingPrevPage.current
    ) {
      isFetchingPrevPage.current = true;
      void (async function doFetch() {
        try {
          await requestFetchPrevPage();
        } finally {
          isFetchingPrevPage.current = false;
        }
      })();
    }
  }, [pageInfo, requestFetchPrevPage]);

  const isFetchingNextPage = useRef(false);
  const tryToFetchNextPage = useCallback(() => {
    if (
      virtualizerRef.current &&
      typeof virtualizerRef.current.findItemIndex === 'function' &&
      virtualizerRef.current.findItemIndex(virtualizerRef.current.scrollOffset + virtualizerRef.current.viewportSize) + 10 > rows.length &&
      pageInfo &&
      pageInfo.hasNextPage &&
      !pageInfo.isFetchingNextPage &&
      !isFetchingNextPage.current
    ) {
      isFetchingNextPage.current = true;
      void (async function doFetch() {
        try {
          await requestFetchNextPage();
        } finally {
          isFetchingNextPage.current = false;
        }
      })();
    }
  }, [rows.length, pageInfo, requestFetchNextPage]);

  const initiallyFetchedExtraPages = useRef(false);
  useEffect(() => {
    if (rows.length && !initiallyFetchedExtraPages.current) {
      initiallyFetchedExtraPages.current = true;
      tryToFetchPrevPage();
    }
  }, [rows.length, tryToFetchNextPage, tryToFetchPrevPage]);

  const onScroll = useCallback(
    (offset) => {
      if (!virtualizerRef.current) return;
      if (scrollAnchor === "bottom") {
        // The sum may not be 0 because of sub-pixel value when browser's window.devicePixelRatio has decimal value
        shouldStickToBottom.current =
          offset - virtualizerRef.current.scrollSize + virtualizerRef.current.viewportSize >= -1.5;
      }
      tryToFetchPrevPage();
      tryToFetchNextPage();
    },
    [scrollAnchor, tryToFetchNextPage, tryToFetchPrevPage],
  );

  const scrollToBottom = useEvent(() => {
    if (rows.length) {
      virtualizerRef.current?.scrollToIndex(rows.length + 1, {
        align: "end",
        offset: startMargin,
      });
    }
  });

  const scrollToTop = useEvent(() => {
    if (rows.length) {
      virtualizerRef.current?.scrollToIndex(0, { align: "start", offset: -startMargin });
    }
  });

  const scrollToIndex = useEvent((index) => {
    virtualizerRef.current?.scrollToIndex(index, {
      offset: -startMargin,
    });
  });

  const scrollToId = useEvent((id) => {
    const index = rows?.findIndex((row) => row[idKey] === id);
    if (index >= 0) {
      scrollToIndex(index);
    }
  });

  useIsomorphicLayoutEffect(() => {
    registerComponentApi?.({
      scrollToBottom,
      scrollToTop,
      scrollToIndex,
      scrollToId,
      ...selectionApi,
    });
  }, [registerComponentApi, scrollToBottom, scrollToId, scrollToIndex, scrollToTop, selectionApi]);
  // REVIEW: I changed this code line because in the build version rows[index] was undefined
  // const rowTypeContextValue = useCallback((index: number) => rows[index]._row_type, [rows]);
  const rowTypeContextValue = useCallback((index: number) => rows?.[index]?._row_type, [rows]);

  const rowCount = rows?.length ?? 0;

  const startMargin = useStartMargin(hasOutsideScroll, parentRef, scrollRef);

  return (
    <ListItemTypeContext.Provider value={rowTypeContextValue}>
      <ListContext.Provider value={expandContextValue}>
        <ListSelectionContext.Provider value={selectionContextValue}>
          <div
            {...rest}
            ref={rootRef}
            style={style}
            onContextMenu={onContextMenu}
            tabIndex={rowsSelectable ? 0 : undefined}
            onKeyDown={rowsSelectable ? compositeKeyDown : undefined}
            className={classnames(
              styles.outerListWrapper,
              {
                [styles.hasOutsideScroll]: hasOutsideScroll,
              },
              classes?.[COMPONENT_PART_KEY],
              className,
            )}
          >
            {loading && rows.length === 0 && (
              <div className={styles.loadingWrapper}>
                <Spinner />
              </div>
            )}
            {!loading &&
              rows.length === 0 &&
              (emptyListPlaceholder ?? (
                <div className={styles.noRows}>
                  <Text>No data available</Text>
                </div>
              ))}
            {rows.length > 0 && (
              <div
                className={classnames(styles.innerListWrapper, {
                  [styles.reverse]: scrollAnchor === "bottom",
                  [styles.borderCollapse]: borderCollapse,
                  [styles.sectioned]: groupBy !== undefined,
                })}
                data-list-container={true}
              >
                <Virtualizer
                  ref={virtualizerRef}
                  scrollRef={scrollElementRef}
                  shift={shift}
                  onScroll={onScroll}
                  startMargin={startMargin}
                  item={Item as CustomItemComponent}
                >
                  {rows.map((row, rowIndex) => {
                    const key = row?.[idKey] ?? rowIndex;
                    const isFirstItem = rowIndex === 0;
                    const shouldMeasure = isFirstItem && fixedItemSize && row != null;
                    const isSelected = row._row_type === undefined
                      ? !!selectedRowIdMap[String(row[idKey])]
                      : false;
                    // Render different row types
                    switch (row._row_type) {
                      case RowType.SECTION:
                        return (
                          <React.Fragment key={key}>
                            {shouldMeasure ? (
                              <div ref={firstItemRef}>{sectionRenderer?.(row, key)}</div>
                            ) : (
                              sectionRenderer?.(row, key)
                            )}
                          </React.Fragment>
                        );
                      case RowType.SECTION_FOOTER:
                        return (
                          <React.Fragment key={key}>
                            {shouldMeasure ? (
                              <div ref={firstItemRef}>{sectionFooterRenderer?.(row, key)}</div>
                            ) : (
                              sectionFooterRenderer?.(row, key)
                            )}
                          </React.Fragment>
                        );
                      default:
                        return (
                          <React.Fragment key={key}>
                            {shouldMeasure ? (
                              <div ref={firstItemRef}>{itemRenderer(row, key, rowIndex, rowCount, isSelected)}</div>
                            ) : (
                              itemRenderer(row, key, rowIndex, rowCount, isSelected)
                            )}
                          </React.Fragment>
                        );
                    }
                  })}
                </Virtualizer>
              </div>
            )}
          </div>
        </ListSelectionContext.Provider>
      </ListContext.Provider>
    </ListItemTypeContext.Provider>
  );
});

// --- Helper function for List item rendering
export function MemoizedSection({
  node,
  renderChild,
  item,
  contextVars = EMPTY_OBJECT,
}: {
  node: ComponentDef;
  item: any;
  renderChild: RenderChildFn;
  contextVars?: Record<string, any>;
}) {
  const { isExpanded, toggleExpanded } = useContext(ListContext);
  const id = item.id;
  const expanded = isExpanded(id);
  const sectionContext = useMemo(() => {
    return {
      isExpanded: expanded,
      toggle: () => {
        toggleExpanded(id, !expanded);
      },
    };
  }, [expanded, id, toggleExpanded]);

  return (
    <MemoizedItem
      node={node}
      renderChild={renderChild}
      contextVars={{
        $group: { ...item, ...sectionContext },
        ...contextVars,
        $isFirst: item.index === 0,
        $isLast: item.index === item.count - 1,
      }}
    />
  );
}
