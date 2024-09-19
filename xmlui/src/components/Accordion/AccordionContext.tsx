import { createContext, useContext } from "react";
import type { Accordion } from "@components/abstractions";

export type AccordionItem = Accordion & { id: string };
export const AccordionContext = createContext({
  registerOrUpdate: (accordionItem: AccordionItem) => {},
  unRegister: (id: string) => {},
  hideIcon: false,
  expandedIcon: "chevronup",
  collapsedIcon: "chevrondown",
  triggerPosition: "end",
});

export function useAccordionContext() {
  return useContext(AccordionContext);
}
