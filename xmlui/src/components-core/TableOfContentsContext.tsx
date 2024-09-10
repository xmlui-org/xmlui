import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import scrollIntoView from "scroll-into-view-if-needed";

type HeadingItem = {
  id: string;
  level: number;
  text: string;
  anchor: HTMLAnchorElement | null;
};

interface ITableOfContentsContext {
  headings: HeadingItem[];
  registerHeading: (headingItem: HeadingItem) => void;
  observeIntersection: boolean;
  setObserveIntersection: (observe: boolean) => void;
  activeAnchorId: string | null;
  setActiveAnchorId: (id: string) => void;
}

export const TableOfContentsContext = createContext<ITableOfContentsContext | null>(null);

export function TableOfContentsProvider({ children }: { children: React.ReactNode }) {
  const [headings, setHeadings] = useState<Record<string, HeadingItem>>({});
  const [observeIntersection, setObserveIntersection] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const initialHeading = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (observeIntersection) {
      const handleObserver = (entries: any) => {
        entries.forEach((entry: any) => {
          if (entry?.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      };
      observer.current = new IntersectionObserver(handleObserver, {
        rootMargin: "0px 0px -50%",
        threshold: [0, 1],
      });

      Object.values(headings).forEach((elem) => observer?.current?.observe?.(elem.anchor!));
      return () => observer.current?.disconnect();
    }
  }, [headings, observeIntersection]);

  const registerHeading = useCallback((headingItem: HeadingItem) => {
    setHeadings((prevHeadings) => {
      return {
        ...prevHeadings,
        [headingItem.id]: headingItem,
      };
    });

    return () => {
      setHeadings((prevHeadings) => {
        const newHeadings = { ...prevHeadings };
        delete newHeadings[headingItem.id];
        return newHeadings;
      });
    }
  }, []);

  const setActiveAnchorId = useCallback(
    (id: string) => {
      if (headings[id]) {
        setActiveId(id);
      }
    },
    [headings],
  );

  const sortedHeadings = useMemo(() => {
    return Object.values(headings).sort(function(a,b) {
      if( a.anchor === b.anchor) return 0;
      if( a.anchor.compareDocumentPosition(b.anchor) & Node.DOCUMENT_POSITION_PRECEDING) {
        // b comes before a
        return 1;
      }
      return -1;
    })
  }, [headings]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      if (initialHeading?.current) {
        return;
      } else {
        initialHeading.current = sortedHeadings.find((value) => `#${value.id}` === hash)?.anchor;
        if (initialHeading.current) {
          scrollIntoView(initialHeading.current, {
            block: "start",
            inline: "start",
            behavior: "instant",
            scrollMode: "always",
          });
        }
      }
    }
  }, [sortedHeadings]);

  const contextValue: ITableOfContentsContext = useMemo(() => {
    return {
      registerHeading,
      headings: sortedHeadings,
      observeIntersection,
      setObserveIntersection,
      activeAnchorId: activeId,
      setActiveAnchorId,
    };
  }, [registerHeading, sortedHeadings, observeIntersection, activeId, setActiveAnchorId]);

  return <TableOfContentsContext.Provider value={contextValue}>{children}</TableOfContentsContext.Provider>;
}

export function useTableOfContents() {
  const context = useContext(TableOfContentsContext);

  if (!context) {
    throw new Error("useTableOfContents must be used within a TableOfContentsProvider");
  }

  return context;
}
