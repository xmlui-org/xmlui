import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LocalLink, TextBox, VisuallyHidden, Text } from "xmlui";
import Fuse, { type RangeTuple, type FuseResult } from "fuse.js";
import styles from "./Search.module.scss";

type Props = {
  id?: string;
  data: Record<string, string>;
  limit?: number;
};

export const defaultProps: Pick<Props, "limit"> = {
  limit: 10,
};

type SearchItem = { path: string; title: string; content: string };
type SearchItemKeys = (keyof SearchItem)[];
type SearchResult = Omit<FuseResult<SearchItem>, "refIndex" | "matches"> & {
  key: string;
  matches: ReadonlyArray<RangeTuple>;
};

export const Search = ({ id, data, limit = defaultProps.limit }: Props) => {
  const _id = useId();
  id = id || _id;
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 300);

  // render-related state
  const [show, setShow] = useState(false);
  const targetRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(0);
  const updateWidth = () => {
    if (targetRef.current) {
      setWidth(targetRef.current.offsetWidth);
    }
  };

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
  const fuse = useMemo(() => {
    // --- Step 1: Convert data to a format better handled by the search engine
    const _data = Object.entries(data).map<SearchItem>(([path, content]) => {
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

  // --- Step 2: Execute search engine search & post-process results
  const results: SearchResult[] = useMemo(() => {
    setShow(debouncedValue.length > 0);
    const limited = !debouncedValue
      ? []
      : fuse
          .search(debouncedValue)
          // The limit is used here to limit the number of results _per article_
          .slice(0, limit);

    const mapped = limited.flatMap((result) => {
      const keysExpanded = result.matches
        ?.map((match) => {
          return {
            item: result.item,
            score: result.score,
            key: match.key || "",
            matches: match.indices ?? [],
          };
        }) ?? [
        {
          item: result.item,
          score: result.score,
          key: "",
          matches: [],
        },
      ];

      return keysExpanded;
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

  useLayoutEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
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
      {/* --- Step 3: Render results */}
      {show && results && results.length > 0 && (
        <ul className={styles.list} style={{ width: width + "px" }}>
          {results.map((result, idx) => {
            if (result.key === "title") {
              return (
                <li key={`${result.item.path}-${idx}`} className={styles.item}>
                  <LocalLink
                    to={result.item.path}
                    onClick={onClick}
                    style={{ textDecorationLine: "none", width: "100%", minHeight: "36px" }}
                  >
                    <Text variant="subtitle">
                      {highlightText(result.item.title, result.matches) || result.item.title}
                    </Text>
                  </LocalLink>
                </li>
              );
            }

            const snippets = formatContentSnippet(result.item.content, result.matches);
            return snippets.map((snippet, snipIdx) => (
              <li
                key={`${result.item.path}-${idx}-${snipIdx}`}
                className={`${styles.item} ${styles.snippet}`}
              >
                <LocalLink
                  to={result.item.path}
                  onClick={onClick}
                  style={{ textDecorationLine: "none", width: "100%", minHeight: "36px" }}
                >
                  <Text>{snippet}</Text>
                </LocalLink>
              </li>
            ));
          })}
        </ul>
      )}
    </div>
  );
};

/**
 * Formats a snippet of text. Determine which ranges are highlighted and how big the snippet is.
 */
function formatContentSnippet(text: string, ranges?: readonly RangeTuple[]) {
  if (!ranges || ranges.length === 0) return [text.slice(0, 100)];
  const contextLength = 50;

  const highlightRanges = ranges?.slice(0, 3);
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
    return highlightText(text.slice(start, end + 1), [highlightRanges[idx]]);
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

// --- TODO: Graveyard, will remove later

/* function highlight(fuseSearchResult: any, highlightClassName: string = 'highlight') {
  const set = (obj: object, path: string, value: any) => {
      const pathValue = path.split('.');
      let i;

      for (i = 0; i < pathValue.length - 1; i++) {
        obj = obj[pathValue[i]];
      }

      obj[pathValue[i]] = value;
  };

  const generateHighlightedText = (inputText: string, regions: number[] = []) => {
    let content = '';
    let nextUnhighlightedRegionStartingIndex = 0;

    regions.forEach(region => {
      const lastRegionNextIndex = region[1] + 1;

      content += [
        inputText.substring(nextUnhighlightedRegionStartingIndex, region[0]),
        `<span class="${highlightClassName}">`,
        inputText.substring(region[0], lastRegionNextIndex),
        '</span>',
      ].join('');

      nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
    });

    content += inputText.substring(nextUnhighlightedRegionStartingIndex);

    return content;
  };

  return fuseSearchResult
    .filter(({ matches }: any) => matches && matches.length)
    .map(({ item, matches }: any) => {
      const highlightedItem = { ...item };

      matches.forEach((match: any) => {
        set(highlightedItem, match.key, generateHighlightedText(match.value, match.indices));
      });

      return highlightedItem;
    });
}; */

/* <AutoComplete
        id={id}
        placeholder="Type to search..."
        value={inputValue}
        style={{ height: "30px" }}
        onDidChange={(value) =>
          setInputValue(() => {
            fuse.search(value);
            return value;
          })
        }
        onFocus={() => setShow(true)}
      >
        {results &&
          results.map((result) => {
            return (
              <OptionNative
                key={result.item.path}
                value={result.item.path}
                label={result.item.path.split("/").pop()}
                labelText={result.item.path.split("/").pop()}
              />
            );
          })}
      </AutoComplete> */
/* <DropdownMenu
        triggerTemplate={
          <TextBox
            id={id}
            ref={targetRef}
            type="search"
            placeholder="Type to search..."
            value={inputValue}
            style={{ height: "30px", width: "280px" }}
            startIcon="search"
            onDidChange={(value) =>
              setInputValue(() => {
                fuse.search(value);
                return value;
              })
            }
          />
        }
        style={{ height: "30px", width: "280px" }}
      >
        {results.map((result) => {
            let label = "";
            const match = result.item.content.match(/^#{1,6}\s+(.+?)(?:\s+\[#.*\])?\s*$/m);
            if (match) {
              label = match[1];
            } else {
              label = result.item.path.split("/").pop() || "";
            }
            return (
              <MenuItem key={result.item.path}>
                <LocalLink
                  to={result.item.path}
                  onClick={() => { setShow(false); setInputValue(""); }}
                  style={{ textDecorationLine: "none" }}
                >
                  {label}
                </LocalLink>
              </MenuItem>
            );
          })}
      </DropdownMenu> */

/* function partition<T>(array: Array<T>, discriminator: (v: T) => boolean) {
  return array.reduce(
    ([pass, fail], elem) => {
      return discriminator(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[] as T[], [] as T[]],
  );
} */

// {show && results && results.length > 0 && (
//         <ul className={styles.list} style={{ width: width + "px" }}>
//           {results.map((result, idx) => {
//             const [titleIndexes, contentIndexes] = partition(
//               // @ts-ignore
//               result.matches ?? [],
//               (match) => match.key === "label",
//             );

//             const title =
//               titleIndexes.length === 0
//                 ? result.item.label
//                 : titleIndexes.map((match) => highlightText(result.item.label, match.indices));

//             const content: React.ReactNode[] = contentIndexes.map((match) => {
//               const contentToDisplay = Math.min(200, result.item.content.length);
//               /* const [inContent, restContent] = partition(
//                 // @ts-ignore
//                 match.indices,
//                 (idx) => idx[1] <= contentToDisplay,
//               ); */
//               const inContent = match.indices;
//               if (inContent.length === 0) return null;
//               //const startIdx = inContent[0][0];
//               return (
//                 <Text key={"content"}>
//                   {highlightText(result.item.content, inContent)}
//                   {contentToDisplay < result.item.content.length && "..."}
//                 </Text>
//               );
//             });

//             return (
//               <Fragment key={result.item.path}>
//                 {title && (
//                   <li key={`${result.item.path}-title`} className={styles.item}>
//                     <Text>
//                       Title:{" "}
//                       <LocalLink
//                         to={result.item.path}
//                         onClick={onClick}
//                         style={{ textDecorationLine: "none" }}
//                       >
//                         <Text>{title}</Text>
//                       </LocalLink>
//                     </Text>
//                   </li>
//                 )}
//                 {/* {content && content.length > 0 && (
//                   <li key={`${result.item.path}-content`} className={styles.item}>
//                     {content}
//                   </li>
//                 )} */}
//                 {/* idx < results.length - 1 && <div className={styles.divider} /> */}
//               </Fragment>
//             );
//           })}
//         </ul>
//       )}
