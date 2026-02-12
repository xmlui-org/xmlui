import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type {
  CellContext,
  Column,
  ColumnDef,
  HeaderContext,
  PaginationState,
  Row,
  RowData,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Virtualizer, type VirtualizerHandle } from "virtua";
import { orderBy } from "lodash-es";
import classnames from "classnames";

import styles from "./Table.module.scss";

import "./react-table-config.d.ts";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import {
  useHasExplicitHeight,
  useIsomorphicLayoutEffect,
  usePrevious,
  useResizeObserver,
  useScrollParent,
  useStartMargin,
} from "../../components-core/utils/hooks";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { isThemeVarName } from "../../components-core/theming/transformThemeVars";
import { Spinner } from "../Spinner/SpinnerNative";
import { Toggle } from "../Toggle/Toggle";
import { Icon } from "../Icon/IconNative";
import { type OurColumnMetadata } from "../Column/TableContext";
import useRowSelection from "./useRowSelection";
import { PaginationNative, type Position } from "../Pagination/PaginationNative";
import { Part } from "../Part/Part";
import { parseKeyBinding, matchesKeyEvent, type ParsedKeyBinding } from "../../parsers/keybinding-parser/keybinding-parser";

// =====================================================================================================================
// Helper types

// --- Declaration merging, see here: https://tanstack.com/table/v8/docs/api/core/table#meta
declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    cellRenderer: (...args: any[]) => any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    style?: CSSProperties;
    className?: string;
    starSizedWidth?: string;
    accessorKey?: string;
    pinTo?: string;
    cellRenderer?: (row: any, rowIdx: number, colIdx: number, value?: any) => ReactNode;
  }
}

/**
 * This type describes an arbitraty table row that has an integer identifier and an order index.
 */
type RowWithOrder = {
  /**
   * Order index; we use it with paging.
   */
  order: number;

  [x: string | number | symbol]: unknown;
};

type SortingDirection = "ascending" | "descending";
export const TablePaginationControlsLocationValues = ["top", "bottom", "both"] as const;
export type TablePaginationControlsLocation =
  (typeof TablePaginationControlsLocationValues)[number];

export const CheckboxToleranceValues = ["none", "compact", "comfortable", "spacious"] as const;
export type CheckboxTolerance = (typeof CheckboxToleranceValues)[number];

// =====================================================================================================================
// Table Action Context Types

/**
 * Context information about a specific row
 */
export type TableRowContext = {
  /** The row data object */
  item: any;
  /** Row index in the visible/filtered data (0-based) */
  rowIndex: number;
  /** Row ID (from idKey property) */
  rowId: string;
  /** Whether this row is currently selected */
  isSelected: boolean;
  /** Whether this row is currently focused */
  isFocused: boolean;
};

/**
 * Complete context passed to table action event handlers
 */
export type TableActionContext = {
  /** Array of selected row IDs */
  selectedIds: string[];
  /** Array of selected row items (full row objects) */
  selectedItems: any[];
  /** Current focused row context (if any) */
  row: TableRowContext | null;
};

/**
 * Helper function to build action context parameters from current table state.
 * Returns three separate values instead of an object for cleaner event handler APIs.
 * 
 * @param selectedItems - Array of selected row items
 * @param selectedRowIdMap - Map of selected row IDs
 * @param focusedIndex - Currently focused row index (-1 if none)
 * @param data - All table data
 * @param idKey - Property name used for row IDs
 * @returns Tuple of [row context, selected items, selected IDs]
 */
function buildActionContext(
  selectedItems: any[],
  selectedRowIdMap: Record<string, boolean>,
  focusedIndex: number,
  data: any[],
  idKey: string,
): [TableRowContext | null, any[], string[]] {
  const selectedIds = Object.keys(selectedRowIdMap).filter((id) => selectedRowIdMap[id]);

  let row: TableRowContext | null = null;
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

// =====================================================================================================================
// React Table component implementation

type CellVerticalAlign = "top" | "center" | "bottom";

type TableProps = {
  data: any[];
  columns?: OurColumnMetadata[];
  isPaginated?: boolean;
  loading?: boolean;
  headerHeight?: string | number;
  rowsSelectable?: boolean;
  enableMultiRowSelection?: boolean;
  initiallySelected?: string[];
  syncWithAppState?: any;
  pageSizeOptions?: number[];
  currentPageIndex?: number;
  pageSize?: number;
  paginationControlsLocation?: TablePaginationControlsLocation;
  rowDisabledPredicate?: (item: any) => boolean;
  rowUnselectablePredicate?: (item: any) => boolean;
  sortBy?: string;
  sortingDirection?: SortingDirection;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconNoSort?: string;
  lookupEventHandler?: any;
  sortingDidChange?: AsyncFunction;
  onSelectionDidChange?: AsyncFunction;
  willSort?: AsyncFunction;
  style?: CSSProperties;
  className?: string;
  uid?: string;
  noDataRenderer?: () => ReactNode;
  autoFocus?: boolean;
  hideHeader?: boolean;
  hideNoDataView?: boolean;
  hideSelectionCheckboxes?: boolean;
  alwaysShowSelectionHeader?: boolean;
  alwaysShowSortingIndicator?: boolean;
  alwaysShowPagination?: boolean;
  registerComponentApi: RegisterComponentApiFn;
  noBottomBorder?: boolean;
  cellVerticalAlign?: CellVerticalAlign;
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  showCurrentPage?: boolean;
  buttonRowPosition?: Position;
  pageSizeSelectorPosition?: Position;
  pageInfoPosition?: Position;
  checkboxTolerance?: CheckboxTolerance;
  rowHeight?: number;
  rowDoubleClick?: (item: any) => void;
  userSelectCell?: string;
  userSelectRow?: string;
  userSelectHeading?: string;
  keyBindings?: Record<string, string>;
  onSelectAllAction?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  alwaysShowHeader?: boolean;
};

function defaultIsRowDisabled(_: any) {
  return false;
}

function defaultIsRowUnselectable(_: any) {
  return false;
}

const SELECT_COLUMN_WIDTH = 42;

const DEFAULT_PAGE_SIZES = [10];

/**
 * Maps checkbox tolerance values to pixel values
 * @param tolerance - The tolerance level
 * @returns The number of pixels for the tolerance
 */
const getCheckboxTolerancePixels = (tolerance: CheckboxTolerance): number => {
  switch (tolerance) {
    case "none":
      return 0;
    case "compact":
      return 8;
    case "comfortable":
      return 12;
    case "spacious":
      return 16;
    default:
      return 8; // fallback to compact
  }
};

/**
 * Helper function to check if a point is within the checkbox boundary
 * @param pointX - X coordinate of the point to check
 * @param pointY - Y coordinate of the point to check
 * @param checkboxRect - Bounding rectangle of the checkbox
 * @param tolerancePixels - Number of pixels to extend the boundary
 * @returns true if the point is within the checkbox or within tolerancePixels of its boundary
 */
const isWithinCheckboxBoundary = (
  pointX: number,
  pointY: number,
  checkboxRect: DOMRect,
  tolerancePixels: number,
): boolean => {
  // Calculate distance from point to checkbox boundaries
  const distanceToLeft = Math.abs(pointX - checkboxRect.left);
  const distanceToRight = Math.abs(pointX - checkboxRect.right);
  const distanceToTop = Math.abs(pointY - checkboxRect.top);
  const distanceToBottom = Math.abs(pointY - checkboxRect.bottom);

  // Check if point is within the checkbox bounds or within boundary pixels of any edge
  const withinHorizontalBounds = pointX >= checkboxRect.left && pointX <= checkboxRect.right;
  const withinVerticalBounds = pointY >= checkboxRect.top && pointY <= checkboxRect.bottom;
  const withinCheckbox = withinHorizontalBounds && withinVerticalBounds;

  const nearHorizontalBoundary =
    withinVerticalBounds &&
    (distanceToLeft <= tolerancePixels || distanceToRight <= tolerancePixels);
  const nearVerticalBoundary =
    withinHorizontalBounds &&
    (distanceToTop <= tolerancePixels || distanceToBottom <= tolerancePixels);

  return withinCheckbox || nearHorizontalBoundary || nearVerticalBoundary;
};

//These are the important styles to make sticky column pinning work!
//Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
//View the index.css file for more needed styles such as border-collapse: separate
const getCommonPinningStyles = (column: Column<RowWithOrder>): CSSProperties => {
  const isPinned = column.getIsPinned();
  // const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left");
  // const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right");

  return {
    // boxShadow: isLastLeftPinnedColumn
    //   ? "-4px 0 4px -4px gray inset"
    //   : isFirstRightPinnedColumn
    //   ? "4px 0 4px -4px gray inset"
    //   : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : undefined,
    position: isPinned ? "sticky" : "relative",
    backgroundColor: isPinned ? "inherit" : undefined,
    zIndex: isPinned ? 1 : undefined,
  };
};

/**
 * Custom hook to handle keyboard actions for the Table component
 * Merges user-provided key bindings with defaults and detects conflicts
 */
function useTableKeyboardActions({
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
  focusedIndex: number | null;
  data: any[];
  idKey: string;
  rowsSelectable: boolean;
  selectionApi: any;
}) {
  // Merge user key bindings with defaults (user bindings take precedence)
  const mergedBindings = useMemo(() => {
    return {
      ...defaultProps.keyBindings,
      ...keyBindings,
    };
  }, [keyBindings]);

  // Parse key bindings and detect duplicates
  const parsedBindings = useMemo(() => {
    const parsed: Record<string, { binding: ParsedKeyBinding; action: string }> = {};
    const keyToActions: Record<string, string[]> = {};

    // Parse each key binding
    Object.entries(mergedBindings).forEach(([action, keyString]) => {
      if (!keyString) return;

      try {
        const binding = parseKeyBinding(keyString);
        parsed[action] = { binding, action };

        // Track which actions use the same key for duplicate detection
        const keySignature = keyString.toLowerCase().trim();
        if (!keyToActions[keySignature]) {
          keyToActions[keySignature] = [];
        }
        keyToActions[keySignature].push(action);
      } catch (error) {
        console.warn(`Failed to parse key binding for action '${action}': ${keyString}`, error);
      }
    });

    // Log warnings for duplicate key bindings
    Object.entries(keyToActions).forEach(([key, actions]) => {
      if (actions.length > 1) {
        console.warn(
          `Key binding conflict: '${key}' is bound to multiple actions: [${actions.join(", ")}]. Using: ${actions[actions.length - 1]}`
        );
      }
    });

    return parsed;
  }, [mergedBindings]);

  // Create composite keyboard handler
  const handleKeyboardActions = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Check each parsed binding
      for (const { binding, action } of Object.values(parsedBindings)) {
        if (matchesKeyEvent(event.nativeEvent, binding)) {
          // Prevent default browser behavior immediately when key matches
          event.preventDefault();
          
          // If rowsSelectable is false, prevent default but don't execute any actions
          if (!rowsSelectable) {
            return true; // Event handled (prevented), but don't execute action
          }
          
          // Call the appropriate handler
          let handled = false;
          switch (action) {
            case "selectAll":
              // First, select all items via the API
              selectionApi.selectAll();
              
              // Build the selectedRowIdMap for all items (since selectAll selects everything)
              const allSelectedRowIdMap: Record<string, boolean> = {};
              data.forEach((item: any) => {
                allSelectedRowIdMap[String(item[idKey])] = true;
              });
              
              // Build context with all items selected
              const [row, allItems, allIds] = buildActionContext(
                data, // All data items are selected
                allSelectedRowIdMap,
                focusedIndex,
                data,
                idKey
              );
              
              // Finally, invoke the event handler if provided
              if (onSelectAllAction) {
                onSelectAllAction(row, allItems, allIds);
              }
              handled = true;
              break;
            case "cut":
              if (onCutAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey
                );
                onCutAction(row, items, ids);
                handled = true;
              }
              break;
            case "copy":
              if (onCopyAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey
                );
                onCopyAction(row, items, ids);
                handled = true;
              }
              break;
            case "paste":
              if (onPasteAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey
                );
                onPasteAction(row, items, ids);
                handled = true;
              }
              break;
            case "delete":
              if (onDeleteAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey
                );
                onDeleteAction(row, items, ids);
                handled = true;
              }
              break;
          }

          if (handled) {
            return true; // Signal that the event was handled
          }
        }
      }

      return false; // Event not handled
    },
    [parsedBindings, onSelectAllAction, onCutAction, onCopyAction, onPasteAction, onDeleteAction, selectedItems, selectedRowIdMap, focusedIndex, data, idKey, rowsSelectable, selectionApi]
  );

  return handleKeyboardActions;
}

// eslint-disable-next-line react/display-name
export const Table = forwardRef(
  (
    {
      data = defaultProps.data,
      columns = defaultProps.columns,
      isPaginated,
      loading = defaultProps.loading,
      headerHeight,
      rowsSelectable = defaultProps.rowsSelectable,
      enableMultiRowSelection = defaultProps.enableMultiRowSelection,
      initiallySelected = defaultProps.initiallySelected,
      syncWithAppState,
      pageSizeOptions = defaultProps.pageSizeOptions,
      pageSize,
      currentPageIndex = 0,
      rowDisabledPredicate = defaultIsRowDisabled,
      rowUnselectablePredicate = defaultIsRowUnselectable,
      sortBy,
      sortingDirection = defaultProps.sortingDirection,
      iconSortAsc,
      iconSortDesc,
      iconNoSort,
      sortingDidChange,
      willSort,
      lookupEventHandler,
      style,
      className,
      noDataRenderer,
      autoFocus = defaultProps.autoFocus,
      hideHeader = defaultProps.hideHeader,
      hideNoDataView = defaultProps.hideNoDataView,
      hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
      alwaysShowPagination,
      alwaysShowSelectionHeader = defaultProps.alwaysShowSelectionHeader,
      alwaysShowSortingIndicator = defaultProps.alwaysShowSortingIndicator,
      registerComponentApi,
      onSelectionDidChange,
      noBottomBorder = defaultProps.noBottomBorder,
      paginationControlsLocation = defaultProps.paginationControlsLocation,
      cellVerticalAlign = defaultProps.cellVerticalAlign,
      buttonRowPosition = defaultProps.buttonRowPosition,
      pageSizeSelectorPosition = defaultProps.pageSizeSelectorPosition,
      pageInfoPosition = defaultProps.pageInfoPosition,
      showCurrentPage = defaultProps.showCurrentPage,
      showPageInfo = defaultProps.showPageInfo,
      showPageSizeSelector = defaultProps.showPageSizeSelector,
      checkboxTolerance = defaultProps.checkboxTolerance,
      rowHeight = defaultProps.rowHeight,
      rowDoubleClick,
      userSelectCell,
      userSelectRow,
      userSelectHeading,
      keyBindings = defaultProps.keyBindings,
      onSelectAllAction,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      alwaysShowHeader = defaultProps.alwaysShowHeader,
      ...rest
      // cols
    }: TableProps,
    forwardedRef,
  ) => {
    const { getThemeVar } = useTheme();
    const effectiveUserSelectCell = userSelectCell ?? getThemeVar("userSelect-cell-Table") ?? defaultProps.userSelectCell;
    const effectiveUserSelectRow = userSelectRow ?? getThemeVar("userSelect-row-Table") ?? defaultProps.userSelectRow;
    const effectiveUserSelectHeading = userSelectHeading ?? getThemeVar("userSelect-heading-Table") ?? defaultProps.userSelectHeading;
    const safeData = Array.isArray(data) ? data : EMPTY_ARRAY;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const ref = forwardedRef ? composeRefs(wrapperRef, forwardedRef) : wrapperRef;
    const tableRef = useRef<HTMLTableElement>(null);

    const effectivePageSize = pageSize ?? (pageSizeOptions?.[0] || DEFAULT_PAGE_SIZES[0]);

    const effectiveIsPaginated = useMemo(() => {
      if (isPaginated !== undefined) {
        return isPaginated;
      }
      if (pageSize !== undefined) {
        return safeData.length > effectivePageSize;
      }
      return defaultProps.isPaginated;
    }, [isPaginated, pageSize, safeData.length, effectivePageSize]);

    const safeColumns: OurColumnMetadata[] = useMemo(() => {
      if (columns) {
        return columns;
      }
      if (!safeData.length) {
        return EMPTY_ARRAY;
      }
      return Object.keys(safeData[0]).map((key: string) => ({ header: key, accessorKey: key }));
    }, [columns, safeData]);

    useEffect(() => {
      if (autoFocus) {
        wrapperRef.current!.focus();
      }
    }, [autoFocus]);

    // --- Keep track of visible table rows
    const [visibleItems, setVisibleItems] = useState<any[]>(EMPTY_ARRAY);

    // --- Track which row should show forced hover for checkbox
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    // --- Track if the header checkbox should show forced hover
    const [headerCheckboxHovered, setHeaderCheckboxHovered] = useState<boolean>(false);

    // --- Calculate tolerance pixels from the prop
    const tolerancePixels = getCheckboxTolerancePixels(checkboxTolerance);

    // --- Get the operations to manage selected rows in a table
    const {
      toggleRow,
      checkAllRows,
      focusedIndex,
      onKeyDown,
      selectedRowIdMap,
      idKey,
      selectionApi,
    } = useRowSelection({
      items: safeData,
      visibleItems,
      rowsSelectable,
      enableMultiRowSelection,
      rowDisabledPredicate,
      rowUnselectablePredicate,
      onSelectionDidChange,
      initiallySelected,
      syncWithAppState,
    });

    // --- Handle keyboard actions (selectAll, cut, copy, paste, delete)
    const handleKeyboardActions = useTableKeyboardActions({
      keyBindings,
      onSelectAllAction,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      selectedItems: selectionApi.getSelectedItems(),
      selectedRowIdMap,
      focusedIndex,
      data: safeData,
      idKey,
      rowsSelectable,
      selectionApi,
    });

    // --- Create composite keyboard handler that handles both actions and navigation
    const compositeKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        // First, try to handle keyboard actions (selectAll, cut, copy, paste, delete)
        const actionHandled = handleKeyboardActions(event);

        // If no action was handled, delegate to existing row selection keyboard navigation
        if (!actionHandled) {
          onKeyDown(event);
        }
      },
      [handleKeyboardActions, onKeyDown]
    );

    // --- Create data with order information whenever the items in the table change
    const dataWithOrder = useMemo(() => {
      return safeData.map((item, index) => {
        return {
          ...item,
          order: index + 1,
        };
      });
    }, [safeData]);

    // --- Local or external sorting of data
    const [_sortBy, _setSortBy] = useState(sortBy);
    const [_sortingDirection, _setSortingDirection] = useState(sortingDirection);

    useIsomorphicLayoutEffect(() => {
      _setSortBy(sortBy);
    }, [sortBy]);

    useIsomorphicLayoutEffect(() => {
      _setSortingDirection(sortingDirection);
    }, [sortingDirection]);

    const sortedData = useMemo(() => {
      if (!_sortBy) {
        return dataWithOrder;
      }
      return orderBy(dataWithOrder, _sortBy, _sortingDirection === "ascending" ? "asc" : "desc");
    }, [_sortBy, _sortingDirection, dataWithOrder]);

    const _updateSorting = useCallback(
      async (accessorKey: string) => {
        let newDirection: SortingDirection = "ascending";
        let newSortBy = accessorKey;
        // The current key is the same as the last -> the user clicked on the same header twice
        if (_sortBy === accessorKey) {
          // The last sorting direction was ascending -> make it descending
          if (_sortingDirection === "ascending") {
            newDirection = "descending";
            // The last sorting direction was descending -> remove the sorting from the current key
          } else {
            newSortBy = undefined;
          }
        }

        // --- Check if sorting is allowed
        const result = await willSort?.(newSortBy, newDirection);
        if (result === false) {
          return;
        }

        _setSortingDirection(newDirection);
        _setSortBy(newSortBy);

        // External callback function is always called.
        // Even if sorting is internal, we can notify other components through this callback
        sortingDidChange?.(newSortBy, newDirection);
      },
      [_sortBy, willSort, sortingDidChange, _sortingDirection],
    );

    // --- Prepare column renderers according to columns defined in the table
    const columnsWithCustomCell: ColumnDef<any>[] = useMemo(() => {
      return safeColumns.map((col, idx) => {
        // --- Obtain column width information
        const { width, starSizedWidth } = getColumnWidth(col.width, true, "width");
        const { width: minWidth } = getColumnWidth(col.minWidth, false, "minWidth");
        const { width: maxWidth } = getColumnWidth(col.maxWidth, false, "maxWidth");

        const customColumn = {
          ...col,
          header: col.header ?? col.accessorKey ?? " ",
          id: "col_" + idx,
          size: width,
          minSize: minWidth,
          maxSize: maxWidth,
          enableResizing: col.canResize,
          enableSorting: col.canSort !== false && !!col.accessorKey,
          enablePinning: col.pinTo !== undefined,
          meta: {
            starSizedWidth,
            pinTo: col.pinTo,
            style: col.style,
            className: col.className,
            accessorKey: col.accessorKey,
            cellRenderer: col.cellRenderer,
          },
        };
        return customColumn;

        function getColumnWidth(
          colWidth: any,
          allowStarSize: boolean,
          propName: string,
        ): { width?: number; starSizedWidth?: string } {
          let starSizedWidth: string;
          let width: number;
          const resolvedWidth = isThemeVarName(colWidth) ? getThemeVar(colWidth) : colWidth;
          if (typeof resolvedWidth === "number") {
            width = resolvedWidth;
          } else if (typeof resolvedWidth === "string") {
            const oneStarSizedWidthMatch = resolvedWidth.match(/^\s*\*\s*$/);
            if (allowStarSize && oneStarSizedWidthMatch) {
              starSizedWidth = "1*";
            } else {
              const starSizedWidthMatch = resolvedWidth.match(/^\s*(\d+)\s*\*\s*$/);
              if (allowStarSize && starSizedWidthMatch) {
                starSizedWidth = starSizedWidthMatch[1] + "*";
              } else {
                const pixelWidthMatch = resolvedWidth.match(/^\s*(\d+)\s*(px)?\s*$/);
                if (pixelWidthMatch) {
                  width = Number(pixelWidthMatch[1]);
                } else {
                  throw new Error(`Invalid TableColumnDef '${propName}' value: ${resolvedWidth}`);
                }
              }
            }
          }
          if (width === undefined && starSizedWidth === undefined && allowStarSize) {
            starSizedWidth = "1*";
          }
          return { width, starSizedWidth };
        }
      });
    }, [getThemeVar, safeColumns]);

    // --- Prepare column renderers according to columns defined in the table supporting optional row selection
    const columnsWithSelectColumn: ColumnDef<any>[] = useMemo(() => {
      if (hideSelectionCheckboxes) {
        return columnsWithCustomCell;
      }
      // --- Extend the columns with a selection checkbox (indeterminate)
      const selectColumn = {
        id: "select",
        size: SELECT_COLUMN_WIDTH,
        enableResizing: false,
        enablePinning: true,
        meta: {
          pinTo: "left",
        },
        header: ({ table }: HeaderContext<any, unknown>) =>
          enableMultiRowSelection ? (
            <Toggle
              {...{
                className: classnames(styles.checkBoxWrapper, {
                  [styles.showInHeader]: alwaysShowSelectionHeader,
                  [styles.forceHoverWrapper]: headerCheckboxHovered,
                }),
                value: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                forceHover: headerCheckboxHovered,
                onDidChange: () => {
                  const allSelected = table
                    .getRowModel()
                    .rows.every(
                      (row) =>
                        rowDisabledPredicate(row.original) ||
                        rowUnselectablePredicate(row.original) ||
                        row.getIsSelected(),
                    );
                  checkAllRows(!allSelected);
                },
              }}
            />
          ) : null,
        cell: ({ row }: CellContext<any, unknown>) => {
          return <>
            {row.getCanSelect() &&
            <Toggle
              {...{
                className: classnames(styles.checkBoxWrapper, {
                  [styles.forceHoverWrapper]: hoveredRowId === row.id,
                }),
                value: row.getIsSelected(),
                indeterminate: row.getIsSomeSelected(),
                forceHover: hoveredRowId === row.id,
                onDidChange: () => {
                  // In single selection mode, allow deselection by checking if already selected
                  if (!enableMultiRowSelection && row.getIsSelected()) {
                    checkAllRows(false); // Deselect all (which is just this one row)
                  } else {
                    toggleRow(row.original, { metaKey: true });
                  }
                },
              }}
            />}
          </>;
        },
      };
      return rowsSelectable ? [selectColumn, ...columnsWithCustomCell] : columnsWithCustomCell;
    }, [
      rowsSelectable,
      columnsWithCustomCell,
      enableMultiRowSelection,
      alwaysShowSelectionHeader,
      checkAllRows,
      toggleRow,
      rowDisabledPredicate,
      rowUnselectablePredicate,
      hoveredRowId,
      headerCheckboxHovered,
      hideSelectionCheckboxes,
    ]);

    // --- Set up page information (using the first page size option)
    const [pagination, setPagination] = useState<PaginationState>({
      pageSize: effectiveIsPaginated ? effectivePageSize : Number.MAX_VALUE,
      pageIndex: currentPageIndex,
    });

    const prevIsPaginated = usePrevious(effectiveIsPaginated);

    useEffect(() => {
      if (!prevIsPaginated && effectiveIsPaginated) {
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: effectivePageSize,
            pageIndex: 0,
          };
        });
      }
      if (prevIsPaginated && !effectiveIsPaginated) {
        setPagination(() => {
          return {
            pageIndex: 0,
            pageSize: Number.MAX_VALUE,
          };
        });
      }
    }, [effectiveIsPaginated, pageSizeOptions, prevIsPaginated, effectivePageSize]);

    const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

    const columnPinning = useMemo(() => {
      const left: Array<string> = [];
      const right: Array<string> = [];
      columnsWithSelectColumn.forEach((col) => {
        if (col.meta?.pinTo === "right") {
          right.push(col.id!);
        }
        if (col.meta?.pinTo === "left") {
          left.push(col.id!);
        }
      });
      return {
        left,
        right,
      };
    }, [columnsWithSelectColumn]);

    // --- Memoize the row selection predicate to ensure it's stable across renders
    const enableRowSelectionFn = useCallback(
      (row: Row<RowWithOrder>) => {
        return rowsSelectable && !rowUnselectablePredicate(row.original);
      },
      [rowUnselectablePredicate, rowsSelectable],
    );

    // --- Use the @tanstack/core-table component that manages a table
    const table = useReactTable<RowWithOrder>({
      columns: columnsWithSelectColumn,
      data: sortedData,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: effectiveIsPaginated ? getPaginationRowModel() : undefined,
      enableRowSelection: enableRowSelectionFn,
      enableMultiRowSelection,
      columnResizeMode: "onChange",
      getRowId: useCallback(
        (originalRow: any) => {
          return originalRow[idKey] + "";
        },
        [idKey],
      ),
      state: useMemo(
        () => ({
          pagination,
          rowSelection: selectedRowIdMap,
          columnSizing,
          columnPinning,
        }),
        [columnPinning, columnSizing, pagination, selectedRowIdMap],
      ),
      onColumnSizingChange: setColumnSizing,
      onPaginationChange: setPagination,
    });

    // --- Select the set of visible rows whenever the table rows change
    const rows = table.getRowModel().rows;
    useEffect(() => {
      setVisibleItems(rows.map((row) => row.original));
    }, [rows]);

    const scrollParent = useScrollParent(wrapperRef.current?.parentElement);
    const scrollRef = useRef(scrollParent);
    scrollRef.current = scrollParent;

    const hasHeight = useHasExplicitHeight(wrapperRef);

    const hasOutsideScroll = scrollRef.current && !hasHeight;

    const startMargin = useStartMargin(hasOutsideScroll, wrapperRef, scrollRef);

    const theadRef = useRef<HTMLTableSectionElement>(null);

    // Use transform-based approach to keep header visible during outside scroll.
    // The header stays in document flow (no position:fixed) — we just visually
    // shift it with translate3d, which avoids all layout-shift/bounce issues.
    // We run synchronously in the scroll handler and cache layout offsets so we
    // only use cheap scrollTop reads per frame.
    // On mobile, scroll events are throttled during momentum scrolling, so we
    // also listen to touchmove (fires every frame during active touch) and run
    // a rAF polling loop during the momentum phase (touchend → scrollend/idle).
    useEffect(() => {
      if (!alwaysShowHeader || !hasOutsideScroll || !tableRef.current || !theadRef.current) return;

      const isBody = !scrollRef.current || scrollRef.current === document.body;
      const scrollEl = isBody ? document.documentElement : scrollRef.current!;
      const scrollTarget: EventTarget = isBody ? window : scrollRef.current!;
      const thead = theadRef.current;
      const table = tableRef.current;

      // Cache layout values — recomputed only on resize, not every scroll
      let tableOffsetTop = 0;
      let tableHeight = 0;
      let theadHeight = thead.offsetHeight;
      let fixedHeaderOffset = 0;
      let lastOffset = -1;

      const getFixedHeaderOffset = (): number => {
        // Get the root node for this component (either document or shadow root)
        const rootNode = thead.getRootNode() as Document | ShadowRoot;

        // Combine selectors into single query for better performance
        // Note: Avoid [style*="..."] selectors - they only match inline styles, not computed styles
        const selector = '[data-part-header], [role="banner"], header, .app-header, .header, [data-fixed-header]';
        
        let maxBottom = 0;
        
        try {
          const elements = rootNode.querySelectorAll(selector);
          
          // Use for...of for better performance than forEach
          for (const el of elements) {
            if (el === thead || thead.contains(el)) continue;
            
            const style = window.getComputedStyle(el);
            
            // Only check position if element is fixed/sticky
            if (style.position === 'fixed' || style.position === 'sticky') {
              const rect = el.getBoundingClientRect();
              // Check if element is at or near the top of the viewport
              if (rect.top <= 10 && rect.bottom > 0) {
                maxBottom = Math.max(maxBottom, rect.bottom);
              }
            }
          }
        } catch (e) {
          // Invalid selector or other DOM error, return 0
        }
        
        return maxBottom;
      };

      const applyTransform = () => {
        const scrollTop = isBody ? window.scrollY : scrollEl.scrollTop;
        const tableTop = tableOffsetTop - scrollTop;

        const tableScrolledPast = tableTop < 0;
        const tableStillVisible = tableTop + tableHeight > theadHeight;

        if (tableScrolledPast && tableStillVisible) {
          const offset = -tableTop + fixedHeaderOffset;
          if (offset !== lastOffset) {
            lastOffset = offset;
            thead.style.transform = `translate3d(0,${offset}px,0)`;
            if (!thead.style.zIndex) {
              thead.style.zIndex = '1000';
              thead.style.position = 'relative';
            }
          }
        } else if (lastOffset !== -1) {
          lastOffset = -1;
          thead.style.transform = '';
          thead.style.zIndex = '';
          thead.style.position = '';
        }
      };

      const cacheOffsets = () => {
        theadHeight = thead.offsetHeight;
        tableHeight = table.offsetHeight;
        fixedHeaderOffset = getFixedHeaderOffset();
        if (isBody) {
          tableOffsetTop = table.getBoundingClientRect().top + window.scrollY;
        } else {
          tableOffsetTop =
            table.getBoundingClientRect().top -
            scrollEl.getBoundingClientRect().top +
            scrollEl.scrollTop;
        }
        // Ensure header is correctly positioned after resizing (e.g. orientation change)
        requestAnimationFrame(applyTransform);
      };
      cacheOffsets();

      const ro = new ResizeObserver(cacheOffsets);
      ro.observe(table);
      ro.observe(scrollEl === document.documentElement ? document.body : scrollEl);

      // --- Momentum-phase polling ---
      // After touchend, mobile browsers momentum-scroll but throttle scroll events.
      // We poll via rAF until scroll position stabilises for ~100ms.
      let pollRafId: number | null = null;
      let lastPollScrollTop = -1;
      let idleFrames = 0;
      const IDLE_THRESHOLD = 6; // ~100ms at 60fps

      const pollLoop = () => {
        applyTransform();
        const currentScroll = isBody ? window.scrollY : scrollEl.scrollTop;
        if (currentScroll === lastPollScrollTop) {
          idleFrames++;
        } else {
          idleFrames = 0;
          lastPollScrollTop = currentScroll;
        }
        if (idleFrames < IDLE_THRESHOLD) {
          pollRafId = requestAnimationFrame(pollLoop);
        } else {
          pollRafId = null;
        }
      };

      const startPolling = () => {
        if (pollRafId == null) {
          idleFrames = 0;
          lastPollScrollTop = -1;
          pollRafId = requestAnimationFrame(pollLoop);
        }
      };

      const stopPolling = () => {
        if (pollRafId != null) {
          cancelAnimationFrame(pollRafId);
          pollRafId = null;
        }
      };

      // --- Event handlers ---
      const onScroll = () => {
        applyTransform();
      };

      const onTouchMove = () => {
        applyTransform();
      };

      const onTouchEnd = () => {
        // Finger lifted — momentum scroll may be happening. Start polling.
        startPolling();
      };

      const onTouchStart = () => {
        // Finger back down — stop polling, touchmove will take over.
        stopPolling();
      };

      scrollTarget.addEventListener('scroll', onScroll, { passive: true });
      scrollTarget.addEventListener('touchmove', onTouchMove, { passive: true });
      scrollTarget.addEventListener('touchend', onTouchEnd, { passive: true });
      scrollTarget.addEventListener('touchstart', onTouchStart, { passive: true });
      applyTransform(); // initial check

      return () => {
        scrollTarget.removeEventListener('scroll', onScroll);
        scrollTarget.removeEventListener('touchmove', onTouchMove);
        scrollTarget.removeEventListener('touchend', onTouchEnd);
        scrollTarget.removeEventListener('touchstart', onTouchStart);
        stopPolling();
        ro.disconnect();
        thead.style.transform = '';
        thead.style.zIndex = '';
        thead.style.position = '';
      };
    }, [alwaysShowHeader, hasOutsideScroll]);

    // ==================================================================================
    // Virtua Virtualization
    // ==================================================================================
    const virtualizerRef = useRef<VirtualizerHandle>(null);
    const firstRowRef = useRef<HTMLTableRowElement>(null);
    const [measuredRowHeight, setMeasuredRowHeight] = useState<number | undefined>(undefined);

    // Measure first row height (follows List component pattern)
    useEffect(() => {
      if (firstRowRef.current && !measuredRowHeight && rows.length > 0) {
        requestAnimationFrame(() => {
          if (firstRowRef.current) {
            const height = firstRowRef.current.offsetHeight;
            if (height > 0) {
              setMeasuredRowHeight(height);
            }
          }
        });
      }
    }, [measuredRowHeight, rows.length]);

    const effectiveRowHeight = measuredRowHeight || rowHeight || defaultProps.rowHeight;

    const hasData = safeData.length !== 0;

    const touchedSizesRef = useRef<Record<string, boolean>>({});
    const columnSizeTouched = useCallback((id: string) => {
      touchedSizesRef.current[id] = true;
    }, []);

    const recalculateStarSizes = useEvent(() => {
      if (!tableRef.current) {
        return;
      }
      let availableWidth = tableRef.current.clientWidth - 1;
      // -1 to prevent horizontal scroll in scaled browsers (when you zoom in)
      const widths: Record<string, number> = {};
      const columnsWithoutSize: Array<Column<RowWithOrder>> = [];
      const numberOfUnitsById: Record<string, number> = {};

      table.getAllColumns().forEach((column) => {
        if (column.columnDef.size !== undefined || touchedSizesRef.current[column.id]) {
          availableWidth -= columnSizing[column.id] || column.columnDef.size || 0;
        } else {
          columnsWithoutSize.push(column);
          let units: number;
          if (column.columnDef.meta?.starSizedWidth) {
            units = Number(column.columnDef.meta?.starSizedWidth.replace("*", "").trim()) || 1;
          } else {
            units = 1;
          }
          numberOfUnitsById[column.id] = units;
        }
      });
      const numberOfAllUnits = Object.values(numberOfUnitsById).reduce((acc, val) => acc + val, 0);
      columnsWithoutSize.forEach((column) => {
        widths[column.id] = Math.floor(
          availableWidth * (numberOfUnitsById[column.id] / numberOfAllUnits),
        );
      });
      flushSync(() => {
        setColumnSizing((prev) => {
          return {
            ...prev,
            ...widths,
          };
        });
      });
    });

    useResizeObserver(tableRef, recalculateStarSizes);

    useIsomorphicLayoutEffect(() => {
      queueMicrotask(() => {
        recalculateStarSizes();
      });
    }, [recalculateStarSizes, safeColumns]);

    useIsomorphicLayoutEffect(() => {
      registerComponentApi(selectionApi);
    }, [registerComponentApi, selectionApi]);

    const paginationControls = (
      <PaginationNative
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        itemCount={safeData.length}
        pageSizeOptions={pageSizeOptions}
        onPageDidChange={(page) => table.setPageIndex(page)}
        onPageSizeDidChange={(size) => table.setPageSize(size)}
        showCurrentPage={showCurrentPage}
        showPageInfo={showPageInfo}
        showPageSizeSelector={showPageSizeSelector}
        buttonRowPosition={buttonRowPosition}
        pageInfoPosition={pageInfoPosition}
        pageSizeSelectorPosition={pageSizeSelectorPosition}
      />
    );

    const shouldShowPagination = useMemo(() => {
      if (alwaysShowPagination !== undefined) {
        return alwaysShowPagination;
      }
      if (!effectiveIsPaginated || !hasData || rows.length === 0 || !pagination) {
        return false;
      }
      return table.getPageCount() > 1;
    }, [effectiveIsPaginated, hasData, rows.length, pagination, alwaysShowPagination, table]);

    return (
      <div
        {...rest}
        className={classnames(styles.wrapper, className, { [styles.noScroll]: hasOutsideScroll })}
        tabIndex={0}
        onKeyDown={compositeKeyDown}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          
          // Skip focusing wrapper if clicking on interactive elements that handle their own focus
          if (target.closest("button")) {
            return;
          }
          
          // Skip if target is an element that expects keyboard text input
          if (isTextInputElement(target)) {
            return;
          }
          
          // Focus the wrapper to enable keyboard shortcuts
          wrapperRef.current?.focus();
        }}
        ref={ref}
        style={style}
      >
        {shouldShowPagination &&
          (paginationControlsLocation === "top" || paginationControlsLocation === "both") &&
          paginationControls}

        <table className={styles.table} ref={tableRef}>
          {!hideHeader && (
            <>
              <thead 
                ref={theadRef}
                style={{ 
                  height: headerHeight,
                  position: 'sticky',
                  top: 0,
                  minWidth: "100%",
                  willChange: alwaysShowHeader && hasOutsideScroll ? 'transform' : undefined,
                }} 
                className={styles.headerWrapper}
              >
              {table.getHeaderGroups().map((headerGroup, headerGroupIndex) => (
                <tr
                  key={`${headerGroup.id}-${headerGroupIndex}`}
                  className={classnames(styles.headerRow, {
                    [styles.allSelected]: table.getIsAllRowsSelected(),
                  })}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    const headerCell = target.closest("th");

                    // Only handle clicks for the select column header
                    if (headerCell && rowsSelectable && enableMultiRowSelection) {
                      const header = headerGroup.headers.find((h) => {
                        const headerElement = headerCell;
                        return (
                          headerElement?.getAttribute("data-column-id") === h.id ||
                          h.id === "select"
                        );
                      });

                      if (header && header.id === "select") {
                        const clickX = event.clientX;
                        const clickY = event.clientY;
                        const checkbox = headerCell.querySelector(
                          'input[type="checkbox"]',
                        ) as HTMLInputElement;

                        if (checkbox) {
                          const checkboxRect = checkbox.getBoundingClientRect();

                          if (
                            isWithinCheckboxBoundary(clickX, clickY, checkboxRect, tolerancePixels)
                          ) {
                            // Prevent the default click and manually trigger the checkbox
                            event.preventDefault();
                            event.stopPropagation();

                            const allSelected = table
                              .getRowModel()
                              .rows.every(
                                (row) =>
                                  rowDisabledPredicate(row.original) ||
                                  rowUnselectablePredicate(row.original) ||
                                  row.getIsSelected(),
                              );
                            checkAllRows(!allSelected);
                          }
                        }
                      }
                    }
                  }}
                  onMouseMove={(event) => {
                    if (rowsSelectable && enableMultiRowSelection) {
                      const target = event.target as HTMLElement;
                      const headerCell = target.closest("th");

                      if (headerCell) {
                        const header = headerGroup.headers.find((h) => {
                          const headerElement = headerCell;
                          return (
                            headerElement?.getAttribute("data-column-id") === h.id ||
                            h.id === "select"
                          );
                        });

                        if (header && header.id === "select") {
                          const mouseX = event.clientX;
                          const mouseY = event.clientY;
                          const checkbox = headerCell.querySelector(
                            'input[type="checkbox"]',
                          ) as HTMLInputElement;

                          if (checkbox) {
                            const checkboxRect = checkbox.getBoundingClientRect();
                            const shouldShowHover = isWithinCheckboxBoundary(
                              mouseX,
                              mouseY,
                              checkboxRect,
                              tolerancePixels,
                            );

                            if (shouldShowHover && !headerCheckboxHovered) {
                              setHeaderCheckboxHovered(true);
                              event.currentTarget.style.cursor = "pointer";
                            } else if (!shouldShowHover && headerCheckboxHovered) {
                              setHeaderCheckboxHovered(false);
                              event.currentTarget.style.cursor = "";
                            }
                          }
                        } else if (headerCheckboxHovered) {
                          setHeaderCheckboxHovered(false);
                          event.currentTarget.style.cursor = "";
                        }
                      }
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (headerCheckboxHovered) {
                      setHeaderCheckboxHovered(false);
                      event.currentTarget.style.cursor = "";
                    }
                  }}
                >
                  {headerGroup.headers.map((header, headerIndex) => {
                    const { width, ...style } = header.column.columnDef.meta?.style || {};
                    const size = header.getSize();
                    const alignmentClass =
                      cellVerticalAlign === "top"
                        ? styles.alignTop
                        : cellVerticalAlign === "bottom"
                          ? styles.alignBottom
                          : styles.alignCenter;
                    return (
                      <th
                        key={`${header.id}-${headerIndex}`}
                        data-column-id={header.id}
                        className={classnames(styles.columnCell, alignmentClass)}
                        colSpan={header.colSpan}
                        style={{
                          position: "relative",
                          width: size,
                          flexShrink: 0,
                          ...getCommonPinningStyles(header.column),
                        }}
                      >
                        <ClickableHeader
                          hasSorting={
                            header.column.columnDef.enableSorting &&
                            !!header.column.columnDef.meta?.accessorKey
                          }
                          updateSorting={() =>
                            _updateSorting(header.column.columnDef.meta?.accessorKey)
                          }
                        >
                          <div className={styles.headerContent} style={{ ...style, userSelect: effectiveUserSelectHeading as React.CSSProperties['userSelect'] }}>
                            {
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              ) as ReactNode
                            }
                            {header.column.columnDef.enableSorting && (
                              <Part partId="orderIndicator">
                                <span
                                  className={classnames(styles.orderingIndicator, {
                                    [styles.activeOrdering]:
                                      header.column.columnDef.meta?.accessorKey === _sortBy,
                                    [styles.alwaysShow]: alwaysShowSortingIndicator,
                                  })}
                                >
                                  <ColumnOrderingIndicator
                                    iconSortAsc={iconSortAsc}
                                    iconSortDesc={iconSortDesc}
                                    iconNoSort={iconNoSort}
                                    direction={
                                      header.column.columnDef.meta?.accessorKey === _sortBy
                                        ? _sortingDirection
                                        : undefined
                                    }
                                  />
                                </span>
                              </Part>
                            )}
                          </div>
                        </ClickableHeader>
                        {header.column.getCanResize() && (
                          <div
                            {...{
                              onDoubleClick: () => {
                                touchedSizesRef.current[header.column.id] = false;
                                if (header.column.columnDef.size !== undefined) {
                                  header.column.resetSize();
                                } else {
                                  recalculateStarSizes();
                                }
                              },
                              onMouseDown: (event) => {
                                columnSizeTouched(header.column.id);
                                header.getResizeHandler()(event);
                              },
                              onTouchStart: (event) => {
                                columnSizeTouched(header.column.id);
                                header.getResizeHandler()(event);
                              },
                              className: classnames(styles.resizer, {
                                [styles.isResizing]: header.column.getIsResizing(),
                              }),
                            }}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            </>
          )}
          {hasData && (
            <tbody className={styles.tableBody}>
              <Virtualizer
                ref={virtualizerRef}
                itemSize={effectiveRowHeight}
                startMargin={startMargin}
              >
                {rows.map((row, rowIndex) => {
                  const isFirstRow = rowIndex === 0;
                  return (
                    <tr
                      data-index={rowIndex}
                      key={`${row.id}-${rowIndex}`}
                      ref={isFirstRow ? firstRowRef : undefined}
                      className={classnames(styles.row, {
                        [styles.selected]: row.getIsSelected(),
                        [styles.focused]: focusedIndex === rowIndex,
                        [styles.disabled]: rowDisabledPredicate(row.original),
                        [styles.noBottomBorder]: noBottomBorder,
                      })}
                      style={{ userSelect: effectiveUserSelectRow as React.CSSProperties['userSelect'] }}
                      onClick={(event) => {
                        if (!row.getCanSelect()) {
                          return;
                        }
                        if (event?.defaultPrevented) {
                          return;
                        }
                        const target = event.target as HTMLElement;
                        if (target.tagName.toLowerCase() === "input") {
                          return;
                        }
                        if (target.closest("button")) {
                          return;
                        }
                        
                        // Focus the table wrapper to enable keyboard shortcuts (after checking input/button)
                        wrapperRef.current?.focus();

                        // Check if click is within checkbox boundary
                        const currentRow = event.currentTarget as HTMLElement;
                        const checkbox = currentRow.querySelector(
                          'input[type="checkbox"]',
                        ) as HTMLInputElement;

                        if (checkbox) {
                          const checkboxRect = checkbox.getBoundingClientRect();
                          const clickX = event.clientX;
                          const clickY = event.clientY;

                          if (
                            isWithinCheckboxBoundary(clickX, clickY, checkboxRect, tolerancePixels)
                          ) {
                            // Toggle the checkbox when clicking within the boundary
                            // In single selection mode, allow deselection by checking if already selected
                            if (!enableMultiRowSelection && row.getIsSelected()) {
                              checkAllRows(false); // Deselect all (which is just this one row)
                            } else {
                              toggleRow(row.original, { metaKey: true });
                            }
                            return;
                          }
                        }
                        toggleRow(row.original, event);
                      }}
                      onDoubleClick={(event) => {
                          // Prevent browser text selection on double-click
                          event.preventDefault();

                          // Call external handler if provided
                          try {
                            if (typeof (rowDoubleClick as any) === "function") {
                              (rowDoubleClick as any)(row.original);
                            }
                          } catch (e) {
                            // swallow errors from handler
                          }
                        }}
                      onMouseMove={(event) => {
                        // Change cursor and hover state when within checkbox boundary
                        const currentRow = event.currentTarget as HTMLElement;
                        const checkbox = currentRow.querySelector(
                          'input[type="checkbox"]',
                        ) as HTMLInputElement;

                        if (checkbox) {
                          const checkboxRect = checkbox.getBoundingClientRect();
                          const mouseX = event.clientX;
                          const mouseY = event.clientY;

                          const shouldShowHover = isWithinCheckboxBoundary(
                            mouseX,
                            mouseY,
                            checkboxRect,
                            tolerancePixels,
                          );

                          // Update hover state and cursor based on proximity to checkbox
                          if (shouldShowHover) {
                            setHoveredRowId(row.id);
                            currentRow.style.cursor = "pointer";
                          } else {
                            setHoveredRowId(null);
                            currentRow.style.cursor = "";
                          }
                        }
                      }}
                      onMouseLeave={(event) => {
                        // Reset cursor and hover state when leaving the row
                        const currentRow = event.currentTarget as HTMLElement;
                        currentRow.style.cursor = "";
                        setHoveredRowId(null);
                      }}
                      onContextMenu={(event) => {
                        // Prevent default browser context menu
                        event.preventDefault();
                        
                        // Use lookupEventHandler with context containing row variables
                        if (lookupEventHandler) {
                          const handler = lookupEventHandler("contextMenu", {
                            context: {
                              $item: row.original,
                              $row: row.original,
                              $rowIndex: rowIndex,
                              $itemIndex: rowIndex,
                            },
                            ephemeral: true, // Don't cache this handler since context changes per row
                          });
                          
                          handler?.(event);
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell, i) => {
                        const cellRenderer = cell.column.columnDef?.meta?.cellRenderer;
                        const size = cell.column.getSize();
                        const columnClassName = cell.column.columnDef?.meta?.className;
                        const columnStyle = cell.column.columnDef?.meta?.style;
                        const alignmentClass =
                          cellVerticalAlign === "top"
                            ? styles.alignTop
                            : cellVerticalAlign === "bottom"
                              ? styles.alignBottom
                              : styles.alignCenter;
                        return (
                          <td
                            className={classnames(styles.cell, alignmentClass, columnClassName)}
                            key={`${cell.id}-${i}`}
                            style={{
                              width: size,
                              flexShrink: 0,
                              ...getCommonPinningStyles(cell.column),
                              ...columnStyle,
                            }}
                          >
                            <div className={styles.cellContent} style={{ userSelect: effectiveUserSelectCell as React.CSSProperties['userSelect'] }}>
                              {cellRenderer
                                ? cellRenderer(cell.row.original, rowIndex, i, cell?.getValue())
                                : (flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  ) as ReactNode)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Virtualizer>
            </tbody>
          )}
        </table>
        {loading && !hasData && (
          <div className={styles.loadingWrapper}>
            <Spinner />
          </div>
        )}
        {!hideNoDataView &&
          !loading &&
          !hasData &&
          (noDataRenderer ? (
            noDataRenderer()
          ) : (
            <div className={styles.noRows}>No data available</div>
          ))}

        {shouldShowPagination &&
          (paginationControlsLocation === "bottom" || paginationControlsLocation === "both") &&
          paginationControls}
      </div>
    );
  },
);

type ClickableHeaderProps = {
  hasSorting?: boolean;
  updateSorting?: () => void;
  children?: ReactNode;
};

function ClickableHeader({ hasSorting, updateSorting, children }: ClickableHeaderProps) {
  return hasSorting ? (
    <button type="button" className={styles.clickableHeader} onClick={updateSorting}>
      {children}
    </button>
  ) : (
    <>{children}</>
  );
}

type ColumnOrderingIndicatorProps = {
  direction?: SortingDirection;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconNoSort?: string;
};

function ColumnOrderingIndicator({
  direction,
  iconSortAsc = "sortasc:Table",
  iconSortDesc = "sortdesc:Table",
  iconNoSort = "nosort:Table",
}: ColumnOrderingIndicatorProps) {
  if (direction === "ascending") {
    return <Icon name={iconSortAsc} fallback="sortasc" size="12" />; //sortasc
  } else if (direction === "descending") {
    return <Icon name={iconSortDesc} fallback="sortdesc" size="12" />; //sortdesc
  }
  return iconNoSort !== "-" ? (
    <Icon name={iconNoSort} fallback="nosort" size="12" />
  ) : (
    <Icon name={iconNoSort} size="12" />
  ); //nosort
}

/**
 * Checks if an HTML element expects keyboard text input
 * @param target - The HTML element to check
 * @returns true if the element expects text input (textarea, contenteditable, or text-like input)
 */
function isTextInputElement(target: HTMLElement): boolean {
  return (
    target.tagName.toLowerCase() === "textarea" ||
    target.contentEditable === "true" ||
    (target.tagName.toLowerCase() === "input" && 
     !["checkbox", "radio", "button", "submit", "reset", "file", "image"].includes((target as HTMLInputElement).type))
  );
}

export const defaultProps = {
  idKey: "id",
  data: EMPTY_ARRAY,
  columns: EMPTY_ARRAY,
  isPaginated: false,
  loading: false,
  rowsSelectable: false,
  enableMultiRowSelection: true,
  initiallySelected: EMPTY_ARRAY,
  pageSizeOptions: [5, 10, 15],
  sortingDirection: "ascending" as SortingDirection,
  autoFocus: false,
  hideHeader: false,
  hideNoDataView: false,
  hideSelectionCheckboxes: false,
  alwaysShowSelectionHeader: false,
  alwaysShowSortingIndicator: false,
  noBottomBorder: false,
  paginationControlsLocation: "bottom" as TablePaginationControlsLocation,
  cellVerticalAlign: "center" as CellVerticalAlign,
  showPageInfo: true,
  showPageSizeSelector: true,
  showCurrentPage: true,
  buttonRowPosition: "center" as Position,
  pageSizeSelectorPosition: "start" as Position,
  pageInfoPosition: "end" as Position,
  checkboxTolerance: "compact" as CheckboxTolerance,
  rowHeight: 40, // For virtua virtualization
  userSelectCell: "auto",
  userSelectRow: "auto",
  userSelectHeading: "none",
  keyBindings: {
    selectAll: "CmdOrCtrl+A",
    cut: "CmdOrCtrl+X",
    copy: "CmdOrCtrl+C",
    paste: "CmdOrCtrl+V",
    delete: "Delete",
  },
  alwaysShowHeader: false,
};
