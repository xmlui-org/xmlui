import {
  useCallback,
  useDeferredValue,
  useId,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  Fragment,
  type ForwardedRef,
} from "react";
import { flushSync } from "react-dom";
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
  FuseResult,
  FuseResultMatch,
  IFuseOptions,
  RangeTuple,
} from "fuse.js";
import Fuse from "fuse.js";
import styles from "./Search.module.scss";
import classnames from "classnames";
import { Popover, PopoverAnchor, PopoverContent, Portal } from "@radix-ui/react-popover";
import { createPortal } from "react-dom";

type Props = {
  id?: string;
  data: SearchItemData[];
  limit?: number;
  maxContentMatchNumber?: number;
  collapsible?: boolean;
  placeholder?: string;
  className?: string;
  suggestedQueries?: string[];
  noResultsMessage?: string;
  showPreviewMetadata?: boolean;
  defaultSelectedCategories?: string[];
  defaultSortOrder?: "relevance" | "date";
  pageSize?: number;
  enableSpellCorrection?: boolean;
  /** "overlay" (default): clicking the search button opens a centered full-screen overlay.
   *  "inline": the current expand-in-place animation inside the navbar.
   *  "drawer": renders results inline below the input, no portal — safe inside a modal drawer. */
  mode?: "overlay" | "inline" | "drawer";
};

export const defaultProps: Required<Pick<Props, "limit" | "maxContentMatchNumber">> = {
  limit: 10,
  maxContentMatchNumber: 3,
};

const MIN_MATCH_LENGTH = 2;

export const Search = ({
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
  defaultSortOrder = "relevance",
  pageSize,
  enableSpellCorrection = true,
  mode = "overlay",
}: Props) => {
  const useOverlay = mode === "overlay";
  const useDrawer = mode === "drawer";
  const _id = useId();
  const inputId = id || _id;
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<HTMLLIElement[]>([]);
  const itemLinkRefs = useRef<HTMLDivElement[]>([]); // <- this is a messy solution
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [animationDirection, setAnimationDirection] = useState<"expanding" | "collapsing" | null>(
    null,
  );

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [drawerOverlayTop, setDrawerOverlayTop] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);

  const openOverlay = useCallback(() => {
    if (triggerRef.current) {
      setDrawerOverlayTop(triggerRef.current.getBoundingClientRect().top);
    }
    // Set synchronously so Sheet.tsx onFocusOutside/onInteractOutside checks it immediately
    if (useDrawer) {
      document.body.setAttribute("data-search-overlay-open", "true");
    }
    // flushSync forces React to render the overlay synchronously so inputRef is populated
    // before we call focus(), keeping us within the user gesture context on mobile
    flushSync(() => {
      setIsOverlayOpen(true);
    });
    // Focus the native <input> directly (not the wrapper div) to reliably trigger
    // the virtual keyboard on mobile — the div relay goes through React events and
    // loses the gesture context on iOS Safari
    const nativeInput = inputRef.current?.querySelector?.("input") ?? inputRef.current;
    nativeInput?.focus({ preventScroll: true });
  }, [useDrawer]);

  const closeOverlay = useCallback(() => {
    document.body.removeAttribute("data-search-overlay-open");
    setIsOverlayOpen(false);
    setInputValue("");
    setShow(false);
    setActiveIndex(-1);
  }, []);

const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDeferredValue(inputValue);

  const effectivePageSize = pageSize ?? limit;
  const [page, setPage] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(defaultSelectedCategories ?? []),
  );

  const [sortOrder, setSortOrder] = useState<"relevance" | "date">(defaultSortOrder);

  // --- Merge data, do search, postprocess results
  const { results: allResults, totalCount, suggestion } = useSearch(
    data,
    limit,
    debouncedValue,
    enableSpellCorrection,
  );

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

  const sortedResults = useMemo(() => {
    if (sortOrder === "relevance") return categoryFilteredResults;
    return [...categoryFilteredResults].sort((a, b) => {
      const dateA = a.item.date;
      const dateB = b.item.date;
      if (dateA == null && dateB == null) return 0;
      if (dateA == null) return 1;
      if (dateB == null) return -1;
      const ta = typeof dateA === "string" ? new Date(dateA).getTime() : dateA;
      const tb = typeof dateB === "string" ? new Date(dateB).getTime() : dateB;
      return tb - ta;
    });
  }, [categoryFilteredResults, sortOrder]);

  const results = useMemo(
    () => sortedResults.slice(0, page * effectivePageSize),
    [sortedResults, page, effectivePageSize],
  );
  const hasMore = results.length < sortedResults.length;

  const [navigationSource, setNavigationSource] = useState<"keyboard" | "mouse" | null>(null);

  // render-related state
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    if (allResults.length > 0) setShow(true);
    setActiveIndex(0);
  }, [allResults]);

  const onSearchButtonClick = useCallback(() => {
    setIsExpanded(true);
    setAnimationDirection("expanding");
    // Focus search input when it expands
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      setAnimationDirection(null);
    }, 300);
  }, []);

  const onClick = useCallback(() => {
    if (useOverlay) {
      closeOverlay();
    } else {
      setInputValue("");
      setActiveIndex(-1);
    }
    // For drawer mode: do nothing extra — keep the search overlay and mobile menu open
  }, [useOverlay, closeOverlay]);

  const onInputFocus = useCallback(() => {
    setIsFocused(true);
    if (debouncedValue.length > 0) setShow(true);
  }, [debouncedValue]);

  const onInputBlur = useCallback(() => {
    setIsFocused(false);
    if (collapsible && inputValue.length === 0) {
      setAnimationDirection("collapsing");
      setTimeout(() => {
        setIsExpanded(false);
        setAnimationDirection(null);
      }, 300);
    }
  }, [collapsible, inputValue]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        if (useOverlay || useDrawer) {
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
    [activeIndex, results.length, show, closeOverlay, useDrawer, useOverlay],
  );

  // Does the scrolling to the active item, accounting for the sticky category header
  useEffect(() => {
    if (navigationSource !== "keyboard" || activeIndex < 0 || !itemRefs.current[activeIndex]) return;

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
    scrollContainer.querySelectorAll(`.${styles.categoryHeader}`).forEach((header) => {
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

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const refocusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Shared results list JSX — used by both overlay and popover modes
  const hasQuery = debouncedValue.length >= MIN_MATCH_LENGTH;
  const allUncategorized = results.every((r) => r.item.category == null);

  const resultsListJsx = (
    <>
      {/* F — Did You Mean banner */}
      {suggestion && enableSpellCorrection && (
        <li role="presentation" aria-hidden="true" style={{ listStyle: "none" }}>
          <DidYouMeanBanner suggestion={suggestion} onAccept={(s) => { setInputValue(s); refocusInput(); }} />
        </li>
      )}
      {results.length > 0 &&
        results.map((result, idx) => {
          const effectiveCategory = result.item.category ?? SEARCH_DEFAULT_CATEGORY;
          const prevEffectiveCategory =
            idx > 0 ? (results[idx - 1].item.category ?? SEARCH_DEFAULT_CATEGORY) : undefined;
          const showCategoryHeader = effectiveCategory !== prevEffectiveCategory;
          return (
            <Fragment key={`${result.item.path}-${idx}`}>
              {showCategoryHeader && !allUncategorized && (
                <li className={styles.categoryHeader} role="presentation" aria-hidden="true">
                  <Text className={styles.categoryHeaderText}>{effectiveCategory}</Text>
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
      {/* A — Zero results UX */}
      {results.length === 0 && (
        <li role="presentation" aria-hidden="true" style={{ listStyle: "none" }}>
          <NoResultsPanel
            message={noResultsMessage}
            suggestedQueries={suggestedQueries}
            onQuerySelect={(q) => { setInputValue(q); refocusInput(); }}
            showSuggestion={!suggestion || !enableSpellCorrection}
          />
        </li>
      )}
    </>
  );

  const loadMoreJsx = (hasMore || totalCount > effectivePageSize) && results.length > 0 && (
    <div className={styles.loadMoreRow}>
      <Text className={styles.resultCount}>{`Showing ${results.length} of ${sortedResults.length}`}</Text>
      {hasMore && (
        <button className={styles.loadMoreButton} onMouseDown={(e) => e.preventDefault()} onClick={() => { setPage((p) => p + 1); refocusInput(); }}>
          Load more
        </button>
      )}
    </div>
  );

  if (useOverlay) {
    return (
      <span className={className}>
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
            onPointerDown={(e) => { e.preventDefault(); openOverlay(); }}
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
        {/* Overlay */}
        {isOverlayOpen && createPortal(
          // Wrap with className so theme CSS vars are in scope for the portal
          <div className={className}>
            {/* Backdrop — click outside to close */}
            <div
              className={classnames(styles.overlayBackdrop, styles.overlayBackdropMobile)}
              onClick={closeOverlay}
            >
              <div
                className={classnames(styles.overlayPanel)}
                role="dialog"
                aria-modal="true"
                aria-label="Search"
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
                    value={inputValue}
                    onDidChange={(value) => setInputValue(value)}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                    aria-controls={`${inputId}-listbox`}
                    aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
                  />
                </div>

                {/* Category tabs + sort — only when there's a query */}
                {hasQuery && (
                  <div className={styles.overlayControls}>
                    <OverlayCategoryTabs
                      categories={availableCategories}
                      selectedCategories={selectedCategories}
                      onSelectOne={(cat: string) => { setSelectedCategories(new Set([cat])); refocusInput(); }}
                      onClearAll={() => { clearCategories(); refocusInput(); }}
                    />
                    <SortControl sortOrder={sortOrder} onSortChange={(o) => { setSortOrder(o); refocusInput(); }} />
                  </div>
                )}

                {/* Results */}
                {hasQuery && (
                  <>
                    <ul
                      id={`${inputId}-listbox`}
                      ref={listRef}
                      className={classnames(styles.list, styles.overlayList)}
                      role="listbox"
                      aria-label="Search results"
                    >
                      {resultsListJsx}
                    </ul>
                    {loadMoreJsx}
                  </>
                )}
              </div>
            </div>
          </div>, document.body
        )}
      </span>
    );
  }

  if (useDrawer) {
    return (
      <span className={className} style={{ display: "block" }}>
        <VisuallyHidden>
          <label htmlFor={inputId}>Search Field</label>
        </VisuallyHidden>
        {/* Trigger — always in DOM so pointer events complete within the Sheet */}
        <div
          ref={triggerRef}
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); openOverlay(); }}
          style={{ cursor: "text" }}
        >
          <TextBox
            className={classnames(styles.input, styles.fullWidth)}
            type="search"
            placeholder={placeholder ?? "Type to search"}
            value=""
            startIcon="search"
            readOnly
          />
        </div>
        {/* Overlay via portal — drawer is already closed by the time this renders */}
        {isOverlayOpen && createPortal(
          <div className={className}>
            <div className={classnames(styles.overlayBackdrop, styles.overlayBackdropMobile)} onClick={closeOverlay}>
              <div
                className={classnames(styles.overlayPanel, styles.overlayPanelMobile)}
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.drawerInputRow}>
                  <TextBox
                    id={inputId}
                    ref={inputRef}
                    className={classnames(styles.input, styles.fullWidth)}
                    type="search"
                    placeholder={placeholder ?? "Type to search"}
                    value={inputValue}
                    startIcon="search"
                    onDidChange={(value) => setInputValue(value)}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                    aria-controls={`${inputId}-listbox`}
                    aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
                  />
                </div>
                {hasQuery && (
                  <div className={styles.drawerResultsWrapper}>
                    <div className={styles.drawerControls}>
                      {availableCategories.length > 1 && (
                        <div className={styles.drawerCategoryRow}>
                          <OverlayCategoryTabs
                            categories={availableCategories}
                            selectedCategories={selectedCategories}
                            onSelectOne={(cat) => { setSelectedCategories(new Set([cat])); refocusInput(); }}
                            onClearAll={() => { clearCategories(); refocusInput(); }}
                          />
                        </div>
                      )}
                      <div className={styles.drawerSortRow}>
                        <SortControl sortOrder={sortOrder} onSortChange={(o) => { setSortOrder(o); refocusInput(); }} />
                      </div>
                    </div>
                    <ul
                      id={`${inputId}-listbox`}
                      ref={listRef}
                      className={classnames(styles.list, styles.overlayList, styles.drawerOverlayList)}
                      role="listbox"
                      aria-label="Search results"
                    >
                      {resultsListJsx}
                    </ul>
                    {loadMoreJsx}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </span>
    );
  }

  return (
    <span className={className}>
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
              aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
            />
          </PopoverAnchor>
        )}
        {show && allResults && hasQuery && (
          <Portal>
            <PopoverContent
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onEscapeKeyDown={() => setShow(false)}
              onFocusOutside={(e) => e.preventDefault()}
              className={classnames(styles.listPanel, className)}
            >
              {/* C — Category filter bar + D — Sort control */}
              {(availableCategories.length > 1 || sortOrder !== "relevance") && (
                <div className={styles.panelControls}>
                  {availableCategories.length > 1 && (
                    <CategoryFilterBar
                      categories={availableCategories}
                      selectedCategories={selectedCategories}
                      onToggle={(cat) => { toggleCategory(cat); refocusInput(); }}
                      onClearAll={() => { clearCategories(); refocusInput(); }}
                    />
                  )}
                  <SortControl sortOrder={sortOrder} onSortChange={(o) => { setSortOrder(o); refocusInput(); }} />
                </div>
              )}
              <ul
                id={`${inputId}-listbox`}
                ref={listRef}
                className={classnames(styles.list)}
                role="listbox"
                aria-label="Search results"
              >
                {resultsListJsx}
              </ul>
              {loadMoreJsx}
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </span>
  );
};

// --- A: NoResultsPanel sub-component

type NoResultsPanelProps = {
  message?: string;
  suggestedQueries?: string[];
  onQuerySelect: (query: string) => void;
  showSuggestion: boolean;
};

function NoResultsPanel({ message, suggestedQueries, onQuerySelect, showSuggestion }: NoResultsPanelProps) {
  return (
    <div className={styles.noResultsPanel} role="status" aria-live="polite">
      <Text variant="em" className={styles.noResultsMessage}>
        {message ?? "No results found"}
      </Text>
      {showSuggestion && (
        <Text className={styles.noResultsHint}>
          Try broadening your search or check for typos.
        </Text>
      )}
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

// --- C: CategoryFilterBar sub-component

type CategoryFilterBarProps = {
  categories: string[];
  selectedCategories: Set<string>;
  onToggle: (cat: string) => void;
  onClearAll: () => void;
};

function CategoryFilterBar({ categories, selectedCategories, onToggle, onClearAll }: CategoryFilterBarProps) {
  return (
    <div className={styles.categoryFilterBar} role="group" aria-label="Filter by category">
      <button
        className={classnames(styles.categoryFilterChip, {
          [styles.categoryFilterChipActive]: selectedCategories.size === 0,
        })}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClearAll}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={classnames(styles.categoryFilterChip, {
            [styles.categoryFilterChipActive]: selectedCategories.has(cat),
          })}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onToggle(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// --- D: SortControl sub-component

type SortControlProps = {
  sortOrder: "relevance" | "date";
  onSortChange: (order: "relevance" | "date") => void;
};

function SortControl({ sortOrder, onSortChange }: SortControlProps) {
  return (
    <div className={styles.sortControl} role="group" aria-label="Sort results">
      <span className={styles.sortLabel}>Sort by</span>
      <button
        className={classnames(styles.sortButton, {
          [styles.sortButtonActive]: sortOrder === "relevance",
        })}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSortChange("relevance")}
      >
        Relevance
      </button>
      <button
        className={classnames(styles.sortButton, {
          [styles.sortButtonActive]: sortOrder === "date",
        })}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSortChange("date")}
      >
        Date
      </button>
    </div>
  );
}

// --- G: OverlayCategoryTabs sub-component

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
        className={classnames(styles.overlayTab, { [styles.overlayTabActive]: allActive })}
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
            className={classnames(styles.overlayTab, { [styles.overlayTabActive]: active })}
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

// --- F: DidYouMeanBanner sub-component

type DidYouMeanBannerProps = {
  suggestion: string;
  onAccept: (s: string) => void;
};

function DidYouMeanBanner({ suggestion, onAccept }: DidYouMeanBannerProps) {
  return (
    <div className={styles.didYouMeanBanner}>
      <Text className={styles.didYouMeanText}>Did you mean: </Text>
      <button
        className={styles.didYouMeanSuggestion}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAccept(suggestion)}
      >
        {suggestion}
      </button>
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
 * Use the `item` prop to access the data original data.
 *
 */
const SearchItemContent = forwardRef(function SearchItemContent(
  { idx, item, matches, maxContentMatchNumber, onClick, showPreviewMetadata = true }: SearchItemContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <LinkNative
      ref={forwardedRef}
      to={item.path}
      onClick={onClick}
      style={{ textDecorationLine: "none", width: "100%", minHeight: "36px" }}
    >
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <Text variant="subtitle" style={{ fontWeight: 600 }}>
            {highlightText(item.title, matches?.title?.indices) || item.title}
          </Text>
        </div>
        {/* B — Preview metadata: category badge + path breadcrumb */}
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
                    {i < arr.length - 1 && <span className={styles.pathSeparator}> / </span>}
                  </Fragment>
                ))}
              </span>
            )}
          </div>
        )}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* content snippets */}
          {matches?.content?.indices &&
            formatContentSnippet(item.content, matches.content.indices, maxContentMatchNumber).map(
              (snippet, snipIdx) => (
                <div key={`${item.path}-${idx}-${snipIdx}`} className={styles.snippet}>
                  <Text>{snippet}</Text>
                </div>
              ),
            )}
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

// --- Utilities

function postProcessSearch(searchResults: FuseResult<SearchItemData>[], debouncedValue: string) {
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
    debouncedValue.length < longTextSearchThreshold ? shortTextSearchRadius : longTextSearchRadius;

  return searchResults
    .map((result) => ({
      item: result.item,
      score: result.score,
      matches: mapMatchIndices(result),
    }))
    .filter((item) => Object.values(item.matches).some((match) => match.indices.length > 0));

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
        const highlightAdjustedMatches = filteredMatches.reduce<RangeTuple[]>((matchAcc, index) => {
          if (matchKey === "title") {
            if (index[1] - index[0] > debouncedValue.length) {
              index[1] = index[0] + debouncedValue.length;
            }
          }

          const origTextLength = fieldValue.length;
          const startIdx = Math.max(index[0] - textSearchRadius, 0);
          const endIdx = Math.min(index[1] + textSearchRadius, origTextLength);
          const textSnippet = fieldValue.toLocaleLowerCase();

          const position = textSnippet.indexOf(debouncedValue.toLocaleLowerCase(), startIdx);
          if (position !== -1 && position + debouncedValue.length - 1 <= endIdx) {
            index[0] = position;
            index[1] = position + debouncedValue.length - 1;

            if (matchAcc.findIndex((m) => m[0] === index[0] && m[1] === index[1]) === -1) {
              matchAcc.push(index);
            }
          }

          return matchAcc;
        }, []);

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

/**
 * B — Parses a URL path into breadcrumb segments, filtering empty parts.
 */
function parsePathBreadcrumb(path: string): string[] {
  return path.split("/").filter((s) => s.length > 0);
}

const FUSE_SEARCH_OPTIONS: IFuseOptions<SearchItemData> = {
  includeScore: true,
  shouldSort: true, // <- sorts by "score"
  includeMatches: true,
  minMatchCharLength: MIN_MATCH_LENGTH,
  threshold: 0,
  ignoreLocation: true,
  ignoreFieldNorm: true,
  keys: [
    { name: "title", weight: 2 },
    { name: "content", weight: 1 },
  ],
};

const FUSE_RELAXED_OPTIONS: IFuseOptions<SearchItemData> = {
  includeScore: true,
  shouldSort: true,
  includeMatches: false,
  minMatchCharLength: MIN_MATCH_LENGTH,
  threshold: 0.6,
  ignoreLocation: true,
  ignoreFieldNorm: true,
  keys: [{ name: "title", weight: 2 }, { name: "content", weight: 1 }],
};

function useSearch(
  data: SearchItemData[],
  limit: number,
  query: string,
  enableSpellCorrection: boolean,
): { results: SearchResult[]; totalCount: number; suggestion: string | null } {
  const fuseRef = useRef<Fuse<SearchItemData>>(new Fuse<SearchItemData>([], FUSE_SEARCH_OPTIONS));
  const relaxedFuseRef = useRef<Fuse<SearchItemData>>(new Fuse<SearchItemData>([], FUSE_RELAXED_OPTIONS));

  // --- Convert data to a format better handled by the search engine
  const dynamicData = useSearchContextContent();
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
    const combined = [...staticData, ...Object.values(dynamicData ?? {})];
    const deduped = new Map<string, SearchItemData>();
    for (const item of combined) {
      const key = `${item.path}::${item.title}`;
      const existing = deduped.get(key);
      if (!existing || (item.content?.length ?? 0) > (existing.content?.length ?? 0)) {
        deduped.set(key, item);
      }
    }
    return Array.from(deduped.values());
  }, [dynamicData, staticData]);

  useEffect(() => {
    fuseRef.current.setCollection(mergedData);
    relaxedFuseRef.current.setCollection(mergedData);
  }, [mergedData]);

  // --- Step 3: Execute search & post-process results
  const searchOutput = useMemo(() => {
    if (query.length < MIN_MATCH_LENGTH) {
      return { results: [], totalCount: 0, suggestion: null };
    }

    const fetchLimit = Math.min(limit * 10, 200);
    const raw = fuseRef.current.search(query, { limit: fetchLimit });
    const mapped = postProcessSearch(raw, query);
    const grouped = groupAndSortByCategory(mapped);

    let suggestion: string | null = null;
    if (grouped.length === 0 && enableSpellCorrection && query.length >= 3) {
      const relaxed = relaxedFuseRef.current.search(query, { limit: 1 });
      if (relaxed.length > 0) {
        suggestion = relaxed[0].item.title;
      }
    }

    return { results: grouped, totalCount: grouped.length, suggestion };
  }, [query, limit, enableSpellCorrection]);

  return searchOutput;
}

/**
 * Groups search results by category and sorts the groups by their summed Fuse.js scores
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

  const sortedCategories = [...groups.keys()].sort(
    (a, b) => (groupScores.get(a) ?? 0) - (groupScores.get(b) ?? 0),
  );

  return sortedCategories.flatMap((cat) => groups.get(cat)!);
}

type SearchItemData = { path: string; title: string; content: string; category?: string; date?: string | number };
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
