import { createContext, useContext } from "react";

export type HeadingItem = {
  id: string;
  level: number;
  text: string;
  anchor: HTMLElement | null;
};

type ActiveAnchorChangedCallback = (id: string) => void;

export type TableOfContentsContextValue = {
  headings: HeadingItem[];
  registerHeading: (headingItem: HeadingItem) => void | (() => void);
  hasTableOfContents: boolean;
  scrollToAnchor: (id: string, smoothScrolling: boolean) => void;
  subscribeToActiveAnchorChange: (callback: ActiveAnchorChangedCallback) => () => void;
  activeAnchorId: string | null;
};

export const TableOfContentsContext = createContext<TableOfContentsContextValue | null>(null);

export function useTableOfContents() {
  const context = useContext(TableOfContentsContext);
  if (!context) {
    throw new Error("The TableOfContents component can only be used inside a Page component.");
  }
  return context;
}
