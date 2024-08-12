import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect } from "react";
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Range, Virtualizer } from "@tanstack/react-virtual";
import { defaultRangeExtractor, observeElementOffset, useVirtualizer } from "@tanstack/react-virtual";
import styles from "./List.module.scss";
import { get, groupBy, noop, omit, orderBy as lodashOrderBy, sortBy, uniq } from "lodash-es";
import { MemoizedItem } from "@components/container-helpers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "@components-core/constants";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { ScrollContext } from "@components-core/ScrollContext";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Card } from "@components/Card/Card";
import { Text } from "@components/Text/Text";
import { Spinner } from "@components/Spinner/Spinner";
import { usePrevious, useResizeObserver } from "@components-core/utils/hooks";

// =====================================================================================================================
// React List component implementation

interface IExpandableListContext {
  isExpanded: (id: any) => boolean;
  toggleExpanded: (id: any, isExpanded: boolean) => void;
}

const ListContext = React.createContext<IExpandableListContext>({
  isExpanded: (id: any) => false,
  toggleExpanded: (id: any, isExpanded: boolean) => {},
});

const Item = ({ children, onHeightChanged, rowIndex, itemType }: any) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useResizeObserver(
    ref,
    useCallback(
      (entries) => {
        onHeightChanged?.(ref.current);
      },
      [onHeightChanged]
    )
  );
  return (
    <div
      ref={(divElement) => {
        onHeightChanged?.(divElement);
        ref.current = divElement;
      }}
      data-list-item-type={itemType}
      data-index={rowIndex}
    >
      {children}
    </div>
  );
};

type FieldOrderBy = { field: string; direction: "asc" | "desc" };
type OrderBy = FieldOrderBy | Array<FieldOrderBy>;

enum RowType {
  SECTION = "SECTION",
  SECTION_FOOTER = "SECTION_FOOTER",
  ITEM = "ITEM",
}

type ListData = {
  sectionsInitiallyExpanded?: boolean;
  defaultSections?: Array<string>;
  expanded?: Record<any, boolean>;
  items: any[];
  limit?: number;
  sectionBy?: string;
  orderBy?: OrderBy;
  availableSections?: string[];
};

export function useListData({
  sectionsInitiallyExpanded = true,
  expanded = EMPTY_OBJECT,
  items,
  limit,
  sectionBy,
  orderBy,
  availableSections,
  defaultSections = EMPTY_ARRAY,
}: ListData) {
  const sortedItems = useMemo(() => {
    if (!orderBy) {
      return items;
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
    const fieldDirectionsToOrderBy = (arrayOrderBy as Array<FieldOrderBy>).map((ob) => ob.direction);
    return lodashOrderBy(items, fieldSelectorsToOrderBy, fieldDirectionsToOrderBy);
  }, [items, orderBy]);

  const cappedItems = useMemo(() => {
    if (!limit) {
      return sortedItems;
    }
    return sortedItems.slice(0, limit - 1);
  }, [sortedItems, limit]);

  const sectionedItems: Record<string, any> = useMemo(() => {
    if (sectionBy === undefined) {
      return EMPTY_OBJECT;
    }
    return groupBy(cappedItems, (item) => item[sectionBy]);
  }, [cappedItems, sectionBy]);

  const sections: string[] = useMemo(() => {
    if (sectionBy === undefined) {
      return EMPTY_ARRAY;
    }
    let foundSectionKeys = uniq([...defaultSections, ...Object.keys(sectionedItems)]);
    if (availableSections) {
      foundSectionKeys = sortBy(foundSectionKeys, (item) => {
        return availableSections.indexOf(item);
      });
    }
    return foundSectionKeys;
  }, [sectionBy, sectionedItems, defaultSections, availableSections]);

  const rows = useMemo(() => {
    if (sectionBy === undefined) {
      return cappedItems;
    }
    const ret: any[] = [];
    sections.forEach((section) => {
      ret.push({
        id: section,
        sectionItems: sectionedItems[section],
        _row_type: RowType.SECTION,
        sectionKey: section,
      });
      if (expanded[section] || (expanded[section] === undefined && sectionsInitiallyExpanded)) {
        ret.push(...(sectionedItems[section] || []));
        ret.push({
          id: `${section}_footer`,
          sectionItems: sectionedItems[section],
          _row_type: RowType.SECTION_FOOTER,
          sectionKey: section,
        });
      }
    });
    return ret;
  }, [sectionBy, sections, cappedItems, expanded, sectionsInitiallyExpanded, sectionedItems]);

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
  let subTitle: string | undefined;
  if (typeof item === "object") {
    const values = Object.values(omit(item, "id"));
    if (!values.length) {
      return null;
    }
    title = values[0] as string;
    subTitle = undefined;
    if (values.length > 1) {
      subTitle = values[1] as string;
    }
  } else if (typeof item === "string" || typeof item === "number") {
    title = item + "";
    subTitle = undefined;
  } else {
    return null;
  }

  return <Card title={title} subTitle={subTitle} />;
};

type DynamicHeightListProps = {
  items: any[];
  itemRenderer?: (item: any, id: any) => ReactNode;
  sectionRenderer?: (group: any, id: any) => ReactNode;
  sectionFooterRenderer?: (group: any, id: any) => ReactNode;
  loading?: boolean;
  limit?: number;
  sectionBy?: string;
  orderBy?: OrderBy;
  availableSections?: string[];
  scrollAnchor?: "top" | "bottom";
  requestFetchPrevPage?: () => any;
  selectedIndex?: number;
  resetSelectedIndex?: () => void;
  pageInfo?: PageInfo;
  idKey?: string;
  layout?: CSSProperties;
  emptyListPlaceholder?: ReactNode;
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;
  sectionsInitiallyExpanded?: boolean;
  defaultSections: Array<string>;
};

const DynamicHeightList = forwardRef(function DynamicHeightList(
  {
    items = EMPTY_ARRAY,
    itemRenderer = defaultItemRenderer,
    sectionRenderer,
    sectionFooterRenderer,
    loading,
    limit,
    sectionBy,
    orderBy,
    availableSections,
    scrollAnchor = "top",
    requestFetchPrevPage = noop,
    selectedIndex,
    resetSelectedIndex = noop,
    pageInfo,
    idKey = "id",
    layout,
    emptyListPlaceholder,
    scrollPaddingStart = 0,
    scrollPaddingEnd = 0,
    sectionsInitiallyExpanded = true,
    defaultSections = EMPTY_ARRAY,
  }: DynamicHeightListProps,
  ref
) {
  // The scrollable element for your list
  const scrollRef = useContext(ScrollContext);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rootRef = ref ? composeRefs(parentRef, ref) : parentRef;
  const rowsContainerRef = useRef<HTMLDivElement | null>(null);
  const [suspendInfiniteLoad, setSuspendInfiniteLoad] = useState(true);

  const [expanded, setExpanded] = useState<Record<any, boolean>>({});
  const toggleExpanded = useCallback((id: any, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
  }, []);

  const expandContextValue = useMemo(() => {
    return {
      isExpanded: (id: any) => expanded[id] || (expanded[id] === undefined && sectionsInitiallyExpanded),
      toggleExpanded,
    };
  }, [expanded, sectionsInitiallyExpanded, toggleExpanded]);

  const { rows } = useListData({
    sectionsInitiallyExpanded,
    defaultSections,
    expanded,
    items,
    limit,
    sectionBy,
    orderBy,
    availableSections,
  });

  const hasOutsideScroll =
    scrollRef && layout?.maxHeight === undefined && layout?.height === undefined && layout?.flex === undefined;
  const scrollElementRef = hasOutsideScroll ? scrollRef : parentRef;

  const overscan = 5;
  const myObserveElementOffset = useCallback(
    (instance: Virtualizer<HTMLDivElement, HTMLDivElement>, cb: (offset: number, isScrolling: boolean) => void) => {
      return observeElementOffset(instance, (offset, isScrolling) => {
        //based on this: https://github.com/TanStack/virtual/issues/387
        const parentContainerOffset = !hasOutsideScroll ? 0 : parentRef.current?.offsetTop || 0;
        cb(offset - parentContainerOffset, isScrolling);
      });
    },
    [hasOutsideScroll]
  );
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rows.length,
    // paddingStart: scrollPaddingStart,
    // paddingEnd: scrollPaddingEnd,
    observeElementOffset: myObserveElementOffset,
    getScrollElement: useCallback(() => {
      return scrollElementRef.current;
    }, [scrollElementRef]),
    estimateSize: useCallback(() => {
      return 30;
    }, []),
    rangeExtractor: useCallback((range: Range) => {
      return defaultRangeExtractor(range);
    }, []),
    getItemKey: useCallback(
      (index: number) => {
        return rows[index][idKey] ?? index;
      },
      [idKey, rows]
    ),
    overscan: overscan,
  });

  // useSyncListViewState({
  //   offsetTop: offsetTopRef.current,
  //   rowVirtualizer: rowVirtualizer,
  //   estimateRowSize,
  //   estimatedRowSize: estimatedRowSizeRef.current,
  //   uid,
  //   scrollElementRef,
  //   trackViewState,
  //   setExpanded,
  //   expanded,
  // });

  const prevRows = usePrevious(rows);

  const tryToScrollToIndex = useCallback(
    (index: number, onFinished?: () => void) => {
      rowVirtualizer.scrollToIndex(index);
      requestAnimationFrame(() => {
        onFinished?.();
      });
      // requestAnimationFrame(() => {
      //   requestAnimationFrame(() => {
      //     const {startIndex, endIndex} = visibleRangeRef.current;
      //     const isVisible = index >= startIndex && index <= endIndex;
      //
      //     if (!isVisible) {
      //       tryToScrollToIndex(index, onFinished);
      //     } else {
      //       onFinished?.();
      //     }
      //   });
      // });
    },
    [rowVirtualizer]
  );

  useEffect(() => {
    if (scrollAnchor === "bottom") {
      if (
        rows.length &&
        (!prevRows || !prevRows.length || rows[rows.length - 1][idKey] !== prevRows[prevRows.length - 1][idKey])
      ) {
        setSuspendInfiniteLoad(true);

        // console.log("TRying to scroll to index");
        tryToScrollToIndex(rows.length - 1, () => {
          setSuspendInfiniteLoad(false);
        });
      }
    }
  }, [idKey, prevRows, rows, scrollAnchor, tryToScrollToIndex]);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  useEffect(() => {
    if (selectedIndex && rowVirtualizer) {
      const index = virtualItems.findIndex((item) => item.key === selectedIndex);
      tryToScrollToIndex(index);
      resetSelectedIndex();
    }
  }, [resetSelectedIndex, rowVirtualizer, selectedIndex, tryToScrollToIndex, virtualItems]);

  const prevTotalSize = usePrevious(totalSize);
  const firstRenderedItem = virtualItems[0];

  useLayoutEffect(() => {
    if (prevTotalSize && prevTotalSize !== totalSize && scrollAnchor === "bottom" && firstRenderedItem?.index === 0) {
      const delta2 = totalSize - prevTotalSize;
      // console.log("restore scroll pos", {
      //   prevTotalSize: prevTotalSize,
      //   totalSize: totalSize,
      //   scrollTop: scrollElementRef.current.scrollTop,
      //   delta: delta2,
      //   newScrollTop: scrollElementRef.current.scrollTop + delta2,
      // });

      queueMicrotask(() => {
        scrollElementRef.current!.scrollBy({ left: 0, top: delta2 });
        // console.log("scrolled to", scrollElementRef.current.scrollTop);
        setSuspendInfiniteLoad(false);
      });
    }
  }, [firstRenderedItem?.index, prevTotalSize, rowVirtualizer, scrollAnchor, scrollElementRef, totalSize]);

  const suspendTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // console.log({
    //   suspendState: suspendInfiniteLoad,
    //   pageInfo,
    //   firstRenderedItem,
    //   // visibleRange
    // });

    if (suspendInfiniteLoad) {
      return;
    }
    if (!pageInfo) {
      return;
    }

    if (!firstRenderedItem) {
      return;
    }

    if (firstRenderedItem.index === 0 && pageInfo.hasPrevPage && !pageInfo.isFetchingPrevPage) {
      (async () => {
        setSuspendInfiniteLoad(true);
        if (suspendTimerRef.current) {
          clearTimeout(suspendTimerRef.current);
        }
        // console.log("fetching prev page START", pageInfo);
        await requestFetchPrevPage();
        // console.log("fetching prev page END", pageInfo);
        suspendTimerRef.current = setTimeout(() => {
          setSuspendInfiniteLoad(false);
        }, 500);
      })();
    }
  }, [firstRenderedItem, pageInfo, requestFetchPrevPage, suspendInfiniteLoad]);

  return (
    <ListContext.Provider value={expandContextValue}>
      <div
        ref={rootRef}
        className={styles.scrollParent}
        style={{
          overflow: hasOutsideScroll ? "initial" : "auto",
          maxHeight: "100%",
          ...layout,
        }}
      >
        {loading && virtualItems.length === 0 && (
          <div className={styles.loadingWrapper}>
            <Spinner />
          </div>
        )}
        {!loading &&
          virtualItems.length === 0 &&
          (emptyListPlaceholder ?? (
            <div className={styles.noRows}>
              <Text>No data available</Text>
            </div>
          ))}
        {/* The large inner element to hold all of the items */}
        {((!loading && virtualItems.length > 0) || items.length > 0) && (
          <div
            ref={rowsContainerRef}
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            <div
              data-list-container={true}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${firstRenderedItem?.start ?? 0}px)`,
              }}
            >
              {virtualItems.map((virtualItem) => {
                const item = rows[virtualItem.index];
                let key = virtualItem.key;

                let itemContent;
                switch (item._row_type) {
                  case RowType.SECTION:
                    itemContent = sectionRenderer?.(item, item[idKey]) ?? null;
                    key = `section_${key}`;
                    break;
                  case RowType.SECTION_FOOTER:
                    itemContent = sectionFooterRenderer?.(item, item[idKey]);
                    key = `section_footer_${key}`;
                    break;
                  default:
                    itemContent = itemRenderer(item, item[idKey]) ?? null;
                    break;
                }
                return (
                  <Item
                    key={key}
                    onHeightChanged={rowVirtualizer.measureElement}
                    rowIndex={virtualItem.index}
                    itemType={item._row_type || RowType.ITEM}
                  >
                    {itemContent}
                  </Item>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ListContext.Provider>
  );
});

// =====================================================================================================================
// XMLUI Items component definition

/**
 * The \`List\` component is a robust layout container that renders associated data items as a 
 * list of components. \`List\` is virtualized; it renders only items that are visible in the 
 * viewport.
 */
export interface ListComponentDef extends ComponentDef<"List"> {
  props: {
    items: string | any[];
    data?: string; //resolved datasource binding
    loading?: string | boolean;
    limit?: number;
    scrollAnchor?: "top" | "bottom";
    sectionBy?: string;
    orderBy?: string;
    availableSections?: string[];
    sectionTemplate: ComponentDef;
    sectionFooterTemplate?: ComponentDef;
    itemTemplate: ComponentDef;
    emptyListTemplate?: ComponentDef;
    pageInfo?: any;
    idKey?: string;
    selectedIndex?: number;
    scrollPaddingStart?: number;
    scrollPaddingEnd?: number;
    sectionsInitiallyExpanded?: boolean;
    defaultSections?: [];
  };
  events: {
    resetSelectedIndex: string;
    requestFetchPrevPage: string;
    requestFetchNextPage: string;
    itemsLoaded: string;
  };
}

export const metadata: ComponentDescriptor<ListComponentDef> = {
  displayName: "List",
  description: "A virtualized list component",
  props: {
    items: desc("The items to display in the list"),
    loading: desc("Is the list being loaded?"),
    limit: desc("The maximum number of items to display"),
    scrollAnchor: desc("Anchor point of the scroll (top, bottom)"),
    sectionBy: desc("the name of the data field to create sections within the list"),
    orderBy: desc("The name of the data field the items are ordered by"),
    availableSections: desc("List of available sections"),
    sectionTemplate: {
      description: "Component template for a section header",
      valueType: "ComponentDef",
    },
    sectionFooterTemplate: {
      description: "Component template for a section footer",
      valueType: "ComponentDef",
    },
    itemTemplate: {
      description: "Component template for a list item",
      valueType: "ComponentDef",
    },
    emptyListTemplate: {
      description: "Component template representing an empty list item",
      valueType: "ComponentDef",
    },
    pageInfo: desc("Information about a particular page"),
    idKey: desc("The field of data items to use as the identifier of the item."),
    selectedIndex: desc("The index of the list item selected by default"),
    scrollPaddingStart: desc("padding to use at the start of the scrolling area"),
    scrollPaddingEnd: desc("padding to use at the end of the scrolling area"),
    sectionsInitiallyExpanded: desc("Indicates if table sections should be initially expanded"),
    defaultSections: desc("Use these sections as the default ones"),
  },
  events: {
    resetSelectedIndex: desc("Triggered when the selected index is reset"),
    requestFetchNextPage: desc("Triggered when the component asks for the previous page's data"),
    requestFetchPrevPage: desc("Triggered when the component asks for the next page's data"),
    itemsLoaded: desc("Triggered when the items have been loaded"),
  },
  themeVars: parseScssVar(styles.themeVars),
};

// --- Helper function for List item rendering
function MemoizedSection({ node, renderChild, item }: { node: ComponentDef; item: any; renderChild: RenderChildFn }) {
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

  return <MemoizedItem node={node} renderChild={renderChild} item={item} context={sectionContext} />;
}

export const dynamicHeightListComponentRenderer = createComponentRenderer<ListComponentDef>(
  "List",
  ({ node, extractValue, renderChild, lookupAction, layoutCss, layoutContext, lookupEventHandler }) => {
    // console.log(node);
    return (
      <DynamicHeightList
        layout={layoutCss}
        loading={extractValue.asOptionalBoolean(node.props.loading)}
        items={extractValue(node.props.items) || extractValue(node.props.data)}
        limit={extractValue(node.props.limit)}
        sectionBy={extractValue(node.props.sectionBy)}
        orderBy={extractValue(node.props.orderBy)}
        availableSections={extractValue(node.props.availableSections)}
        scrollAnchor={node.props.scrollAnchor}
        pageInfo={extractValue(node.props.pageInfo)}
        idKey={extractValue(node.props.idKey)}
        requestFetchPrevPage={lookupEventHandler("requestFetchPrevPage")}
        selectedIndex={extractValue(node.props.selectedIndex)}
        resetSelectedIndex={lookupAction(node.events?.resetSelectedIndex)}
        emptyListPlaceholder={renderChild(node.props.emptyListTemplate)}
        scrollPaddingStart={extractValue.asOptionalNumber(node.props.scrollPaddingStart)}
        scrollPaddingEnd={extractValue.asOptionalNumber(node.props.scrollPaddingEnd)}
        sectionsInitiallyExpanded={extractValue.asOptionalBoolean(node.props.sectionsInitiallyExpanded)}
        defaultSections={extractValue(node.props.defaultSections)}
        itemRenderer={
          node.props.itemTemplate &&
          ((item) => {
            return (
              <MemoizedItem
                node={node.props.itemTemplate}
                item={item}
                renderChild={renderChild}
                layoutContext={layoutContext}
              />
            );
          })
        }
        sectionRenderer={
          node.props.sectionBy
            ? (item) => (
                <MemoizedSection
                  node={node.props.sectionTemplate ?? { type: "Fragment" }}
                  renderChild={renderChild}
                  item={item}
                />
              )
            : undefined
        }
        sectionFooterRenderer={
          node.props.sectionFooterTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.sectionFooterTemplate ?? { type: "Fragment" }}
                  item={item}
                  renderChild={renderChild}
                />
              )
            : undefined
        }
      />
    );
  },
  metadata
);
