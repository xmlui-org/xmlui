import { createContext, useCallback, useContext, useMemo, useState } from "react";
import produce from "immer";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { Accordion } from "@components/abstractions";

type AccordionItem = Accordion & { id: string };
export const AccordionContext = createContext({
  register: (accordionItem: AccordionItem) => {},
  unRegister: (id: string) => {},
  hideIcon: false,
  expandedIcon: "chevronup",
  collapsedIcon: "chevrondown",
  triggerPosition: "end",
  activeItems: [],
  setAccordionActive: (id: string) => {},
});

export function useAccordionContextValue() {
  const [accordionItems, setAccordionItems] = useState(EMPTY_ARRAY);
  const [activeItems, setActiveItems] = useState([]);

  const register = useCallback(
    (column: AccordionItem) => {
      setAccordionItems(
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
    [setAccordionItems],
  );

  const unRegister = useCallback(
    (id: string) => {
      setAccordionItems(
        produce((draft) => {
          return draft.filter((col) => col.id !== id);
        }),
      );
    },
    [setAccordionItems],
  );

  const setAccordionActive = useCallback(
    (id: string) => {
      setActiveItems((prev) => {
        const index = prev.indexOf(id);
        if (index < 0) {
          return [...prev, id];
        }
        return prev.filter((item) => item !== id);
      });
    },
    [setActiveItems],
  );

  return {
    setAccordionActive,
    accordionItems,
    register,
    unRegister,
    activeItems,
  };
}

export function useAccordionContext() {
  return useContext(AccordionContext);
}
