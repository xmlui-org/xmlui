import { createContext, type ReactNode, useContext } from "react";

import type { Accordion } from "../../components/abstractions";
import { noop } from "../../components-core/constants";

export type AccordionItem = Accordion & {
  id: string;
  headerRenderer?: (header: string) => ReactNode;
};

type AccordionContextDefinition = {
  rotateExpanded: string;
  expandItem: (id: string) => void;
  register: (id: string) => void;
  unRegister: (id: string) => void;
  expandedItems: string[];
  hideIcon: boolean;
  expandedIcon: string;
  collapsedIcon: string;
  triggerPosition: "start" | "end";
};

export const AccordionContext = createContext<AccordionContextDefinition>({
  expandedItems: null,
  rotateExpanded: null,
  expandItem: noop,
  register: noop,
  unRegister: noop,
  hideIcon: null,
  expandedIcon: null,
  collapsedIcon: null,
  triggerPosition: null,
});

export function useAccordionContext() {
  return useContext(AccordionContext);
}
