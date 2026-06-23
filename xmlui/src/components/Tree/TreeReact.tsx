import { forwardRef, memo, useImperativeHandle, useMemo, useState, type CSSProperties, type ReactNode } from "react";

import { defaultProps } from "./Tree.defaults";
import styles from "./TreeComponent.module.scss?xmlui-css-module";

export type TreeItem = {
  id: unknown;
  name: string;
  source: unknown;
  children: TreeItem[];
};

export type VisibleTreeItem = TreeItem & {
  depth: number;
};

export type TreeApi = {
  selectedId: unknown;
  expandAll: () => void;
  collapseAll: () => void;
  selectId: (id: unknown) => void;
};

export type TreeNativeProps = {
  id?: string;
  data: unknown[];
  dataFormat?: "flat" | "hierarchy";
  idField?: string;
  nameField?: string;
  parentIdField?: string;
  childrenField?: string;
  selectableField?: string;
  selectedId?: unknown;
  selectedValue?: unknown;
  defaultExpanded?: "none" | "all" | "first-level" | unknown[];
  itemClickExpands?: boolean;
  className?: string;
  style?: CSSProperties;
  renderItem?: (item: unknown, visibleItem: VisibleTreeItem) => ReactNode;
  onItemClick?: (item: unknown) => void | Promise<void>;
  onSelectionDidChange?: (item: unknown) => void | Promise<void>;
  "data-testid"?: string;
};

export const TreeNative = memo(forwardRef<TreeApi, TreeNativeProps>(function TreeNative(
  {
    id,
    data,
    dataFormat = defaultProps.dataFormat,
    idField = defaultProps.idField,
    nameField = defaultProps.nameField,
    parentIdField = defaultProps.parentIdField,
    childrenField = defaultProps.childrenField,
    selectableField = defaultProps.selectableField,
    selectedId,
    selectedValue,
    defaultExpanded = defaultProps.defaultExpanded,
    itemClickExpands = defaultProps.itemClickExpands,
    className,
    style,
    renderItem,
    onItemClick,
    onSelectionDidChange,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const roots = useMemo(
    () => dataFormat === "hierarchy"
      ? hierarchyItems(data, idField, nameField, childrenField)
      : flatItems(data, idField, nameField, parentIdField),
    [childrenField, data, dataFormat, idField, nameField, parentIdField],
  );
  const allIds = useMemo(() => flattenItems(roots).map((item) => item.id), [roots]);
  const [expandedIds, setExpandedIds] = useState<unknown[]>(() => initialExpandedIds(roots, defaultExpanded));
  const [currentSelectedId, setCurrentSelectedId] = useState<unknown>(selectedId ?? selectedValue);
  const visibleItems = useMemo(() => visibleTreeItems(roots, expandedIds), [expandedIds, roots]);

  const selectId = (nextId: unknown) => {
    setCurrentSelectedId(nextId);
    const sourceItem = flattenItems(roots).find((item) => Object.is(item.id, nextId))?.source;
    void onSelectionDidChange?.(sourceItem);
  };

  const api = useMemo<TreeApi>(() => ({
    get selectedId() {
      return currentSelectedId;
    },
    expandAll: () => setExpandedIds(allIds),
    collapseAll: () => setExpandedIds([]),
    selectId,
  }), [allIds, currentSelectedId]);
  useImperativeHandle(ref, () => api, [api]);

  return (
    <div {...rest} id={id} className={[styles.root, className].filter(Boolean).join(" ")} style={style} data-testid={dataTestId} role="tree">
      {visibleItems.map((item) => {
        const expandable = item.children.length > 0;
        const expanded = expandedIds.some((idValue) => Object.is(idValue, item.id));
        const selectable = fieldValue(item.source, selectableField) !== false;
        const selected = Object.is(currentSelectedId, item.id);
        return (
          <div
            key={String(item.id)}
            role="treeitem"
            aria-expanded={expandable ? expanded : undefined}
            aria-selected={selected || undefined}
            className={[styles.item, selected ? styles.selected : ""].filter(Boolean).join(" ")}
            style={{ paddingLeft: `${item.depth * 18 + 6}px` }}
            onClick={() => {
              void onItemClick?.(item.source);
              if (itemClickExpands && expandable) {
                setExpandedIds((current) => toggleId(current, item.id));
              }
              if (selectable) {
                selectId(item.id);
              }
            }}
          >
            {expandable ? (
              <button
                type="button"
                className={styles.toggle}
                aria-label={expanded ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation();
                  setExpandedIds((current) => toggleId(current, item.id));
                }}
              >
                {expanded ? "▾" : "▸"}
              </button>
            ) : <span className={styles.togglePlaceholder} />}
            <span className={styles.label}>{renderItem?.(item.source, item) ?? item.name}</span>
          </div>
        );
      })}
    </div>
  );
}));

function flatItems(data: unknown[], idField: string, nameField: string, parentIdField: string): TreeItem[] {
  const byId = new Map<unknown, TreeItem>();
  const roots: TreeItem[] = [];
  for (const source of data) {
    const id = fieldValue(source, idField);
    byId.set(id, {
      id,
      name: String(fieldValue(source, nameField) ?? id ?? ""),
      source,
      children: [],
    });
  }
  for (const item of byId.values()) {
    const parentId = fieldValue(item.source, parentIdField);
    const parent = byId.get(parentId);
    if (parent) {
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  }
  return roots;
}

function hierarchyItems(data: unknown[], idField: string, nameField: string, childrenField: string): TreeItem[] {
  return data.map((source) => ({
    id: fieldValue(source, idField),
    name: String(fieldValue(source, nameField) ?? fieldValue(source, idField) ?? ""),
    source,
    children: Array.isArray(fieldValue(source, childrenField))
      ? hierarchyItems(fieldValue(source, childrenField) as unknown[], idField, nameField, childrenField)
      : [],
  }));
}

function visibleTreeItems(items: TreeItem[], expandedIds: unknown[], depth = 0): VisibleTreeItem[] {
  return items.flatMap((item) => {
    const current = { ...item, depth };
    if (!expandedIds.some((id) => Object.is(id, item.id))) {
      return [current];
    }
    return [current, ...visibleTreeItems(item.children, expandedIds, depth + 1)];
  });
}

function flattenItems(items: TreeItem[]): TreeItem[] {
  return items.flatMap((item) => [item, ...flattenItems(item.children)]);
}

function initialExpandedIds(items: TreeItem[], defaultExpanded: TreeNativeProps["defaultExpanded"]): unknown[] {
  if (Array.isArray(defaultExpanded)) {
    return defaultExpanded;
  }
  if (defaultExpanded === "all") {
    return flattenItems(items).map((item) => item.id);
  }
  if (defaultExpanded === "first-level") {
    return items.map((item) => item.id);
  }
  return [];
}

function toggleId(ids: unknown[], id: unknown): unknown[] {
  return ids.some((value) => Object.is(value, id))
    ? ids.filter((value) => !Object.is(value, id))
    : [...ids, id];
}

function fieldValue(item: unknown, field: string): unknown {
  return item && typeof item === "object" ? (item as Record<string, unknown>)[field] : undefined;
}
