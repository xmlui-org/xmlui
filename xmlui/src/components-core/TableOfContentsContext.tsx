import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);
  const subscribers = useRef(new Set<(id: string) => void>());
  useEffect(() => {
    const scan = () => setHeadings(Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"), (node) => ({
      id: (node as HTMLElement).id,
      level: Number(node.tagName.slice(1)),
      text: node.textContent?.trim() ?? "",
      anchor: node as HTMLElement,
    })).filter((heading) => heading.id));
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("nav a[href^='#'], nav a[href*='#']") as HTMLAnchorElement | null;
      const id = link?.hash.slice(1);
      if (!id) return;
      setActiveAnchorId(id);
      subscribers.current.forEach((callback) => callback(id));
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);
  useEffect(() => {
    const updateFromHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      setActiveAnchorId(id);
      subscribers.current.forEach((callback) => callback(id));
    };
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);
  const value = useMemo<TableOfContentsContextValue>(() => ({
    headings,
    registerHeading: (heading) => { setHeadings((current) => current.some((item) => item.id === heading.id) ? current : [...current, heading]); },
    hasTableOfContents: true,
    scrollToAnchor: (id, smoothScrolling) => {
      setActiveAnchorId(id);
      subscribers.current.forEach((callback) => callback(id));
      document.getElementById(id)?.scrollIntoView({ behavior: smoothScrolling ? "smooth" : "auto", block: "center" });
      window.location.hash = id;
    },
    subscribeToActiveAnchorChange: (callback) => {
      subscribers.current.add(callback);
      if (activeAnchorId) callback(activeAnchorId);
      return () => subscribers.current.delete(callback);
    },
    activeAnchorId,
  }), [headings, activeAnchorId]);
  return <TableOfContentsContext.Provider value={value}>{children}</TableOfContentsContext.Provider>;
}

export function useTableOfContents() {
  const context = useContext(TableOfContentsContext);
  const [fallbackHeadings, setFallbackHeadings] = useState<HeadingItem[]>([]);
  useEffect(() => {
    const scan = () => {
      const candidates: Array<HeadingItem | null> = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6,[data-anchor='true'][id]"), (node) => {
      const element = node as HTMLElement;
      const heading = element.matches("h1,h2,h3,h4,h5,h6") ? element : element.closest("h1,h2,h3,h4,h5,h6");
      if (context && !heading) return null;
      if (element.dataset.xmluiOmitFromToc === "true") return null;
      const level = heading ? Number(heading.tagName.slice(1)) : Number(element.dataset.bookmarkLevel ?? 1);
      return {
        id: element.id,
        level,
        text: element.dataset.bookmarkTitle ?? heading?.textContent?.trim() ?? element.textContent?.trim() ?? element.id,
        anchor: element,
      };
      });
      setFallbackHeadings(candidates.filter((heading): heading is HeadingItem => !!heading && !!heading.id)
        .filter((heading, index, all) => all.findIndex((item) => item.id === heading.id) === index));
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [context]);
  if (context) {
    const merged: HeadingItem[] = [];
    for (const heading of [...context.headings, ...fallbackHeadings]) {
      if (!merged.some((item) => item.id === heading.id)) merged.push(heading);
    }
    return { ...context, headings: merged };
  }
  return {
    headings: fallbackHeadings,
    registerHeading: () => undefined,
    hasTableOfContents: false,
    scrollToAnchor: (id, smoothScrolling) => {
      document.getElementById(id)?.scrollIntoView({ behavior: smoothScrolling ? "smooth" : "auto", block: "center" });
      window.location.hash = id;
    },
    subscribeToActiveAnchorChange: () => () => undefined,
    activeAnchorId: null,
  } satisfies TableOfContentsContextValue;
}
