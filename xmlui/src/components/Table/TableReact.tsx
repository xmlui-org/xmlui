import { forwardRef, memo, useImperativeHandle, useMemo, useState, type CSSProperties, type ReactNode } from "react";

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
  enableMultiRowSelection?: boolean;
  initiallySelected?: unknown[];
  hideHeader?: boolean;
  hideSelectionCheckboxes?: boolean;
  className?: string;
  style?: CSSProperties;
  emptyTemplate?: ReactNode;
  renderCell?: (item: unknown, rowIndex: number, column: TableColumnDefinition, colIndex: number) => ReactNode;
  onSelectionDidChange?: (selectedItems: unknown[]) => void | Promise<void>;
  "data-testid"?: string;
};

export const TableNative = memo(forwardRef<TableApi, TableNativeProps>(function TableNative(
  {
    id,
    items,
    columns,
    idKey = defaultProps.idKey,
    loading = defaultProps.loading,
    rowsSelectable = defaultProps.rowsSelectable,
    enableMultiRowSelection = defaultProps.enableMultiRowSelection,
    initiallySelected = defaultProps.initiallySelected,
    hideHeader = defaultProps.hideHeader,
    hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
    className,
    style,
    emptyTemplate,
    renderCell,
    onSelectionDidChange,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const [sort, setSort] = useState<{ key: string; descending: boolean }>();
  const [selectedIds, setSelectedIds] = useState<unknown[]>(initiallySelected);
  const visibleColumns = columns.length > 0 ? columns : inferColumns(items);

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

  const updateSelectedIds = (nextIds: unknown[]) => {
    setSelectedIds(nextIds);
    void onSelectionDidChange?.(items.filter((item) => nextIds.some((id) => Object.is(id, rowId(item, idKey)))));
  };

  const api = useMemo<TableApi>(() => ({
    getSelectedIds: () => selectedIds,
    getSelectedItems: () => selectedItems,
    clearSelection: () => updateSelectedIds([]),
    selectAll: () => updateSelectedIds(items.map((item) => rowId(item, idKey))),
  }), [idKey, items, selectedIds, selectedItems]);

  useImperativeHandle(ref, () => api, [api]);

  const hasRows = sortedItems.length > 0;
  return (
    <div {...rest} id={id} className={[styles.root, className].filter(Boolean).join(" ")} style={style} data-testid={dataTestId}>
      <table className={styles.table} data-xmlui-part="table">
        {!hideHeader && (
          <thead>
            <tr>
              {rowsSelectable && !hideSelectionCheckboxes && <th className={`${styles.headerCell} ${styles.selectionCell}`} />}
              {visibleColumns.map((column, index) => (
                <th
                  key={column.id}
                  className={[styles.headerCell, column.canSort === false || !column.bindTo ? "" : styles.sortableHeader].filter(Boolean).join(" ")}
                  style={columnStyle(column)}
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
                  {column.header ?? column.bindTo ?? `Column ${index + 1}`}
                  {sort?.key === column.bindTo ? (sort?.descending ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {loading && !hasRows ? (
            <tr><td className={styles.empty} colSpan={visibleColumns.length + (rowsSelectable ? 1 : 0)}>Loading...</td></tr>
          ) : hasRows ? sortedItems.map((item, rowIndex) => {
            const currentId = rowId(item, idKey);
            const selected = selectedIds.some((selectedId) => Object.is(selectedId, currentId));
            return (
              <tr key={String(currentId ?? rowIndex)} className={[styles.row, selected ? styles.rowSelected : ""].filter(Boolean).join(" ")} data-list-index={rowIndex}>
                {rowsSelectable && !hideSelectionCheckboxes && (
                  <td className={`${styles.cell} ${styles.selectionCell}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const nextIds = selected
                          ? selectedIds.filter((selectedId) => !Object.is(selectedId, currentId))
                          : enableMultiRowSelection ? [...selectedIds, currentId] : [currentId];
                        updateSelectedIds(nextIds);
                      }}
                    />
                  </td>
                )}
                {visibleColumns.map((column, colIndex) => (
                  <td key={column.id} className={styles.cell} style={column.cellStyle}>
                    {renderCell?.(item, rowIndex, column, colIndex) ?? displayValue(valueByKey(item, column.bindTo))}
                  </td>
                ))}
              </tr>
            );
          }) : (
            <tr>
              <td className={styles.empty} colSpan={visibleColumns.length + (rowsSelectable ? 1 : 0)}>
                {emptyTemplate ?? "No data"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
  return (item as Record<string, unknown>)[key];
}

function rowId(item: unknown, idKey: string): unknown {
  return valueByKey(item, idKey) ?? item;
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

function columnStyle(column: TableColumnDefinition): CSSProperties | undefined {
  const style: CSSProperties = {};
  if (column.width !== undefined) {
    style.width = typeof column.width === "number" ? `${column.width}px` : column.width;
  }
  if (column.minWidth !== undefined) {
    style.minWidth = typeof column.minWidth === "number" ? `${column.minWidth}px` : column.minWidth;
  }
  if (column.maxWidth !== undefined) {
    style.maxWidth = typeof column.maxWidth === "number" ? `${column.maxWidth}px` : column.maxWidth;
  }
  return Object.keys(style).length > 0 ? style : undefined;
}
