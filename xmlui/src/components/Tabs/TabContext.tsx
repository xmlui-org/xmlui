import { createContext, useContext, useMemo, useState } from "react";
import produce from "immer";

import { EMPTY_ARRAY } from "../../components-core/constants";
import type { Tab } from "../abstractions";

type TabItem = Tab & { id: string };
export const TabContext = createContext({
  register: (tabItem: TabItem) => {},
  unRegister: (id: string) => {},
  activeTabId: "",
});

export function useTabContextValue() {
  const [tabItems, setTabItems] = useState(EMPTY_ARRAY);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const tabContextValue = useMemo(() => {
    return {
      register: (column: TabItem) => {
        setTabItems(
          produce((draft) => {
            const existing = draft.findIndex((col) => col.id === column.id);
            if (existing < 0) {
              draft.push(column);
            } else {
              draft[existing] = column;
            }
          }),
        );
      },
      unRegister: (id: string) => {
        setTabItems(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
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
