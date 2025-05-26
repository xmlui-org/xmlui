import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LocalLink, TextBox, VisuallyHidden } from "xmlui";
import Fuse, { type FuseResult } from "fuse.js";
import styles from "./Search.module.scss";

type Props = {
  id?: string;
  data: Record<string, string>;
  limit?: number;
};

export const defaultProps: Pick<Props, "limit"> = {
  limit: 10,
};

type SearchItem = { path: string, label: string; content: string };
type SearchResult = FuseResult<SearchItem>;

export const Search = ({ id, data, limit = defaultProps.limit }: Props) => {
  const _id = useId();
  id = id || _id;
  const [inputValue, setInputValue] = useState("");
  const [show, setShow] = useState(false);

  const targetRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(0);
  const updateWidth = () => {
    if (targetRef.current) {
      setWidth(targetRef.current.offsetWidth);
    }
  };

  const searchOptions = useMemo(() => {
    return {
      // isCaseSensitive: false,
      // includeScore: false,
      // ignoreDiacritics: false,
      shouldSort: true,
      // includeMatches: true,
      // findAllMatches: false,
      // minMatchCharLength: 2,
      // location: 0,
      threshold: 0.4,
      // distance: 100,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      // ignoreFieldNorm: false,
      // fieldNormWeight: 1,
      keys: ["label", "content"],
    };
  }, []);

  const fuse = useMemo(() => {
    const _data = Object.entries(data).map<SearchItem>(
      ([path, content]) => {
        let label = "";
        const match = content.match(/^#{1,6}\s+(.+?)(?:\s+\[#.*\])?\s*$/m);
        if (match) {
          label = match[1];
        } else {
          label = path.split("/").pop() || path;
        }
        return {
          path,
          label,
          content,
        };
      }
    );
    return new Fuse(_data, searchOptions);
  }, [data, searchOptions]);

  const results: SearchResult[] = useMemo(() => {
    setShow(inputValue.length > 0);
    return inputValue
      ? fuse
          .search(inputValue)
          ?.map((result) => {
            // placeholder if we need to transform data
            return result;
          })
          ?.slice(0, limit)
      : [];
  }, [inputValue, fuse, limit]);

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
      {show && results && results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 1,
            padding: "0",
            marginTop: "2px",
            backgroundColor: "var(--xmlui-color-surface-0)",
            border: "1px solid var(--xmlui-color-surface-500)",
            borderEndStartRadius: "4px",
            borderEndEndRadius: "4px",
            width: width + "px",
          }}
        >
          {results.map((result) => {
            return (
              <li key={result.item.path} className={styles.item}>
                <LocalLink
                  to={result.item.path}
                  onClick={onClick}
                  style={{ textDecorationLine: "none" }}
                >
                  {result.item.label}
                </LocalLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

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
