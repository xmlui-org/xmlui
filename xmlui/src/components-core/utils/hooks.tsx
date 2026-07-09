import React, { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";

import { useTheme } from "../theming/ThemeContext";
import { useEvent } from "./misc";

export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

export function useOnMount(onMount?: () => void | Promise<void>) {
  useEffect(() => {
    void onMount?.();
  }, [onMount]);
}

export const useResizeObserver = (
  element: React.MutableRefObject<Element | undefined | null>,
  callback: ResizeObserverCallback,
) => {
  const current = element?.current;
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    if (observer.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(callback);
    if (element?.current) {
      observer.current.observe(element.current);
    }
    return () => observer.current?.disconnect();
  }, [callback, current, element]);
};

export function usePrevious<T>(value: T): ReturnType<typeof useRef<T>>["current"] {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useMediaQuery(query: string) {
  const getMatch = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatch);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useIsTouchDevice() {
  return useMediaQuery("(pointer: coarse)");
}

export function useDocumentKeydown(onDocumentKeydown: (event: KeyboardEvent) => void) {
  const onKeyDown = useEvent(onDocumentKeydown);
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);
}

export function useDocumentKeyup(onDocumentKeyup: (event: KeyboardEvent) => void) {
  const onKeyUp = useEvent(onDocumentKeyup);
  useEffect(() => {
    document.addEventListener("keyup", onKeyUp);
    return () => document.removeEventListener("keyup", onKeyUp);
  }, [onKeyUp]);
}

export function useShallowCompareMemoize<T extends Record<any, any> | undefined>(value: T) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef(0);
  if (!shallowCompare(value, ref.current)) {
    ref.current = value;
    signalRef.current++;
  }
  return React.useMemo(() => ref.current, [signalRef.current]);
}

function getScrollParent(element: HTMLElement): HTMLElement | null {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === "absolute";
  const overflowRegex = /(auto|scroll)/;

  if (style.position === "fixed") {
    return document.body;
  }
  for (let parent: HTMLElement | null = element; ; parent = parent.parentElement) {
    if (!parent) {
      return null;
    }
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === "static") {
      continue;
    }
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
  }
}

export const useScrollParent = (element?: HTMLElement | null): HTMLElement | null => {
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useIsomorphicLayoutEffect(() => {
    setScrollParent(element ? getScrollParent(element) : null);
  }, [element]);
  return scrollParent;
};

function realBackgroundColor(element: HTMLElement | null): string {
  if (!element) {
    return "rgba(0, 0, 0, 0)";
  }
  const background = getComputedStyle(element).backgroundColor;
  if (background === "rgba(0, 0, 0, 0)" || background === "transparent") {
    return realBackgroundColor(element.parentElement);
  }
  return background;
}

export const useRealBackground = (element?: HTMLElement | null): string => {
  const { activeThemeTone, activeThemeId } = useTheme();
  return React.useMemo(
    () => element ? realBackgroundColor(element) : "transparent",
    [activeThemeId, activeThemeTone, element],
  );
};

export const useStartMargin = (
  hasOutsideScroll: boolean,
  parentRef: MutableRefObject<HTMLElement | null | undefined>,
  scrollRef: MutableRefObject<HTMLElement | null | undefined>,
) => {
  const calculateStartMargin = useEvent(() => {
    if (!hasOutsideScroll) {
      return 0;
    }
    const precedingElement = parentRef.current;
    const scrollContainer = scrollRef.current;
    if (!precedingElement || !scrollContainer) {
      return 0;
    }
    const precedingRect = precedingElement.getBoundingClientRect();
    const scrollContainerRect = scrollContainer.getBoundingClientRect();
    return precedingRect.top - scrollContainerRect.top + scrollContainer.scrollTop;
  });

  const [startMargin, setStartMargin] = useState<number>(() => calculateStartMargin());

  useResizeObserver(scrollRef, () => {
    setStartMargin(calculateStartMargin());
  });

  useIsomorphicLayoutEffect(() => {
    const newMargin = calculateStartMargin();
    setStartMargin(newMargin);
    if (newMargin === 0 && hasOutsideScroll && parentRef.current && scrollRef.current) {
      requestAnimationFrame(() => {
        const recalculated = calculateStartMargin();
        if (recalculated !== 0) {
          setStartMargin(recalculated);
        }
      });
    }
  }, [hasOutsideScroll, calculateStartMargin, parentRef, scrollRef]);

  return startMargin;
};

export function useHasExplicitHeight(parentRef: React.MutableRefObject<HTMLDivElement | null>) {
  const [hasHeight, setHasHeight] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!parentRef.current) {
      return;
    }
    const computedStyles = window.getComputedStyle(parentRef.current);
    const hasMaxHeight = computedStyles.maxHeight !== "none";
    const originalHeight = computedStyles.height;
    const originalInlineHeight = parentRef.current.style.height || "";
    parentRef.current.style.height = "auto";
    const autoHeight = window.getComputedStyle(parentRef.current).height;
    parentRef.current.style.height = originalInlineHeight;
    setHasHeight(hasMaxHeight || originalHeight !== autoHeight || !!originalInlineHeight || computedStyles.display === "flex");
  }, [parentRef]);
  return hasHeight;
}

function shallowCompare(left: any, right: any) {
  if (Object.is(left, right)) {
    return true;
  }
  if (!left || !right || typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && Object.is(left[key], right[key]));
}
