import {
  useCallback,
  useDeferredValue,
  useId,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type ForwardedRef,
} from "react";
import {
  LinkNative,
  Text,
  TextBox,
  useSearchContextContent,
  useTheme,
  VisuallyHidden,
  useAppLayoutContext,
  Button,
  Icon,
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
import { Popover, PopoverContent, PopoverTrigger, Portal } from "@radix-ui/react-popover";

type Props = {
  id?: string;
  data: Record<string, string>;
  limit?: number;
  maxContentMatchNumber?: number;
  collapsible?: boolean;
  useContentFromAppContext?: boolean;
  placeholder?: string;
};

export const defaultProps: Required<Pick<Props, "limit" | "maxContentMatchNumber">> = {
  limit: 10,
  maxContentMatchNumber: 3,
};

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


export const Search = ({
  id,
  data,
  limit = defaultProps.limit,
  maxContentMatchNumber = defaultProps.maxContentMatchNumber,
  collapsible = false,
  useContentFromAppContext = true,
  placeholder,
}: Props) => {
  const fuseRef = useRef<Fuse<SearchItemData>>(new Fuse<SearchItemData>([], searchOptions));

  const content = useSearchContextContent();
  const _id = useId();
  const inputId = id || _id;
  const { root } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<HTMLLIElement[]>([]);
  const itemLinkRefs = useRef<HTMLDivElement[]>([]); // <- this is a messy solution
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [animationDirection, setAnimationDirection] = useState<"expanding" | "collapsing" | null>(
    null,
  );

  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDeferredValue(inputValue);

  const layout = useAppLayoutContext();
  const inDrawer = layout?.drawerVisible ?? false;
  const _root = inDrawer && inputRef.current ? inputRef.current?.closest(`div`) : root;

  const [navigationSource, setNavigationSource] = useState<"keyboard" | "mouse" | null>(null);

  // render-related state
  const [show, setShow] = useState(false);
  // --- Step 2: Convert data to a format better handled by the search engine
  const dataFromMd = useMemo(
    () => {
      if (!data) return [];
      if (typeof data !== "object") {
        console.warn("Search data should be an object with path keys and string content values");
        return [];
      }
      return Object.entries(data).map<SearchItemData>(([path, content]) => {
        const lines = content.split("\n");
        const firstLine = lines.length > 0 ? lines[0] : "";
        // Remove title after matching, since it is in the "label"
        const restContent = lines.length > 1 ? lines.slice(1).join("\n") : "";
        return {
          path,
          title: firstLine,
          content: restContent,
        };
      });
    },
    [data],
  );

  const mergedData = useMemo(() => {
    return [...dataFromMd, ...(useContentFromAppContext ? Object.values(content ?? {}) : [])];
  }, [content, dataFromMd, useContentFromAppContext]);

  useEffect(() => {
    fuseRef.current.setCollection(mergedData);
  }, [mergedData]);

  // --- Step 3: Execute search & post-process results
  const results: SearchResult[] = useMemo(() => {
    if (debouncedValue.length <= 1) return [];

    const limited = !debouncedValue
      ? []
      : fuseRef.current.search(debouncedValue, { limit: limit ?? defaultProps.limit });

    const mapped = postProcessSearch(limited, debouncedValue);
    return mapped;
  }, [debouncedValue, limit]);

  useEffect(() => {
    if (results.length > 0) setShow(true);
  }, [results]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

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

  // Does the scrolling to the active item
  useEffect(() => {
    if (
      navigationSource === "keyboard" &&
      activeIndex >= 0 &&
      itemRefs.current[activeIndex] &&
      typeof itemRefs.current[activeIndex].scrollIntoView === "function"
    ) {
      itemRefs.current[activeIndex].scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [activeIndex, navigationSource]);

  // flush item refs to prevent stale refs when results change drastically (e.g. from one search to another with few overlapping results)
  itemRefs.current = [];
  itemLinkRefs.current = [];
  return (
    <Popover open={show} onOpenChange={setShow}>
      <VisuallyHidden>
        <label htmlFor={inputId}>Search Field</label>
      </VisuallyHidden>
      {collapsible && !isExpanded && animationDirection === null ? (
        <Button
          variant="ghost"
          themeColor="secondary"
          icon={<Icon name="search" aria-hidden />}
          onClick={() => {
            setIsExpanded(true);
            setAnimationDirection("expanding");
            // Focus search input when it expands
            setTimeout(() => {
              inputRef.current?.focus();
              setAnimationDirection(null);
            }, 300);
          }}
          contextualLabel="Open search"
        />
      ) : (
        <PopoverTrigger asChild>
          <TextBox
            id={inputId}
            ref={inputRef}
            className={classnames(styles.input, {
              [styles.fullWidth]: inDrawer,
              [styles.active]: inputValue.length > 0,
              [styles.focused]: isFocused,
              [styles.expanding]: animationDirection === "expanding",
              [styles.collapsing]: animationDirection === "collapsing",
            })}
            type="search"
            placeholder={placeholder ?? "Type to search"}
            value={inputValue}
            startIcon="search"
            onDidChange={(value) =>
              setInputValue(() => {
                setActiveIndex(-1);
                return value;
              })
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="dropdown-list"
            aria-activedescendant={activeIndex >= 0 ? `option-${activeIndex}` : undefined}
          />
        </PopoverTrigger>
      )}
      {show && results && debouncedValue && (
        <Portal container={_root}>
          <PopoverContent
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={() => setShow(false)}
            className={classnames(styles.listPanel, {
              [styles.inDrawer]: inDrawer,
            })}
          >
            <ul className={styles.list} role="listbox">
              {results.length > 0 &&
                results.map((result, idx) => {
                  return (
                    <li
                      role="option"
                      key={`${result.item.path}-${idx}`}
                      className={classnames(styles.item, styles.header, {
                        [styles.keyboardFocus]: activeIndex === idx,
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
                  );
                })}
              {results.length === 0 && (
                <div className={styles.noResults}>
                  <Text variant="em">No results</Text>
                </div>
              )}
            </ul>
          </PopoverContent>
        </Portal>
      )}
    </Popover>
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
          {getSourceLabel(item.path) && (
            <Text
              variant="em"
              style={{
                fontSize: "0.7em",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                opacity: 0.6,
                flexShrink: 0,
              }}
            >
              {getSourceLabel(item.path)}
            </Text>
          )}
          <Text variant="subtitle">
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
        {matches?.content?.indices && (
          <Text variant="em">
            {`${pluralize(matches?.content?.indices.length, "match", "matches")} in this article`}
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
          return result.item[matchKey]
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

          const origTextLength = result.item[matchKey].length;
          const startIdx = Math.max(index[0] - textSearchRadius, 0);
          const endIdx = Math.min(index[1] + textSearchRadius, origTextLength);
          const textSnippet = result.item[matchKey].toLocaleLowerCase();

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
      <Text key={`${index}-highlighted`} variant="marked" style={{ fontSize: "inherit" }}>
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

/**
 * Extracts a human-readable source label from a path string.
 * Returns "Docs", "Blog", or null if the source cannot be determined.
 */
function getSourceLabel(path: string): string | null {
  const segments = path.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  if (first === "docs") return "Docs";
  if (first === "blog") return "Blog";
  return null;
}

function pluralize(number: number, singular: string, plural: string): string {
  if (number === 1) {
    return `${number} ${singular}`;
  }
  return `${number} ${plural}`;
}

type SearchItemData = { path: string; title: string; content: string };
type MatchesByKey = Partial<
  Record<keyof SearchItemData, Pick<FuseResultMatch, "indices" | "value">>
>;
type SearchResult = Omit<FuseResult<SearchItemData>, "refIndex" | "matches"> & {
  matches: MatchesByKey;
};
