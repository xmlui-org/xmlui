import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import produce from "immer";

import { EMPTY_ARRAY } from "../../components-core/constants";
import type { Tab } from "../abstractions";

type TabItem = Tab & { innerId: string };

interface ITabContext{
  register: (tabItem: TabItem) => void;
  unRegister: (innerId: string) => void;
  activeTabId: string;
  getTabItems: () => TabItem[];
}
export const TabContext = createContext<ITabContext>({
  register: (tabItem) => {},
  unRegister: (innerId: string) => {},
  activeTabId: "",
  getTabItems: () => [],
});

export function useTabContextValue() {
  const [tabItems, setTabItems] = useState<TabItem[]>(EMPTY_ARRAY);
  const tabItemsRef = useRef<TabItem[]>(EMPTY_ARRAY);
  tabItemsRef.current = tabItems;
  
  const [activeTabId, setActiveTabId] = useState<string>("");
  
  const register = useCallback((tabItem: TabItem) => {
    setTabItems(
      produce((draft) => {
        const existing = draft.findIndex((col) => col.innerId === tabItem.innerId);
        if (existing < 0) {
          draft.push(tabItem);
        } else {
          draft[existing] = tabItem;
        }
      }),
    );
  }, []);
  
  const unRegister = useCallback((innerId: string) => {
    setTabItems(
      produce((draft) => {
        return draft.filter((col) => col.innerId !== innerId);
      }),
    );
  }, []);
  
  const getTabItems = useCallback(() => {
    return tabItemsRef.current;
  }, []);
  
  const tabContextValue = useMemo(() => {
    return {
      register,
      unRegister,
      activeTabId,
      setActiveTabId,
      getTabItems,
    };
  }, [register, unRegister, activeTabId, getTabItems]);

  return {
    tabItems,
    tabContextValue,
  };
}

export function useTabContext() {
  return useContext(TabContext);
}
