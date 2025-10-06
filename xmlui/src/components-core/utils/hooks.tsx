import type {
  MutableRefObject} from "react";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isEqual } from "lodash-es";

import type { ComponentApi, ContainerState } from "../rendering/ContainerWrapper";
import type { ColorDef } from "./css-utils";

import { shallowCompare, useEvent } from "../utils/misc";
import { useTheme } from "../theming/ThemeContext";
import { EMPTY_OBJECT } from "../constants";
import Color from "color";

/**
 * This hook invokes a callback when the size of the specified DOM element changes.
 * @param element A DOM element to watch for size changes
 * @param callback The callback function to invoke on size changes
 */
export const useResizeObserver = (
  element: React.MutableRefObject<Element | undefined | null>,
  callback: ResizeObserverCallback,
) => {
  const current = element?.current;
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    // --- We are already observing old element
    if (observer?.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(callback);
    if (element && element.current && observer.current) {
      observer.current.observe(element.current);
    }
  }, [callback, current, element]);
};

/**
 * This hook gets the previous state of the specified value (props, variable used in a React
 * function).
 *
 * @see {@link https://blog.logrocket.com/accessing-previous-props-state-react-hooks/}
 */
export function usePrevious<T>(value: T): ReturnType<typeof useRef<T>>["current"] {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * This hook tests if the component is used within an iframe.
 * @returns True, if the component is used within an iframe; otherwise, false.
 */
export function useIsInIFrame() {
  return useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);
}

// --- Tests if the document has the focus
const hasFocus = () => typeof document !== "undefined" && document.hasFocus();

/**
 * This hook tests if the window has the focus.
 * @returns True, if the window has the focus; otherwise, false.
 */
export function useIsWindowFocused() {
  const [focused, setFocused] = useState(hasFocus); // Focus for first render

  useEffect(() => {
    setFocused(hasFocus()); // Focus for additional renders

    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return focused;
}

/**
 * This hook allows running media queries.
 * @param query Media query to run
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(false);
  useEffect(() => {
    if (!window) {
      setMatches(false);
      return;
    }

    const matchMedia = window.matchMedia(query);
    // Triggered at the first client-side load and if query changes
    handleChange();

    matchMedia.addEventListener("change", handleChange);
    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };

    function handleChange() {
      setMatches(matchMedia.matches);
    }
  }, [query]);

  return matches;
}

/**
 * This hook runs a callback function when a key is pressed in the document window.
 * @param onDocumentKeydown Callback function to run
 */
export function useDocumentKeydown(onDocumentKeydown: (event: KeyboardEvent) => void) {
  const onKeyDown = useEvent(onDocumentKeydown);
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}

/**
 * This hook runs a function when the corresponding component has been mounted.
 * @param onMount
 */
export function useOnMount(onMount: any) {
  const thizRef = useRef({ mountedFired: false });
  useEffect(() => {
    if (!thizRef.current.mountedFired) {
      thizRef.current.mountedFired = true;
      onMount?.();
    }
  }, [onMount]);
}

/**
 * This hook memoizes the specified value. It uses a shallow comparison with the previously
 * stored value when checking for changes. So, while a shallow comparison shows equality,
 * it returns with the memoized value.
 * @param value Value to memoize
 */
export function useShallowCompareMemoize<T extends Record<any, any> | undefined>(value: T) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef<number>(0);

  if (!shallowCompare(value, ref.current)) {
    ref.current = value;
    signalRef.current++;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [signalRef.current]);
}

/**
 * This hook memoizes the specified value. When checking for changes, it uses a deep comparison
 * with the previously stored value. So, while a deep comparison shows equality, it returns with
 * the memoized value, even if value references differ.
 * @param value Value to memoize
 */
export function useDeepCompareMemoize<T extends Record<any, any> | undefined>(value: T) {
  const ref = React.useRef<T>(value);
  const signalRef = React.useRef<number>(0);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => ref.current, [signalRef.current]);
}

export function useColors(...colorNames: (string | ColorDef)[]) {
  const { getThemeVar } = useTheme();
  // const paramsRef = useRef(colorNames);
  // const { themeStyles } = useTheme();
  const colors = useMemo(() => {
    const ret: Record<string, string> = {};
    for (const color of colorNames) {
      if (typeof color === "string") {
        const col = getThemeVar(color);
        ret[color] = Color(col).toString();
      } else {
        const col = getThemeVar(color.name);
        ret[color.name] = Color(col).hex().toString();
      }
    }
    return ret;
  }, [colorNames, getThemeVar]);

  // useEffect(() => {
  //   setColors(getColors(...paramsRef.current));
  // }, [themeStyles]);

  return colors;
}

export function useReferenceTrackedApi(componentState: ContainerState) {
  return useShallowCompareMemoize(
    useMemo(() => {
      const ret: Record<string, ComponentApi> = {};
      if (Reflect.ownKeys(componentState).length === 0) {
        //skip containers with no registered apis
        return EMPTY_OBJECT;
      }
      for (const componentApiKey of Object.getOwnPropertySymbols(componentState)) {
        const value = componentState[componentApiKey];
        if (componentApiKey.description) {
          ret[componentApiKey.description] = value;
        }
      }
      return ret;
    }, [componentState]),
  );
}

/**
 * This hook uses either useLayoutEffect or useEffect based on the environment
 * (client-side or server-side).
 */
export const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

// https://stackoverflow.com/a/49186677
function getScrollParent(element: HTMLElement) {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === "absolute";
  const overflowRegex = /(auto|scroll)/;

  if (style.position === "fixed") {
    return document.body;
  }
  for (let parent = element; ; parent = parent.parentElement) {
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

  return document.body;
}

export const useScrollParent = (element?: HTMLElement): HTMLElement => {
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useIsomorphicLayoutEffect(() => {
    setScrollParent(element ? getScrollParent(element) : null);
  }, [element]);
  return scrollParent;
};

// because safari doesn't support scrollend event...
export const useScrollEventHandler = (
  element: HTMLElement | null | undefined,
  {
    onScrollStart,
    onScrollEnd,
  }: {
    onScrollStart?: () => void;
    onScrollEnd?: () => void;
  },
) => {
  const thisRef = useRef({ scrolling: false });
  useIsomorphicLayoutEffect(() => {
    let timer;
    let listener = () => {
      if (!thisRef.current.scrolling) {
        onScrollStart?.();
      }
      thisRef.current.scrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        thisRef.current.scrolling = false;
        onScrollEnd?.();
      }, 50);
    };
    element?.addEventListener("scroll", listener);
    return () => {
      element?.removeEventListener("scroll", listener);
    };
  }, [element, onScrollEnd, onScrollStart]);
};

function realBackgroundColor(elem: HTMLElement) {
  let transparent = "rgba(0, 0, 0, 0)";
  let transparentIE11 = "transparent";
  if (!elem) return transparent;

  let bg = getComputedStyle(elem).backgroundColor;
  if (bg === transparent || bg === transparentIE11) {
    return realBackgroundColor(elem.parentElement);
  } else {
    return bg;
  }
}

export const useRealBackground = (element: HTMLElement) => {
  const { activeThemeTone, activeThemeId } = useTheme();
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    return setCounter((prev) => prev + 1);
  }, [activeThemeTone, activeThemeId]);
  return useMemo(
    () => (element ? realBackgroundColor(element) : "transparent"),
    [element, counter],
  );
};

// export const useIsInViewport = (ref, observerOptions) => {
//   const [entered, setEntered] = useState(false);
//   const observer = useRef(
//     new IntersectionObserver(
//       ([entry]) => setEntered(entry.isIntersecting),
//       observerOptions
//     )
//   );
//
//   useEffect(() => {
//     const element = ref.current;
//     const ob = observer.current;
//
//     // stop observing once the element has entered the viewport for the first time.
//     // if (entered) {
//     //   ob.disconnect();
//     //   return;
//     // }
//
//     if (element) ob.observe(element);
//
//     return () => ob.disconnect();
//   }, [entered, ref]);
//
//   return entered;
// };

export const useStartMargin = (
  hasOutsideScroll: boolean,
  parentRef: MutableRefObject<HTMLElement | null | undefined>,
  scrollRef: MutableRefObject<HTMLElement | null | undefined>,
) => {
  const [startMargin, setStartMargin] = useState<number>(0);

  const calculateStartMargin = useEvent(() => {
    if (!hasOutsideScroll) {
      return 0;
    }
    const precedingElement = parentRef.current;
    const scrollContainer = scrollRef.current;

    if (precedingElement && scrollContainer) {
      const precedingRect = precedingElement.getBoundingClientRect();
      const scrollContainerRect = scrollContainer.getBoundingClientRect();

      // It's important that scrollContainer is indeed the element whose scrollTop is relevant
      const scrollTopOfScrollContainer = scrollContainer.scrollTop;

      const calculatedMargin =
        precedingRect.top - scrollContainerRect.top + scrollTopOfScrollContainer;
      return calculatedMargin;
    }
    return 0;
  });

  useResizeObserver(scrollRef, () => {
    setStartMargin(calculateStartMargin());
  });

  return startMargin;
};

export function useHasExplicitHeight(parentRef: React.MutableRefObject<HTMLDivElement | null>) {
  const [hasHeight, setHasHeight] = useState(false);
  useLayoutEffect(() => {
    if (parentRef.current) {
      const computedStyles = window.getComputedStyle(parentRef.current);
      const hasMaxHeight = computedStyles.maxHeight !== "none";
      // Get the original computed height
      const originalHeight = window.getComputedStyle(parentRef.current).height;

      // Store original inline style to restore it later
      const originalInlineHeight = parentRef.current.style.height || "";

      // Temporarily set height to auto and get the new computed height
      parentRef.current.style.height = "auto";
      const autoHeight = window.getComputedStyle(parentRef.current).height;

      // Restore the original inline style immediately
      parentRef.current.style.height = originalInlineHeight;

      // If the original height is different from what the browser
      // calculates for 'auto', it means a height was explicitly set.
      // We also check if the inline style itself had a value.
      let hasHeight = originalHeight !== autoHeight || !!originalInlineHeight;

      const isFlex = computedStyles.display === "flex";
      setHasHeight(hasMaxHeight || hasHeight || isFlex);
    }
  }, [parentRef]);
  return hasHeight;
}