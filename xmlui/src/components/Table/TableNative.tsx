import type { CSSProperties, ReactNode } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type {
  CellContext,
  Column,
  ColumnDef,
  HeaderContext,
  PaginationState,
  RowData,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { useVirtualizer } from "@tanstack/react-virtual";
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
// React Table component implementation

type CellVerticalAlign = "top" | "center" | "bottom";

type TableProps = {
  dataIdProperty?: string;
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
  sortBy?: string;
  sortingDirection?: SortingDirection;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconNoSort?: string;
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
  alwaysShowSelectionHeader?: boolean;
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
};

function defaultIsRowDisabled(_: any) {
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

// eslint-disable-next-line react/display-name
export const Table = forwardRef(
  (
    {
      // TEMP: will be removed in favor of idKey
      dataIdProperty,
      data = defaultProps.data,
      columns = defaultProps.columns,
      isPaginated = defaultProps.isPaginated,
      loading = defaultProps.loading,
      headerHeight,
      rowsSelectable = defaultProps.rowsSelectable,
      enableMultiRowSelection = defaultProps.enableMultiRowSelection,
      initiallySelected = defaultProps.initiallySelected,
      syncWithAppState,
      pageSizeOptions = defaultProps.pageSizeOptions,
      pageSize = pageSizeOptions?.[0] || DEFAULT_PAGE_SIZES[0],
      currentPageIndex = 0,
      rowDisabledPredicate = defaultIsRowDisabled,
      sortBy,
      sortingDirection = defaultProps.sortingDirection,
      iconSortAsc,
      iconSortDesc,
      iconNoSort,
      sortingDidChange,
      willSort,
      style,
      className,
      noDataRenderer,
      autoFocus = defaultProps.autoFocus,
      hideHeader = defaultProps.hideHeader,
      hideNoDataView = defaultProps.hideNoDataView,
      alwaysShowSelectionHeader = defaultProps.alwaysShowSelectionHeader,
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
      ...rest
      // cols
    }: TableProps,
    forwardedRef,
  ) => {
    const { getThemeVar } = useTheme();
    const arrayData = Array.isArray(data) ? data : EMPTY_ARRAY;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const ref = forwardedRef ? composeRefs(wrapperRef, forwardedRef) : wrapperRef;
    const tableRef = useRef<HTMLTableElement>(null);
    const estimatedHeightRef = useRef<number | null>(null);

    const safeData = useMemo(() => {
      if (arrayData.length === 0) {
        return arrayData;
      }
      if (dataIdProperty) {
        return arrayData.map((item) => ({ ...item, id: item[dataIdProperty] }));
      }
      // --- Check the first 3 items for an 'id' property
      const sampleSize = Math.min(3, arrayData.length);
      const hasIdProperty = arrayData
        .slice(0, sampleSize)
        .every((item) => item && item.hasOwnProperty("id"));
      if (!hasIdProperty) {
        return arrayData.map((item, index) => ({ ...item, id: index }));
      }

      return arrayData;
    }, [dataIdProperty, arrayData]);

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
      onSelectionDidChange,
      initiallySelected,
      syncWithAppState,
    });

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

    useLayoutEffect(() => {
      _setSortBy(sortBy);
    }, [sortBy]);

    useLayoutEffect(() => {
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
          enableSorting: col.canSort && !!col.accessorKey,
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
                    .rows.every((row) => rowDisabledPredicate(row.original) || row.getIsSelected());
                  checkAllRows(!allSelected);
                },
              }}
            />
          ) : null,
        cell: ({ row }: CellContext<any, unknown>) => {
          return (
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
            />
          );
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
      hoveredRowId,
      headerCheckboxHovered,
    ]);

    // --- Set up page information (using the first page size option)
    // const [pagination, setPagination] = useState<PaginationState>();
    const [pagination, setPagination] = useState<PaginationState>({
      pageSize: isPaginated ? pageSize : Number.MAX_VALUE,
      pageIndex: currentPageIndex,
    });

    const prevIsPaginated = usePrevious(isPaginated);

    useEffect(() => {
      if (!prevIsPaginated && isPaginated) {
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: pageSize,
            pageIndex: 0,
          };
        });
      }
      if (prevIsPaginated && !isPaginated) {
        setPagination(() => {
          return {
            pageIndex: 0,
            pageSize: Number.MAX_VALUE,
          };
        });
      }
    }, [isPaginated, pageSizeOptions, prevIsPaginated, pageSize]);

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

    // --- Use the @tanstack/core-table component that manages a table
    const table = useReactTable<RowWithOrder>({
      columns: columnsWithSelectColumn,
      data: sortedData,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: isPaginated ? getPaginationRowModel() : undefined,
      enableRowSelection: rowsSelectable,
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

    const rowVirtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: useCallback(() => {
        return hasOutsideScroll && scrollRef?.current ? scrollRef?.current : wrapperRef.current;
      }, [scrollRef, hasOutsideScroll]),
      scrollMargin: startMargin,
      estimateSize: useCallback(() => {
        return estimatedHeightRef.current || 30;
      }, []),
      overscan: 5,
    });

    const paddingTop =
      rowVirtualizer.getVirtualItems().length > 0
        ? rowVirtualizer.getVirtualItems()?.[0]?.start - startMargin || 0
        : 0;
    const paddingBottom =
      rowVirtualizer.getVirtualItems().length > 0
        ? rowVirtualizer.getTotalSize() -
          (rowVirtualizer.getVirtualItems()?.[rowVirtualizer.getVirtualItems().length - 1]?.end -
            startMargin || 0)
        : 0;

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

    return (
      <div
        {...rest}
        className={classnames(styles.wrapper, className, { [styles.noScroll]: hasOutsideScroll })}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        ref={ref}
        style={style}
      >
        {isPaginated &&
          hasData &&
          rows.length > 0 &&
          pagination &&
          (paginationControlsLocation === "top" || paginationControlsLocation === "both") &&
          paginationControls}

        <table className={styles.table} ref={tableRef}>
          {!hideHeader && (
            <thead style={{ height: headerHeight }} className={styles.headerWrapper}>
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
                          'input[type=\"checkbox\"]',
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
                                (row) => rowDisabledPredicate(row.original) || row.getIsSelected(),
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
                            'input[type=\"checkbox\"]',
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
                          <div className={styles.headerContent} style={style}>
                            {
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              ) as ReactNode
                            }
                            {header.column.columnDef.enableSorting && (
                              <span style={{ display: "inline-flex", maxWidth: 16 }}>
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
          )}
          {hasData && (
            <tbody className={styles.tableBody}>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowIndex = virtualRow.index;
                const row = rows[rowIndex];
                return (
                  <tr
                    data-index={rowIndex}
                    key={`${row.id}-${rowIndex}`}
                    className={classnames(styles.row, {
                      [styles.selected]: row.getIsSelected(),
                      [styles.focused]: focusedIndex === rowIndex,
                      [styles.disabled]: rowDisabledPredicate(row.original),
                      [styles.noBottomBorder]: noBottomBorder,
                    })}
                    ref={(el) => {
                      if (el && estimatedHeightRef.current === null) {
                        estimatedHeightRef.current = Math.round(el.getBoundingClientRect().height);
                      }
                      rowVirtualizer.measureElement(el);
                    }}
                    onClick={(event) => {
                      if (event?.defaultPrevented) {
                        return;
                      }
                      const target = event.target as HTMLElement;
                      if (target.tagName.toLowerCase() === "input") {
                        return;
                      }

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
                  >
                    {row.getVisibleCells().map((cell, i) => {
                      const cellRenderer = cell.column.columnDef?.meta?.cellRenderer;
                      const size = cell.column.getSize();
                      const alignmentClass =
                        cellVerticalAlign === "top"
                          ? styles.alignTop
                          : cellVerticalAlign === "bottom"
                            ? styles.alignBottom
                            : styles.alignCenter;
                      return (
                        <td
                          className={classnames(styles.cell, alignmentClass)}
                          key={`${cell.id}-${i}`}
                          style={{
                            // width: size,
                            width: size,
                            ...getCommonPinningStyles(cell.column),
                          }}
                        >
                          {/*we have to wrap it in a div, because tables...

                          The "Last Cell" Problem: Why This Happens
                          Even with box-sizing: border-box, the browser gives special treatment to the last column of a table.

                          With table-layout: fixed, the browser calculates the widths for all columns.
                          It strictly enforces the widths for columns 1, 2, 3, etc.
                          The last column is often used as a "catch-all" to ensure the total width of all columns exactly matches the width of the <table> element itself (e.g., 100%).
                          When you add padding-right to this very last cell, you create a conflict. The browser tries to simultaneously:
                          Keep the cell's right edge perfectly aligned with the table's right edge.
                          Render the padding inside that right edge.

                          Solution: The Inner Wrapper <div>
                          The most robust and common solution is to decouple the cell's width from its content's padding. You do this by adding a wrapper <div> inside the cell.
                          The <td> will be responsible only for setting the rigid width.
                          The inner <div> will be responsible only for handling the padding and content.
                           */}
                          <div className={styles.cellContent}>
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
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
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

        {isPaginated &&
          hasData &&
          rows.length > 0 &&
          pagination &&
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

export const defaultProps = {
  data: EMPTY_ARRAY,
  dataIdProperty: "id",
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
  alwaysShowSelectionHeader: false,
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
};
