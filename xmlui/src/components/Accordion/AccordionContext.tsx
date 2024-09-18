import { createContext, useContext, useMemo, useState } from "react";
import produce from "immer";
import { EMPTY_ARRAY } from "@components-core/constants";
import type { Accordion } from "@components/abstractions";

type AccordionItem = Accordion & { id: string };
export const AccordionContext = createContext({
  register: (accordionItem: AccordionItem) => {},
  unRegister: (id: string) => {},
});

export function useAccordionContextValue() {
  const [accordionItems, setAccordionItems] = useState(EMPTY_ARRAY);
  const accordionContextValue = useMemo(() => {
    return {
      register: (column: AccordionItem) => {
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
      unRegister: (id: string) => {
        setAccordionItems(
          produce((draft) => {
            return draft.filter((col) => col.id !== id);
          }),
        );
      },
    };
  }, [setAccordionItems]);

  return {
    accordionItems,
    accordionContextValue,
  };
}

export function useAccordionContext() {
  return useContext(AccordionContext);
}
