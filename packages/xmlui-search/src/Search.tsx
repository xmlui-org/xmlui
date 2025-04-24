import { useEffect, useMemo, useState } from "react";
import Fuse, { FuseResult } from "fuse.js";
import staticData from "./static-content";

const fuseOptions = {
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
  keys: ["value"],
};

type Props = {
  data: any;
  limit?: number;
};

const defaultProps: Pick<Props, "limit"> = {
  limit: 10,
};

export const Search = ({ data, limit = defaultProps.limit }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const fuse = useMemo(() => {
    return new Fuse(/* data */ staticData, fuseOptions);
  }, [data]);

  // FuseResult<{ item: { key: string, value: string } }>[]
  const results: any[] = debouncedValue
    ? fuse
        .search(debouncedValue)
        .map((result) => {
          //console.log(result);
          return result;
        })
        .slice(0, limit)
    : [];

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
    <div>
      <input
        type="search"
        placeholder="Type to search..."
        value={inputValue}
        onChange={(e) =>
          setInputValue(() => {
            fuse.search(e.target.value);
            return e.target.value;
          })
        }
      />
      <ul>
        {results.map((result) => {
          return (
            <li key={result.item.key} style={{ paddingBottom: "4px" }}>
              <strong>Match indices length:</strong> {result.matches?.[0].indices.length} <br />
              <strong>First X num of characters:</strong> {result.item.value.slice(0, 200)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
