import { createContext, type ReactNode, useContext } from "react";
import type { Accordion } from "@components/abstractions";

export type AccordionItem = Accordion & {
  id: string;
  headerRenderer?: (header: string) => ReactNode;
  expanded?: boolean;
  doExpand?: () => void;
  doCollapse?: () => void;
  doToggle?: () => void;
};
export const AccordionContext = createContext({
  expandItem: (id: string) => {},
  collapseItem: (id: string) => {},
  register: (accordionItem: AccordionItem) => {},
  unRegister: (id: string) => {},
  hideIcon: false,
  expandedIcon: "chevronup",
  collapsedIcon: "chevrondown",
  triggerPosition: "end",
});

export function useAccordionContext() {
  return useContext(AccordionContext);
}
