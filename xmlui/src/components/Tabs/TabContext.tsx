import { createContext, useContext, useMemo, useState } from "react";
import produce from "immer";

import { EMPTY_ARRAY } from "../../components-core/constants";
import type { Tab } from "../abstractions";

type TabItem = Tab & { innerId: string };

interface ITabContext{
  register: (tabItem: TabItem) => void;
  unRegister: (innerId: string) => void;
  activeTabId: string;
}
export const TabContext = createContext<ITabContext>({
  register: (tabItem) => {},
  unRegister: (innerId: string) => {},
  activeTabId: "",
});

export function useTabContextValue() {
  const [tabItems, setTabItems] = useState<TabItem[]>(EMPTY_ARRAY);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const tabContextValue = useMemo(() => {
    return {
      register: (tabItem: TabItem) => {
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
      },
      unRegister: (innerId: string) => {
        setTabItems(
          produce((draft) => {
            return draft.filter((col) => col.innerId !== innerId);
          }),
        );
      },
      activeTabId,
      setActiveTabId,
    };
  }, [activeTabId]);

  return {
    tabItems,
    tabContextValue,
  };
}

export function useTabContext() {
  return useContext(TabContext);
}
