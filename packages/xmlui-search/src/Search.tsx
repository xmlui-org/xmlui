import {
  useCallback,
  useDeferredValue,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LinkNative,
  Text,
  TextBox,
  useSearchContextContent,
  useTheme,
  VisuallyHidden,
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

import { Command, CommandInput, CommandItem, CommandList } from "cmdk";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  Portal,
} from "@radix-ui/react-popover";

type Props = {
  id?: string;
  data: Record<string, string>;
  limit?: number;
  maxContentMatchNumber?: number;
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
  distance: 500,
  // useExtendedSearch: false,
  ignoreLocation: true,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys,
};

export const Search = ({
  id,
  data,
  limit = defaultProps.limit,
  maxContentMatchNumber = defaultProps.maxContentMatchNumber,
}: Props) => {
  const content = useSearchContextContent();
  const _id = useId();
  const inputId = id || _id;
  const { root } = useTheme();
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDeferredValue(inputValue);

  // render-related state
  const [show, setShow] = useState(false);
  const targetRef = useRef<HTMLInputElement>(null);

  // --- Step 2: Convert data to a format better handled by the search engine
  const dataFromMd = useMemo(
    () =>
      Object.entries(data).map<SearchItemData>(([path, content]) => {
        const lines = content.split('\n');
        const firstLine = lines.length > 0 ? lines[0] : '';
        // Remove title after matching, since it is in the "label"
        const restContent = lines.length > 1 ? lines.slice(1).join('\n') : '';
        return {
          path,
          title: firstLine,
          content: restContent,
        };
      }),
    [data],
  );

  const mergedData = useMemo(() => {
    return [...dataFromMd, ...Object.values(content)];
  }, [content, dataFromMd]);

  const fuse = useMemo(() => {
    // console.log("Creating Fuse instance with data length:", mergedData.length);
    return new Fuse<SearchItemData>(mergedData, searchOptions);
  }, [mergedData]);

  // --- Step 3: Execute search & post-process results
  const results: SearchResult[] = useMemo(() => {
    // Ignore single characters
    if (debouncedValue.length <= 1) return [];

    setShow(debouncedValue.length > 0);
    const limited = !debouncedValue
      ? []
      : fuse.search(debouncedValue, { limit: limit ?? defaultProps.limit });

    const mapped = limited
      .map((result) => {
        const mappedMatches: MatchesByKey = {};
        result.matches?.forEach((match) => {
          if (match.key !== undefined) {
            const matchKey = match.key as keyof SearchItemData;

            mappedMatches[matchKey] = {
              indices: match.indices
                .filter(
                  // Here we exclude results that are too short and not match the search term
                  (index) => {
                    if (match.key === "title") {
                      return index[1] - index[0] >= debouncedValue.length - 1;
                    }
                    return (
                      /* index[1] - index[0] >= debouncedValue.length - 1 && */
                      result.item[matchKey]
                        .slice(index[0], index[1] + 1)
                        .toLocaleLowerCase()
                        .includes(debouncedValue.toLocaleLowerCase())
                    );
                  },
                )
                // Restrict highlights that are longer than the original search term
                .map((index) => {
                  const substr = getSubstringIndexes(result.item[matchKey], debouncedValue);
                  return !!substr ? [substr.start, substr.end] : index;
                }),
              value: match.value,
            };
          }
        });

        return {
          item: result.item,
          score: result.score,
          matches: mappedMatches,
        };
      })
      .filter((item) => Object.values(item.matches).some((match) => match.indices.length > 0));

    return mapped;
  }, [debouncedValue, fuse, limit]);

  // render related hooks
  useLayoutEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShow(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  const onClick = useCallback(() => {
    setInputValue("");
    setShow(false);
  }, []);

  return (
    <Popover open={show} onOpenChange={setShow}>
      <Command shouldFilter={false}>
        <VisuallyHidden>
          <label htmlFor={inputId}>Search Field</label>
        </VisuallyHidden>
        <PopoverTrigger asChild>
          <CommandInput
            id={inputId}
            typeof="search"
            placeholder="Type to search..."
            value={inputValue}
            className={styles.searchInput}
            onValueChange={setInputValue}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                setShow(true);
              }
              if (event.key === "Enter") {
                setShow((prev) => !prev);
              }
            }}
          />
        </PopoverTrigger>
        <PopoverAnchor />
        {results.length > 0 && (
          <Portal container={root}>
            <PopoverContent
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
              className={styles.dropdownPanel}
            >
              <CommandList className={styles.listContainer}>
                {results.map((result, idx) => {
                  return (
                    <CommandItem
                      key={`${result.item.path}-${idx}`}
                      value={result.item.title}
                      /* onSelect={() => itemRef.current?.click()} */
                    >
                      <SearchItem
                        key={`${result.item.path}-${idx}`}
                        idx={idx}
                        item={result.item}
                        matches={result.matches}
                        maxContentMatchNumber={maxContentMatchNumber}
                        onClick={onClick}
                      />
                    </CommandItem>
                  );
                })}
              </CommandList>
            </PopoverContent>
          </Portal>
        )}
      </Command>
    </Popover>
  );
};

type SearchItemProps = SearchResult & {
  idx: string | number;
  maxContentMatchNumber?: number;
  onClick?: () => void;
};

/**
 * Renders a single search result.
 * Use the `item` prop to access the data original data.
 *
 */
function SearchItem({ idx, item, matches, maxContentMatchNumber, onClick }: SearchItemProps) {
  return (
    <div key={`${item.path}-${idx}`} className={`${styles.item} ${styles.header}`}>
      <LinkNative
        to={item.path}
        onClick={onClick}
        style={{ textDecorationLine: "none", width: "100%", minHeight: "36px" }}
      >
        <div style={{ width: "100%" }}>
          <Text variant="subtitle">
            <Text variant="strong">
              {highlightText(item.title, matches?.title?.indices) || item.title}
            </Text>
          </Text>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {matches?.content?.indices &&
              formatContentSnippet(
                item.content,
                matches.content.indices,
                maxContentMatchNumber,
              ).map((snippet, snipIdx) => (
                <div key={`${item.path}-${idx}-${snipIdx}`} className={styles.snippet}>
                  <Text>{snippet}</Text>
                </div>
              ))}
          </div>
          {/* Display the number of other matches if there are any */}
          {matches?.content?.indices && (
            <Text variant="em">
              <Text variant="secondary">
                {`${pluralize(matches?.content?.indices.length, "match", "matches")} in this article`}
              </Text>
            </Text>
          )}
        </div>
      </LinkNative>
    </div>
  );
}

// --- Utilities

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
    return [start - contextRanges[idx][0], end - contextRanges[idx][1]];
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
      <Text key={`${index}-highlighted`} variant="marked">
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

function getSubstringIndexes(str: string, substr: string) {
  const start = str.indexOf(substr);
  if (start === -1) {
    return null; // Substring not found
  }
  const end = start + substr.length - 1;
  return { start, end };
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
