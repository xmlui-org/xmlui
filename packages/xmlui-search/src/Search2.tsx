import { useCallback, useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import staticData from "./static-content";
import { RegisterComponentApiFn } from "xmlui";

const fuseOptions = {
  // isCaseSensitive: false,
  // includeScore: false,
  // ignoreDiacritics: false,
  // shouldSort: true,
  // includeMatches: false,
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
  registerComponentApi?: RegisterComponentApiFn;
};

const defaultProps: Pick<Props, "limit"> = {
  limit: 10,
};

export const Search2 = ({ data, registerComponentApi, limit = defaultProps.limit }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const fuse = useMemo(() => {
    return new Fuse(/* data */ staticData, fuseOptions);
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(() => {
        return inputValue;
      });
    }, 500);

    // Cleanup timeout if inputValue changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const setValue = useCallback(
    (value: string) => {
      setInputValue(value);
    },
    [inputValue],
  );

  const getResults = useCallback(() => {
    if (!debouncedValue) {
      return [];
    }
    const asd = fuse
      .search(debouncedValue)
      .map((result) => result.item)
      .slice(0, limit);
    return asd;
  }, [debouncedValue]);

  useEffect(() => {
    registerComponentApi?.({
      getResults,
      setValue,
    });
  }, [registerComponentApi]);

  return null;
};
