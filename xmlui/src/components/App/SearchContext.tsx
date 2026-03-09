import { createContext, useContextSelector } from "use-context-selector";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { useAppContext } from "../../components-core/AppContext";
import { useSsgEnv } from "../../components-core/rendering/SsgEnvContext";

export type SearchItemData = { path: string; title: string; content: string; category?: string };

// NOTE: SEARCH_CATEGORIES and SEARCH_DEFAULT_CATEGORY are intentionally duplicated in
// xmlui/bin/ssg.ts for use during the SSG build. If you change these values, update both.
export const SEARCH_CATEGORIES = ["docs", "blog", "news", "get-started"] as const;
export const SEARCH_DEFAULT_CATEGORY = "other";

type ISearchContext = {
  content: Record<string, SearchItemData>;
  storeContent: ({ path, title, content, category }: SearchItemData) => void;
  isIndexing: boolean;
  setIsIndexing: (isIndexing: boolean) => void;
  loadedExternalIndex: boolean;
};

const SearchContext = createContext<ISearchContext | null>(null);

export const SearchContextProvider = ({ children }) => {
  const appContext = useAppContext();
  const ssgEnv = useSsgEnv();
  const [content, setContent] = useState<Record<string, SearchItemData>>(EMPTY_OBJECT);
  const [isIndexing, setIsIndexing] = useState(true);
  const [loadedExternalIndex, setLoadedExternalIndex] = useState(false);

  useEffect(() => {
    if (!appContext.appGlobals?.searchIndexEnabled || !ssgEnv?.searchIndexFile) {
      return;
    }

    fetch(`/${ssgEnv.searchIndexFile}`)
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
        setLoadedExternalIndex(true);
      })
      .catch(() => {
        // Pre-built index not available (e.g. dev server) — SearchIndexCollector will run instead.
      });
  }, [appContext.appGlobals?.searchIndexEnabled, ssgEnv]);

  const storeContent = useCallback((entry: SearchItemData) => {
    setContent((prevContent) => ({
      ...prevContent,
      [entry.path]: entry,
    }));
  }, []);

  const value = useMemo(
    () => ({
      content,
      storeContent,
      isIndexing,
      setIsIndexing,
      loadedExternalIndex,
    }),
    [content, loadedExternalIndex, isIndexing, storeContent],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
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

export const useSearchContextLoadedExternalIndex = () => {
  return useContextSelector(SearchContext, (value) => value?.loadedExternalIndex ?? false);
};
