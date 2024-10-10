import type { CSSProperties, ReactNode } from "react";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Range } from "@tanstack/react-virtual";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import styles from "./List.module.scss";
import { get, groupBy, noop, omit, orderBy as lodashOrderBy, sortBy, uniq } from "lodash-es";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "@components-core/constants";
import { ScrollContext } from "@components-core/ScrollContext";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Card } from "@components/Card/CardNative";
import { Text } from "@components/Text/TextNative";
import { Spinner } from "@components/Spinner/SopinnerNative";
import { usePrevious, useResizeObserver } from "@components-core/utils/hooks";
import { MemoizedItem } from "@components/container-helpers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn, RenderChildFn } from "@abstractions/RendererDefs";
import { useEvent } from "@components-core/utils/misc";

interface IExpandableListContext {
  isExpanded: (id: any) => boolean;
  toggleExpanded: (id: any, isExpanded: boolean) => void;
}

export const ListContext = React.createContext<IExpandableListContext>({
  isExpanded: (id: any) => false,
  toggleExpanded: (id: any, isExpanded: boolean) => {},
});

const Item = ({ children, onHeightChanged, rowIndex, itemType }: any) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useResizeObserver(
    ref,
    useCallback(() => {
      onHeightChanged?.(ref.current);
    }, [onHeightChanged]),
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
    const fieldDirectionsToOrderBy = (arrayOrderBy as Array<FieldOrderBy>).map(
      (ob) => ob.direction,
    );
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
  requestFetchNextPage?: () => any;
  selectedIndex?: number;
  resetSelectedIndex?: () => void;
  pageInfo?: PageInfo;
  idKey?: string;
  style?: CSSProperties;
  emptyListPlaceholder?: ReactNode;
  sectionsInitiallyExpanded?: boolean;
  defaultSections: Array<string>;
  registerComponentApi?: RegisterComponentApiFn;
};

export const DynamicHeightList = forwardRef(function DynamicHeightList(
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
    requestFetchNextPage = noop,
    selectedIndex,
    resetSelectedIndex = noop,
    pageInfo,
    idKey = "id",
    style,
    emptyListPlaceholder,
    sectionsInitiallyExpanded = true,
    defaultSections = EMPTY_ARRAY,
    registerComponentApi,
  }: DynamicHeightListProps,
  ref,
) {
  // The scrollable element for your list
  const scrollRef = useContext(ScrollContext);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rootRef = ref ? composeRefs(parentRef, ref) : parentRef;
  const rowsContainerRef = useRef<HTMLDivElement | null>(null);
  const [suspendInfiniteLoad, setSuspendInfiniteLoad] = useState(scrollAnchor === "bottom");

  const [expanded, setExpanded] = useState<Record<any, boolean>>(EMPTY_OBJECT);
  const toggleExpanded = useCallback((id: any, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
  }, []);

  const expandContextValue = useMemo(() => {
    return {
      isExpanded: (id: any) =>
        expanded[id] || (expanded[id] === undefined && sectionsInitiallyExpanded),
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
    scrollRef &&
    style?.maxHeight === undefined &&
    style?.height === undefined &&
    style?.flex === undefined;
  const scrollElementRef = hasOutsideScroll ? scrollRef : parentRef;

  const overscan = 5;
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rows.length,
    // paddingStart: scrollPaddingStart,
    // paddingEnd: scrollPaddingEnd,
    scrollMargin: !hasOutsideScroll ? 0 : parentRef.current?.offsetTop || 0,
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
      [idKey, rows],
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
      // console.log("SCROLLING TO INDEX", index);
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
    [rowVirtualizer],
  );

  const scrollToBottom = useEvent(() => {
    tryToScrollToIndex(rows.length - 1);
  });

  const scrollToTop = useEvent(() => {
    tryToScrollToIndex(0);
  });

  useEffect(() => {
    registerComponentApi?.({
      scrollToBottom,
      scrollToTop,
    });
  }, [registerComponentApi, scrollToBottom, scrollToTop]);

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
  const lastRenderedItem = virtualItems[virtualItems.length - 1];

  // restore scroll position when total size changes
  useLayoutEffect(() => {
    if (
      prevTotalSize &&
      prevTotalSize !== totalSize &&
      scrollAnchor === "bottom" //&&
    ) {
      const delta2 = totalSize - prevTotalSize;
      setSuspendInfiniteLoad(true);
      queueMicrotask(() => {
        scrollElementRef.current!.scrollBy({ left: 0, top: delta2 });
        // console.log("scrolled to", scrollElementRef.current.scrollTop);
        setSuspendInfiniteLoad(false);
      });
    }
  }, [
    firstRenderedItem?.index,
    prevTotalSize,
    rowVirtualizer,
    scrollAnchor,
    scrollElementRef,
    totalSize,
  ]);

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

  useEffect(() => {
    // console.log({
    //   suspendState: suspendInfiniteLoad,
    //   pageInfo,
    //   lastRenderedItem,
    //   itemsLength: items.length
    //   // visibleRange
    // });

    if (suspendInfiniteLoad) {
      return;
    }
    if (!pageInfo) {
      return;
    }

    if (!lastRenderedItem) {
      return;
    }

    if (
      lastRenderedItem.index === items.length - 1 &&
      pageInfo.hasNextPage &&
      !pageInfo.isFetchingNextPage
    ) {
      (async () => {
        setSuspendInfiniteLoad(true);
        if (suspendTimerRef.current) {
          clearTimeout(suspendTimerRef.current);
        }
        // console.log("fetching prev page START", pageInfo);
        await requestFetchNextPage();
        // console.log("fetching prev page END", pageInfo);
        suspendTimerRef.current = setTimeout(() => {
          setSuspendInfiniteLoad(false);
        }, 500);
      })();
    }
  }, [items.length, lastRenderedItem, pageInfo, requestFetchNextPage, suspendInfiniteLoad]);

  const listContainerTransformY = !firstRenderedItem
    ? 0
    : firstRenderedItem.start - rowVirtualizer.options.scrollMargin;
  return (
    <ListContext.Provider value={expandContextValue}>
      <div
        ref={rootRef}
        className={styles.scrollParent}
        style={{
          overflow: hasOutsideScroll ? "initial" : "auto",
          maxHeight: "100%",
          ...style,
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
                transform: `translateY(${listContainerTransformY}px)`,
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

// --- Helper function for List item rendering
export function MemoizedSection({
  node,
  renderChild,
  item,
}: {
  node: ComponentDef;
  item: any;
  renderChild: RenderChildFn;
}) {
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

  return (
    <MemoizedItem node={node} renderChild={renderChild} item={item} context={sectionContext} />
  );
}
