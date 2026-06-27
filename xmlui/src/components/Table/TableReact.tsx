import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { defaultProps } from "./Table.defaults";
import styles from "./Table.module.scss";
import type { TableColumnDefinition } from "../Column/ColumnReact";

export type TableApi = {
  getSelectedIds: () => unknown[];
  getSelectedItems: () => unknown[];
  clearSelection: () => void;
  selectAll: () => void;
};

export type TableNativeProps = {
  id?: string;
  items: unknown[];
  columns: TableColumnDefinition[];
  idKey?: string;
  loading?: boolean;
  rowsSelectable?: boolean;
  autoFocus?: boolean;
  isPaginated?: boolean;
  pageSize?: number;
  alwaysShowPagination?: boolean;
  rowHeight?: number;
  sortBy?: string;
  sortDirection?: string;
  enableMultiRowSelection?: boolean;
  toggleSelectionOnClick?: boolean;
  initiallySelected?: unknown[];
  hideHeader?: boolean;
  hideSelectionCheckboxes?: boolean;
  hideSelectionCheckboxesHeader?: boolean;
  alwaysShowSelectionCheckboxes?: boolean;
  alwaysShowSortingIndicator?: boolean;
  checkboxTolerance?: string;
  userSelectCell?: string;
  userSelectRow?: string;
  userSelectHeading?: string;
  cellVerticalAlign?: string;
  keyBindings?: Record<string, string>;
  striped?: boolean;
  syncKey?: string;
  rowDisabledPredicate?: (item: unknown) => unknown;
  rowUnselectablePredicate?: (item: unknown) => unknown;
  className?: string;
  style?: CSSProperties;
  emptyTemplate?: ReactNode;
  renderCell?: (item: unknown, rowIndex: number, column: TableColumnDefinition, colIndex: number) => ReactNode;
  onRowClick?: (item: unknown) => void | Promise<void>;
  onRowDoubleClick?: (item: unknown) => void | Promise<void>;
  onContextMenu?: (item: unknown, rowIndex: number) => void | Promise<void>;
  onSelectionDidChange?: (selectedItems: unknown[]) => void | Promise<void>;
  onSelectAllAction?: (row: TableActionRow | null, selectedItems: unknown[], selectedIds: unknown[]) => void | Promise<void>;
  onCutAction?: (row: TableActionRow | null, selectedItems: unknown[], selectedIds: unknown[]) => void | Promise<void>;
  onCopyAction?: (row: TableActionRow | null, selectedItems: unknown[], selectedIds: unknown[]) => void | Promise<void>;
  onPasteAction?: (row: TableActionRow | null, selectedItems: unknown[], selectedIds: unknown[]) => void | Promise<void>;
  onDeleteAction?: (row: TableActionRow | null, selectedItems: unknown[], selectedIds: unknown[]) => void | Promise<void>;
  "data-testid"?: string;
};

type TableActionRow = {
  item: unknown;
  rowId: unknown;
  isSelected: boolean;
  isFocused: boolean;
};

export const TableNative = memo(forwardRef<TableApi, TableNativeProps>(function TableNative(
  {
    id,
    items,
    columns,
    idKey = defaultProps.idKey,
    loading = defaultProps.loading,
    rowsSelectable = defaultProps.rowsSelectable,
    autoFocus = defaultProps.autoFocus,
    isPaginated,
    pageSize = 0,
    alwaysShowPagination,
    rowHeight = defaultProps.rowHeight,
    sortBy,
    sortDirection = defaultProps.sortingDirection,
    enableMultiRowSelection = defaultProps.enableMultiRowSelection,
    toggleSelectionOnClick = defaultProps.toggleSelectionOnClick,
    initiallySelected = defaultProps.initiallySelected,
    hideHeader = defaultProps.hideHeader,
    hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
    hideSelectionCheckboxesHeader = defaultProps.hideSelectionCheckboxesHeader,
    alwaysShowSelectionCheckboxes = defaultProps.alwaysShowSelectionCheckboxes,
    alwaysShowSortingIndicator = defaultProps.alwaysShowSortingIndicator,
    checkboxTolerance = defaultProps.checkboxTolerance,
    userSelectCell,
    userSelectRow,
    userSelectHeading,
    cellVerticalAlign = defaultProps.cellVerticalAlign,
    keyBindings,
    striped = defaultProps.striped,
    syncKey,
    rowDisabledPredicate,
    rowUnselectablePredicate,
    className,
    style,
    emptyTemplate,
    renderCell,
    onRowClick,
    onRowDoubleClick,
    onContextMenu,
    onSelectionDidChange,
    onSelectAllAction,
    onCutAction,
    onCopyAction,
    onPasteAction,
    onDeleteAction,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<{ key: string; descending: boolean } | undefined>(
    sortBy ? { key: sortBy, descending: sortDirection === "descending" } : undefined,
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<unknown[]>(initiallySelected);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const visibleColumns = columns.length > 0 ? columns : inferColumns(items);

  useEffect(() => {
    setSelectedIds(initiallySelected);
  }, [initiallySelected]);

  useEffect(() => {
    if (!syncKey || typeof window === "undefined") {
      return;
    }
    const eventName = `xmlui-table-sync:${syncKey}`;
    const listener = (event: Event) => {
      const nextIds = (event as CustomEvent<unknown[]>).detail;
      if (Array.isArray(nextIds)) {
        setSelectedIds(nextIds);
      }
    };
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [syncKey]);

  const sortedItems = useMemo(() => {
    if (!sort) {
      return items;
    }
    return [...items].sort((left, right) => compareValues(valueByKey(left, sort.key), valueByKey(right, sort.key), sort.descending));
  }, [items, sort]);

  const selectedItems = useMemo(
    () => sortedItems.filter((item) => selectedIds.some((id) => Object.is(id, rowId(item, idKey)))),
    [idKey, selectedIds, sortedItems],
  );
  const selectableSortedItems = useMemo(
    () => sortedItems.filter((item) => !isRowDisabled(item, rowDisabledPredicate) && !isRowUnselectable(item, rowUnselectablePredicate)),
    [rowDisabledPredicate, rowUnselectablePredicate, sortedItems],
  );
  const shouldPaginate = isPaginated === true || (isPaginated !== false && pageSize > 0) || alwaysShowPagination === true;
  const effectivePageSize = pageSize > 0 ? pageSize : items.length || 1;
  const totalPages = shouldPaginate ? Math.max(1, Math.ceil(sortedItems.length / effectivePageSize)) : 1;
  const pageItems = shouldPaginate
    ? sortedItems.slice(pageIndex * effectivePageSize, pageIndex * effectivePageSize + effectivePageSize)
    : sortedItems;
  const viewportHeight = numericSize(style?.height);
  const shouldVirtualize = !!viewportHeight && pageItems.length > Math.ceil(viewportHeight / rowHeight) + 4;
  const virtualStart = shouldVirtualize ? Math.max(0, Math.floor(scrollTop / rowHeight) - 4) : 0;
  const virtualCount = shouldVirtualize ? Math.ceil(viewportHeight / rowHeight) + 10 : pageItems.length;
  const virtualEnd = shouldVirtualize ? Math.min(pageItems.length, virtualStart + virtualCount) : pageItems.length;
  const renderedItems = shouldVirtualize ? pageItems.slice(virtualStart, virtualEnd) : pageItems;
  const topSpacerHeight = shouldVirtualize ? virtualStart * rowHeight : 0;
  const bottomSpacerHeight = shouldVirtualize ? Math.max(0, (pageItems.length - virtualEnd) * rowHeight) : 0;
  const showPagination = shouldPaginate && (alwaysShowPagination === true || (alwaysShowPagination !== false && totalPages > 1));
  const allSortedRowsSelected = selectableSortedItems.length > 0 &&
    selectableSortedItems.every((item) => selectedIds.some((id) => Object.is(id, rowId(item, idKey))));

  const updateSelectedIds = (nextIds: unknown[]) => {
    setSelectedIds(nextIds);
    if (syncKey && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`xmlui-table-sync:${syncKey}`, { detail: nextIds }));
    }
    void onSelectionDidChange?.(items.filter((item) => nextIds.some((id) => Object.is(id, rowId(item, idKey)))));
  };

  const toggleSelection = (item: unknown) => {
    if (!rowsSelectable || isRowDisabled(item, rowDisabledPredicate) || isRowUnselectable(item, rowUnselectablePredicate)) {
      updateSelectedIds(selectedIds);
      return;
    }
    const currentId = rowId(item, idKey);
    const selected = selectedIds.some((selectedId) => Object.is(selectedId, currentId));
    const nextIds = selected
      ? selectedIds.filter((selectedId) => !Object.is(selectedId, currentId))
      : enableMultiRowSelection ? [...selectedIds, currentId] : [currentId];
    updateSelectedIds(nextIds);
  };

  const selectRowFromClick = (item: unknown, event: MouseEvent<HTMLElement>) => {
    if (event.shiftKey && focusedIndex !== null) {
      const targetIndex = sortedItems.indexOf(item);
      if (targetIndex >= 0) {
        const [start, end] = [focusedIndex, targetIndex].sort((left, right) => left - right);
        const rangeIds = sortedItems
          .slice(start, end + 1)
          .filter((rangeItem) => !isRowDisabled(rangeItem, rowDisabledPredicate) && !isRowUnselectable(rangeItem, rowUnselectablePredicate))
          .map((rangeItem) => rowId(rangeItem, idKey));
        updateSelectedIds([...new Set([...selectedIds, ...rangeIds])]);
        return;
      }
    }
    if (toggleSelectionOnClick) {
      const currentId = rowId(item, idKey);
      const selected = selectedIds.some((selectedId) => Object.is(selectedId, currentId));
      updateSelectedIds(selected
        ? selectedIds.filter((selectedId) => !Object.is(selectedId, currentId))
        : [...selectedIds, currentId]);
      return;
    }
    if (!rowsSelectable || isRowDisabled(item, rowDisabledPredicate) || isRowUnselectable(item, rowUnselectablePredicate)) {
      updateSelectedIds(selectedIds);
      return;
    }
    updateSelectedIds([rowId(item, idKey)]);
  };

  const api = useMemo<TableApi>(() => ({
    getSelectedIds: () => selectedIds,
    getSelectedItems: () => selectedItems,
    clearSelection: () => updateSelectedIds([]),
    selectAll: () => updateSelectedIds(items
      .filter((item) => !isRowDisabled(item, rowDisabledPredicate) && !isRowUnselectable(item, rowUnselectablePredicate))
      .map((item) => rowId(item, idKey))),
  }), [idKey, items, rowDisabledPredicate, rowUnselectablePredicate, selectedIds, selectedItems]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (autoFocus) {
      rootRef.current?.focus();
    }
  }, [autoFocus]);

  const selectAllVisibleRows = () => {
    updateSelectedIds(allSortedRowsSelected ? [] : selectableSortedItems.map((item) => rowId(item, idKey)));
  };

  const actionContext = (nextSelectedIds = selectedIds): [TableActionRow | null, unknown[], unknown[]] => {
    const selectedItemsForAction = items.filter((item) => nextSelectedIds.some((id) => Object.is(id, rowId(item, idKey))));
    const focusedItem = focusedIndex === null ? undefined : sortedItems[focusedIndex];
    return [
      focusedItem === undefined ? null : {
        item: focusedItem,
        rowId: rowId(focusedItem, idKey),
        isSelected: nextSelectedIds.some((id) => Object.is(id, rowId(focusedItem, idKey))),
        isFocused: true,
      },
      selectedItemsForAction,
      nextSelectedIds.map((id) => String(id)),
    ];
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const bindings = { ...defaultProps.keyBindings, ...keyBindings };
    const matchedAction = Object.entries(bindings).find(([, binding]) => matchesKeyBinding(event, binding))?.[0];
    if (matchedAction) {
      if (matchedAction === "selectAll" && rowsSelectable && onSelectAllAction) {
        const nextIds = selectableSortedItems.map((item) => rowId(item, idKey));
        updateSelectedIds(nextIds);
        void onSelectAllAction(...actionContext(nextIds));
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (matchedAction === "delete" && rowsSelectable && onDeleteAction) {
        void onDeleteAction(...actionContext());
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (matchedAction === "copy" && rowsSelectable && onCopyAction) {
        void onCopyAction(...actionContext());
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (matchedAction === "cut" && rowsSelectable && onCutAction) {
        void onCutAction(...actionContext());
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (matchedAction === "paste" && onPasteAction) {
        void onPasteAction(...actionContext());
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    if (event.key === "ArrowDown") {
      setFocusedIndex((current) => Math.min(sortedItems.length - 1, current === null ? 0 : current + 1));
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      setFocusedIndex((current) => Math.max(0, current === null ? 0 : current - 1));
      event.preventDefault();
      return;
    }
    if (event.key === " " && rowsSelectable && focusedIndex !== null) {
      const focusedItem = sortedItems[focusedIndex];
      if (focusedItem !== undefined) {
        toggleSelection(focusedItem);
        event.preventDefault();
      }
    }
  };

  const hasRows = sortedItems.length > 0;
  const cellAlignClass = alignmentClass(cellVerticalAlign);
  const renderPagination = () => showPagination ? (
    <nav aria-label="Pagination" className={styles.pagination}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={pageIndex <= 0}
        onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
      >
        Previous
      </button>
      <button
        type="button"
        aria-label="Next page"
        disabled={pageIndex >= totalPages - 1}
        onClick={() => setPageIndex((current) => Math.min(totalPages - 1, current + 1))}
      >
        Next
      </button>
    </nav>
  ) : null;
  return (
    <div
      {...rest}
      id={id}
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      data-testid={dataTestId}
      tabIndex={autoFocus ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <table className={styles.table} data-xmlui-part="table">
        {!hideHeader && (
          <thead>
            <tr>
              {rowsSelectable && !hideSelectionCheckboxes && (
                <th
                  className={`${styles.headerCell} ${styles.selectionCell}`}
                  data-checkbox-tolerance={checkboxTolerance}
                  onClick={(event) => {
                    if (event.target instanceof HTMLInputElement || !enableMultiRowSelection || hideSelectionCheckboxesHeader) {
                      return;
                    }
                    selectAllVisibleRows();
                  }}
                >
                  {enableMultiRowSelection && !hideSelectionCheckboxesHeader ? (
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      checked={allSortedRowsSelected}
                      onChange={selectAllVisibleRows}
                    />
                  ) : null}
                </th>
              )}
              {visibleColumns.map((column, index) => {
                const effectiveColumnStyle = columnStyle(column, columnWidths[column.id]);
                return (
                <th
                  key={column.id}
                  className={[styles.headerCell, cellAlignClass, column.canSort === false || !column.bindTo ? "" : styles.sortableHeader].filter(Boolean).join(" ")}
                  style={{ ...effectiveColumnStyle, ...(userSelectHeading ? { userSelect: userSelectHeading as CSSProperties["userSelect"] } : undefined) }}
                  role={column.canSort === false || !column.bindTo ? undefined : "columnheader"}
                  onClick={() => {
                    if (column.canSort === false || !column.bindTo) {
                      return;
                    }
                    setSort((current) => ({
                      key: column.bindTo!,
                      descending: current && current.key === column.bindTo ? !current.descending : false,
                    }));
                  }}
                >
                  {column.canSort === false || !column.bindTo ? (
                    <div style={userSelectHeading ? { userSelect: userSelectHeading as CSSProperties["userSelect"] } : undefined}>
                      {column.header ?? column.bindTo ?? `Column ${index + 1}`}
                    </div>
                  ) : (
                    <button type="button" className={styles.sortButton}>
                      <div style={userSelectHeading ? { userSelect: userSelectHeading as CSSProperties["userSelect"] } : undefined}>
                        {column.header ?? column.bindTo ?? `Column ${index + 1}`}
                      </div>
                      <span
                        data-part-id="orderIndicator"
                        className={[
                          styles.orderIndicator,
                          alwaysShowSortingIndicator || sort?.key === column.bindTo ? styles.orderIndicatorVisible : "",
                        ].filter(Boolean).join(" ")}
                        aria-hidden="true"
                      >
                        {sort?.key === column.bindTo && sort.descending ? "↓" : "↑"}
                      </span>
                    </button>
                  )}
                  {column.canResize ? (
                    <div
                      className={styles.resizer}
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const headerCell = event.currentTarget.closest("th");
                        const startX = event.clientX;
                        const startWidth = headerCell?.getBoundingClientRect().width ?? numericSize(effectiveColumnStyle?.width) ?? 0;
                        const handleMove = (moveEvent: globalThis.MouseEvent) => {
                          const nextWidth = Math.max(32, startWidth + moveEvent.clientX - startX);
                          setColumnWidths((current) => ({ ...current, [column.id]: nextWidth }));
                        };
                        const handleUp = () => {
                          document.removeEventListener("mousemove", handleMove);
                          document.removeEventListener("mouseup", handleUp);
                        };
                        document.addEventListener("mousemove", handleMove);
                        document.addEventListener("mouseup", handleUp);
                      }}
                    />
                  ) : null}
                </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {loading && !hasRows ? (
            <tr><td className={styles.empty} role="status" aria-label="Loading" colSpan={visibleColumns.length + (rowsSelectable ? 1 : 0)}>Loading...</td></tr>
          ) : hasRows ? (
            <>
              {topSpacerHeight > 0 ? (
                <tr aria-hidden="true" className={styles.virtualSpacer} style={{ height: topSpacerHeight }}>
                  <td colSpan={visibleColumns.length + (rowsSelectable && !hideSelectionCheckboxes ? 1 : 0)} />
                </tr>
              ) : null}
              {renderedItems.map((item, rowIndex) => {
            const absoluteRowIndex = (shouldPaginate ? pageIndex * effectivePageSize : 0) + virtualStart + rowIndex;
            const currentId = rowId(item, idKey);
            const selected = selectedIds.some((selectedId) => Object.is(selectedId, currentId));
            const disabled = isRowDisabled(item, rowDisabledPredicate);
            const unselectable = isRowUnselectable(item, rowUnselectablePredicate);
            return (
              <tr
                key={String(currentId ?? rowIndex)}
                className={[
                  styles.row,
                  selected ? styles.rowSelected : "",
                  selected ? "selected" : "",
                  disabled ? styles.disabled : "",
                  striped && absoluteRowIndex % 2 === 0 ? styles.evenRow : "",
                  striped && absoluteRowIndex % 2 !== 0 ? styles.oddRow : "",
                ].filter(Boolean).join(" ")}
                data-list-index={absoluteRowIndex}
                style={{
                  ...(userSelectRow ? { userSelect: userSelectRow as CSSProperties["userSelect"] } : undefined),
                  borderBottom: "var(--xmlui-borderBottom-row-Table, 1px solid var(--xmlui-color-border, currentColor))",
                }}
                onClick={(event) => {
                  if (isInteractiveClick(event)) {
                    return;
                  }
                  setFocusedIndex(absoluteRowIndex);
                  void onRowClick?.(item);
                  if (event.detail < 2) {
                    selectRowFromClick(item, event);
                  }
                }}
                onDoubleClick={() => void onRowDoubleClick?.(item)}
                onContextMenu={(event) => {
                  if (onContextMenu) {
                    event.preventDefault();
                    void onContextMenu(item, rowIndex);
                  }
                }}
              >
                {rowsSelectable && !hideSelectionCheckboxes && !unselectable && (
                  <td className={`${styles.cell} ${styles.selectionCell}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      className={alwaysShowSelectionCheckboxes ? styles.showSelectionCheckbox : undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      onChange={() => {
                        if (!disabled) {
                          toggleSelection(item);
                        }
                      }}
                    />
                  </td>
                )}
                {visibleColumns.map((column, colIndex) => (
                  <td
                    key={column.id}
                    className={[styles.cell, cellAlignClass].filter(Boolean).join(" ")}
                    style={{ ...columnStyle(column, columnWidths[column.id]), ...column.cellStyle, ...(userSelectCell ? { userSelect: userSelectCell as CSSProperties["userSelect"] } : undefined) }}
                  >
                    <div className={styles.cellContent}>{renderCell?.(item, absoluteRowIndex, column, colIndex) ?? displayValue(valueByKey(item, column.bindTo))}</div>
                  </td>
                ))}
              </tr>
            );
              })}
              {bottomSpacerHeight > 0 ? (
                <tr aria-hidden="true" className={styles.virtualSpacer} style={{ height: bottomSpacerHeight }}>
                  <td colSpan={visibleColumns.length + (rowsSelectable && !hideSelectionCheckboxes ? 1 : 0)} />
                </tr>
              ) : null}
            </>
          ) : (
            <tr>
              <td className={styles.empty} colSpan={visibleColumns.length + (rowsSelectable ? 1 : 0)}>
                {emptyTemplate ?? "No data"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
}));

function inferColumns(items: unknown[]): TableColumnDefinition[] {
  const firstObject = items.find((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item));
  return Object.keys(firstObject ?? {}).map((key) => ({ id: key, bindTo: key, header: key, canSort: true }));
}

function valueByKey(item: unknown, key?: string): unknown {
  if (!key || !item || typeof item !== "object") {
    return undefined;
  }
  return key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, item);
}

function rowId(item: unknown, idKey: string): unknown {
  return valueByKey(item, idKey) ?? item;
}

function isRowDisabled(item: unknown, predicate?: (item: unknown) => unknown): boolean {
  return !!predicate?.(item);
}

function isRowUnselectable(item: unknown, predicate?: (item: unknown) => unknown): boolean {
  return !!predicate?.(item);
}

function isInteractiveClick(event: MouseEvent<HTMLElement>): boolean {
  const target = event.target;
  return target instanceof HTMLElement && !!target.closest("button,input,select,textarea,a,[role='button'],[role='menuitem']");
}

function alignmentClass(value?: string): string {
  if (value === "top") {
    return styles.alignTop;
  }
  if (value === "bottom") {
    return styles.alignBottom;
  }
  return styles.alignCenter;
}

function matchesKeyBinding(event: KeyboardEvent<HTMLDivElement>, binding: string | undefined): boolean {
  if (!binding) {
    return false;
  }
  const parts = binding.split("+").map((part) => part.trim().toLowerCase()).filter(Boolean);
  const key = parts.at(-1);
  if (!key) {
    return false;
  }
  const wantsCtrlOrMeta = parts.includes("ctrlormeta") || parts.includes("cmdormeta");
  const wantsCtrl = wantsCtrlOrMeta || parts.includes("ctrl") || parts.includes("control");
  const wantsMeta = wantsCtrlOrMeta || parts.includes("cmd") || parts.includes("meta");
  const wantsAlt = parts.includes("alt") || parts.includes("option");
  const wantsShift = parts.includes("shift");
  const modifierMatches =
    (wantsCtrlOrMeta ? event.ctrlKey || event.metaKey : (!wantsCtrl || event.ctrlKey) && (!wantsMeta || event.metaKey)) &&
    event.altKey === wantsAlt &&
    event.shiftKey === wantsShift;
  return modifierMatches && event.key.toLowerCase() === normalizeKeyName(key);
}

function normalizeKeyName(key: string): string {
  if (key === "space") {
    return " ";
  }
  if (key === "esc") {
    return "escape";
  }
  return key;
}

function numericSize(value: CSSProperties["height"]): number | undefined {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const match = /^(\d+(?:\.\d+)?)px$/.exec(value.trim());
    return match ? Number(match[1]) : undefined;
  }
  return undefined;
}

function displayValue(value: unknown): ReactNode {
  if (value === undefined || value === null) {
    return "";
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function compareValues(left: unknown, right: unknown, descending: boolean): number {
  const direction = descending ? -1 : 1;
  if (left === right) {
    return 0;
  }
  if (left === undefined || left === null) {
    return 1;
  }
  if (right === undefined || right === null) {
    return -1;
  }
  return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
}

function columnStyle(column: TableColumnDefinition, overrideWidth?: number): CSSProperties | undefined {
  const style: CSSProperties = {};
  if (overrideWidth !== undefined) {
    style.width = `${overrideWidth}px`;
  }
  if (column.width !== undefined) {
    style.width = style.width ?? sizeValue(column.width);
  }
  if (column.minWidth !== undefined) {
    style.minWidth = sizeValue(column.minWidth);
  }
  if (column.maxWidth !== undefined) {
    style.maxWidth = sizeValue(column.maxWidth);
    style.width = style.width ?? sizeValue(column.maxWidth);
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

function sizeValue(value: string | number): string {
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (value.startsWith("$")) {
    const token = value.slice(1);
    const knownSpaces: Record<string, string> = {
      "space-8": "32px",
      "space-12": "48px",
      "space-24": "96px",
    };
    return knownSpaces[token] ?? `var(--xmlui-${token})`;
  }
  return value;
}
