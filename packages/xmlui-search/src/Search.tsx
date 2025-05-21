import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LocalLink, AutoComplete, TextBox, VisuallyHidden } from "xmlui";
import Fuse, { type FuseResult } from "fuse.js";

type Props = {
  id?: string;
  data: any;
  limit?: number;
};

export const defaultProps: Pick<Props, "limit"> = {
  limit: 10,
};

type SearchItem = { path: string; content: string };
type SearchResult = FuseResult<SearchItem>;

export const Search = ({ id, data, limit = defaultProps.limit }: Props) => {
  const _id = useId();
  id = id || _id;
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [show, setShow] = useState(false);

  const searchOptions = useMemo(() => {
    return {
      // isCaseSensitive: false,
      // includeScore: false,
      // ignoreDiacritics: false,
      // shouldSort: true,
      includeMatches: true,
      // findAllMatches: false,
      // minMatchCharLength: 1,
      // location: 0,
      // threshold: 0.6,
      // distance: 100,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys: ["path", "content"],
    };
  }, []);

  const fuse = useMemo(() => {
    const _data = Object.entries(data).map(
      ([path, content]) =>
        ({
          path,
          content,
        }) as SearchItem,
    );
    return new Fuse(_data, searchOptions);
  }, [data, searchOptions]);

  const results: SearchResult[] = useMemo(() => {
    setShow(debouncedValue.length > 0);
    return debouncedValue
      ? fuse
          .search(debouncedValue)
          ?.map((result) => {
            // placeholder if we need to transform data
            return result;
          })
          ?.slice(0, limit)
      : [];
  }, [debouncedValue, fuse, limit]);

  //console.log(debouncedValue, " results: ", results);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 500);

    // Cleanup timeout if inputValue changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  return (
    <form role="search" style={{ position: "relative" }}>
      <VisuallyHidden>
        <label htmlFor={id}>Search Field</label>
      </VisuallyHidden>
      <TextBox
        id={id}
        type="search"
        placeholder="Type to search..."
        value={inputValue}
        style={{ height: "30px" }}
        startIcon="search"
        onDidChange={(value) =>
          setInputValue(() => {
            fuse.search(value);
            return value;
          })
        }
        onFocus={() => setShow(true)}
      />
      {/* !!!!TEMP!!!! */}
      {show && results && results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 1,
            padding: "12px",
            backgroundColor: "var(--xmlui-color-surface-0)",
            border: "1px solid var(--xmlui-color-secondary-900)",
            borderRadius: "4px",
          }}
        >
          {results.map((result) => {
            return (
              <li key={result.item.path} style={{ paddingBottom: "8px", listStyle: "none" }}>
                <LocalLink to={result.item.path} onClick={() => setShow(false)}>
                  {result.item.path.split("/").pop()}
                </LocalLink>
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
};
