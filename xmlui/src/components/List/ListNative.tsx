import type { CSSProperties, ReactNode } from "react";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  get,
  groupBy as groupByFunc,
  noop,
  omit,
  orderBy as lodashOrderBy,
  sortBy,
  uniq,
} from "lodash-es";
import type { RegisterComponentApiFn, RenderChildFn } from "../../abstractions/RendererDefs";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../components-core/constants";
import type { FieldOrderBy, ScrollAnchoring } from "../abstractions";
import { Card } from "../Card/CardNative";
import type { CustomItemComponentProps, VListHandle } from "virtua";
import { Virtualizer } from "virtua";
import { usePrevious } from "../../components-core/utils/hooks";
import { ScrollContext } from "../../components-core/ScrollContext";
import { composeRefs } from "@radix-ui/react-compose-refs";
import styles from "./List.module.scss";
import classnames from "classnames";
import { useEvent } from "../../components-core/utils/misc";
import { Spinner } from "../Spinner/SpinnerNative";
import { Text } from "../Text/TextNative";
import { MemoizedItem } from "../container-helpers";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { CustomItemComponent } from "virtua/lib/react/types";

interface IExpandableListContext {
  isExpanded: (id: any) => boolean;
  toggleExpanded: (id: any, isExpanded: boolean) => void;
}

export const ListContext = React.createContext<IExpandableListContext>({
  isExpanded: (id: any) => false,
  toggleExpanded: (id: any, isExpanded: boolean) => {},
});

type OrderBy = FieldOrderBy | Array<FieldOrderBy>;

enum RowType {
  SECTION = "SECTION",
  SECTION_FOOTER = "SECTION_FOOTER",
  ITEM = "ITEM",
}

type ListData = {
  groupsInitiallyExpanded?: boolean;
  defaultGroups?: Array<string>;
  expanded?: Record<any, boolean>;
  items: any[];
  limit?: number;
  groupBy?: string;
  orderBy?: OrderBy;
  availableGroups?: string[];
};

export function useListData({
  groupsInitiallyExpanded = true,
  expanded = EMPTY_OBJECT,
  items,
  limit,
  groupBy,
  orderBy,
  availableGroups,
  defaultGroups = EMPTY_ARRAY,
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
    if (groupBy === undefined) {
      return EMPTY_OBJECT;
    }
    return groupByFunc(cappedItems, (item) => item[groupBy]);
  }, [cappedItems, groupBy]);

  const sections: string[] = useMemo(() => {
    if (groupBy === undefined) {
      return EMPTY_ARRAY;
    }
    let foundSectionKeys = uniq([...defaultGroups, ...Object.keys(sectionedItems)]);
    if (availableGroups) {
      foundSectionKeys = sortBy(foundSectionKeys, (item) => {
        return availableGroups.indexOf(item);
      });
    }
    return foundSectionKeys;
  }, [groupBy, sectionedItems, defaultGroups, availableGroups]);

  const rows = useMemo(() => {
    if (groupBy === undefined) {
      return cappedItems;
    }
    const ret: any[] = [];
    sections.forEach((section) => {
      ret.push({
        id: section,
        items: sectionedItems[section],
        _row_type: RowType.SECTION,
        key: section,
      });
      if (expanded[section] || (expanded[section] === undefined && groupsInitiallyExpanded)) {
        ret.push(...(sectionedItems[section] || []));
        ret.push({
          id: `${section}_footer`,
          items: sectionedItems[section],
          _row_type: RowType.SECTION_FOOTER,
          key: section,
        });
      }
    });
    return ret;
  }, [groupBy, sections, cappedItems, expanded, groupsInitiallyExpanded, sectionedItems]);

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
  let subtitle: string | undefined;
  if (typeof item === "object") {
    const values = Object.values(omit(item, "id"));
    if (!values.length) {
      return null;
    }
    title = values[0] as string;
    subtitle = undefined;
    if (values.length > 1) {
      subtitle = values[1] as string;
    }
  } else if (typeof item === "string" || typeof item === "number") {
    title = item + "";
    subtitle = undefined;
  } else {
    return null;
  }

  return <Card title={title} subtitle={subtitle} />;
};

type DynamicHeightListProps = {
  items: any[];
  itemRenderer?: (item: any, id: any) => ReactNode;
  sectionRenderer?: (group: any, id: any) => ReactNode;
  sectionFooterRenderer?: (group: any, id: any) => ReactNode;
  loading?: boolean;
  limit?: number;
  groupBy?: string;
  orderBy?: OrderBy;
  availableGroups?: string[];
  scrollAnchor?: ScrollAnchoring;
  requestFetchPrevPage?: () => any;
  requestFetchNextPage?: () => any;
  pageInfo?: PageInfo;
  idKey?: string;
  style?: CSSProperties;
  emptyListPlaceholder?: ReactNode;
  groupsInitiallyExpanded?: boolean;
  defaultGroups: Array<string>;
  registerComponentApi?: RegisterComponentApiFn;
  borderCollapse?: boolean;
};

// eslint-disable-next-line react/display-name
const Item = forwardRef(
  ({ children, style, index }: CustomItemComponentProps, forwardedRef: any) => {
    const getItemType = useContext(ListItemTypeContext);
    const itemType = getItemType(index) || RowType.ITEM;
    return (
      <div
        style={style}
        ref={forwardedRef}
        className={classnames({
          [styles.row]: itemType === RowType.ITEM,
          [styles.section]: itemType === RowType.SECTION,
          [styles.sectionFooter]: itemType === RowType.SECTION_FOOTER,
        })}
        data-list-item-type={itemType}
        data-index={index}
      >
        {children}
      </div>
    );
  },
);

const ListItemTypeContext = createContext<(index: number) => RowType>((index) => RowType.ITEM);

export const ListNative = forwardRef(function DynamicHeightList(
  {
    items = EMPTY_ARRAY,
    itemRenderer = defaultItemRenderer,
    sectionRenderer,
    sectionFooterRenderer,
    loading,
    limit,
    groupBy,
    orderBy,
    availableGroups,
    scrollAnchor = "top",
    requestFetchPrevPage = noop,
    requestFetchNextPage = noop,
    pageInfo,
    idKey = "id",
    style,
    emptyListPlaceholder,
    groupsInitiallyExpanded = true,
    defaultGroups = EMPTY_ARRAY,
    registerComponentApi,
    borderCollapse = true,
  }: DynamicHeightListProps,
  ref,
) {
  const virtualizerRef = useRef<VListHandle>(null);
  const scrollRef = useContext(ScrollContext);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rootRef = ref ? composeRefs(parentRef, ref) : parentRef;

  const hasOutsideScroll =
    scrollRef &&
    style?.maxHeight === undefined &&
    style?.height === undefined &&
    style?.flex === undefined;
  const scrollElementRef = hasOutsideScroll ? scrollRef : parentRef;

  const [expanded, setExpanded] = useState<Record<any, boolean>>(EMPTY_OBJECT);
  const toggleExpanded = useCallback((id: any, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
  }, []);

  const expandContextValue = useMemo(() => {
    return {
      isExpanded: (id: any) =>
        expanded[id] || (expanded[id] === undefined && groupsInitiallyExpanded),
      toggleExpanded,
    };
  }, [expanded, groupsInitiallyExpanded, toggleExpanded]);

  const { rows } = useListData({
    groupsInitiallyExpanded,
    defaultGroups,
    expanded,
    items,
    limit,
    groupBy,
    orderBy,
    availableGroups,
  });

  const isPrepend = useRef(false);
  const prevRows = usePrevious(rows);
  useLayoutEffect(() => {
    if (prevRows?.length < rows.length) {
      isPrepend.current = false;
    }
  }, [rows.length, prevRows?.length]);

  const initiallyScrolledToBottom = useRef(false);
  useEffect(() => {
    if (rows.length && scrollAnchor === "bottom" && !initiallyScrolledToBottom.current) {
      initiallyScrolledToBottom.current = true;
      virtualizerRef.current?.scrollToIndex(rows.length - 1);
    }
  }, [rows.length, scrollAnchor]);

  const tryToFetchPrevPage = useCallback(() => {
    if (
      virtualizerRef.current &&
      virtualizerRef.current.findStartIndex() < 10 &&
      pageInfo &&
      pageInfo.hasPrevPage &&
      !pageInfo.isFetchingPrevPage
    ) {
      isPrepend.current = true;
      requestFetchPrevPage();
    }
  }, [pageInfo, requestFetchPrevPage]);

  const tryToFetchNextPage = useCallback(() => {
    if (
      virtualizerRef.current &&
      virtualizerRef.current.findEndIndex() + 10 > rows.length &&
      pageInfo &&
      pageInfo.hasNextPage &&
      !pageInfo.isFetchingNextPage
    ) {
      requestFetchNextPage();
    }
  }, [rows.length, pageInfo, requestFetchNextPage]);

  const initiallyFetchedExtraPages = useRef(false);
  useEffect(() => {
    if (rows.length && !initiallyFetchedExtraPages.current) {
      initiallyFetchedExtraPages.current = true;
      tryToFetchPrevPage();
    }
  }, [rows.length, tryToFetchNextPage, tryToFetchPrevPage]);

  const onScroll = useCallback(() => {
    if (!virtualizerRef.current) return;
    tryToFetchPrevPage();
    tryToFetchNextPage();
  }, [tryToFetchNextPage, tryToFetchPrevPage]);

  const scrollToBottom = useEvent(() => {
    if (rows.length) {
      virtualizerRef.current.scrollToIndex(rows.length - 1);
    }
  });

  const scrollToTop = useEvent(() => {
    if (rows.length) {
      virtualizerRef.current.scrollToIndex(0);
    }
  });

  useLayoutEffect(() => {
    registerComponentApi?.({
      scrollToBottom,
      scrollToTop,
    });
  }, [registerComponentApi, scrollToBottom, scrollToTop]);
  const rowTypeContextValue = useCallback((index: number) => rows[index]._row_type, [rows]);

  return (
    <ListItemTypeContext.Provider value={rowTypeContextValue}>
      <ListContext.Provider value={expandContextValue}>
        <div
          ref={rootRef}
          style={style}
          className={classnames(styles.outerWrapper, {
            [styles.hasOutsideScroll]: hasOutsideScroll,
          })}
        >
          {loading && rows.length === 0 && (
            <div className={styles.loadingWrapper}>
              <Spinner />
            </div>
          )}
          {!loading &&
            rows.length === 0 &&
            (emptyListPlaceholder ?? (
              <div className={styles.noRows}>
                <Text>No data available</Text>
              </div>
            ))}
          {!loading && rows.length > 0 && (
            <div
              className={classnames(styles.innerWrapper, {
                [styles.reverse]: scrollAnchor === "bottom",
                [styles.borderCollapse]: borderCollapse,
                [styles.sectioned]: groupBy !== undefined,
              })}
              data-list-container={true}
            >
              <Virtualizer
                ref={virtualizerRef}
                scrollRef={scrollElementRef}
                shift={isPrepend.current}
                onScroll={onScroll}
                startMargin={!hasOutsideScroll ? 0 : parentRef.current?.offsetTop || 0}
                item={Item as CustomItemComponent}
              >
                {rows.map((row) => {
                  const key = row[idKey];
                  switch (row._row_type) {
                    case RowType.SECTION:
                      return sectionRenderer?.(row, key) || <div key={key} />;
                    case RowType.SECTION_FOOTER:
                      return sectionFooterRenderer?.(row, key) || <div key={key} />;
                    default:
                      return itemRenderer(row, key) || <div key={key} />;
                  }
                })}
              </Virtualizer>
            </div>
          )}
        </div>
      </ListContext.Provider>
    </ListItemTypeContext.Provider>
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
    <MemoizedItem
      node={node}
      renderChild={renderChild}
      item={item}
      context={sectionContext}
      itemKey="$group"
      contextKey="$group"
    />
  );
}
