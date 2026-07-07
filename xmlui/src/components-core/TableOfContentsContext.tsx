import { createContext, useContext, type ReactNode } from "react";

type HeadingItem = {
  id: string;
  level: number;
  text: string;
  anchor: HTMLElement | null;
};

type TableOfContentsContextValue = {
  headings: HeadingItem[];
  registerHeading: (headingItem: HeadingItem) => void | (() => void);
  hasTableOfContents: boolean;
  scrollToAnchor: (id: string, smoothScrolling: boolean) => void;
  subscribeToActiveAnchorChange: (callback: (id: string) => void) => () => void;
  activeAnchorId: string | null;
};

export const TableOfContentsContext = createContext<TableOfContentsContextValue | null>(null);

export function TableOfContentsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTableOfContents() {
  return useContext(TableOfContentsContext);
}
