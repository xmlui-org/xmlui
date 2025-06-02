import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LinkNative, TextBox, VisuallyHidden, Text } from "xmlui";
import Fuse, { type RangeTuple, type FuseResult, type FuseResultMatch } from "fuse.js";
import styles from "./Search.module.scss";

type Props = {
  id?: string;
  data: Record<string, string>;
  limit?: number;
  maxContentMatchNumber?: number;
};

export const defaultProps: Pick<Props, "limit" | "maxContentMatchNumber"> = {
  limit: 10,
  maxContentMatchNumber: 3,
};

export const Search = ({
  id,
  data,
  limit = defaultProps.limit,
  maxContentMatchNumber = defaultProps.maxContentMatchNumber,
}: Props) => {
  const ref = useRef<HTMLUListElement>(null);
  const _id = useId();
  id = id || _id;
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 300);

  // render-related state
  const [show, setShow] = useState(false);
  const targetRef = useRef<HTMLInputElement>(null);

  // --- Step 1: Set parameters for the search engine
  const searchOptions = useMemo(() => {
    // Separating the title from the content produces better results
    const keys: SearchItemKeys = ["title", "content"];
    return {
      // isCaseSensitive: false,
      includeScore: true,
      // ignoreDiacritics: false,
      shouldSort: true, // <- sorts by "score"
      includeMatches: true,
      // findAllMatches: false,
      minMatchCharLength: 2,
      // location: 0,
      threshold: 0.1,
      distance: 500,
      // useExtendedSearch: false,
      // ignoreLocation: true,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys,
    };
  }, []);
  // --- Step 2: Convert data to a format better handled by the search engine
  const fuse = useMemo(() => {
    const _data = Object.entries(data).map<SearchItemData>(([path, content]) => {
      let title = "";
      const titleRegex = /^#{1,6}\s+(.+?)(?:\s+\[#.*\])?\s*$/m;
      const match = content.match(titleRegex);
      if (match) {
        title = match[1];
      } else {
        title = path.split("/").pop() || path;
      }
      return {
        path,
        title,
        // Remove title after matching, since it is in the "label"
        content: removeMarkdownFormatting(content.replace(titleRegex, "")),
      };
    });
    return new Fuse(_data, searchOptions);
  }, [data, searchOptions]);

  // --- Step 3: Execute search & post-process results
  const results: SearchResult[] = useMemo(() => {
    setShow(debouncedValue.length > 0);
    const limited = !debouncedValue
      ? []
      : fuse
          .search(debouncedValue)
          // This is to limit the number of results _per article_
          .slice(0, limit);

    const mapped = limited.map((result) => {
      const mappedMatches: MatchesByKey = {};
      result.matches?.forEach((match) => {
        if (match.key !== undefined) {
          mappedMatches[match.key as keyof SearchItemData] = {
            indices: match.indices.filter(
              // Tweak this value to limit the number of matches
              // Most matches are too short to be useful
              (index) => index[1] - index[0] >= debouncedValue.length - 1,
            ),
            value: match.value,
          };
        }
      });

      return {
        item: result.item,
        score: result.score ?? 100,
        matches: mappedMatches,
      };
    });

    // TODO: Add any additional post-processing here

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
    <div style={{ position: "relative" }}>
      <VisuallyHidden>
        <label htmlFor={id}>Search Field</label>
      </VisuallyHidden>
      <TextBox
        id={id}
        ref={targetRef}
        type="search"
        placeholder="Type to search..."
        value={inputValue}
        style={{ height: "36px", width: "280px" }}
        startIcon="search"
        onDidChange={(value) =>
          setInputValue(() => {
            fuse.search(value);
            return value;
          })
        }
        onFocus={() => setShow(true)}
      />
      {/* --- Step 4: Render results */}
      {show && results && results.length > 0 && (
        <ul ref={ref} className={styles.list}>
          {results.map((result, idx) => (
            <SearchItem
              key={`${result.item.path}-${idx}`}
              idx={idx}
              item={result.item}
              matches={result.matches}
              maxContentMatchNumber={maxContentMatchNumber}
              onClick={onClick}
            />
          ))}
        </ul>
      )}
    </div>
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
    <>
      <li key={`${item.path}-${idx}`} className={`${styles.item} ${styles.header}`}>
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
                  {`${matches?.content?.indices.length} matches in this article`}
                </Text>
              </Text>
            )}
          </div>
        </LinkNative>
      </li>
    </>
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

  const highlightRanges = ranges?.slice(0, maxContentMatchNumber);
  const contextRanges: RangeTuple[] = highlightRanges.map(([start, end]) => {
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

  return contextRanges.map(([start, end], idx) => {
    const textWithEllipsis: React.ReactNode[] = [];
    if (start > 0) {
      textWithEllipsis.push("...");
    }

    textWithEllipsis.push(highlightText(text.slice(start, end + 1), [highlightRanges[idx]]));

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

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Step 0: Remove markdown formatting
function removeMarkdownFormatting(markdown: string) {
  return (
    markdown
      // Remove code blocks
      .replace(/```\S*\n([\s\S]*?)```/g, "")
      // Remove inline code
      .replace(/`[^`]*`/g, "")
      // Remove images ![alt](url)
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // Remove links [text](url)
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      // Remove bold and italic (***, **, *, __, _)
      .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/gm, "")
      // Remove headers
      .replace(/^\s{0,3}(#{1,6})\s+/gm, "")
      // Remove horizontal rules
      .replace(/^\s{0,3}([-*_]\s?){3,}$/gm, "")
      // Remove unordered lists
      .replace(/^\s*[-+*]\s+/gm, "")
      // Remove ordered lists
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, "")
      // Remove extra spaces
      .replace(/\s{2,}/g, " ")
      // Remove explicit header anchors
      .replace(/\[#[\s\S]*\]/g, "")
      // Remove admonitions
      .replace(/\[![\s\S]*\]/g, "")
      // Remove tables
      .replace(
        /^(\s*\|.*\|.*$(?:\r?\n|\r)+\s*\|[\s:-]+\|.*$(?:\r?\n|\r)+(?:\s*\|.*\|.*$(?:\r?\n|\r)*)*)/gim,
        "",
      )
      // Trim leading/trailing whitespace
      .trim()
  );
}

type SearchItemData = { path: string; title: string; content: string };
type SearchItemKeys = (keyof SearchItemData)[];
type MatchesByKey = Partial<
  Record<keyof SearchItemData, Pick<FuseResultMatch, "indices" | "value">>
>;
type SearchResult = Omit<FuseResult<SearchItemData>, "refIndex" | "matches"> & {
  matches: MatchesByKey;
};
