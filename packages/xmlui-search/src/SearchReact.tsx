import {
  memo,
  useCallback,
  useId,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  Fragment,
  type HTMLAttributes,
  type ForwardedRef,
} from "react";
import { createPortal, flushSync } from "react-dom";
import {
  LinkNative,
  Text,
  TextBox,
  useSearchContextContent,
  VisuallyHidden,
  Button,
  Icon,
  SEARCH_DEFAULT_CATEGORY,
} from "xmlui";
import type {
  FuseOptionKeyObject,
  FuseResult,
  FuseResultMatch,
  IFuseOptions,
  RangeTuple,
} from "fuse.js";
import Fuse from "fuse.js";
import styles from "./Search.module.scss";
import classnames from "classnames";
import { Popover, PopoverAnchor, PopoverContent } from "@radix-ui/react-popover";

type Props = Omit<HTMLAttributes<HTMLSpanElement>, "data"> & {
  data: SearchItemData[];
  limit?: number;
  maxContentMatchNumber?: number;
  collapsible?: boolean;
  placeholder?: string;
  suggestedQueries?: string[];
  noResultsMessage?: string;
  showPreviewMetadata?: boolean;
  defaultSelectedCategories?: string[];
  pageSize?: number;
  mode?: "overlay" | "inline" | "drawer";
};

export const defaultProps: Required<Pick<Props, "limit" | "maxContentMatchNumber">> = {
  limit: 10,
  maxContentMatchNumber: 3,
};

// --- Search config (from v1)

const keys: Array<FuseOptionKeyObject<SearchItemData>> = [
  {
    name: "title",
    weight: 2,
  },
  {
    name: "content",
    weight: 1,
  },
];

const searchOptions: IFuseOptions<SearchItemData> = {
  // isCaseSensitive: false,
  includeScore: true,
  // ignoreDiacritics: false,
  shouldSort: true, // <- sorts by "score"
  includeMatches: true,
  // findAllMatches: false,
  minMatchCharLength: 2,
  // location: 0,
  threshold: 0,
  // distance: 500,
  // useExtendedSearch: true,
  ignoreLocation: true,
  ignoreFieldNorm: true,
  // fieldNormWeight: 1,
  keys,
};

const MIN_MATCH_LENGTH = 2;

export const Search = memo(function Search({
  id,
  data,
  limit = defaultProps.limit,
  maxContentMatchNumber = defaultProps.maxContentMatchNumber,
  collapsible = false,
  placeholder,
  className,
  suggestedQueries,
  noResultsMessage,
  showPreviewMetadata = true,
  defaultSelectedCategories,
  pageSize,
  mode = "overlay",
  ...rest
}: Props) {
  const fuse = useMemo(() => new Fuse<SearchItemData>([], searchOptions), []);
  const useOverlay = mode === "overlay";
  const _id = useId();
  const inputId = id || _id;

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<HTMLLIElement[]>([]);
  const itemLinkRefs = useRef<HTMLDivElement[]>([]); // <- this is a messy solution
  const listRef = useRef<HTMLUListElement>(null);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [animationDirection, setAnimationDirection] = useState<
    "expanding" | "collapsing" | null
  >(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const openOverlay = useCallback(() => {
    // flushSync forces React to render the overlay synchronously so inputRef is populated
    // before we call focus(), keeping us within the user gesture context on mobile
    flushSync(() => {
      setIsOverlayOpen(true);
    });
    // Focus the native <input> directly (not the wrapper div) to reliably trigger
    // the virtual keyboard on mobile — the div relay goes through React events and
    // loses the gesture context on iOS Safari
    const nativeInput =
      inputRef.current?.querySelector?.("input") ?? inputRef.current;
    nativeInput?.focus({ preventScroll: true });
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setInputValue("");
    setShow(false);
    setActiveIndex(-1);
  }, []);

  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(inputValue), 150);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const effectivePageSize = pageSize ?? limit;
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(defaultSelectedCategories ?? []),
  );

  // --- Data preparation

  const content = useSearchContextContent();

  const staticData = useMemo(() => {
    if (!data) return [];
    if (typeof data !== "object") {
      console.warn("Search data should be an object with path keys and string content values");
      return [];
    }
    if (!isSearchItemDataArray(data)) {
      console.warn(
        "Search data should be an array of objects with 'path', 'title' and 'content' string properties",
      );
      return [];
    }
    return data;
  }, [data]);

  // Does very basic deduplication of search data based on path and title, preferring entries with longer content
  const mergedData = useMemo(() => {
    const combined = [...staticData, ...Object.values(content ?? {})];
    const deduped = new Map<string, SearchItemData>();
    for (const item of combined) {
      const key = `${item.path}::${item.title}`;
      const existing = deduped.get(key);
      if (!existing || (item.content?.length ?? 0) > (existing.content?.length ?? 0)) {
        deduped.set(key, item);
      }
    }
    return Array.from(deduped.values());
  }, [content, staticData]);

  useEffect(() => {
    fuse.setCollection(mergedData);
  }, [fuse, mergedData]);

  // --- Search execution (v1 style — inline useMemo)

  const allResults: SearchResult[] = useMemo(() => {
    // Ignore single characters
    if (debouncedValue.length < MIN_MATCH_LENGTH) return [];

    const limited = fuse.search(debouncedValue, {
      limit: limit ?? defaultProps.limit,
    });
    const mapped = postProcessSearch(limited, debouncedValue);
    return groupAndSortByCategory(mapped);
  }, [debouncedValue, limit]);

  const totalCount = allResults.length;

  // Reset page and category filter when query changes
  useEffect(() => {
    setPage(1);
    setSelectedCategories(new Set(defaultSelectedCategories ?? []));
  }, [debouncedValue]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const r of allResults) {
      cats.add(r.item.category ?? SEARCH_DEFAULT_CATEGORY);
    }
    return Array.from(cats);
  }, [allResults]);

  const categoryFilteredResults = useMemo(() => {
    if (selectedCategories.size === 0) return allResults;
    return allResults.filter((r) =>
      selectedCategories.has(r.item.category ?? SEARCH_DEFAULT_CATEGORY),
    );
  }, [allResults, selectedCategories]);

  const results = categoryFilteredResults.slice(0, page * effectivePageSize);
  const hasMore = results.length < categoryFilteredResults.length;

  const [navigationSource, setNavigationSource] = useState<"keyboard" | "mouse" | null>(
    null,
  );

  // render-related state
  const [show, setShow] = useState(false);

  // Overlay mode: use useEffect (render doesn't need to be synchronous)
  // Inline mode: use useLayoutEffect (avoids flash of stale active index)
  const useResultEffect = useOverlay ? useEffect : useLayoutEffect;

  useResultEffect(() => {
    if (allResults.length > 0) setShow(true);
    setActiveIndex(0);
  }, [allResults]);

  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const onSearchButtonClick = useCallback(() => {
    setIsExpanded(true);
    setAnimationDirection("expanding");
    expandTimerRef.current = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      setAnimationDirection(null);
      expandTimerRef.current = null;
    }, 300);
  }, []);

  const onClick = useCallback(() => {
    if (useOverlay) {
      closeOverlay();
    } else {
      setInputValue("");
      setActiveIndex(-1);
    }
  }, [useOverlay, closeOverlay]);

  const onInputFocus = useCallback(() => {
    setIsFocused(true);
    if (debouncedValue.length > 0) setShow(true);
  }, [debouncedValue]);

  const onInputBlur = useCallback(() => {
    setIsFocused(false);
    if (collapsible && inputValue.length === 0) {
      setAnimationDirection("collapsing");
      collapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
        setAnimationDirection(null);
        collapseTimerRef.current = null;
      }, 300);
    }
  }, [collapsible, inputValue]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        if (useOverlay) {
          closeOverlay();
        } else {
          setActiveIndex(-1);
          setShow(false);
        }
        return;
      }
      if (!show) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
        setNavigationSource("keyboard");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
        setNavigationSource("keyboard");
      } else if (e.key === "Enter") {
        if (results.length === 0) return;
        e.preventDefault();
        const targetIndex = activeIndex >= 0 ? activeIndex : 0;
        if (useOverlay) {
          closeOverlay();
        } else {
          setActiveIndex(-1);
          setShow(false);
        }
        itemLinkRefs.current[targetIndex]?.click();
      }
    },
    [activeIndex, results.length, show, closeOverlay, useOverlay],
  );

  // Does the scrolling to the active item, accounting for the sticky category header
  useEffect(() => {
    if (navigationSource !== "keyboard" || activeIndex < 0 || !itemRefs.current[activeIndex])
      return;

    const item = itemRefs.current[activeIndex];
    const scrollContainer = listRef.current;

    if (!scrollContainer) {
      item.scrollIntoView({ block: "nearest", behavior: "instant" });
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    // Measure any sticky category header currently pinned at the top of the scroll container
    let stickyHeight = 0;
    scrollContainer
      .querySelectorAll(`.${styles.categoryHeader}`)
      .forEach((header) => {
        const headerRect = header.getBoundingClientRect();
        if (Math.abs(headerRect.top - containerRect.top) < 2) {
          stickyHeight = Math.max(stickyHeight, headerRect.height);
        }
      });

    const itemTop = itemRect.top - containerRect.top;
    const itemBottom = itemRect.bottom - containerRect.top;

    if (itemTop < stickyHeight) {
      // Item is obscured by the sticky header — scroll up to reveal it
      scrollContainer.scrollTop += itemTop - stickyHeight;
    } else if (itemBottom > containerRect.height) {
      // Item is below the visible area — scroll down
      scrollContainer.scrollTop += itemBottom - containerRect.height;
    }
  }, [activeIndex, navigationSource]);

  const clearCategories = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const refocusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onQuerySelect = useCallback(
    (q: string) => {
      setInputValue(q);
      refocusInput();
    },
    [refocusInput],
  );

  const onLoadMore = useCallback(() => {
    setPage((p) => p + 1);
    refocusInput();
  }, [refocusInput]);

  const onSelectOneCategory = useCallback(
    (cat: string) => {
      setSelectedCategories(new Set([cat]));
      refocusInput();
    },
    [refocusInput],
  );

  const onClearAllCategories = useCallback(() => {
    clearCategories();
    refocusInput();
  }, [clearCategories, refocusInput]);

  // Shared results list JSX — used by overlay mode
  const hasQuery = debouncedValue.length >= MIN_MATCH_LENGTH;
  const allUncategorized = results.every((r) => r.item.category == null);

  const overlayResultsListJsx = (
    <>
      {results.length > 0 &&
        results.map((result, idx) => {
          const effectiveCategory = result.item.category ?? SEARCH_DEFAULT_CATEGORY;
          const prevEffectiveCategory =
            idx > 0
              ? (results[idx - 1].item.category ?? SEARCH_DEFAULT_CATEGORY)
              : undefined;
          const showCategoryHeader = effectiveCategory !== prevEffectiveCategory;

          return (
            <Fragment key={result.item.path}>
              {showCategoryHeader && !allUncategorized && (
                <li
                  className={styles.categoryHeader}
                  role="presentation"
                  aria-hidden="true"
                >
                  <Text className={styles.categoryHeaderText}>
                    {effectiveCategory}
                  </Text>
                </li>
              )}
              <li
                id={`option-${idx}`}
                role="option"
                className={classnames(styles.item, styles.header, {
                  [styles.focus]: activeIndex === idx,
                })}
                onMouseEnter={() => {
                  setActiveIndex(idx);
                  setNavigationSource("mouse");
                }}
                ref={(el) => (itemRefs.current[idx] = el!)}
                aria-selected={activeIndex === idx}
              >
                <SearchItemContent
                  ref={(el) => (itemLinkRefs.current[idx] = el!)}
                  idx={idx}
                  item={result.item}
                  matches={result.matches}
                  maxContentMatchNumber={maxContentMatchNumber}
                  onClick={onClick}
                  showPreviewMetadata={showPreviewMetadata}
                />
              </li>
            </Fragment>
          );
        })}

      {results.length === 0 && (
        <li role="presentation" aria-hidden="true" style={{ listStyle: "none" }}>
          <NoResultsPanel
            message={noResultsMessage}
            suggestedQueries={suggestedQueries}
            onQuerySelect={onQuerySelect}
          />
        </li>
      )}

      {(hasMore || totalCount > effectivePageSize) && results.length > 0 && (
        <li role="presentation" aria-hidden="true" style={{ listStyle: "none" }}>
          <div className={styles.loadMoreRow}>
            <Text
              className={styles.resultCount}
            >{`Showing ${results.length} of ${categoryFilteredResults.length}`}</Text>
            {hasMore && (
              <button
                className={styles.loadMoreButton}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onLoadMore}
              >
                Load more
              </button>
            )}
          </div>
        </li>
      )}
    </>
  );

  // --- Overlay mode ---
  if (useOverlay) {
    return (
      <span {...rest} className={className}>
        <VisuallyHidden>
          <label htmlFor={inputId}>Search Field</label>
        </VisuallyHidden>

        {/* Trigger — either a toggle button (collapsible) or an always-visible input */}
        {!isOverlayOpen && collapsible && (
          <Button
            variant="ghost"
            themeColor="secondary"
            icon={<Icon name="search" aria-hidden />}
            onClick={openOverlay}
            contextualLabel="Open search"
            className={styles.searchToggleButton}
          />
        )}

        {!isOverlayOpen && !collapsible && (
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              openOverlay();
            }}
            style={{ cursor: "text" }}
          >
            <TextBox
              className={styles.input}
              type="search"
              placeholder={placeholder ?? "Type to search"}
              value=""
              startIcon="search"
              readOnly
            />
          </div>
        )}

        {/* Overlay — rendered in a portal so the DOM parent is document.body.
             Without this, the browser traverses the nav-bar ancestor chain on every
             keypress to scroll the focused input into view, causing the page to drift. */}
        {isOverlayOpen && createPortal(
          <div>
            {/* Backdrop — click outside to close */}
            <div
              className={classnames(
                styles.overlayBackdrop,
                styles.overlayBackdropMobile,
              )}
              onPointerDown={closeOverlay}
            >
              <div
                className={classnames(styles.overlayPanel, {
                  [styles.overlayPanelWithResults]: hasQuery,
                })}
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Input row */}
                <div className={styles.overlayInputRow}>
                  <Icon name="search" className={styles.overlaySearchIcon} />
                  <TextBox
                    id={inputId}
                    ref={inputRef}
                    className={styles.overlayInput}
                    type="search"
                    placeholder={placeholder ?? "Type to search…"}
                    onDidChange={(value) => setInputValue(value)}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                    aria-controls={`${inputId}-listbox`}
                    aria-activedescendant={
                      activeIndex >= 0 ? `option-${activeIndex}` : undefined
                    }
                  />
                </div>

                {/* Category tabs — only when there's a query and multiple categories */}
                {hasQuery && availableCategories.length > 1 && (
                  <div className={styles.overlayControls}>
                    <OverlayCategoryTabs
                      categories={availableCategories}
                      selectedCategories={selectedCategories}
                      onSelectOne={onSelectOneCategory}
                      onClearAll={onClearAllCategories}
                    />
                  </div>
                )}

                {/* Results */}
                {hasQuery && (
                  <ul
                    id={`${inputId}-listbox`}
                    ref={listRef}
                    className={classnames(
                      styles.list,
                      styles.overlayList,
                      styles.overlayResultsList,
                    )}
                    role="listbox"
                    aria-label="Search results"
                  >
                    {overlayResultsListJsx}
                  </ul>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
      </span>
    );
  }

  // --- Inline mode ---
  return (
    <span {...rest} className={className}>
      <Popover open={show} onOpenChange={setShow}>
        <VisuallyHidden>
          <label htmlFor={inputId}>Search Field</label>
        </VisuallyHidden>

        {collapsible && !isExpanded && animationDirection === null ? (
          <Button
            variant="ghost"
            themeColor="secondary"
            icon={<Icon name="search" aria-hidden />}
            onClick={onSearchButtonClick}
            contextualLabel="Open search"
            className={styles.searchToggleButton}
          />
        ) : (
          <PopoverAnchor asChild>
            <TextBox
              id={inputId}
              ref={inputRef}
              className={classnames(styles.input, {
                [styles.active]: inputValue.length > 0 || show,
                [styles.focused]: isFocused,
                [styles.expanding]: animationDirection === "expanding",
                [styles.collapsing]: animationDirection === "collapsing",
              })}
              type="search"
              placeholder={placeholder ?? "Type to search"}
              value={inputValue}
              startIcon="search"
              onDidChange={(value) => setInputValue(value)}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              onKeyDown={handleKeyDown}
              aria-autocomplete="list"
              aria-controls={`${inputId}-listbox`}
              aria-activedescendant={
                activeIndex >= 0 ? `option-${activeIndex}` : undefined
              }
            />
          </PopoverAnchor>
        )}

        {show && allResults && hasQuery && (
          <PopoverContent
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={() => setShow(false)}
            onFocusOutside={(e) => e.preventDefault()}
            className={classnames(styles.listPanel, className)}
          >
            {availableCategories.length > 1 && (
              <div className={styles.overlayControls}>
                <OverlayCategoryTabs
                  categories={availableCategories}
                  selectedCategories={selectedCategories}
                  onSelectOne={onSelectOneCategory}
                  onClearAll={onClearAllCategories}
                />
              </div>
            )}

            <ul
              id={`${inputId}-listbox`}
              ref={listRef}
              className={classnames(styles.list, styles.overlayList)}
              role="listbox"
              aria-label="Search results"
            >
              {overlayResultsListJsx}
            </ul>
          </PopoverContent>
        )}
      </Popover>
    </span>
  );
});

// --- Sub-components

type NoResultsPanelProps = {
  message?: string;
  suggestedQueries?: string[];
  onQuerySelect: (query: string) => void;
};

function NoResultsPanel({ message, suggestedQueries, onQuerySelect }: NoResultsPanelProps) {
  return (
    <div className={styles.noResultsPanel} role="status" aria-live="polite">
      <Text variant="em" className={styles.noResultsMessage}>
        {message ?? "No results found"}
      </Text>
      <Text className={styles.noResultsHint}>
        Try broadening your search or check for typos.
      </Text>
      {suggestedQueries && suggestedQueries.length > 0 && (
        <div className={styles.noResultsSuggestions}>
          {suggestedQueries.map((q) => (
            <button
              key={q}
              className={styles.noResultsSuggestionChip}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onQuerySelect(q)}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Maps raw category keys to user-friendly display labels. */
function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    docs: "Documentation",
    blog: "Blog",
    news: "News",
    "get-started": "Get Started",
    other: "Other",
  };
  return labels[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1);
}

type OverlayCategoryTabsProps = {
  categories: string[];
  selectedCategories: Set<string>;
  onSelectOne: (cat: string) => void;
  onClearAll: () => void;
};

function OverlayCategoryTabs({
  categories,
  selectedCategories,
  onSelectOne,
  onClearAll,
}: OverlayCategoryTabsProps) {
  const allActive = selectedCategories.size === 0;
  return (
    <div className={styles.overlayTabs} role="tablist" aria-label="Filter by category">
      <button
        role="tab"
        aria-selected={allActive}
        className={classnames(styles.overlayTab, {
          [styles.overlayTabActive]: allActive,
        })}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClearAll}
      >
        All content
      </button>
      {categories.map((cat) => {
        const active = selectedCategories.size === 1 && selectedCategories.has(cat);
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={active}
            className={classnames(styles.overlayTab, {
              [styles.overlayTabActive]: active,
            })}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelectOne(cat)}
          >
            {getCategoryLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}

type SearchItemContentProps = SearchResult & {
  idx: string | number;
  maxContentMatchNumber?: number;
  onClick?: () => void;
  showPreviewMetadata?: boolean;
};

/**
 * Renders a single search result.
 * Use the item prop to access the data original data.
 */
const SearchItemContent = forwardRef(function SearchItemContent(
  {
    idx,
    item,
    matches,
    maxContentMatchNumber,
    onClick,
    showPreviewMetadata = true,
  }: SearchItemContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <LinkNative ref={forwardedRef} to={item.path} onClick={onClick} className={styles.itemLink}>
      <div className={styles.itemBody}>
        <div className={styles.itemTitleRow}>
          <Text variant="subtitle">
            {highlightText(item.title, matches?.title?.indices) || item.title}
          </Text>
        </div>

        {showPreviewMetadata && (item.category || item.path) && (
          <div className={styles.previewMetadata}>
            {item.category && (
              <span className={styles.categoryBadge}>{item.category}</span>
            )}
            {item.path && (
              <span className={styles.pathBreadcrumb}>
                {parsePathBreadcrumb(item.path).map((segment, i, arr) => (
                  <Fragment key={i}>
                    <span className={styles.pathSegment}>{segment}</span>
                    {i < arr.length - 1 && (
                      <span className={styles.pathSeparator}> / </span>
                    )}
                  </Fragment>
                ))}
              </span>
            )}
          </div>
        )}

        <div className={styles.itemSnippets}>
          {/* content snippets */}
          {matches?.content?.indices &&
            formatContentSnippet(
              item.content,
              matches.content.indices,
              maxContentMatchNumber,
            ).map((snippet, snipIdx) => (
              <div
                key={`${item.path}-${idx}-${snipIdx}`}
                className={styles.snippet}
              >
                <Text>{snippet}</Text>
              </div>
            ))}
        </div>

        {/* Display the number of other matches if there are any */}
        {matches.content?.indices && (
          <Text variant="em">
            {`${pluralize(matches.content.indices.length, "match", "matches")} in this article`}
          </Text>
        )}
      </div>
    </LinkNative>
  );
});

// --- Utilities (search logic from v1)

function postProcessSearch(
  searchResults: FuseResult<SearchItemData>[],
  debouncedValue: string,
) {
  // Minimum number of characters to trigger a long text search filter
  const longTextSearchThreshold = 25;
  // Number of characters needed to accept the search term as a match in the title
  const titleAcceptanceThreshold = debouncedValue.length - 1;
  // Number of character threshold to accept the search term as a match in the content
  const longContentAcceptance = Math.floor(debouncedValue.length * 0.5);

  // Determines the size of the area around a string index
  // used in search filtering and highlight correction
  const shortTextSearchRadius = 3;
  const longTextSearchRadius = 50;
  const textSearchRadius =
    debouncedValue.length < longTextSearchThreshold
      ? shortTextSearchRadius
      : longTextSearchRadius;

  return searchResults
    .map((result) => ({
      item: result.item,
      score: result.score,
      matches: mapMatchIndices(result),
    }))
    .filter((item) =>
      Object.values(item.matches).some((match) => match.indices.length > 0),
    );

  // ---
  function mapMatchIndices(result: FuseResult<SearchItemData>) {
    return (result.matches ?? [])
      .filter((match) => !!match.key)
      .reduce<MatchesByKey>((acc, match) => {
        const matchKey = match.key as keyof SearchItemData;

        const fieldValue = result.item[matchKey];
        // Skip fields that have no value (e.g. optional fields like category)
        if (fieldValue === undefined) return acc;
        // Skip non-string fields
        if (typeof fieldValue !== "string") return acc;

        // --- Prefilter matches that are too short/significantly misaligned compared to the search term
        const filteredMatches = match.indices.filter((index) => {
          const foundSubstrLength = index[1] - index[0];

          // Title
          if (matchKey === "title") {
            return foundSubstrLength >= titleAcceptanceThreshold;
          }

          // Content: long text search
          if (debouncedValue.length >= longTextSearchThreshold) {
            return foundSubstrLength >= longContentAcceptance;
          }

          // Content: regular text search
          return fieldValue
            .slice(index[0], index[1] + 1)
            .toLocaleLowerCase()
            .includes(debouncedValue.toLocaleLowerCase());
        });

        // --- Restrict highlights that are longer than the original search term
        const highlightAdjustedMatches = filteredMatches.reduce<RangeTuple[]>(
          (matchAcc, index) => {
            if (matchKey === "title") {
              if (index[1] - index[0] > debouncedValue.length) {
                index[1] = index[0] + debouncedValue.length;
              }
            }

            const origTextLength = fieldValue.length;
            const startIdx = Math.max(index[0] - textSearchRadius, 0);
            const endIdx = Math.min(
              index[1] + textSearchRadius,
              origTextLength,
            );

            const textSnippet = fieldValue.toLocaleLowerCase();
            const position = textSnippet.indexOf(
              debouncedValue.toLocaleLowerCase(),
              startIdx,
            );

            if (position !== -1 && position + debouncedValue.length - 1 <= endIdx) {
              index[0] = position;
              index[1] = position + debouncedValue.length - 1;

              if (
                matchAcc.findIndex(
                  (m) => m[0] === index[0] && m[1] === index[1],
                ) === -1
              ) {
                matchAcc.push(index);
              }
            }

            return matchAcc;
          },
          [],
        );

        // Map match indexes to results
        acc[matchKey] = {
          value: match.value,
          indices: highlightAdjustedMatches,
        };

        return acc;
      }, {});
  }
}

/**
 * Priority order for search result categories. Lower number = higher priority.
 * Categories not listed here fall back to a default priority of 99.
 */
const CATEGORY_PRIORITY: Partial<Record<string, number>> = {
  docs: 0,
  "get-started": 1,
  blog: 2,
  news: 3,
};

/**
 * Groups search results by category and sorts the groups first by explicit category
 * priority (docs before blog), then by their summed Fuse.js scores as a tiebreaker
 * (lower sum = better overall match quality), keeping items within each group in their
 * original score-sorted order.
 */
function groupAndSortByCategory(results: SearchResult[]): SearchResult[] {
  const groups = new Map<string, SearchResult[]>();
  for (const result of results) {
    const cat = result.item.category ?? SEARCH_DEFAULT_CATEGORY;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(result);
  }

  // Sum scores per group — lower is better in Fuse.js (0 = perfect match)
  const groupScores = new Map<string, number>();
  for (const [cat, items] of groups) {
    const sum = items.reduce((acc, item) => acc + (item.score ?? 0), 0);
    groupScores.set(cat, sum);
  }

  const sortedCategories = [...groups.keys()].sort((a, b) => {
    const priorityA = CATEGORY_PRIORITY[a] ?? 99;
    const priorityB = CATEGORY_PRIORITY[b] ?? 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return (groupScores.get(a) ?? 0) - (groupScores.get(b) ?? 0);
  });

  return sortedCategories.flatMap((cat) => groups.get(cat)!);
}

/**
 * Formats a snippet of text. Determines which ranges are highlighted and how big the snippet is.
 */
function formatContentSnippet(
  text: string,
  ranges?: readonly RangeTuple[],
  maxContentMatchNumber?: number,
) {
  if (!ranges || ranges.length === 0) return [text.slice(0, 100)];

  const contextLength = 50;
  const limitedRanges = ranges.slice(0, maxContentMatchNumber);

  const contextRanges: RangeTuple[] = limitedRanges.map(([start, end]) => {
    let contextStart = 0;
    let contextEnd = text.length - 1;

    if (0 <= start - contextLength) {
      contextStart = start - contextLength;
    }
    if (end + contextLength <= text.length - 1) {
      contextEnd = end + contextLength;
    }

    return [contextStart, contextEnd];
  });

  const highlightRanges: RangeTuple[] = limitedRanges.map(([start, end], idx) => {
    return [start - contextRanges[idx][0], end - contextRanges[idx][0]];
  });

  return contextRanges.map(([start, end], idx) => {
    const textWithEllipsis: React.ReactNode[] = [];

    if (start > 0) {
      textWithEllipsis.push("...");
    }

    textWithEllipsis.push(highlightText(text.slice(start, end), [highlightRanges[idx]]));

    if (end < text.length - 1) {
      textWithEllipsis.push("...");
    }

    return textWithEllipsis;
  });
}

/**
 * Highlights specified ranges in a string with JSX.
 */
function highlightText(text: string, ranges?: readonly RangeTuple[]) {
  if (!ranges || ranges.length === 0) return [text];

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach(([start, end], index) => {
    if (lastIndex < start) {
      result.push(text.slice(lastIndex, start));
    }
    result.push(
      // style is temporary, fontSize should be inherited if Text is inside other Text
      <Text
        key={`${index}-highlighted`}
        variant="marked"
        style={{ fontSize: "inherit", fontWeight: "inherit", color: "inherit" }}
      >
        {text.slice(start, end + 1)}
      </Text>,
    );
    lastIndex = end + 1;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

function pluralize(number: number, singular: string, plural: string): string {
  if (number === 1) {
    return `${number} ${singular}`;
  }
  return `${number} ${plural}`;
}

function parsePathBreadcrumb(path: string): string[] {
  return path.split("/").filter((s) => s.length > 0);
}

// --- Types

type SearchItemData = {
  path: string;
  title: string;
  content: string;
  category?: string;
  date?: string | number;
};

function isSearchItemDataArray(data: any): data is SearchItemData[] {
  return (
    Array.isArray(data) &&
    (data.length === 0 ||
      (typeof data[0] === "object" &&
        typeof data[0].path === "string" &&
        typeof data[0].title === "string" &&
        typeof data[0].content === "string"))
  );
}

type MatchesByKey = Partial<
  Record<keyof SearchItemData, Pick<FuseResultMatch, "indices" | "value">>
>;

type SearchResult = Omit<FuseResult<SearchItemData>, "refIndex" | "matches"> & {
  matches: MatchesByKey;
};
