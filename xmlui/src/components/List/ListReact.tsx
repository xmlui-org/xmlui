import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { defaultProps } from "./List.defaults";
import styles from "./List.module.scss?xmlui-css-module";

export type ListApi = {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToIndex: (index: number) => void;
  scrollToId: (id: unknown) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedIds: () => string[];
  getSelectedItems: () => unknown[];
  selectId: (id: unknown) => void;
};

export type ListProps = {
  id?: string;
  items?: unknown[];
  loading?: boolean;
  limit?: number;
  groupBy?: string;
  orderBy?: string;
  idKey?: string;
  rowsSelectable?: boolean;
  enableMultiRowSelection?: boolean;
  initiallySelected?: unknown[];
  hideSelectionCheckboxes?: boolean;
  className?: string;
  style?: CSSProperties;
  renderItem: (item: unknown, index: number, count: number, isSelected: boolean) => ReactNode;
  renderGroupHeader?: (group: string, items: unknown[]) => ReactNode;
  renderGroupFooter?: (group: string, items: unknown[]) => ReactNode;
  emptyListTemplate?: ReactNode;
  onSelectionDidChange?: (items: unknown[]) => void | Promise<void>;
  onRowDoubleClick?: (item: unknown) => void | Promise<void>;
  onContextMenu?: () => void | Promise<void>;
  registerApi?: (api: Record<string, unknown>) => void;
  "data-testid"?: string;
};

export const ListNative = memo(forwardRef<ListApi, ListProps>(function ListNative(
  {
    id,
    items = [],
    loading = false,
    limit,
    groupBy,
    orderBy,
    idKey = defaultProps.idKey,
    rowsSelectable = defaultProps.rowsSelectable,
    enableMultiRowSelection = defaultProps.enableMultiRowSelection,
    initiallySelected = defaultProps.initiallySelected,
    hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
    className,
    style,
    renderItem,
    renderGroupHeader,
    renderGroupFooter,
    emptyListTemplate,
    onSelectionDidChange,
    onRowDoubleClick,
    onContextMenu,
    registerApi,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalizedItems = useMemo(
    () => normalizeItems(items, orderBy, limit),
    [items, limit, orderBy],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set((initiallySelected ?? []).map(String)),
  );
  const selectedItems = useMemo(
    () => normalizedItems.filter((item) => selectedIds.has(String(itemId(item, idKey)))),
    [idKey, normalizedItems, selectedIds],
  );

  const publishSelection = useCallback((nextIds: Set<string>) => {
    setSelectedIds(nextIds);
    const nextItems = normalizedItems.filter((item) => nextIds.has(String(itemId(item, idKey))));
    void onSelectionDidChange?.(nextItems);
  }, [idKey, normalizedItems, onSelectionDidChange]);

  const toggleItem = useCallback((item: unknown, additive: boolean) => {
    if (!rowsSelectable) {
      return;
    }
    const id = String(itemId(item, idKey));
    const next = enableMultiRowSelection && additive ? new Set(selectedIds) : new Set<string>();
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    publishSelection(next);
  }, [enableMultiRowSelection, idKey, publishSelection, rowsSelectable, selectedIds]);

  const api = useMemo<ListApi>(() => ({
    scrollToTop: () => rootRef.current?.scrollTo({ top: 0 }),
    scrollToBottom: () => rootRef.current?.scrollTo({ top: rootRef.current.scrollHeight }),
    scrollToIndex: (index) => rootRef.current?.querySelector<HTMLElement>(`[data-list-index="${index}"]`)?.scrollIntoView(),
    scrollToId: (targetId) => rootRef.current?.querySelector<HTMLElement>(`[data-list-id="${String(targetId)}"]`)?.scrollIntoView(),
    selectAll: () => publishSelection(new Set(normalizedItems.map((item) => String(itemId(item, idKey))))),
    clearSelection: () => publishSelection(new Set()),
    getSelectedIds: () => [...selectedIds],
    getSelectedItems: () => selectedItems,
    selectId: (targetId) => publishSelection(new Set([String(targetId)])),
  }), [idKey, normalizedItems, publishSelection, selectedIds, selectedItems]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    registerApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerApi]);

  const sections = useMemo(
    () => groupBy ? groupItems(normalizedItems, groupBy) : undefined,
    [groupBy, normalizedItems],
  );

  if (loading && normalizedItems.length === 0) {
    return <div className={styles.loadingWrapper}>Loading...</div>;
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      id={id}
      data-testid={dataTestId}
      data-xmlui-component="List"
      className={cx(styles.outerListWrapper, className)}
      style={style}
      onContextMenu={(event) => {
        event.preventDefault();
        void onContextMenu?.();
      }}
    >
      <div className={styles.innerListWrapper}>
        {normalizedItems.length === 0 ? (
          <div className={styles.noRows}>{emptyListTemplate ?? "No data"}</div>
        ) : sections ? (
          Object.entries(sections).map(([group, groupItems]) => (
            <section key={group}>
              <div className={styles.listGroupHeader}>{renderGroupHeader?.(group, groupItems) ?? group}</div>
              {groupItems.map((item, index) => renderRow({
                item,
                index: normalizedItems.indexOf(item),
                localIndex: index,
                count: normalizedItems.length,
                idKey,
                selectedIds,
                rowsSelectable,
                hideSelectionCheckboxes,
                renderItem,
                toggleItem,
                onRowDoubleClick,
              }))}
              {renderGroupFooter ? <div className={styles.listGroupFooter}>{renderGroupFooter(group, groupItems)}</div> : null}
            </section>
          ))
        ) : (
          normalizedItems.map((item, index) => renderRow({
            item,
            index,
            localIndex: index,
            count: normalizedItems.length,
            idKey,
            selectedIds,
            rowsSelectable,
            hideSelectionCheckboxes,
            renderItem,
            toggleItem,
            onRowDoubleClick,
          }))
        )}
      </div>
    </div>
  );
}));

function renderRow({
  item,
  index,
  count,
  idKey,
  selectedIds,
  rowsSelectable,
  hideSelectionCheckboxes,
  renderItem,
  toggleItem,
  onRowDoubleClick,
}: {
  item: unknown;
  index: number;
  localIndex: number;
  count: number;
  idKey: string;
  selectedIds: Set<string>;
  rowsSelectable: boolean;
  hideSelectionCheckboxes: boolean;
  renderItem: ListProps["renderItem"];
  toggleItem: (item: unknown, additive: boolean) => void;
  onRowDoubleClick?: (item: unknown) => void | Promise<void>;
}) {
  const id = String(itemId(item, idKey));
  const selected = selectedIds.has(id);
  return (
    <div
      key={`${id}:${index}`}
      data-list-index={index}
      data-list-id={id}
      className={cx(
        styles.listRow,
        rowsSelectable ? styles.listRowSelectable : undefined,
        selected ? styles.listRowSelected : undefined,
        rowsSelectable && !hideSelectionCheckboxes ? styles.listRowHasCheckboxes : undefined,
      )}
      onClick={(event) => toggleItem(item, event.metaKey || event.ctrlKey)}
      onDoubleClick={() => void onRowDoubleClick?.(item)}
    >
      {rowsSelectable && !hideSelectionCheckboxes ? (
        <span className={styles.listCheckboxWrapper}>
          <input
            type="checkbox"
            checked={selected}
            readOnly
            aria-label={`Select row ${index + 1}`}
          />
        </span>
      ) : null}
      {renderItem(item, index, count, selected)}
    </div>
  );
}

function normalizeItems(items: unknown, orderBy: string | undefined, limit: number | undefined): unknown[] {
  const array = Array.isArray(items) ? items.filter((item) => item != null) : [];
  const sorted = orderBy ? [...array].sort((left, right) =>
    String(fieldValue(left, orderBy)).localeCompare(String(fieldValue(right, orderBy)))) : array;
  return limit && limit > 0 ? sorted.slice(0, limit) : sorted;
}

function groupItems(items: unknown[], field: string): Record<string, unknown[]> {
  return items.reduce<Record<string, unknown[]>>((groups, item) => {
    const key = String(fieldValue(item, field) ?? "");
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function itemId(item: unknown, idKey: string): unknown {
  return fieldValue(item, idKey) ?? item;
}

function fieldValue(item: unknown, field: string): unknown {
  if (item !== null && typeof item === "object") {
    return (item as Record<string, unknown>)[field];
  }
  return item;
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
