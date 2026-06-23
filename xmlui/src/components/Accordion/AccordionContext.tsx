import { createContext, useContext } from "react";

export type AccordionContextValue = {
  collapsedIcon?: string;
  expandedIcon?: string;
  expandedItems: string[];
  expandItem: (id: string) => void;
  hideIcon: boolean;
  isExpanded: (id: string) => boolean;
  registerItem: (id: string, initiallyExpanded: boolean) => void;
  rotateExpanded: string;
  toggleItem: (id: string) => void;
  triggerPosition: "start" | "end";
};

export const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

export function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be rendered inside Accordion.");
  }
  return context;
}
