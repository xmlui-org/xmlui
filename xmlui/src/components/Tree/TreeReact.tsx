import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { defaultProps } from "./Tree.defaults";
import styles from "./TreeComponent.module.scss";
import { Icon } from "../Icon/IconReact";

export type TreeItem = {
  id: unknown;
  name: string;
  source: unknown;
  children: TreeItem[];
  parentId?: unknown;
  dynamic: boolean;
  loaded: boolean;
};

export type VisibleTreeItem = TreeItem & {
  depth: number;
  index: number;
  hasChildren: boolean;
  key: unknown;
  displayName: string;
  selectable: boolean;
  expanded: boolean;
};

export type TreeApi = {
  selectedId: unknown;
  expandAll: () => void;
  collapseAll: () => void;
  selectId: (id: unknown) => void;
  selectNode: (id: unknown) => void;
  clearSelection: () => void;
  expandNode: (id: unknown) => void;
  collapseNode: (id: unknown) => void;
  expandToLevel: (level: number) => void;
  getExpandedNodes: () => unknown[];
  getSelectedNode: () => unknown;
  getVisibleItems: () => unknown[];
  scrollIntoView: (id: unknown) => void;
  scrollToItem: (id: unknown) => void;
  appendNode: (parentId: unknown, nodeData: Record<string, unknown>) => void;
  removeNode: (id: unknown) => void;
  removeChildren: (id: unknown) => void;
  insertNodeBefore: (beforeId: unknown, nodeData: Record<string, unknown>) => void;
  insertNodeAfter: (afterId: unknown, nodeData: Record<string, unknown>) => void;
  replaceNode: (id: unknown, nodeData: Record<string, unknown>) => void;
  replaceChildren: (id: unknown, newChildren: unknown[]) => void;
  refreshData: () => void;
  getNodeById: (id: unknown) => unknown;
  getDynamic: (id: unknown) => boolean;
  setDynamic: (id: unknown, dynamic: boolean | undefined) => void;
  getNodeLoadingState: (id: unknown) => "unloaded" | "loading" | "loaded";
  setNodeLoaded: (id: unknown, loaded: boolean) => void;
  markNodeLoaded: (id: unknown) => void;
  markNodeUnloaded: (id: unknown) => void;
  getExpandedTimestamp: (id: unknown) => number | undefined;
  setAutoLoadAfter: (id: unknown, milliseconds: number | null | undefined) => void;
  getAutoLoadAfter: (id: unknown) => number | null | undefined;
  getNodeAutoLoadAfter: (id: unknown) => number | null | undefined;
};

export type TreeNativeProps = {
  id?: string;
  data: unknown[];
  dataFormat?: "flat" | "hierarchy";
  idField?: string;
  nameField?: string;
  iconField?: string;
  iconExpandedField?: string;
  iconCollapsedField?: string;
  parentIdField?: string;
  childrenField?: string;
  selectableField?: string;
  dynamicField?: string;
  loadedField?: string;
  dynamic?: boolean;
  autoLoadAfterField?: string;
  autoLoadAfter?: number;
  spinnerDelay?: number;
  iconCollapsed?: string;
  iconExpanded?: string;
  iconSize?: string;
  selectedId?: unknown;
  selectedValue?: unknown;
  defaultExpanded?: "none" | "all" | "first-level" | unknown[];
  autoExpandToSelection?: boolean;
  itemClickExpands?: boolean;
  itemHeight?: number;
  scrollStyle?: "normal" | "overlay" | "whenMouseOver" | "whenScrolling";
  showScrollerFade?: boolean;
  overflow?: string;
  className?: string;
  style?: CSSProperties;
  renderItem?: (item: unknown, visibleItem: VisibleTreeItem) => ReactNode;
  onItemClick?: (item: unknown) => void | Promise<void>;
  onSelectionDidChange?: (item: unknown) => void | Promise<void>;
  onNodeDidExpand?: (item: unknown) => void | Promise<void>;
  onNodeDidCollapse?: (item: unknown) => void | Promise<void>;
  onLoadChildren?: (item: unknown) => unknown[] | Promise<unknown[] | undefined> | undefined;
  onContextMenu?: (item: unknown, event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  registerApi?: (api: Record<string, unknown>) => void;
  "data-testid"?: string;
};

export const TreeNative = memo(forwardRef<TreeApi, TreeNativeProps>(function TreeNative(
  {
    id,
    data,
    dataFormat = defaultProps.dataFormat,
    idField = defaultProps.idField,
    nameField = defaultProps.nameField,
    iconField = defaultProps.iconField,
    iconExpandedField = defaultProps.iconExpandedField,
    iconCollapsedField = defaultProps.iconCollapsedField,
    parentIdField = defaultProps.parentIdField,
    childrenField = defaultProps.childrenField,
    selectableField = defaultProps.selectableField,
    dynamicField = defaultProps.dynamicField,
    loadedField = defaultProps.loadedField,
    dynamic = defaultProps.dynamic,
    autoLoadAfterField = defaultProps.autoLoadAfterField,
    autoLoadAfter = defaultProps.autoLoadAfter,
    spinnerDelay = defaultProps.spinnerDelay,
    iconCollapsed = defaultProps.iconCollapsed,
    iconExpanded = defaultProps.iconExpanded,
    iconSize = defaultProps.iconSize,
    selectedId,
    selectedValue,
    defaultExpanded = defaultProps.defaultExpanded,
    autoExpandToSelection = defaultProps.autoExpandToSelection,
    itemClickExpands = defaultProps.itemClickExpands,
    itemHeight = defaultProps.itemHeight,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    overflow,
    className,
    style,
    renderItem,
    onItemClick,
    onSelectionDidChange,
    onNodeDidExpand,
    onNodeDidCollapse,
    onLoadChildren,
    onContextMenu,
    registerApi,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportProxyRef = useRef<HTMLDivElement | null>(null);
  const [internalData, setInternalData] = useState<unknown[] | undefined>(undefined);
  const effectiveData = internalData ?? data;
  const dataSignature = useMemo(() => stableDataSignature(data), [data]);
  const roots = useMemo(
    () => dataFormat === "hierarchy"
      ? hierarchyItems(effectiveData, idField, nameField, childrenField, dynamicField, loadedField, dynamic)
      : flatItems(effectiveData, idField, nameField, parentIdField, childrenField, dynamicField, loadedField, dynamic),
    [childrenField, dynamic, dynamicField, effectiveData, dataFormat, idField, loadedField, nameField, parentIdField],
  );
  const allIds = useMemo(() => flattenItems(roots).map((item) => item.id), [roots]);
  const [expandedIds, setExpandedIds] = useState<unknown[]>(() => initialExpandedIds(roots, defaultExpanded));
  const [currentSelectedId, setCurrentSelectedId] = useState<unknown>(selectedId ?? selectedValue);
  const [focusedId, setFocusedId] = useState<unknown>(undefined);
  const [loadingIds, setLoadingIds] = useState<unknown[]>([]);
  const [spinnerIds, setSpinnerIds] = useState<unknown[]>([]);
  const [expandedTimestamps, setExpandedTimestamps] = useState<Map<string, number>>(() => new Map());
  const [collapsedTimestamps, setCollapsedTimestamps] = useState<Map<string, number>>(() => new Map());
  const [autoLoadAfterOverrides, setAutoLoadAfterOverrides] = useState<Map<string, number | null>>(() => new Map());
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const visibleItems = useMemo(() => visibleTreeItems(roots, expandedIds), [expandedIds, roots]);
  const allItems = useMemo(() => flattenItems(roots), [roots]);

  useEffect(() => {
    setInternalData(undefined);
  }, [dataSignature]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }
    const updateViewport = () => setViewportHeight(node.clientHeight);
    updateViewport();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(updateViewport);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCurrentSelectedId(selectedId ?? selectedValue);
  }, [selectedId, selectedValue]);

  useEffect(() => {
    setExpandedIds(initialExpandedIds(roots, defaultExpanded));
  }, [dataFormat, defaultExpanded, idField, parentIdField, childrenField]);

  useEffect(() => {
    if (autoExpandToSelection && currentSelectedId !== undefined && currentSelectedId !== null) {
      setExpandedIds((current) => mergeIds(current, parentPathIds(roots, currentSelectedId)));
    }
  }, [autoExpandToSelection, currentSelectedId, roots]);

  const selectId = (nextId: unknown) => {
    const previous = currentSelectedId === undefined || currentSelectedId === null
      ? null
      : toTemplateItem(flattenItems(roots).find((item) => idsEqual(item.id, currentSelectedId)), expandedIds, selectableField);
    setCurrentSelectedId(nextId);
    setFocusedId(nextId);
    const sourceItem = toTemplateItem(flattenItems(roots).find((item) => idsEqual(item.id, nextId)), expandedIds, selectableField);
    void onSelectionDidChange?.(selectionEvent(sourceItem, previous));
  };

  const clearSelection = () => {
    const previous = currentSelectedId === undefined || currentSelectedId === null
      ? null
      : toTemplateItem(flattenItems(roots).find((item) => idsEqual(item.id, currentSelectedId)), expandedIds, selectableField);
    setCurrentSelectedId(undefined);
    void onSelectionDidChange?.(selectionEvent(null, previous));
  };

  const expandNode = (id: unknown, emit = true) => {
    const item = allItems.find((candidate) => idsEqual(candidate.id, id));
    if (!item) {
      return;
    }
    setExpandedTimestamps((current) => new Map(current).set(String(item.id), Date.now()));
    const expandable = item.children.length > 0 || !item.loaded || item.dynamic;
    if (!expandable) {
      return;
    }
    setCollapsedTimestamps((current) => {
      const next = new Map(current);
      next.delete(String(item.id));
      return next;
    });
    setExpandedIds((current) => current.some((value) => idsEqual(value, id)) ? current : [...current, item.id]);
    if (emit) {
      void onNodeDidExpand?.(toTemplateItem(item, [...expandedIds, item.id], selectableField));
    }
    const shouldLoad = shouldLoadChildren(item, loadingIds, autoLoadAfterOverrides, collapsedTimestamps, autoLoadAfterField, autoLoadAfter);
    if (shouldLoad && onLoadChildren) {
      void loadChildrenForItem(item);
    }
  };

  const collapseNode = (id: unknown, emit = true, manual = false) => {
    const item = allItems.find((candidate) => idsEqual(candidate.id, id));
    if (!item) {
      return;
    }
    const descendantIds = flattenItems(item.children).map((child) => child.id);
    const nextExpandedIds = expandedIds.filter((value) => !idsEqual(value, id) && !descendantIds.some((descendantId) => idsEqual(value, descendantId)));
    setExpandedIds((current) => current.filter((value) => !idsEqual(value, id) && !descendantIds.some((descendantId) => idsEqual(value, descendantId))));
    const collapsedAt = Date.now();
    setCollapsedTimestamps((current) => new Map(current).set(String(id), collapsedAt));
    if (emit) {
      void onNodeDidCollapse?.(toTemplateItem(item, nextExpandedIds, selectableField));
    }
    const reloadAfter = effectiveAutoLoadAfter(item, autoLoadAfterOverrides, autoLoadAfterField, autoLoadAfter);
    if (reloadAfter === 0 || (typeof reloadAfter === "number" && Number.isFinite(reloadAfter) && reloadAfter > 0 && !manual)) {
      setInternalData((current) => replaceNodeData(current ?? data, id, { [loadedField]: false }, dataFormat, idField, parentIdField, childrenField));
    } else if (typeof reloadAfter === "number" && Number.isFinite(reloadAfter) && reloadAfter > 0) {
      window.setTimeout(() => {
        setCollapsedTimestamps((current) => {
          if (current.get(String(id)) !== collapsedAt) {
            return current;
          }
          setInternalData((currentData) => replaceNodeData(currentData ?? data, id, { [loadedField]: false }, dataFormat, idField, parentIdField, childrenField));
          return current;
        });
      }, reloadAfter);
    }
  };

  const loadChildrenForItem = async (item: TreeItem) => {
    if (loadingIds.some((id) => idsEqual(id, item.id))) {
      return;
    }
    setLoadingIds((current) => current.some((id) => idsEqual(id, item.id)) ? current : [...current, item.id]);
    const delay = Math.max(0, Number(spinnerDelay) || 0);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (delay === 0) {
      setSpinnerIds((current) => current.some((id) => idsEqual(id, item.id)) ? current : [...current, item.id]);
    } else {
      timer = setTimeout(() => {
        setSpinnerIds((current) => current.some((id) => idsEqual(id, item.id)) ? current : [...current, item.id]);
      }, delay);
    }
    try {
      const loaded = await onLoadChildren?.(toTemplateItem(item, expandedIds, selectableField));
      const children = Array.isArray(loaded) ? loaded : [];
      setInternalData((current) => mergeLoadedChildren(current ?? data, item.id, children, dataFormat, idField, parentIdField, childrenField, loadedField, dynamicField));
    } catch {
      setExpandedIds((current) => current.filter((id) => !idsEqual(id, item.id)));
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
      setLoadingIds((current) => current.filter((id) => !idsEqual(id, item.id)));
      setSpinnerIds((current) => current.filter((id) => !idsEqual(id, item.id)));
    }
  };

  const toggleNode = (item: VisibleTreeItem, emit = true) => {
    if (expandedIds.some((value) => idsEqual(value, item.id))) {
      if (loadingIds.some((id) => idsEqual(id, item.id))) {
        return;
      }
      collapseNode(item.id, emit, true);
    } else {
      expandNode(item.id, emit);
    }
  };

  const api = useMemo<TreeApi>(() => ({
    get selectedId() {
      return currentSelectedId;
    },
    expandAll: () => setExpandedIds(allIds),
    collapseAll: () => setExpandedIds([]),
    selectId,
    selectNode: selectId,
    clearSelection,
    expandNode,
    collapseNode,
    expandToLevel: (level: number) => setExpandedIds(
      flattenItems(roots)
        .filter((item) => itemDepth(roots, item.id) < level)
        .map((item) => item.id),
    ),
    getExpandedNodes: () => expandedIds,
    getSelectedNode: () => toTemplateItem(allItems.find((item) => idsEqual(item.id, currentSelectedId)), expandedIds, selectableField),
    getVisibleItems: () => visibleItemsInViewport(rootRef.current, visibleItems, itemHeight)
      .map((item) => toTemplateItem(item, expandedIds, selectableField)),
    scrollIntoView: (id: unknown) => {
      setExpandedIds((current) => mergeIds(current, parentPathIds(roots, id)));
      window.setTimeout(() => {
        const nextVisible = visibleTreeItems(roots, mergeIds(expandedIds, parentPathIds(roots, id)));
        const index = nextVisible.findIndex((item) => idsEqual(item.id, id));
        if (index >= 0) {
          setScrollTop(index * itemHeight);
          rootRef.current?.scrollTo({ top: index * itemHeight });
        }
      }, 0);
    },
    scrollToItem: (id: unknown) => {
      const index = visibleItems.findIndex((item) => idsEqual(item.id, id));
      if (index >= 0) {
        setScrollTop(index * itemHeight);
        rootRef.current?.scrollTo({ top: index * itemHeight });
      }
    },
    appendNode: (parentId: unknown, nodeData: Record<string, unknown>) => {
      setInternalData((current) => appendNodeData(current ?? data, parentId, nodeData, dataFormat, idField, parentIdField, childrenField));
      if (parentId !== undefined && parentId !== null) {
        setExpandedIds((current) => current.some((id) => idsEqual(id, parentId)) ? current : [...current, parentId]);
      }
    },
    removeNode: (id: unknown) => {
      setInternalData((current) => removeNodeData(current ?? data, id, dataFormat, idField, parentIdField, childrenField));
      setExpandedIds((current) => current.filter((value) => !idsEqual(value, id)));
      if (idsEqual(currentSelectedId, id)) {
        setCurrentSelectedId(undefined);
      }
    },
    removeChildren: (id: unknown) => {
      setInternalData((current) => removeChildrenData(current ?? data, id, dataFormat, idField, parentIdField, childrenField));
    },
    insertNodeBefore: (beforeId: unknown, nodeData: Record<string, unknown>) => {
      setInternalData((current) => insertNodeData(current ?? data, beforeId, nodeData, "before", dataFormat, idField, parentIdField, childrenField));
    },
    insertNodeAfter: (afterId: unknown, nodeData: Record<string, unknown>) => {
      setInternalData((current) => insertNodeData(current ?? data, afterId, nodeData, "after", dataFormat, idField, parentIdField, childrenField));
    },
    replaceNode: (id: unknown, nodeData: Record<string, unknown>) => {
      setInternalData((current) => replaceNodeData(current ?? data, id, nodeData, dataFormat, idField, parentIdField, childrenField));
      const nextId = nodeData[idField];
      if (nextId !== undefined && !idsEqual(nextId, id)) {
        setExpandedIds((current) => current.map((value) => idsEqual(value, id) ? nextId : value));
        if (idsEqual(currentSelectedId, id)) {
          setCurrentSelectedId(nextId);
        }
      }
    },
    replaceChildren: (id: unknown, newChildren: unknown[]) => {
      setInternalData((current) => replaceChildrenData(current ?? data, id, newChildren, dataFormat, idField, parentIdField, childrenField));
    },
    refreshData: () => {
      setInternalData((current) => Array.isArray(current) ? [...current] : [...data]);
    },
    getNodeById: (id: unknown) => toTemplateItem(allItems.find((item) => idsEqual(item.id, id)), expandedIds, selectableField),
    getDynamic: (id: unknown) => Boolean(allItems.find((item) => idsEqual(item.id, id))?.dynamic),
    setDynamic: (id: unknown, value: boolean | undefined) => {
      setInternalData((current) => replaceNodeData(current ?? data, id, { [dynamicField]: value }, dataFormat, idField, parentIdField, childrenField));
    },
    getNodeLoadingState: (id: unknown) => {
      const item = allItems.find((candidate) => idsEqual(candidate.id, id));
      if (!item) {
        return "loaded";
      }
      if (loadingIds.some((candidate) => idsEqual(candidate, id))) {
        return "loading";
      }
      return item.loaded ? "loaded" : "unloaded";
    },
    setNodeLoaded: (id: unknown, loaded: boolean) => {
      setInternalData((current) => replaceNodeData(current ?? data, id, { [loadedField]: loaded }, dataFormat, idField, parentIdField, childrenField));
    },
    markNodeLoaded: (id: unknown) => {
      setInternalData((current) => replaceNodeData(current ?? data, id, { [loadedField]: true }, dataFormat, idField, parentIdField, childrenField));
    },
    markNodeUnloaded: (id: unknown) => {
      setInternalData((current) => replaceNodeData(current ?? data, id, { [loadedField]: false }, dataFormat, idField, parentIdField, childrenField));
    },
    getExpandedTimestamp: (id: unknown) => expandedTimestamps.get(String(id)),
    setAutoLoadAfter: (id: unknown, milliseconds: number | null | undefined) => {
      setAutoLoadAfterOverrides((current) => {
        const next = new Map(current);
        if (milliseconds === undefined || milliseconds === null) {
          next.set(String(id), null);
        } else {
          next.set(String(id), milliseconds);
        }
        return next;
      });
    },
    getAutoLoadAfter: (id: unknown) => {
      const key = String(id);
      if (autoLoadAfterOverrides.has(key)) {
        return autoLoadAfterOverrides.get(key);
      }
      const item = allItems.find((candidate) => idsEqual(candidate.id, id));
      return effectiveAutoLoadAfter(item, autoLoadAfterOverrides, autoLoadAfterField, autoLoadAfter);
    },
    getNodeAutoLoadAfter: (id: unknown) => {
      const key = String(id);
      if (autoLoadAfterOverrides.has(key)) {
        return autoLoadAfterOverrides.get(key);
      }
      const item = allItems.find((candidate) => idsEqual(candidate.id, id));
      return effectiveAutoLoadAfter(item, autoLoadAfterOverrides, autoLoadAfterField, autoLoadAfter);
    },
  }), [allIds, allItems, autoLoadAfter, autoLoadAfterField, autoLoadAfterOverrides, currentSelectedId, data, dataFormat, dynamicField, expandedIds, expandedTimestamps, idField, itemHeight, loadedField, loadingIds, parentIdField, childrenField, roots, selectableField, visibleItems]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => {
    registerApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerApi]);

  const focusedIndex = Math.max(0, visibleItems.findIndex((item) => idsEqual(item.id, focusedId)));
  const rootStyle: CSSProperties = {
    ...style,
    overflow,
    ["--xmlui-tree-item-height" as string]: `${itemHeight}px`,
  };
  const totalHeight = visibleItems.length * itemHeight;
  const shouldVirtualize = viewportHeight > 0 && totalHeight > viewportHeight + itemHeight;
  const overscan = 2;
  const startIndex = shouldVirtualize
    ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    : 0;
  const endIndex = shouldVirtualize
    ? Math.min(visibleItems.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan)
    : visibleItems.length;
  const renderedItems = visibleItems.slice(startIndex, endIndex);
  const topSpacerHeight = shouldVirtualize ? startIndex * itemHeight : 0;
  const bottomSpacerHeight = shouldVirtualize ? Math.max(0, totalHeight - endIndex * itemHeight) : 0;

  return (
    <div
      {...rest}
      id={id}
      ref={rootRef}
      className={[styles.root, showScrollerFade ? styles.withFade : "", className].filter(Boolean).join(" ")}
      style={rootStyle}
      data-testid={dataTestId}
      data-scroll-style={scrollStyle}
      role="tree"
      aria-label="Tree navigation"
      aria-multiselectable="false"
      tabIndex={0}
      onFocus={() => {
        if (focusedId === undefined && visibleItems.length > 0) {
          setFocusedId(visibleItems[0].id);
        }
      }}
      onKeyDown={(event) => handleKeyDown(event, {
        visibleItems,
        focusedIndex,
        setFocusedId,
        selectId,
        toggleNode,
        expandNode,
        collapseNode,
        hasNodeDidExpandHandler: Boolean(onNodeDidExpand),
      })}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div
        data-overlayscrollbars-viewport
        ref={(node) => {
          viewportProxyRef.current = node;
          if (node) {
            node.scrollTo = ((xOrOptions?: number | ScrollToOptions, y?: number) => {
              const top = typeof xOrOptions === "object" ? xOrOptions.top ?? 0 : y ?? 0;
              setScrollTop(top);
              rootRef.current?.scrollTo(typeof xOrOptions === "object" ? xOrOptions : { top });
            }) as HTMLDivElement["scrollTo"];
          }
        }}
        style={{ display: "contents" }}
      >
      {topSpacerHeight > 0 ? <div aria-hidden="true" style={{ height: topSpacerHeight }} /> : null}
      {renderedItems.map((item) => {
        const expandable = item.children.length > 0 || !item.loaded || item.dynamic;
        const expanded = expandedIds.some((idValue) => idsEqual(idValue, item.id));
        const selectable = fieldValue(item.source, selectableField) !== false;
        const selected = idsEqual(currentSelectedId, item.id);
        const focused = idsEqual(focusedId, item.id);
        const isLoading = loadingIds.some((id) => idsEqual(id, item.id));
        const showSpinner = spinnerIds.some((id) => idsEqual(id, item.id));
        const templateItem = {
          ...toTemplateItem(item, expandedIds, selectableField),
          loadingState: isLoading ? "loading" : item.loaded ? "loaded" : "unloaded",
        };
        return (
          <div
            key={String(item.id)}
            role="treeitem"
            data-tree-node-id={String(item.id)}
            aria-expanded={expandable ? expanded : undefined}
            aria-selected={selected ? "true" : "false"}
            aria-level={item.depth + 1}
            aria-label={item.name}
            className={[styles.item, selected ? styles.selected : "", focused ? styles.focused : ""].filter(Boolean).join(" ")}
            style={{ paddingLeft: `${item.depth * 18 + 6}px` }}
            onContextMenu={(event) => {
              setFocusedId(item.id);
              if (selectable) {
                setCurrentSelectedId(item.id);
              }
              void onContextMenu?.(templateItem, event);
            }}
            onClick={(event) => {
              if (event.button !== 0) {
                return;
              }
              void onItemClick?.(templateItem);
              if (itemClickExpands && expandable) {
                toggleNode(item);
              }
              if (selectable) {
                selectId(item.id);
              }
            }}
          >
            {expandable ? (
              <button
                type="button"
                data-tree-expand-icon
                className={styles.toggle}
                aria-label={expanded ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleNode(item);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setFocusedId(item.id);
                  if (selectable) {
                    setCurrentSelectedId(item.id);
                  }
                  void onContextMenu?.(templateItem, event as unknown as MouseEvent<HTMLDivElement>);
                }}
              >
                {showSpinner ? (
                  <span data-tree-node-spinner className={styles.spinner} />
                ) : (
                  <TreeToggleIcon
                    name={String(resolveToggleIcon(item, expanded, iconExpanded, iconCollapsed, iconExpandedField, iconCollapsedField))}
                    size={String(iconSize)}
                  />
                )}
              </button>
            ) : <span className={styles.togglePlaceholder} />}
            <span className={styles.label}>{renderItem?.(templateItem, item) ?? item.name}</span>
          </div>
        );
      })}
      {bottomSpacerHeight > 0 ? <div aria-hidden="true" style={{ height: bottomSpacerHeight }} /> : null}
      </div>
      {showScrollerFade ? (
        <>
          <div className={[styles.fadeOverlay, styles.fadeTop, scrollTop > 0 ? styles.fadeVisible : ""].filter(Boolean).join(" ")} />
          <div className={[styles.fadeOverlay, styles.fadeBottom, styles.fadeVisible].join(" ")} />
        </>
      ) : null}
    </div>
  );
}));

function flatItems(
  data: unknown[],
  idField: string,
  nameField: string,
  parentIdField: string,
  childrenField: string,
  dynamicField: string,
  loadedField: string,
  dynamicDefault: boolean,
): TreeItem[] {
  const byId = new Map<unknown, TreeItem>();
  const roots: TreeItem[] = [];
  for (const source of flattenFlatSources(data, childrenField)) {
    if (!source || typeof source !== "object") {
      continue;
    }
    const id = fieldValue(source, idField);
    if (id === undefined || id === null) {
      continue;
    }
    const parentId = fieldValue(source, parentIdField);
    if (!byId.has(id)) {
      byId.set(id, {
      id,
      name: String(fieldValue(source, nameField) ?? id ?? ""),
      source,
      children: [],
      parentId,
      dynamic: resolveDynamic(source, dynamicField, loadedField, dynamicDefault),
      loaded: resolveLoaded(source, loadedField, dynamicField, dynamicDefault),
    });
    }
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

function flattenFlatSources(data: unknown[], childrenField: string): unknown[] {
  return data.flatMap((source) => {
    if (!source || typeof source !== "object") {
      return [source];
    }
    const children = fieldValue(source, childrenField);
    return Array.isArray(children)
      ? [source, ...flattenFlatSources(children, childrenField)]
      : [source];
  });
}

function hierarchyItems(
  data: unknown[],
  idField: string,
  nameField: string,
  childrenField: string,
  dynamicField: string,
  loadedField: string,
  dynamicDefault: boolean,
): TreeItem[] {
  return data.flatMap((source): TreeItem[] => {
    if (!source || typeof source !== "object") {
      return [];
    }
    const id = fieldValue(source, idField);
    if (id === undefined || id === null) {
      return [];
    }
    return [{
      id,
      name: String(fieldValue(source, nameField) ?? fieldValue(source, idField) ?? ""),
      source,
      children: Array.isArray(fieldValue(source, childrenField))
        ? hierarchyItems(fieldValue(source, childrenField) as unknown[], idField, nameField, childrenField, dynamicField, loadedField, dynamicDefault)
        : [],
      dynamic: resolveDynamic(source, dynamicField, loadedField, dynamicDefault),
      loaded: resolveLoaded(source, loadedField, dynamicField, dynamicDefault),
    }];
  });
}

function visibleTreeItems(items: TreeItem[], expandedIds: unknown[], depth = 0): VisibleTreeItem[] {
  return items.flatMap((item, localIndex) => {
    const expanded = expandedIds.some((id) => idsEqual(id, item.id));
    const current = {
      ...item,
      depth,
      index: localIndex,
      key: item.id,
      displayName: item.name,
      hasChildren: item.children.length > 0,
      selectable: true,
      expanded,
    };
    if (!expanded) {
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
    return mergeIds(defaultExpanded, defaultExpanded.flatMap((id) => parentPathIds(items, id)));
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
  return ids.some((value) => idsEqual(value, id))
    ? ids.filter((value) => !idsEqual(value, id))
    : [...ids, id];
}

function fieldValue(item: unknown, field: string): unknown {
  return item && typeof item === "object" ? (item as Record<string, unknown>)[field] : undefined;
}

function idsEqual(left: unknown, right: unknown): boolean {
  return Object.is(left, right) || String(left) === String(right);
}

function stableDataSignature(data: unknown[]): string {
  try {
    return JSON.stringify(data);
  } catch {
    return String(data.length);
  }
}

function mergeIds(left: unknown[], right: unknown[]): unknown[] {
  const merged = [...left];
  for (const id of right) {
    if (!merged.some((value) => idsEqual(value, id))) {
      merged.push(id);
    }
  }
  return merged;
}

function parentPathIds(items: TreeItem[], targetId: unknown, path: unknown[] = []): unknown[] {
  for (const item of items) {
    if (idsEqual(item.id, targetId)) {
      return path;
    }
    const childPath = parentPathIds(item.children, targetId, [...path, item.id]);
    if (childPath.length > 0) {
      return childPath;
    }
  }
  return [];
}

function itemDepth(items: TreeItem[], targetId: unknown, depth = 0): number {
  for (const item of items) {
    if (idsEqual(item.id, targetId)) {
      return depth;
    }
    const childDepth = itemDepth(item.children, targetId, depth + 1);
    if (childDepth >= 0) {
      return childDepth;
    }
  }
  return -1;
}

function toTemplateItem(item: TreeItem | VisibleTreeItem | undefined, expandedIds: unknown[], selectableField: string): Record<string, unknown> | null {
  if (!item) {
    return null;
  }
  const source = item.source && typeof item.source === "object" ? item.source as Record<string, unknown> : {};
  const depth = "depth" in item ? item.depth : 0;
  const selectable = fieldValue(item.source, selectableField) !== false;
  return {
    ...source,
    id: item.id,
    key: item.id,
    name: item.name,
    displayName: item.name,
    depth,
    selectable,
    hasChildren: item.children.length > 0,
    expanded: expandedIds.some((id) => idsEqual(id, item.id)),
    dynamic: item.dynamic,
    loaded: item.loaded,
    loadingState: item.loaded ? "loaded" : "unloaded",
  };
}

function resolveLoaded(source: unknown, loadedField: string, dynamicField: string, dynamicDefault: boolean): boolean {
  const value = fieldValue(source, loadedField);
  if (value !== undefined) {
    return Boolean(value);
  }
  return !resolveDynamic(source, dynamicField, loadedField, dynamicDefault);
}

function resolveDynamic(source: unknown, dynamicField: string, loadedField: string, dynamicDefault: boolean): boolean {
  const value = fieldValue(source, dynamicField);
  if (value !== undefined) {
    return Boolean(value);
  }
  if (fieldValue(source, loadedField) === false) {
    return true;
  }
  return Boolean(dynamicDefault);
}

function resolveToggleIcon(
  item: TreeItem | VisibleTreeItem,
  expanded: boolean,
  defaultExpandedIcon: string,
  defaultCollapsedIcon: string,
  iconExpandedField: string,
  iconCollapsedField: string,
): string {
  const source = item.source;
  if (expanded) {
    return String(fieldValue(source, iconExpandedField) ?? fieldValue(source, "iconExpanded") ?? defaultExpandedIcon);
  }
  return String(fieldValue(source, iconCollapsedField) ?? fieldValue(source, "iconCollapsed") ?? defaultCollapsedIcon);
}

function shouldLoadChildren(
  item: TreeItem,
  loadingIds: unknown[],
  overrides: Map<string, number | null>,
  collapsedTimestamps: Map<string, number>,
  autoLoadAfterField: string,
  autoLoadAfter: number | undefined,
): boolean {
  if (loadingIds.some((id) => idsEqual(id, item.id))) {
    return false;
  }
  if (!item.dynamic && item.loaded) {
    return false;
  }
  if (!item.loaded) {
    return item.dynamic;
  }
  const threshold = effectiveAutoLoadAfter(item, overrides, autoLoadAfterField, autoLoadAfter);
  const collapsed = collapsedTimestamps.get(String(item.id));
  return item.dynamic && threshold !== undefined && threshold !== null && collapsed !== undefined && Date.now() - collapsed > threshold;
}

function effectiveAutoLoadAfter(
  item: TreeItem | undefined,
  overrides: Map<string, number | null>,
  autoLoadAfterField: string,
  autoLoadAfter: number | undefined,
): number | null | undefined {
  if (!item) {
    return autoLoadAfter;
  }
  const key = String(item.id);
  if (overrides.has(key)) {
    return overrides.get(key);
  }
  const sourceValue = fieldValue(item.source, autoLoadAfterField);
  return sourceValue === undefined ? autoLoadAfter : sourceValue as number | null;
}

function mergeLoadedChildren(
  data: unknown[],
  id: unknown,
  children: unknown[],
  dataFormat: "flat" | "hierarchy",
  idField: string,
  parentIdField: string,
  childrenField: string,
  loadedField: string,
  dynamicField: string,
): unknown[] {
  if (dataFormat === "hierarchy") {
    return data.map((node) => {
      if (!node || typeof node !== "object") {
        return node;
      }
      const record = node as Record<string, unknown>;
      if (idsEqual(record[idField], id)) {
        return { ...record, [childrenField]: children, [loadedField]: true, [dynamicField]: true };
      }
      const childNodes = record[childrenField];
      return Array.isArray(childNodes)
        ? { ...record, [childrenField]: mergeLoadedChildren(childNodes, id, children, dataFormat, idField, parentIdField, childrenField, loadedField, dynamicField) }
        : node;
    });
  }
  const withoutOldChildren = data.filter((node) => {
    if (!node || typeof node !== "object") {
      return true;
    }
    return !idsEqual((node as Record<string, unknown>)[parentIdField], id);
  });
  const patchedParent = withoutOldChildren.map((node) => {
    if (!node || typeof node !== "object") {
      return node;
    }
    const record = node as Record<string, unknown>;
    return idsEqual(record[idField], id) ? { ...record, [loadedField]: true, [dynamicField]: true } : node;
  });
  const normalizedChildren = children.map((child) => {
    if (!child || typeof child !== "object") {
      return child;
    }
    const record = child as Record<string, unknown>;
    return { ...record, [parentIdField]: record[parentIdField] ?? id };
  });
  return [...patchedParent, ...normalizedChildren];
}

function appendNodeData(
  data: unknown[],
  parentId: unknown,
  nodeData: Record<string, unknown>,
  dataFormat: "flat" | "hierarchy",
  idField: string,
  parentIdField: string,
  childrenField: string,
): unknown[] {
  const nextId = nodeData[idField] ?? Date.now();
  const newNode = { ...nodeData, [idField]: nextId };
  if (dataFormat === "flat") {
    return [...data, { ...newNode, [parentIdField]: parentId ?? null }];
  }
  const hierarchyNode = { ...newNode, [childrenField]: Array.isArray(newNode[childrenField]) ? newNode[childrenField] : [] };
  if (parentId === undefined || parentId === null) {
    return [...data, hierarchyNode];
  }
  return data.map((node) => {
    if (!node || typeof node !== "object") {
      return node;
    }
    const record = node as Record<string, unknown>;
    if (idsEqual(record[idField], parentId)) {
      const children = Array.isArray(record[childrenField]) ? record[childrenField] as unknown[] : [];
      return { ...record, [childrenField]: [...children, hierarchyNode] };
    }
    const children = record[childrenField];
    return Array.isArray(children)
      ? { ...record, [childrenField]: appendNodeData(children, parentId, nodeData, dataFormat, idField, parentIdField, childrenField) }
      : node;
  });
}

function removeNodeData(
  data: unknown[],
  id: unknown,
  dataFormat: "flat" | "hierarchy",
  idField: string,
  parentIdField: string,
  childrenField: string,
): unknown[] {
  if (dataFormat === "hierarchy") {
    return data.flatMap((node) => {
      if (!node || typeof node !== "object") {
        return [node];
      }
      const record = node as Record<string, unknown>;
      if (idsEqual(record[idField], id)) {
        return [];
      }
      const children = record[childrenField];
      return [Array.isArray(children)
        ? { ...record, [childrenField]: removeNodeData(children, id, dataFormat, idField, parentIdField, childrenField) }
        : node];
    });
  }
  const idsToRemove = new Set<string>([String(id)]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of data) {
      if (node && typeof node === "object") {
        const record = node as Record<string, unknown>;
        if (idsToRemove.has(String(record[parentIdField])) && !idsToRemove.has(String(record[idField]))) {
          idsToRemove.add(String(record[idField]));
          changed = true;
        }
      }
    }
  }
  return data.filter((node) => !node || typeof node !== "object" || !idsToRemove.has(String((node as Record<string, unknown>)[idField])));
}

function removeChildrenData(
  data: unknown[],
  id: unknown,
  dataFormat: "flat" | "hierarchy",
  idField: string,
  parentIdField: string,
  childrenField: string,
): unknown[] {
  if (dataFormat === "hierarchy") {
    return data.map((node) => {
      if (!node || typeof node !== "object") {
        return node;
      }
      const record = node as Record<string, unknown>;
      if (idsEqual(record[idField], id)) {
        return { ...record, [childrenField]: [] };
      }
      const children = record[childrenField];
      return Array.isArray(children)
        ? { ...record, [childrenField]: removeChildrenData(children, id, dataFormat, idField, parentIdField, childrenField) }
        : node;
    });
  }
  const descendants = removeNodeData(data, id, dataFormat, idField, parentIdField, childrenField);
  return data.filter((node) => {
    if (!node || typeof node !== "object") {
      return true;
    }
    const nodeId = (node as Record<string, unknown>)[idField];
    return idsEqual(nodeId, id) || descendants.some((candidate) => candidate && typeof candidate === "object" && idsEqual((candidate as Record<string, unknown>)[idField], nodeId));
  });
}

function insertNodeData(
  data: unknown[],
  targetId: unknown,
  nodeData: Record<string, unknown>,
  position: "before" | "after",
  dataFormat: "flat" | "hierarchy",
  idField: string,
  parentIdField: string,
  childrenField: string,
): unknown[] {
  const nextId = nodeData[idField] ?? Date.now();
  const newNode = { ...nodeData, [idField]: nextId };
  if (dataFormat === "flat") {
    const index = data.findIndex((node) => node && typeof node === "object" && idsEqual((node as Record<string, unknown>)[idField], targetId));
    if (index < 0) {
      return [...data, { ...newNode, [parentIdField]: null }];
    }
    const target = data[index] as Record<string, unknown>;
    const result = [...data];
    result.splice(position === "before" ? index : index + 1, 0, { ...newNode, [parentIdField]: target[parentIdField] ?? null });
    return result;
  }
  const hierarchyNode = { ...newNode, [childrenField]: Array.isArray(newNode[childrenField]) ? newNode[childrenField] : [] };
  const targetIndex = data.findIndex((node) => node && typeof node === "object" && idsEqual((node as Record<string, unknown>)[idField], targetId));
  if (targetIndex >= 0) {
    const result = [...data];
    result.splice(position === "before" ? targetIndex : targetIndex + 1, 0, hierarchyNode);
    return result;
  }
  return data.map((node) => {
    if (!node || typeof node !== "object") {
      return node;
    }
    const record = node as Record<string, unknown>;
    const children = record[childrenField];
    return Array.isArray(children)
      ? { ...record, [childrenField]: insertNodeData(children, targetId, nodeData, position, dataFormat, idField, parentIdField, childrenField) }
      : node;
  });
}

function selectionEvent(selectedNode: Record<string, unknown> | null, previousNode: Record<string, unknown> | null): Record<string, unknown> {
  return {
    ...(selectedNode ?? {}),
    newNode: selectedNode,
    selectedNode,
    previousNode,
  };
}

function TreeToggleIcon({ name, size }: { name: string; size: string }) {
  return (
    <span data-tree-expand-icon data-icon-name={name} className={styles.toggleIcon} aria-hidden="true">
      <Icon name={name} size={size.endsWith("px") ? size : `${size}px`} />
      <span className={styles.toggleIconFallback}>›</span>
    </span>
  );
}

function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, helpers: {
  visibleItems: VisibleTreeItem[];
  focusedIndex: number;
  setFocusedId: (id: unknown) => void;
  selectId: (id: unknown) => void;
  toggleNode: (item: VisibleTreeItem) => void;
  expandNode: (id: unknown) => void;
  collapseNode: (id: unknown) => void;
  hasNodeDidExpandHandler: boolean;
}) {
  const { visibleItems, focusedIndex, setFocusedId, selectId, toggleNode, expandNode, collapseNode, hasNodeDidExpandHandler } = helpers;
  const focused = visibleItems[focusedIndex] ?? visibleItems[0];
  if (!focused) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    setFocusedId(visibleItems[Math.min(focusedIndex + 1, visibleItems.length - 1)].id);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setFocusedId(visibleItems[Math.max(focusedIndex - 1, 0)].id);
  } else if (event.key === "Home") {
    event.preventDefault();
    setFocusedId(visibleItems[0].id);
  } else if (event.key === "End") {
    event.preventDefault();
    setFocusedId(visibleItems[visibleItems.length - 1].id);
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (focused.hasChildren && !focused.expanded && hasNodeDidExpandHandler) {
      expandNode(focused.id);
      return;
    }
    selectId(focused.id);
  } else if (event.key === " ") {
    event.preventDefault();
    selectId(focused.id);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    expandNode(focused.id);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    const parent = visibleItems.slice(0, focusedIndex).reverse().find((item) => item.depth === focused.depth - 1);
    if (focused.depth > 0 && parent) {
      setFocusedId(parent.id);
      return;
    }
    if (focused.expanded) {
      collapseNode(focused.id);
    }
  }
}

function visibleItemsInViewport(root: HTMLDivElement | null, items: VisibleTreeItem[], itemHeight: number): VisibleTreeItem[] {
  if (!root || root.clientHeight <= 0 || root.scrollHeight <= root.clientHeight + 1) {
    return items;
  }
  const start = Math.max(0, Math.floor(root.scrollTop / itemHeight));
  const count = Math.max(1, Math.ceil(root.clientHeight / itemHeight) + 1);
  return items.slice(start, start + count);
}

function replaceNodeData(data: unknown[], id: unknown, nodeData: Record<string, unknown>, dataFormat: "flat" | "hierarchy", idField: string, parentIdField: string, childrenField: string): unknown[] {
  if (dataFormat === "hierarchy") {
    return data.map((node) => {
      if (!node || typeof node !== "object") {
        return node;
      }
      const record = node as Record<string, unknown>;
      if (idsEqual(record[idField], id)) {
        return { ...record, ...nodeData, [childrenField]: childrenField in nodeData ? nodeData[childrenField] : record[childrenField] };
      }
      const children = record[childrenField];
      return Array.isArray(children)
        ? { ...record, [childrenField]: replaceNodeData(children, id, nodeData, dataFormat, idField, parentIdField, childrenField) }
        : node;
    });
  }
  const newId = nodeData[idField];
  return data.map((node) => {
    if (!node || typeof node !== "object") {
      return node;
    }
    const record = node as Record<string, unknown>;
    if (idsEqual(record[idField], id)) {
      return { ...record, ...nodeData };
    }
    if (newId !== undefined && idsEqual(record[parentIdField], id)) {
      return { ...record, [parentIdField]: newId };
    }
    return node;
  });
}

function replaceChildrenData(data: unknown[], id: unknown, newChildren: unknown[], dataFormat: "flat" | "hierarchy", idField: string, parentIdField: string, childrenField: string): unknown[] {
  if (dataFormat === "hierarchy") {
    return data.map((node) => {
      if (!node || typeof node !== "object") {
        return node;
      }
      const record = node as Record<string, unknown>;
      if (idsEqual(record[idField], id)) {
        return { ...record, [childrenField]: newChildren };
      }
      const children = record[childrenField];
      return Array.isArray(children)
        ? { ...record, [childrenField]: replaceChildrenData(children, id, newChildren, dataFormat, idField, parentIdField, childrenField) }
        : node;
    });
  }
  const descendantIds = new Set<string>();
  const collect = (parent: unknown) => {
    for (const node of data) {
      if (node && typeof node === "object" && idsEqual((node as Record<string, unknown>)[parentIdField], parent)) {
        const nodeId = (node as Record<string, unknown>)[idField];
        descendantIds.add(String(nodeId));
        collect(nodeId);
      }
    }
  };
  collect(id);
  const filtered = data.filter((node) => !node || typeof node !== "object" || !descendantIds.has(String((node as Record<string, unknown>)[idField])));
  return [
    ...filtered,
    ...newChildren.map((child) => child && typeof child === "object" ? { ...child as Record<string, unknown>, [parentIdField]: id } : child),
  ];
}
