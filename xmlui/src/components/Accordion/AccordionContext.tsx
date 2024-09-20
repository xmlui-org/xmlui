import { createContext, type ReactNode, useContext } from "react";
import type { Accordion } from "@components/abstractions";

export type AccordionItem = Accordion & {
  id: string;
  headerRenderer?: (header: string) => ReactNode;
};

type AccordionContextDefinition = {
  register: (id: string, el: HTMLButtonElement) => void;
  unRegister: (id: string) => void;
  expandedItems: string[];
  hideIcon: boolean;
  expandedIcon: string;
  collapsedIcon: string;
  triggerPosition: "start" | "end";
};

export const AccordionContext = createContext<AccordionContextDefinition>({
  expandedItems: [],
  register: () => {},
  unRegister: () => {},
  hideIcon: null,
  expandedIcon: null,
  collapsedIcon: null,
  triggerPosition: null,
});

export function useAccordionContext() {
  return useContext(AccordionContext);
}
