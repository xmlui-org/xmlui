import { createContext, useContextSelector } from "use-context-selector";
import { useCallback, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "../../components-core/constants";

export type SearchItemData = { path: string; title: string; content: string; category?: string };

export const SEARCH_CATEGORIES = ["docs", "blog", "news", "get-started"] as const;
export const SEARCH_DEFAULT_CATEGORY = "other";

type ISearchContext = {
  content: Record<string, SearchItemData>;
  storeContent: ({ path, title, content, category }: SearchItemData) => void;
  isIndexing: boolean;
  setIsIndexing: (isIndexing: boolean) => void;
};

const SearchContext = createContext<ISearchContext | null>(null);

export const SearchContextProvider = ({children})=>{
  const [content, setContent] = useState<Record<string, SearchItemData>>(EMPTY_OBJECT);
  const [isIndexing, setIsIndexing] = useState(true);
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
    setIsIndexing
  }), [content, isIndexing, storeContent]);

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

