import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { defaultProps } from "./List.defaults";
import styles from "./List.module.scss";

export type ListApi = {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToIndex: (index: number) => void;
  scrollToId: (id: unknown) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedIds: () => Array<string | number>;
  getSelectedItems: () => unknown[];
  selectId: (id: unknown) => void;
};

export type ListProps = {
  id?: string;
  items?: unknown;
  loading?: boolean;
  limit?: number;
  scrollAnchor?: string;
  fixedItemSize?: boolean;
  groupBy?: unknown;
  orderBy?: unknown;
  availableGroups?: string[];
  pageInfo?: unknown;
  idKey?: string;
  groupsInitiallyExpanded?: boolean;
  defaultGroups?: string[];
  hideEmptyGroups?: boolean;
  borderCollapse?: boolean;
  rowsSelectable?: boolean;
  enableMultiRowSelection?: boolean;
  initiallySelected?: unknown[];
  hideSelectionCheckboxes?: boolean;
  rowUnselectablePredicate?: (item: unknown) => unknown;
  selectionCheckboxPosition?: string;
  selectionCheckboxAnchor?: string;
  selectionCheckboxOffsetX?: string;
  selectionCheckboxOffsetY?: string;
  selectionCheckboxSize?: string;
  keyBindings?: Record<string, string>;
  className?: string;
  style?: CSSProperties;
  renderItem?: (item: unknown, index: number, count: number, isSelected: boolean) => ReactNode;
  renderGroupHeader?: (group: string, items: unknown[]) => ReactNode;
  renderGroupFooter?: (group: string, items: unknown[]) => ReactNode;
  emptyListTemplate?: ReactNode;
  onSelectionDidChange?: (items: unknown[]) => void | Promise<void>;
  onRowDoubleClick?: (item: unknown) => void | Promise<void>;
  onContextMenu?: () => void | Promise<void>;
  onRequestFetchPrevPage?: () => void | Promise<void>;
  onRequestFetchNextPage?: () => void | Promise<void>;
  onSelectAllAction?: (row: ListRowContext | null, items: unknown[], ids: string[]) => void | Promise<void>;
  onCutAction?: (row: ListRowContext | null, items: unknown[], ids: string[]) => void | Promise<void>;
  onCopyAction?: (row: ListRowContext | null, items: unknown[], ids: string[]) => void | Promise<void>;
  onPasteAction?: (row: ListRowContext | null, items: unknown[], ids: string[]) => void | Promise<void>;
  onDeleteAction?: (row: ListRowContext | null, items: unknown[], ids: string[]) => void | Promise<void>;
  registerApi?: (api: Record<string, unknown>) => void;
  "data-testid"?: string;
};

type ListRowContext = {
  item: unknown;
  rowIndex: number;
  rowId: string;
  isSelected: boolean;
  isFocused: boolean;
};

type Row =
  | { type: "section"; group: string; items: unknown[]; index: number }
  | { type: "footer"; group: string; items: unknown[]; index: number }
  | { type: "item"; item: unknown; index: number };

const VIRTUALIZATION_THRESHOLD = 50;
const ESTIMATED_ROW_HEIGHT = 48;
const VIRTUALIZATION_OVERSCAN = 8;

export const ListNative = memo(forwardRef<ListApi, ListProps>(function ListNative(
  {
    id,
    items = [],
    loading = false,
    limit,
    scrollAnchor = defaultProps.scrollAnchor,
    fixedItemSize: _fixedItemSize,
    groupBy,
    orderBy,
    availableGroups,
    pageInfo,
    idKey = defaultProps.idKey,
    groupsInitiallyExpanded = defaultProps.groupsInitiallyExpanded,
    defaultGroups = [],
    hideEmptyGroups = defaultProps.hideEmptyGroups,
    borderCollapse = defaultProps.borderCollapse,
    rowsSelectable = defaultProps.rowsSelectable,
    enableMultiRowSelection = defaultProps.enableMultiRowSelection,
    initiallySelected = defaultProps.initiallySelected,
    hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
    rowUnselectablePredicate,
    selectionCheckboxPosition = defaultProps.selectionCheckboxPosition,
    selectionCheckboxAnchor = defaultProps.selectionCheckboxAnchor,
    selectionCheckboxOffsetX = defaultProps.selectionCheckboxOffsetX,
    selectionCheckboxOffsetY = defaultProps.selectionCheckboxOffsetY,
    selectionCheckboxSize,
    keyBindings = defaultProps.keyBindings,
    className,
    style,
    renderItem = defaultRenderItem,
    renderGroupHeader,
    renderGroupFooter,
    emptyListTemplate,
    onSelectionDidChange,
    onRowDoubleClick,
    onContextMenu,
    onRequestFetchPrevPage,
    onRequestFetchNextPage,
    onSelectAllAction,
    onCutAction,
    onCopyAction,
    onPasteAction,
    onDeleteAction,
    registerApi,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const normalizedItems = useMemo(
    () => normalizeItems(items, orderBy, limit),
    [items, limit, orderBy],
  );
  const rows = useMemo(
    () => buildRows({
      items: normalizedItems,
      groupBy,
      defaultGroups,
      availableGroups,
      hideEmptyGroups,
      groupsInitiallyExpanded,
    }),
    [availableGroups, defaultGroups, groupBy, groupsInitiallyExpanded, hideEmptyGroups, normalizedItems],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set((initiallySelected ?? []).map(String)),
  );
  const selectedItems = useMemo(
    () => normalizedItems.filter((item) => selectedIds.has(String(itemId(item, idKey)))),
    [idKey, normalizedItems, selectedIds],
  );
  const shouldVirtualize = rows.length > VIRTUALIZATION_THRESHOLD && hasConstrainedHeight(style);
  const virtualWindow = useMemo(
    () => shouldVirtualize
      ? visibleWindow(rows.length, rootRef.current?.clientHeight ?? 400, scrollTop)
      : { start: 0, end: rows.length, top: 0, bottom: 0 },
    [rows.length, scrollTop, shouldVirtualize],
  );
  const renderedRows = shouldVirtualize ? rows.slice(virtualWindow.start, virtualWindow.end) : rows;

  const publishSelection = useCallback((nextIds: Set<string>) => {
    setSelectedIds(nextIds);
    const nextItems = normalizedItems.filter((item) => nextIds.has(String(itemId(item, idKey))));
    void onSelectionDidChange?.(nextItems);
  }, [idKey, normalizedItems, onSelectionDidChange]);

  const toggleItem = useCallback((item: unknown, additive: boolean) => {
    if (!rowsSelectable) {
      return;
    }
    if (isUnselectable(item, rowUnselectablePredicate)) {
      publishSelection(new Set(selectedIds));
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
  }, [enableMultiRowSelection, idKey, publishSelection, rowUnselectablePredicate, rowsSelectable, selectedIds]);

  const actionContext = useCallback((): [ListRowContext | null, unknown[], string[]] => {
    const ids = [...selectedIds];
    const firstId = ids[0];
    const item = normalizedItems.find((candidate) => String(itemId(candidate, idKey)) === firstId);
    const rowIndex = item === undefined ? -1 : normalizedItems.indexOf(item);
    return [
      item === undefined ? null : {
        item,
        rowIndex,
        rowId: firstId,
        isSelected: true,
        isFocused: true,
      },
      selectedItems,
      ids,
    ];
  }, [idKey, normalizedItems, selectedIds, selectedItems]);

  const api = useMemo<ListApi>(() => ({
    scrollToTop: () => rootRef.current?.scrollTo({ top: 0 }),
    scrollToBottom: () => rootRef.current?.scrollTo({ top: rootRef.current.scrollHeight }),
    scrollToIndex: (index) => {
      if (shouldVirtualize) {
        rootRef.current?.scrollTo({ top: Math.max(0, index * ESTIMATED_ROW_HEIGHT) });
        return;
      }
      rootRef.current?.querySelector<HTMLElement>(`[data-list-index="${index}"]`)?.scrollIntoView();
    },
    scrollToId: (targetId) => {
      if (shouldVirtualize) {
        const index = normalizedItems.findIndex((item) => String(itemId(item, idKey)) === String(targetId));
        if (index >= 0) {
          rootRef.current?.scrollTo({ top: index * ESTIMATED_ROW_HEIGHT });
        }
        return;
      }
      rootRef.current?.querySelector<HTMLElement>(`[data-list-id="${String(targetId)}"]`)?.scrollIntoView();
    },
    selectAll: () => {
      if (!rowsSelectable) {
        return;
      }
      publishSelection(new Set(normalizedItems
        .filter((item) => !isUnselectable(item, rowUnselectablePredicate))
        .map((item) => String(itemId(item, idKey)))));
    },
    clearSelection: () => publishSelection(new Set()),
    getSelectedIds: () => [...selectedIds].map((id) => numericId(id)),
    getSelectedItems: () => selectedItems,
    selectId: (targetId) => {
      if (!rowsSelectable) {
        return;
      }
      const ids = Array.isArray(targetId) ? targetId : [targetId];
      publishSelection(new Set(ids.map(String)));
    },
  }), [idKey, normalizedItems, publishSelection, rowUnselectablePredicate, rowsSelectable, selectedIds, selectedItems, shouldVirtualize]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    registerApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerApi]);

  useEffect(() => {
    if (scrollAnchor !== "bottom") {
      return;
    }
    requestAnimationFrame(() => rootRef.current?.scrollTo({ top: rootRef.current.scrollHeight }));
  }, [rows.length, scrollAnchor]);

  useEffect(() => {
    if (!pageInfo || typeof pageInfo !== "object") {
      return;
    }
    const info = pageInfo as Record<string, unknown>;
    if (info.hasPrevPage && !info.isFetchingPrevPage && rootRef.current?.scrollTop === 0) {
      void onRequestFetchPrevPage?.();
    }
    const isAtBottom = rootRef.current
      ? rootRef.current.scrollTop + rootRef.current.clientHeight >= rootRef.current.scrollHeight - 1
      : false;
    if (info.hasNextPage && !info.isFetchingNextPage && isAtBottom) {
      void onRequestFetchNextPage?.();
    }
  }, [onRequestFetchNextPage, onRequestFetchPrevPage, pageInfo, rows.length]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const action = keyActionForEvent(event, keyBindings);
    if (!action) {
      return;
    }
    const [row, items, ids] = actionContext();
    let handled = false;
    if (action === "selectAll" && rowsSelectable) {
      api.selectAll();
      void onSelectAllAction?.(row, normalizedItems.filter((item) => !isUnselectable(item, rowUnselectablePredicate)), normalizedItems
        .filter((item) => !isUnselectable(item, rowUnselectablePredicate))
        .map((item) => String(itemId(item, idKey))));
      handled = true;
    } else if (action === "copy" && rowsSelectable) {
      void onCopyAction?.(row, items, ids);
      handled = true;
    } else if (action === "cut" && rowsSelectable) {
      void onCutAction?.(row, items, ids);
      handled = true;
    } else if (action === "delete" && rowsSelectable) {
      void onDeleteAction?.(row, items, ids);
      handled = true;
    } else if (action === "paste") {
      void onPasteAction?.(row, items, ids);
      handled = true;
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, [
    actionContext,
    api,
    idKey,
    keyBindings,
    normalizedItems,
    onCopyAction,
    onCutAction,
    onDeleteAction,
    onPasteAction,
    onSelectAllAction,
    rowUnselectablePredicate,
    rowsSelectable,
  ]);

  return (
    <div
      {...rest}
      ref={rootRef}
      id={id}
      data-testid={dataTestId}
      data-xmlui-component="List"
      className={cx(styles.outerListWrapper, className)}
      style={style}
      tabIndex={0}
      onContextMenu={(event) => {
        event.preventDefault();
        void onContextMenu?.();
      }}
      onKeyDown={handleKeyDown}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className={styles.innerListWrapper}>
        {loading && normalizedItems.length === 0 ? (
          <div className={styles.loadingWrapper}>Loading...</div>
        ) : normalizedItems.length === 0 ? (
          <div className={styles.noRows}>{emptyListTemplate ?? "No data"}</div>
        ) : (
          <>
            {shouldVirtualize && virtualWindow.top > 0 ? (
              <div aria-hidden="true" style={{ height: virtualWindow.top, flex: "0 0 auto" }} />
            ) : null}
            {renderedRows.map((row) => {
            if (row.type === "section") {
              return (
                <div
                  key={`section:${row.group}`}
                  data-list-item-type="SECTION"
                  data-index={row.index}
                  className={styles.section}
                  style={shouldVirtualize ? virtualRowStyle() : undefined}
                >
                  <div className={styles.listGroupHeader}>
                    {renderGroupHeader?.(row.group, row.items) ?? row.group}
                  </div>
                </div>
              );
            }
            if (row.type === "footer") {
              return renderGroupFooter ? (
                <div
                  key={`footer:${row.group}`}
                  data-list-item-type="SECTION_FOOTER"
                  data-index={row.index}
                  className={styles.sectionFooter}
                  style={shouldVirtualize ? virtualRowStyle() : undefined}
                >
                  <div className={styles.listGroupFooter}>{renderGroupFooter(row.group, row.items)}</div>
                </div>
              ) : null;
            }
            return renderRow({
              item: row.item,
              index: row.index,
              count: normalizedItems.length,
              idKey,
              selectedIds,
              rowsSelectable,
              hideSelectionCheckboxes,
              rowUnselectablePredicate,
              selectionCheckboxPosition,
              selectionCheckboxAnchor,
              selectionCheckboxOffsetX,
              selectionCheckboxOffsetY,
              selectionCheckboxSize,
              borderCollapse,
              renderItem,
              toggleItem,
              onRowDoubleClick,
              virtualized: shouldVirtualize,
            });
            })}
            {shouldVirtualize && virtualWindow.bottom > 0 ? (
              <div aria-hidden="true" style={{ height: virtualWindow.bottom, flex: "0 0 auto" }} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}));

function hasConstrainedHeight(style: CSSProperties | undefined): boolean {
  return style?.height !== undefined || style?.maxHeight !== undefined;
}

function visibleWindow(rowCount: number, viewportHeight: number, scrollTop: number): {
  start: number;
  end: number;
  top: number;
  bottom: number;
} {
  const visibleCount = Math.ceil(Math.max(1, viewportHeight) / ESTIMATED_ROW_HEIGHT);
  const start = Math.max(0, Math.floor(scrollTop / ESTIMATED_ROW_HEIGHT) - VIRTUALIZATION_OVERSCAN);
  const end = Math.min(rowCount, start + visibleCount + VIRTUALIZATION_OVERSCAN * 2);
  return {
    start,
    end,
    top: start * ESTIMATED_ROW_HEIGHT,
    bottom: Math.max(0, (rowCount - end) * ESTIMATED_ROW_HEIGHT),
  };
}

function renderRow({
  item,
  index,
  count,
  idKey,
  selectedIds,
  rowsSelectable,
  hideSelectionCheckboxes,
  rowUnselectablePredicate,
  selectionCheckboxPosition,
  selectionCheckboxAnchor,
  selectionCheckboxOffsetX,
  selectionCheckboxOffsetY,
  selectionCheckboxSize,
  borderCollapse,
  renderItem,
  toggleItem,
  onRowDoubleClick,
  virtualized,
}: {
  item: unknown;
  index: number;
  count: number;
  idKey: string;
  selectedIds: Set<string>;
  rowsSelectable: boolean;
  hideSelectionCheckboxes: boolean;
  rowUnselectablePredicate?: (item: unknown) => unknown;
  selectionCheckboxPosition: string;
  selectionCheckboxAnchor: string;
  selectionCheckboxOffsetX: string;
  selectionCheckboxOffsetY: string;
  selectionCheckboxSize?: string;
  borderCollapse: boolean;
  renderItem: NonNullable<ListProps["renderItem"]>;
  toggleItem: (item: unknown, additive: boolean) => void;
  onRowDoubleClick?: (item: unknown) => void | Promise<void>;
  virtualized?: boolean;
}) {
  const id = String(itemId(item, idKey));
  const selected = selectedIds.has(id);
  const unselectable = isUnselectable(item, rowUnselectablePredicate);
  const showCheckbox = rowsSelectable && !hideSelectionCheckboxes;
  const overlay = selectionCheckboxPosition === "overlay";
  const checkbox = showCheckbox ? (
    <span
      className={cx(
        styles.checkboxWrapper,
        overlay ? styles.checkboxOverlay : undefined,
      )}
      style={overlay ? overlayStyle(selectionCheckboxAnchor, selectionCheckboxOffsetX, selectionCheckboxOffsetY) : undefined}
      onClick={(event) => {
        event.stopPropagation();
        toggleItem(item, event.metaKey || event.ctrlKey);
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={unselectable}
        readOnly
        aria-label={`Select row ${index + 1}`}
        style={{
          ...(selectionCheckboxSize ? { width: selectionCheckboxSize, height: selectionCheckboxSize } : {}),
          ...(unselectable ? { pointerEvents: "none" } : {}),
        }}
        onClick={(event) => {
          event.stopPropagation();
          toggleItem(item, event.metaKey || event.ctrlKey);
        }}
      />
    </span>
  ) : null;
  return (
    <div
      key={`${id}:${index}`}
      data-list-index={index}
      data-index={index}
      data-list-id={id}
      data-list-item-type="ITEM"
      data-selected={selected ? "true" : undefined}
      className={cx(
        styles.listRow,
        styles.row,
        borderCollapse ? styles.borderCollapse : undefined,
        rowsSelectable ? styles.listRowSelectable : undefined,
        rowsSelectable ? styles.selectable : undefined,
        selected ? styles.listRowSelected : undefined,
        selected ? styles.selected : undefined,
        showCheckbox && !overlay ? styles.listRowHasCheckboxes : undefined,
        showCheckbox && !overlay ? styles.hasCheckboxes : undefined,
        showCheckbox && overlay ? styles.hasOverlayCheckbox : undefined,
      )}
      style={virtualized ? virtualRowStyle() : undefined}
      onClick={(event) => toggleItem(item, event.metaKey || event.ctrlKey)}
      onDoubleClick={() => void onRowDoubleClick?.(item)}
    >
      {!overlay ? checkbox : null}
      {renderItem(item, index, count, selected)}
      {overlay ? checkbox : null}
    </div>
  );
}

function virtualRowStyle(): CSSProperties {
  return {
    height: ESTIMATED_ROW_HEIGHT,
    minHeight: ESTIMATED_ROW_HEIGHT,
    maxHeight: ESTIMATED_ROW_HEIGHT,
    overflow: "hidden",
    flex: "0 0 auto",
  };
}

function normalizeItems(items: unknown, orderBy: unknown, limit: number | undefined): unknown[] {
  const array = arrayItems(items).filter((item) => item != null);
  const sorters = orderByFields(orderBy);
  const sorted = sorters.length ? [...array].sort((left, right) => compareByFields(left, right, sorters)) : array;
  return limit && limit > 0 ? sorted.slice(0, limit) : sorted;
}

function arrayItems(items: unknown): unknown[] {
  if (Array.isArray(items)) {
    return items;
  }
  if (items && typeof items === "object") {
    return Object.keys(items as Record<string, unknown>)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => (items as Record<string, unknown>)[key]);
  }
  return [];
}

function buildRows({
  items,
  groupBy,
  defaultGroups,
  availableGroups,
  hideEmptyGroups,
  groupsInitiallyExpanded,
}: {
  items: unknown[];
  groupBy: unknown;
  defaultGroups: string[];
  availableGroups?: string[];
  hideEmptyGroups: boolean;
  groupsInitiallyExpanded: boolean;
}): Row[] {
  if (groupBy === undefined || groupBy === null || groupBy === "") {
    return items.map((item, index) => ({ type: "item", item, index }));
  }
  const groups = new Map<string, unknown[]>();
  for (const item of items) {
    const key = groupKey(item, groupBy);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  let groupNames = unique([...defaultGroups, ...groups.keys()]);
  if (availableGroups?.length) {
    const allowed = new Set(availableGroups);
    groupNames = groupNames
      .filter((name) => allowed.has(name))
      .sort((left, right) => availableGroups.indexOf(left) - availableGroups.indexOf(right));
  }
  const rows: Row[] = [];
  for (const group of groupNames) {
    const groupItems = groups.get(group) ?? [];
    if (hideEmptyGroups && groupItems.length === 0) {
      continue;
    }
    rows.push({ type: "section", group, items: groupItems, index: rows.length });
    if (groupsInitiallyExpanded) {
      for (const item of groupItems) {
        rows.push({ type: "item", item, index: items.indexOf(item) });
      }
      rows.push({ type: "footer", group, items: groupItems, index: rows.length });
    }
  }
  return rows;
}

function groupKey(item: unknown, groupBy: unknown): string {
  if (typeof groupBy === "function") {
    return String(groupBy(item) ?? "");
  }
  return String(fieldValue(item, String(groupBy)) ?? "");
}

function unique(values: Iterable<string>): string[] {
  return [...new Set(values)];
}

function itemId(item: unknown, idKey: string): unknown {
  return fieldValue(item, idKey) ?? item;
}

function numericId(id: string): string | number {
  return /^-?\d+(\.\d+)?$/.test(id) ? Number(id) : id;
}

function defaultRenderItem(item: unknown): ReactNode {
  if (item === null || item === undefined) {
    return null;
  }
  if (typeof item === "object") {
    const values = Object.entries(item as Record<string, unknown>)
      .filter(([key]) => key !== "id")
      .map(([, value]) => value)
      .filter((value) => value !== null && value !== undefined);
    return <div>{values.length ? values.map(String).join(" ") : String(itemId(item, "id"))}</div>;
  }
  return <div>{String(item)}</div>;
}

function fieldValue(item: unknown, field: string): unknown {
  if (item !== null && typeof item === "object") {
    return field.split(".").reduce<unknown>((current, part) => {
      if (current !== null && typeof current === "object") {
        return (current as Record<string, unknown>)[part];
      }
      return undefined;
    }, item);
  }
  return item;
}

function orderByFields(orderBy: unknown): Array<{ field: string; direction: "asc" | "desc" }> {
  const fields = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
  return fields.flatMap((entry) => {
    if (typeof entry === "string") {
      return [{ field: entry, direction: "asc" as const }];
    }
    if (entry && typeof entry === "object" && "field" in entry) {
      const object = entry as Record<string, unknown>;
      return [{ field: String(object.field), direction: object.direction === "desc" ? "desc" as const : "asc" as const }];
    }
    return [];
  });
}

function compareByFields(
  left: unknown,
  right: unknown,
  fields: Array<{ field: string; direction: "asc" | "desc" }>,
): number {
  for (const { field, direction } of fields) {
    const result = String(fieldValue(left, field) ?? "").localeCompare(String(fieldValue(right, field) ?? ""));
    if (result !== 0) {
      return direction === "desc" ? -result : result;
    }
  }
  return 0;
}

function isUnselectable(item: unknown, predicate?: (item: unknown) => unknown): boolean {
  return !!predicate?.(item);
}

function overlayStyle(anchor: string, offsetX: string, offsetY: string): CSSProperties {
  return {
    ...(anchor.includes("center")
      ? { top: "50%", transform: "translateY(-50%)" }
      : anchor.includes("bottom")
        ? { bottom: offsetY }
        : { top: offsetY }),
    ...(anchor.includes("right") ? { right: offsetX } : { left: offsetX }),
  };
}

function keyActionForEvent(event: KeyboardEvent<HTMLDivElement>, bindings: Record<string, string>): string | undefined {
  return Object.entries({ ...defaultProps.keyBindings, ...bindings }).find(([, value]) =>
    matchesBinding(event, value),
  )?.[0];
}

function matchesBinding(event: KeyboardEvent<HTMLDivElement>, binding: string): boolean {
  const normalized = binding.toLowerCase();
  const needsCommand = normalized.includes("cmdorctrl") || normalized.includes("ctrl") || normalized.includes("cmd");
  if (needsCommand && !(event.ctrlKey || event.metaKey)) {
    return false;
  }
  const key = normalized.split("+").at(-1);
  return key === event.key.toLowerCase();
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
