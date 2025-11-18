import { createContext, useContextSelector } from "use-context-selector";
import { useCallback, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "../../components-core/constants";

type SearchEntry = { path: string; title: string; content: string };

type ISearchContext = {
  content: Record<string, SearchEntry>;
  storeContent: ({ path, title, content }: SearchEntry) => void;
  isIndexing: boolean;
  setIsIndexing: (isIndexing: boolean) => void;
};

const SearchContext = createContext<ISearchContext | null>(null);

export const SearchContextProvider = ({children})=>{
  const [content, setContent] = useState<Record<string, SearchEntry>>(EMPTY_OBJECT);
  const [isIndexing, setIsIndexing] = useState(true);
  const storeContent = useCallback((entry: SearchEntry) => {
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

