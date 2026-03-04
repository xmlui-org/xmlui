import { createContext, useContextSelector } from "use-context-selector";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "../../components-core/constants";

export type SearchItemData = { path: string; title: string; content: string; category?: string };

// NOTE: SEARCH_CATEGORIES and SEARCH_DEFAULT_CATEGORY are intentionally duplicated in
// xmlui/bin/ssg.ts for use during the SSG build. If you change these values, update both.
export const SEARCH_CATEGORIES = ["docs", "blog", "news", "get-started"] as const;
export const SEARCH_DEFAULT_CATEGORY = "other";

const SSG_SEARCH_INDEX_URL = "/__xmlui-search-index.json";

type ISearchContext = {
  content: Record<string, SearchItemData>;
  storeContent: ({ path, title, content, category }: SearchItemData) => void;
  isIndexing: boolean;
  setIsIndexing: (isIndexing: boolean) => void;
  hydrated: boolean;
};

const SearchContext = createContext<ISearchContext | null>(null);

export const SearchContextProvider = ({children})=>{
  const [content, setContent] = useState<Record<string, SearchItemData>>(EMPTY_OBJECT);
  const [isIndexing, setIsIndexing] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch(SSG_SEARCH_INDEX_URL)
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<SearchItemData[]>;
      })
      .then((entries) => {
        if (!entries) return;
        const map: Record<string, SearchItemData> = {};
        for (const entry of entries) {
          map[entry.path] = entry;
        }
        setContent(map);
        setIsIndexing(false);
        setHydrated(true);
      })
      .catch(() => {
        // Pre-built index not available (e.g. dev server) — SearchIndexCollector will run instead.
      });
  }, []);

  const storeContent = useCallback((entry: SearchItemData) => {
    setContent((prevContent) => ({
      ...prevContent,
      [entry.path]: entry,
    }));
  }, []);

  const value = useMemo(()=>({
    content,
    storeContent,
    isIndexing,
    setIsIndexing,
    hydrated,
  }), [content, hydrated, isIndexing, storeContent]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
};

export const useSearchContextUpdater = () => {
  return useContextSelector(SearchContext, (value) => value.storeContent);
};

export const useSearchContextContent = () => {
  return useContextSelector(SearchContext, (value) => value?.content);
};

export const useSearchContextSetIndexing = () => {
  return useContextSelector(SearchContext, (value) => value.setIsIndexing);
};

export const useSearchContextHydrated = () => {
  return useContextSelector(SearchContext, (value) => value?.hydrated ?? false);
};

