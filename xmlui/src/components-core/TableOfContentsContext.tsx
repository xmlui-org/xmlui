import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useScrollParent } from "./utils/hooks";

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

export function TableOfContentsProvider({
  children,
  preserveAppRouteHash = false,
}: {
  children: ReactNode;
  preserveAppRouteHash?: boolean;
}) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null);
  const subscribers = useRef(new Set<(id: string) => void>());
  const headingsRef = useRef<HeadingItem[]>([]);
  const suspendPositionActiveRef = useRef(false);
  const scrollParent = useScrollParent(headings.find((heading) => heading.anchor)?.anchor);

  useEffect(() => {
    headingsRef.current = headings;
  }, [headings]);

  const notify = useCallback((id: string) => {
    setActiveAnchorId((current) => current === id ? current : id);
    subscribers.current.forEach((callback) => callback(id));
  }, []);

  const registerHeading = useCallback((heading: HeadingItem) => {
    setHeadings((current) => {
      const index = current.findIndex((item) => item.id === heading.id);
      if (index < 0) return [...current, heading].sort(compareHeadingPosition);
      if (
        current[index].anchor === heading.anchor &&
        current[index].level === heading.level &&
        current[index].text === heading.text
      ) {
        return current;
      }
      const next = [...current];
      next[index] = heading;
      return next.sort(compareHeadingPosition);
    });
    return () => {
      setHeadings((current) => current.filter((item) => item.id !== heading.id));
    };
  }, []);

  const scrollToAnchor = useCallback((id: string, smoothScrolling: boolean) => {
    suspendPositionActiveRef.current = true;
    notify(id);
    updateLocationAnchor(id, preserveAppRouteHash);
    const scroll = () => {
      const target = headingsRef.current.find((item) => item.id === id)?.anchor ?? findAnchorTarget(id);
      if (target) {
        scrollElementIntoContainer(target, findScrollParent(target), smoothScrolling);
      }
    };
    requestAnimationFrame(scroll);
  }, [notify, preserveAppRouteHash]);

  const subscribeToActiveAnchorChange = useCallback((callback: (id: string) => void) => {
    subscribers.current.add(callback);
    if (activeAnchorId) callback(activeAnchorId);
    return () => subscribers.current.delete(callback);
  }, [activeAnchorId]);

  const updateActiveHeading = useCallback(() => {
    if (suspendPositionActiveRef.current) return;
    const candidates = headings.filter((heading) => heading.anchor);
    if (candidates.length === 0) return;
    const rootRect = scrollParent?.getBoundingClientRect();
    const line = (rootRect?.top ?? 0) + (rootRect?.height ?? window.innerHeight) * 0.2;
    const current = candidates.reduce<HeadingItem | undefined>((best, heading) => {
      const top = heading.anchor!.getBoundingClientRect().top;
      if (top <= line) return heading;
      return best;
    }, undefined) ?? candidates[0];
    notify(current.id);
  }, [headings, notify, scrollParent]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (suspendPositionActiveRef.current) return;
            const heading = headings.find((item) => item.anchor === entry.target);
            if (heading) notify(heading.id);
          }
        });
      },
      {
        root: scrollParent ?? null,
        rootMargin: "0% 0% -80%",
      },
    );
    headings.forEach((heading) => heading.anchor && observer.observe(heading.anchor));
    updateActiveHeading();
    return () => observer.disconnect();
  }, [headings, notify, scrollParent, updateActiveHeading]);

  useEffect(() => {
    const target = scrollParent ?? window;
    target.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    return () => {
      target.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [scrollParent, updateActiveHeading]);

  useEffect(() => {
    const handleTocLinkClick = (event: MouseEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest("nav[aria-label='Table of Contents'] a") as HTMLAnchorElement | null;
      const id = link?.id || link?.hash.split("#").filter(Boolean).pop();
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      suspendPositionActiveRef.current = true;
      notify(id);
      updateLocationAnchor(id, preserveAppRouteHash);
      const anchor = headingsRef.current.find((item) => item.id === id)?.anchor ?? findAnchorTarget(id);
      if (anchor) {
        scrollElementIntoContainer(anchor, findScrollParent(anchor), false);
        window.setTimeout(() => scrollElementIntoContainer(anchor, findScrollParent(anchor), false), 0);
        window.setTimeout(() => scrollElementIntoContainer(anchor, findScrollParent(anchor), false), 100);
      }
    };
    document.addEventListener("click", handleTocLinkClick, true);
    return () => document.removeEventListener("click", handleTocLinkClick, true);
  }, [notify, preserveAppRouteHash]);

  useEffect(() => {
    const resumePositionUpdates = () => {
      suspendPositionActiveRef.current = false;
    };
    window.addEventListener("wheel", resumePositionUpdates, { passive: true, capture: true });
    window.addEventListener("touchstart", resumePositionUpdates, { passive: true, capture: true });
    window.addEventListener("keydown", resumePositionUpdates, true);
    return () => {
      window.removeEventListener("wheel", resumePositionUpdates, true);
      window.removeEventListener("touchstart", resumePositionUpdates, true);
      window.removeEventListener("keydown", resumePositionUpdates, true);
    };
  }, []);

  useEffect(() => {
    const updateFromHash = () => {
      const id = getAnchorIdFromLocation(preserveAppRouteHash);
      if (!id) return;
      notify(id);
    };
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, [notify, preserveAppRouteHash]);

  const value = useMemo<TableOfContentsContextValue>(() => ({
    headings,
    registerHeading,
    hasTableOfContents: true,
    scrollToAnchor,
    subscribeToActiveAnchorChange,
    activeAnchorId,
  }), [activeAnchorId, headings, registerHeading, scrollToAnchor, subscribeToActiveAnchorChange]);
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
  if (context) return context;
  return {
    headings: fallbackHeadings,
    registerHeading: () => undefined,
    hasTableOfContents: false,
    scrollToAnchor: (id, smoothScrolling) => {
      findAnchorTarget(id)?.scrollIntoView({ behavior: smoothScrolling ? "smooth" : "auto", block: "center" });
      window.location.hash = id;
    },
    subscribeToActiveAnchorChange: () => () => undefined,
    activeAnchorId: null,
  } satisfies TableOfContentsContextValue;
}

function compareHeadingPosition(left: HeadingItem, right: HeadingItem) {
  if (left.anchor === right.anchor) return 0;
  if (!left.anchor) return 1;
  if (!right.anchor) return -1;
  return left.anchor.compareDocumentPosition(right.anchor) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
}

function findAnchorTarget(id: string) {
  const escaped = CSS.escape(id);
  return document.querySelector<HTMLElement>(
    `h1[id="${escaped}"],h2[id="${escaped}"],h3[id="${escaped}"],h4[id="${escaped}"],h5[id="${escaped}"],h6[id="${escaped}"],[data-anchor="true"][id="${escaped}"]`,
  ) ?? document.getElementById(id);
}

function getAnchorIdFromLocation(preserveAppRouteHash: boolean) {
  if (!preserveAppRouteHash) {
    return window.location.hash.slice(1);
  }
  const hashValue = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const anchorSeparatorIndex = hashValue.indexOf("#");
  return anchorSeparatorIndex >= 0 ? hashValue.slice(anchorSeparatorIndex + 1) : "";
}

function updateLocationAnchor(id: string, preserveAppRouteHash: boolean) {
  if (!preserveAppRouteHash) {
    window.location.hash = id;
    return;
  }
}

function scrollElementIntoContainer(
  target: HTMLElement,
  container: HTMLElement | null,
  smoothScrolling: boolean,
) {
  if (!container) {
    target.scrollIntoView({ behavior: smoothScrolling ? "smooth" : "auto", block: "start" });
    return;
  }
  const targetRect = target.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const containerStyle = getComputedStyle(container);
  const targetStyle = getComputedStyle(target);
  const top =
    targetRect.top -
    containerRect.top +
    container.scrollTop -
    readCssPixelValue(containerStyle.scrollPaddingTop) -
    readCssPixelValue(targetStyle.scrollMarginTop);
  container.scrollTo({
    top,
    behavior: "auto",
  });
  container.scrollTop = top;
}

function readCssPixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findScrollParent(element: HTMLElement): HTMLElement | null {
  const overflowRegex = /(auto|scroll)/;
  for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    if (
      overflowRegex.test(`${style.overflow}${style.overflowY}${style.overflowX}`) &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
  }
  return null;
}
