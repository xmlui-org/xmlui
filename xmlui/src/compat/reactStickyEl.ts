import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RenderArgs = {
  holderRef: (element: HTMLElement | null) => void;
  wrapperRef: (element: HTMLElement | null) => void;
  isFixed: boolean;
  wrapperStyles?: CSSProperties;
  holderStyles?: CSSProperties;
};

type RenderPropStickyProps = {
  mode?: "top" | "bottom";
  scrollElement?: HTMLElement | Window | Document | string;
  onFixedToggle?: (isFixed: boolean) => void;
  children: (args: RenderArgs) => ReactNode;
};

export function RenderPropSticky({
  mode = "top",
  scrollElement = window,
  onFixedToggle,
  children,
}: RenderPropStickyProps) {
  const holderRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<{
    isFixed: boolean;
    wrapperStyles?: CSSProperties;
    holderStyles?: CSSProperties;
  }>({ isFixed: false });

  const setHolderRef = useCallback((element: HTMLElement | null) => {
    holderRef.current = element;
  }, []);

  const setWrapperRef = useCallback((element: HTMLElement | null) => {
    wrapperRef.current = element;
  }, []);

  useEffect(() => {
    const scrollTarget = resolveScrollElement(scrollElement);
    const eventTarget = scrollTarget === document ? window : scrollTarget;
    if (!eventTarget) {
      return;
    }

    const update = () => {
      const holder = holderRef.current;
      const wrapper = wrapperRef.current;
      if (!holder || !wrapper) {
        return;
      }

      const holderRect = holder.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const scrollRect = scrollTargetRect(scrollTarget);
      const isFixed =
        mode === "bottom"
          ? holderRect.bottom >= scrollRect.bottom
          : holderRect.top <= scrollRect.top;

      const nextState = isFixed
        ? {
            isFixed,
            holderStyles: { minHeight: wrapperRect.height },
            wrapperStyles: {
              position: "fixed" as const,
              width: holderRect.width || wrapperRect.width,
              ...(mode === "bottom"
                ? { bottom: window.innerHeight - scrollRect.bottom }
                : { top: scrollRect.top }),
            },
          }
        : {
            isFixed,
            holderStyles: undefined,
            wrapperStyles: undefined,
          };

      setState((current) => {
        if (current.isFixed !== nextState.isFixed) {
          onFixedToggle?.(nextState.isFixed);
        }
        if (
          current.isFixed === nextState.isFixed &&
          JSON.stringify(current.wrapperStyles) === JSON.stringify(nextState.wrapperStyles) &&
          JSON.stringify(current.holderStyles) === JSON.stringify(nextState.holderStyles)
        ) {
          return current;
        }
        return nextState;
      });
    };

    update();
    eventTarget.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      eventTarget.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mode, onFixedToggle, scrollElement]);

  return children({
    holderRef: setHolderRef,
    wrapperRef: setWrapperRef,
    isFixed: state.isFixed,
    wrapperStyles: state.wrapperStyles,
    holderStyles: state.holderStyles,
  });
}

function resolveScrollElement(
  scrollElement: RenderPropStickyProps["scrollElement"],
): HTMLElement | Window | Document | undefined {
  if (typeof scrollElement === "string") {
    return scrollElement === "window"
      ? window
      : document.querySelector<HTMLElement>(scrollElement) ?? undefined;
  }
  return scrollElement ?? window;
}

function scrollTargetRect(scrollElement: HTMLElement | Window | Document | undefined) {
  if (!scrollElement || scrollElement === window || scrollElement === document) {
    return { top: 0, bottom: window.innerHeight };
  }
  return scrollElement.getBoundingClientRect();
}
