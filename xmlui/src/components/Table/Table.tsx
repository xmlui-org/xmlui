import {CSSProperties, forwardRef, ReactNode} from "react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import type {
  CellContext,
  Column,
  ColumnDef,
  Header,
  HeaderContext,
  PaginationState,
  RowData,
} from "@tanstack/react-table";
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import styles from "./Table.module.scss";
import "./react-table-config.d.ts";
import { Button } from "@components/Button/Button";
import { Spinner } from "@components/Spinner/Spinner";
import classnames from "@components-core/utils/classnames";
import useRowSelection from "./useRowSelection";
import { Toggle } from "@components/Toggle/Toggle";
import { Icon } from "@components/Icon/Icon";
import { observeElementOffset, useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import { orderBy } from "lodash-es";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { EMPTY_ARRAY } from "@components-core/constants";
import { ScrollContext } from "@components-core/ScrollContext";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { type OurColumnMetadata, TableContext } from "../TableColumnDef/TableContext";
import produce from "immer";
import { useEvent } from "@components-core/utils/misc";
import { flushSync } from "react-dom";
import { useIsomorphicLayoutEffect, useResizeObserver } from "@components-core/utils/hooks";
import {composeRefs} from "@radix-ui/react-compose-refs";

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
    cellRenderer?: (row: any) => ReactNode;
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

// =====================================================================================================================
// React Table component implementation

type TableProps = {
  data: any[];
  columns?: OurColumnMetadata[];
  isPaginated?: boolean;
  loading?: boolean;
  headerHeight?: string | number;
  rowsSelectable?: boolean;
  enableMultiRowSelection?: boolean;
  alwaysShowOrderingIndicators?: boolean;
  pageSizes?: number[];
  rowDisabledPredicate?: (item: any) => boolean;
  sortBy?: string;
  sortingDirection?: SortingDirection;
  sortingDidChange?: AsyncFunction;
  willSort?: AsyncFunction;
  style?: CSSProperties;
  uid?: string;
  noDataRenderer?: () => ReactNode;
  autoFocus?: boolean;
  hideHeader?: boolean;
  children: ReactNode;
};

function defaultIsRowDisabled(_: any) {
  return false;
}

const SELECT_COLUMN_WIDTH = 42;

const DEFAULT_PAGE_SIZES = [20];

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
export const Table = forwardRef(({
  data = EMPTY_ARRAY,
  columns = EMPTY_ARRAY,
  isPaginated = false,
  loading = false,
  headerHeight,
  rowsSelectable = false,
  enableMultiRowSelection = true,
  alwaysShowOrderingIndicators = true,
  pageSizes = DEFAULT_PAGE_SIZES,
  rowDisabledPredicate = defaultIsRowDisabled,
  sortBy,
  sortingDirection = "ascending",
  sortingDidChange,
  willSort,
  style,
  noDataRenderer,
  autoFocus = false,
  hideHeader = false,
  children,
}: TableProps, forwardedRef) => {
  const [stableColumns, setStableColumns] = useState(columns);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = forwardedRef ? composeRefs(wrapperRef, forwardedRef) : wrapperRef;
  const tableRef = useRef<HTMLTableElement>(null);
  const estimatedHeightRef = useRef<number | null>(null);

  const safeColumns: OurColumnMetadata[] = useMemo(() => {
    if (stableColumns) {
      return stableColumns;
    }
    if (!data.length) {
      return EMPTY_ARRAY;
    }
    return Object.keys(data[0]).map((key: string) => ({ header: key, accessorKey: key }));
  }, [stableColumns, data]);

  useEffect(() => {
    if (autoFocus) {
      wrapperRef.current!.focus();
    }
  }, [autoFocus]);

  // --- Keep track of visible table rows
  const [visibleItems, setVisibleItems] = useState<any[]>(EMPTY_ARRAY);

  // --- Get the operations to manage selected rows in a table
  const { toggleRow, checkAllRows, focusedIndex, onKeyDown, selectedRowIdMap, idKey } = useRowSelection(visibleItems);

  // --- Create data with order information whenever the items in the table change
  const dataWithOrder = useMemo(() => {
    return data.map((item, index) => {
      return {
        ...item,
        order: index + 1,
      };
    });
  }, [data]);

  // --- Local or external sorting of data
  const [_sortBy, _setSortBy] = useState(sortBy);
  const [_sortingDirection, _setSortingDirection] = useState(sortingDirection);

  useEffect(() => {
    _setSortBy(sortBy);
  }, [sortBy]);

  useEffect(() => {
    _setSortingDirection(sortingDirection);
  }, [sortingDirection]);

  const [sortedData, setSortedData] = useState(dataWithOrder);

  useEffect(() => {
    if (!_sortBy) {
      setSortedData(dataWithOrder);
      return;
    }
    (async () => {
      const result = await willSort?.(_sortBy, _sortingDirection);
      if (result === false) {
        setSortedData(dataWithOrder);
      } else {
        setSortedData(orderBy(dataWithOrder, _sortBy, _sortingDirection === "ascending" ? "asc" : "desc"));
      }
    })();
  }, [_sortBy, _sortingDirection, dataWithOrder, willSort]);

  const _updateSorting = useCallback(
    async (header: Header<RowWithOrder, unknown>) => {
      let newDirection: SortingDirection = "ascending";
      let newSortBy = header.column.columnDef.meta?.accessorKey;
      // The current key is the same as the last -> the user clicked on the same header twice
      if (_sortBy === header.column.columnDef.meta?.accessorKey) {
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
    [sortingDidChange, _sortBy, _sortingDirection]
  );

  // --- Prepare column renderers according to columns defined in the table
  const columnsWithCustomCell: ColumnDef<any>[] = useMemo(() => {
    return safeColumns.map((col) => {
      // --- Obtain column width information
      const { width, starSizedWidth } = getColumnWidth(col.width, true, "width");
      const { width: minWidth } = getColumnWidth(col.minWidth, false, "minWidth");
      const { width: maxWidth } = getColumnWidth(col.maxWidth, false, "maxWidth");

      const customColumn = {
        ...col,
        header: col.header ?? col.accessorKey ?? " ",
        size: width,
        minSize: minWidth,
        maxSize: maxWidth,
        enableResizing: col.canResize,
        enableSorting: col.canSort,
        enablePinning: col.pinTo !== undefined,
        meta: {
          starSizedWidth,
          pinTo: col.pinTo,
          style: col.style,
          accessorKey: col.accessorKey,
          cellRenderer: col.cellRenderer,
        },
      };
      return customColumn;

      function getColumnWidth(
        colWidth: any,
        allowStarSize: boolean,
        propName: string
      ): { width?: number; starSizedWidth?: string } {
        let starSizedWidth;
        let width;
        if (typeof colWidth === "number") {
          width = colWidth;
        } else if (typeof colWidth === "string") {
          const oneStarSizedWidthMatch = colWidth.match(/^\s*\*\s*$/);
          if (allowStarSize && oneStarSizedWidthMatch) {
            starSizedWidth = "1*";
          } else {
            const starSizedWidthMatch = colWidth.match(/^\s*(\d+)\s*\*\s*$/);
            if (allowStarSize && starSizedWidthMatch) {
              starSizedWidth = starSizedWidthMatch[1] + "*";
            } else {
              const pixelWidthMatch = colWidth.match(/^\s*(\d+)\s*(px)?\s*$/);
              if (pixelWidthMatch) {
                width = Number(pixelWidthMatch[1]);
              } else {
                throw new Error(`Invalid TableColumnDef '${propName}' value`);
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
  }, [rowsSelectable, safeColumns]);

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
              className: classnames(styles.checkBoxWrapper),
              value: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onDidChange: (checked: any) => {
                checkAllRows(checked);
              },
            }}
          />
        ) : null,
      cell: ({ row }: CellContext<any, unknown>) => (
        <Toggle
          {...{
            className: styles.checkBoxWrapper,
            value: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onDidChange: () => {
              toggleRow(row.original, { metaKey: enableMultiRowSelection });
            },
          }}
        />
      ),
    };
    return rowsSelectable ? [selectColumn, ...columnsWithCustomCell] : columnsWithCustomCell;
  }, [columnsWithCustomCell, toggleRow, rowsSelectable, checkAllRows]);

  // --- Set up page information (using the first page size option)
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizes[0],
  });

  // --- Update pagination info whenever the pae size or page index changes
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

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
      [idKey]
    ),
    state: useMemo(
      () => ({
        pagination,
        rowSelection: selectedRowIdMap,
        columnSizing,
        columnPinning,
      }),
      [columnPinning, columnSizing, pagination, selectedRowIdMap]
    ),
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: setPagination,
  });

  // --- Select the set of visible rows whenever the table rows change
  const rows = table.getRowModel().rows;
  useEffect(() => {
    setVisibleItems(rows.map((row) => row.original));
  }, [rows]);

  const scrollRef = useContext(ScrollContext);

  const hasOutsideScroll =
    scrollRef && style?.maxHeight === undefined && style?.height === undefined && style?.flex === undefined;

  const myObserveElementOffset = useCallback(
    (instance: Virtualizer<any, Element>, cb: (offset: number, isScrolling: boolean) => void) => {
      return observeElementOffset(instance, (offset, isScrolling) => {
        //based on this: https://github.com/TanStack/virtual/issues/387
        const parentContainerOffset = !hasOutsideScroll ? 0 : wrapperRef.current?.offsetTop || 0;
        cb(offset - parentContainerOffset, isScrolling);
      });
    },
    [hasOutsideScroll]
  );
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: useCallback(() => {
      return hasOutsideScroll && scrollRef?.current ? scrollRef?.current : wrapperRef.current;
    }, [scrollRef, hasOutsideScroll]),
    observeElementOffset: myObserveElementOffset,
    estimateSize: useCallback(() => {
      return estimatedHeightRef.current || 30;
    }, []),
    overscan: 5,
  });

  const paddingTop =
    rowVirtualizer.getVirtualItems().length > 0 ? rowVirtualizer.getVirtualItems()?.[0]?.start || 0 : 0;
  const paddingBottom =
    rowVirtualizer.getVirtualItems().length > 0
      ? rowVirtualizer.getTotalSize() -
        (rowVirtualizer.getVirtualItems()?.[rowVirtualizer.getVirtualItems().length - 1]?.end || 0)
      : 0;

  const tableContextValue = useMemo(() => {
    return {
      registerColumn: (column: OurColumnMetadata) => {
        setStableColumns(
          produce((draft) => {
            const existing = draft.findIndex((col) => col.id === column.id);
            if (existing < 0) {
              draft.push(column);
            } else {
              draft[existing] = column;
            }
            draft.sort((a, b) => a.index - b.index);
          })
        );
      },
      unRegisterColumn: (id: string) => {
        setStableColumns(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
          })
        );
      },
    };
  }, []);

  const hasData = data.length !== 0;

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
        let units;
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
      widths[column.id] = Math.floor(availableWidth * (numberOfUnitsById[column.id] / numberOfAllUnits));
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
  }, [recalculateStarSizes]);

  return (
    <TableContext.Provider value={tableContextValue}>
      <div
        className={classnames(styles.wrapper, { [styles.noScroll]: hasOutsideScroll })}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        ref={ref}
        style={style}
      >
        {loading && !hasData && (
          <div className={styles.loadingWrapper}>
            <Spinner />
          </div>
        )}
        {!loading &&
          !hasData &&
          (noDataRenderer ? noDataRenderer() : <div className={styles.noRows}>No data available</div>)}
        {hasData && (
          <table className={styles.table} ref={tableRef}>
            {!hideHeader && (
              <thead style={{ height: headerHeight }} className={styles.headerWrapper}>
                {table.getHeaderGroups().map((headerGroup, headerGroupIndex) => (
                  <tr
                    key={`${headerGroup.id}-${headerGroupIndex}`}
                    className={classnames(styles.headerRow, {
                      [styles.allSelected]: table.getIsAllRowsSelected(),
                    })}
                  >
                    {headerGroup.headers.map((header, headerIndex) => {
                      const style = header.column.columnDef.meta?.style || {};
                      const size = header.getSize();
                      return (
                        <th
                          key={`${header.id}-${headerIndex}`}
                          className={styles.columnCell}
                          colSpan={header.colSpan}
                          style={{
                            position: "relative",
                            width: size,
                            ...getCommonPinningStyles(header.column),
                          }}
                        >
                          <ClickableHeader
                            hasSorting={header.column.columnDef.enableSorting}
                            updateSorting={() => _updateSorting(header)}
                          >
                            <div className={styles.headerContent} style={style}>
                              {flexRender(header.column.columnDef.header, header.getContext()) as ReactNode}
                              <span style={{ display: "inline-flex", minWidth: 12 }}>
                                {header.column.columnDef.enableSorting &&
                                  <ColumnOrderingIndicator
                                    alwaysShow={alwaysShowOrderingIndicators}
                                    direction={
                                      header.column.columnDef.meta?.accessorKey === _sortBy
                                        ? _sortingDirection
                                        : undefined
                                    }
                                  />
                                }
                              </span>
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
                    })}
                    ref={(el) => {
                      if (el && estimatedHeightRef.current === null) {
                        estimatedHeightRef.current = Math.round(el.getBoundingClientRect().height);
                      }
                      rowVirtualizer.measureElement(el);
                    }}
                    onClick={(event) => {
                      if (event.defaultPrevented) {
                        return;
                      }
                      toggleRow(row.original, {
                        ...event,
                        metaKey: enableMultiRowSelection,
                        shiftKey: enableMultiRowSelection ? event.shiftKey : false,
                      });
                    }}
                  >
                    {row.getVisibleCells().map((cell, i) => {
                      const cellRenderer = cell.column.columnDef?.meta?.cellRenderer;
                      const size = cell.column.getSize();
                      return (
                        <td
                          className={styles.cell}
                          key={`${cell.id}-${i}`}
                          style={{
                            // width: size,
                            width: size,
                            ...getCommonPinningStyles(cell.column),
                          }}
                        >
                          {cellRenderer
                            ? cellRenderer(cell.row.original)
                            : (flexRender(cell.column.columnDef.cell, cell.getContext()) as ReactNode)}
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
          </table>
        )}

        {isPaginated && hasData && rows.length > 0 && (
          // --- Render the pagination controls
          <div className={styles.pagination}>
            <div style={{ flex: 1 }}>
              <span className={styles.paginationLabel}>
                Showing {rows[0].original.order} to {rows[rows.length - 1].original.order} of {data.length} entries
              </span>
            </div>
            {pageSizes.length > 1 && (<div>
              <span className={styles.paginationLabel}>Rows per page</span>
              <select
                className={styles.paginationSelect}
                value={pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
              >
                {pageSizes.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>)}
            <div className={styles.paginationButtons}>
              <Button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                type={"button"}
                variant={"ghost"}
              >
                <FiChevronsLeft />
              </Button>
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                type={"button"}
                variant={"ghost"}
              >
                <FiChevronLeft />
              </Button>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                type={"button"}
                variant={"ghost"}
              >
                <FiChevronRight />
              </Button>
              <Button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                type={"button"}
                variant={"ghost"}
              >
                <FiChevronsRight />
              </Button>
            </div>
          </div>
        )}
      </div>
      {children}
    </TableContext.Provider>
  );
});

type ClickableHeaderProps = {
  hasSorting?: boolean;
  updateSorting?: () => void;
  children?: ReactNode;
}

function ClickableHeader({ hasSorting, updateSorting, children }: ClickableHeaderProps) {
  return hasSorting ? (
    <button className={styles.clickableHeader} onClick={updateSorting}>
      {children}
    </button>
  ) : (
    <>{children}</>
  )
}

type ColumnOrderingIndicatorProps = {
  direction?: SortingDirection;
  alwaysShow?: boolean;
}

function ColumnOrderingIndicator({ direction, alwaysShow = true }: ColumnOrderingIndicatorProps) {
  if (!alwaysShow) {
    if (direction === "ascending") {
      return <Icon name="chevronup" size={"sm"} />
    } else if (direction === "descending") {
      return <Icon name="chevrondown" size={"sm"} />
    }
    return null;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Icon name="chevronup" size={"sm"} opacity={direction === "ascending" ? "100%" : "40%"} />
      <Icon name="chevrondown" size={"sm"} opacity={direction === "descending" ? "100%" : "40%"} />
    </div>
  )
}

// arrowup:Table (theme resource) -> arrowup:Table (built-in) -> arrowup (theme resource) -> arrowup (built-in) -> fallback (no icon?)

// =====================================================================================================================
// XMLUI Table component definition

/**
 * \`Table\` is a component that displays cells organized into rows and columns.
 * The \`Table\` component is virtualized so it only renders visible cells.
 * @descriptionRef
 */
export interface TableComponentDef extends ComponentDef<"Table"> {
  props: {
    /**
     * You can use \`items\` as an alias for the \`data\` property. When you bind the table to a data source 
     * (for example, you set the `data source` property to a URL to fetch the data from), \`data\` 
     * represents the information obtained from the API.
     *
     * By convention, when you use direct data (set manually or assembled by code), you pass it in the 
     * \`items\` property.
     *
     * When both \`items\` and \`data\` are used, \`items\` has priority.
     */
    items: string;
    /** @descriptionRef */
    data?: string;
    /** @descriptionRef */
    isPaginated?: boolean;
    /** @descriptionRef */
    loading?: boolean;
    /** @descriptionRef */
    headerHeight?: string | number;
    /** @descriptionRef */
    rowsSelectable?: boolean;
    /** @descriptionRef */
    enableMultiRowSelection?: boolean;
    /** @descriptionRef */
    pageSizes?: number[];
    /** @descriptionRef */
    rowDisabledPredicate?: string;
    /** @descriptionRef */
    noDataTemplate?: ComponentDef;
    /** @descriptionRef */
    sortBy?: string;
    /** @descriptionRef */
    sortDirection?: SortingDirection;
    /** @descriptionRef */
    autoFocus?: boolean;
    /** @descriptionRef */
    hideHeader?: boolean;
    /**
     * This property controls whether to show ordering indicators in column headers (\`true\`) or not (\`false\`).
     * The default value is \`false\`.
     * @descriptionRef
     */
    alwaysShowOrderingIndicators?: boolean;
  };
  events: {
    /** @descriptionRef */
    sortingDidChange: string;
    /** @descriptionRef */
    willSort: string;
  };
}

const tableMetadata: ComponentDescriptor<TableComponentDef> = {
  displayName: "Table",
  description: "A virtualized table component with columns and cells",
  props: {
    items: desc("The items of the table"),
    isPaginated: desc("Is the table paginated?"),
    loading: desc("Is the table being loaded?"),
    headerHeight: desc("The height of the table header"),
    rowsSelectable: desc("Does the table supports row selection?"),
    pageSizes: desc("A list of available page sizes the paginator displays in the UI"),
    rowDisabledPredicate: desc("A function determining if a particular row is to be disabled"),
    noDataTemplate: {
      description: "The template displayed when the table is empty",
      valueType: "ComponentDef",
    },
    sortBy: desc("The name of the data field the table is sorted by"),
    sortDirection: desc("The sorting direction (ascending/descending)"),
    autoFocus: desc("Should the table have the focus automatically?"),
    hideHeader: desc("Should the header be hidden?"),
    alwaysShowOrderingIndicators: desc("Show ordering indicators in column headers or not"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "padding-horizontal-heading-Table": "$space-2",
    "padding-vertical-heading-Table": "$space-2",
    "padding-heading-Table": "$padding-vertical-heading-Table $padding-horizontal-heading-Table",
    "padding-horizontal-cell-Table": "$space-2",
    "padding-horizontal-cell-first-Table": "$space-5",
    "padding-horizontal-cell-last-Table": "$space-5",
    "padding-vertical-cell-Table": "$space-2",
    "padding-cell-Table": "$padding-vertical-cell-Table $padding-horizontal-cell-Table",
    "thickness-border-cell-Table": "1px",
    "style-border-cell-Table": "solid",
    "border-cell-Table": "$thickness-border-cell-Table $style-border-cell-Table $color-border-cell-Table",

    "thickness-outline-heading-Table--focus": "$thickness-outline--focus",
    "style-outline-heading-Table--focus": "$style-outline--focus",
    "offset-outline-heading-Table--focus": "$offset-outline--focus",

    "font-size-heading-Table": "$font-size-tiny",
    "font-weight-heading-Table": "$font-weight-bold",
    "transform-text-heading-Table": "uppercase",
    "font-size-row-Table": "$font-size-small",

    "color-bg-Table": "transparent",
    "color-border-cell-Table": "$color-border",
    "color-bg-selected-Table--hover": "$color-bg-row-Table--hover",
    "color-bg-pagination-Table": "$color-bg-Table",
    "color-outline-heading-Table--focus": "$color-outline--focus",
    "color-text-pagination-Table": "$color-secondary",

    light: {
      "color-bg-row-Table--hover": "$color-primary-50",
      "color-bg-selected-Table": "$color-primary-100",
      "color-bg-heading-Table--hover": "$color-surface-200",
      "color-bg-heading-Table--active": "$color-surface-300",
      "color-bg-heading-Table": "$color-surface-100",
      "color-text-heading-Table": "$color-surface-500",
    },
    dark: {
      "color-bg-row-Table--hover": "$color-primary-900",
      "color-bg-selected-Table": "$color-primary-800",
      "color-bg-heading-Table--hover": "$color-surface-800",
      "color-bg-heading-Table": "$color-surface-950",
      "color-bg-heading-Table--active": "$color-surface-700",
    }
  },
};

/**
 * This function defines the renderer for the Heading component.
 */
export const tableComponentRenderer = createComponentRenderer<TableComponentDef>(
  "Table",
  ({ extractValue, node, renderChild, lookupEventHandler, lookupSyncCallback, layoutCss }) => {
    const data = extractValue(node.props.items) || extractValue(node.props.data);

    return (
      <Table
        data={data}
        pageSizes={extractValue(node.props.pageSizes)}
        rowsSelectable={extractValue.asOptionalBoolean(node.props.rowsSelectable)}
        noDataRenderer={
          node.props.noDataTemplate &&
          (() => {
            return renderChild(node.props.noDataTemplate);
          })
        }
        loading={extractValue.asOptionalBoolean(node.props.loading)}
        isPaginated={extractValue.asOptionalBoolean(node.props?.isPaginated)}
        headerHeight={extractValue.asSize(node.props.headerHeight)}
        rowDisabledPredicate={lookupSyncCallback(node.props.rowDisabledPredicate)}
        sortBy={extractValue(node.props?.sortBy)}
        sortingDirection={extractValue(node.props?.sortDirection)}
        sortingDidChange={lookupEventHandler("sortingDidChange")}
        willSort={lookupEventHandler("willSort")}
        style={layoutCss}
        uid={node.uid}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        hideHeader={extractValue.asOptionalBoolean(node.props.hideHeader)}
        enableMultiRowSelection={extractValue.asOptionalBoolean(node.props.enableMultiRowSelection)}
        alwaysShowOrderingIndicators={extractValue.asOptionalBoolean(node.props.alwaysShowOrderingIndicators)}
      >
        {renderChild(node.children)}
      </Table>
    );
  },
  tableMetadata
);
