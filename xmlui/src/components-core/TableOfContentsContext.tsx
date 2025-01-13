import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import scrollIntoView from "scroll-into-view-if-needed";

// --- Stores the information about a particular heading to be displeyed in the TOC.
type HeadingItem = {
  // --- The id of the heading.
  id: string;

  // --- Heading level
  level: number;

  // --- Heading thext to display in the TOC.
  text: string;

  // --- Reference to the anchor element.
  anchor: HTMLAnchorElement | null;
};

// --- The context object that is used to store the hierarchy of headings.
interface ITableOfContentsContext {
  // --- The list of headings in the TOC
  headings: HeadingItem[];

  // --- This method allows adding a new heading to the TOC.
  registerHeading: (headingItem: HeadingItem) => void;

  // --- This flag indicates whether the intersection observer is enabled.
  observeIntersection: boolean;

  // --- This method allows enabling or disabling the intersection
  setObserveIntersection: (observe: boolean) => void;

  // --- The id of the currently active anchor.
  activeAnchorId: string | null;

  // --- This method allows setting the id of the active anchor.
  setActiveAnchorId: (id: string) => void;
}

/**
 * Several components work together to represent the hierarchy of a particular
 * app page as a TOC. This React component provides a context for storing this 
 * hierarchy information.
 */
export const TableOfContentsContext = createContext<ITableOfContentsContext | null>(null);

/**
 * This provider component injects the specified children into the TOC context.
 */
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
