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
import {
  LinkNative,
  Text,
  TextBox,
  useSearchContextContent,
  VisuallyHidden,
  useAppLayoutContext,
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
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";
import classNames from "classnames";

type Props = {
  id?: string;
  data: SearchItemData[];
  limit?: number;
  maxContentMatchNumber?: number;
  collapsible?: boolean;
  placeholder?: string;
  className?: string;
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
}: Props) => {
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

  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDeferredValue(inputValue);
  // --- Merge data, do search, postprocess results
  const results = useSearch(data, limit, debouncedValue);

  const layout = useAppLayoutContext();
  const inDrawer = layout?.drawerVisible ?? false;
  const _root = inDrawer && inputRef.current ? inputRef.current?.closest(`div`) : undefined;

  const [navigationSource, setNavigationSource] = useState<"keyboard" | "mouse" | null>(null);

  // render-related state
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    if (results.length > 0) setShow(true);
    setActiveIndex(0);
  }, [results]);

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
    setInputValue("");
    setActiveIndex(-1);
  }, []);

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
        setActiveIndex(-1);
        setShow(false);
        itemLinkRefs.current[targetIndex]?.click();
      } else if (e.key === "Escape") {
        setActiveIndex(-1);
        setShow(false);
      }
    },
    [activeIndex, results.length, show],
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
                [styles.fullWidth]: inDrawer,
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
        {show && results && debouncedValue && debouncedValue.length >= MIN_MATCH_LENGTH && (
          <Portal container={_root}>
            <PopoverContent
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onEscapeKeyDown={() => setShow(false)}
              onFocusOutside={(e) => e.preventDefault()}
              className={classnames(styles.listPanel, className, {
                [styles.inDrawer]: inDrawer,
              })}
            >
              <ul
                id={`${inputId}-listbox`}
                ref={listRef}
                className={classNames(styles.list)}
                role="listbox"
                aria-label="Search results"
              >
                {results.length > 0 &&
                  results.map((result, idx) => {
                    const effectiveCategory = result.item.category ?? SEARCH_DEFAULT_CATEGORY;
                    const prevEffectiveCategory =
                      idx > 0
                        ? (results[idx - 1].item.category ?? SEARCH_DEFAULT_CATEGORY)
                        : undefined;
                    const showCategoryHeader = effectiveCategory !== prevEffectiveCategory;
                    let allUncategorized = results.every((r) => r.item.category == null);
                    return (
                      <Fragment key={`${result.item.path}-${idx}`}>
                        {showCategoryHeader && !allUncategorized && (
                          <li
                            className={styles.categoryHeader}
                            role="presentation"
                            aria-hidden="true"
                          >
                            <Text
                              className={styles.categoryHeaderText}
                            >
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
                          />
                        </li>
                      </Fragment>
                    );
                  })}
                {results.length === 0 && (
                  <div className={styles.noResults}>
                    <Text variant="em">No results</Text>
                  </div>
                )}
              </ul>
              {!inDrawer && (
                <footer className={styles.panelFooter}>
                  <div>
                    <Text variant="keyboard"><Icon name="arrowup" size="sm" /></Text>
                    <Text variant="keyboard"><Icon name="arrowdown" size="sm" /></Text>
                    <Text>Navigate</Text>
                  </div>

                  <div style={{ flex: "1" }}>
                    <Text variant="keyboard">Enter</Text>
                    <Text>Select</Text>
                  </div>

                  <div>
                    <Text variant="keyboard">Esc</Text>
                    <Text>Close</Text>
                  </div>
              </footer>)}
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </span>
  );
};

type SearchItemContentProps = SearchResult & {
  idx: string | number;
  maxContentMatchNumber?: number;
  onClick?: () => void;
};

/**
 * Renders a single search result.
 * Use the `item` prop to access the data original data.
 *
 */
const SearchItemContent = forwardRef(function SearchItemContent(
  { idx, item, matches, maxContentMatchNumber, onClick }: SearchItemContentProps,
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

function useSearch(data: SearchItemData[], limit: number, query: string): SearchResult[] {
  const searchOptions: IFuseOptions<SearchItemData> = useMemo(() => {
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
    return {
      // isCaseSensitive: false,
      includeScore: true,
      // ignoreDiacritics: false,
      shouldSort: true, // <- sorts by "score"
      includeMatches: true,
      // findAllMatches: false,
      minMatchCharLength: MIN_MATCH_LENGTH,
      // location: 0,
      threshold: 0,
      // distance: 500,
      // useExtendedSearch: true,
      ignoreLocation: true,
      ignoreFieldNorm: true,
      // fieldNormWeight: 1,
      keys,
    };
  }, []);
  const fuseRef = useRef<Fuse<SearchItemData>>(new Fuse<SearchItemData>([], searchOptions));

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
  }, [mergedData]);

  // --- Step 3: Execute search & post-process results
  const results: SearchResult[] = useMemo(() => {
    if (query.length < MIN_MATCH_LENGTH) return [];

    const limited = !query
      ? []
      : fuseRef.current.search(query, { limit: limit ?? defaultProps.limit });

    const mapped = postProcessSearch(limited, query);
    const sorted = groupAndSortByCategory(mapped);

    // Emit app:trace when xsVerbose tracing is active
    if ((window as any)._xsLogs) {
      const xsTraceEvent = (window as any).xsTraceEvent;
      if (typeof xsTraceEvent === "function") {
        xsTraceEvent("search", {
          term: query,
          fuseHits: limited.length,
          resultCount: sorted.length,
          topResults: sorted.slice(0, 3).map((r) => r.item.title),
        });
      }
    }

    return sorted;
  }, [query, limit]);

  return results;
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

type SearchItemData = { path: string; title: string; content: string; category?: string };
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
