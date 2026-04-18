import {
  type CSSProperties,
  forwardRef,
  memo,
  type ForwardedRef,
  type ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import React from "react";
import classnames from "classnames";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

import styles from "./Stack.module.scss";
import { ThemedScroller as Scroller, type ScrollStyle } from "../ScrollViewer/ScrollViewer";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import { useContentAlignment } from "../../components-core/component-hooks";
import { useOnMount } from "../../components-core/utils/hooks";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";

export const DEFAULT_ORIENTATION = "vertical";

export const defaultProps = {
  orientation: DEFAULT_ORIENTATION,
  reverse: false,
  desktopOnly: false,
  hoverContainer: false,
  visibleOnHover: false,
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: true,
};

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onClick" | "onContextMenu"> & {
  orientation?: string;
  uid?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  classes?: Record<string, string>;
  reverse?: boolean;
  hoverContainer?: boolean;
  visibleOnHover?: boolean;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
  onClick?: AsyncFunction;
  onContextMenu?: AsyncFunction;
  onMount?: AsyncFunction;
  desktopOnly?: boolean;
  registerComponentApi?: (api: any) => void;
};

// =====================================================================================================================
// Stack React component

export const Stack = memo(forwardRef(function Stack(
  {
    uid,
    children,
    orientation = defaultProps.orientation,
    horizontalAlignment,
    verticalAlignment,
    style,
    reverse = defaultProps.reverse,
    hoverContainer = defaultProps.hoverContainer,
    visibleOnHover = defaultProps.visibleOnHover,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    onClick,
    onContextMenu,
    onMount,
    desktopOnly = defaultProps.desktopOnly,
    className,
    classes,
    registerComponentApi,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  useOnMount(onMount);
  const containerRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, containerRef);

  const { horizontal, vertical } = useContentAlignment(
    orientation,
    horizontalAlignment,
    verticalAlignment,
  );

  const scrollToTop = useCallback((behavior: ScrollBehavior = "instant") => {
    containerRef.current?.scrollTo({ top: 0, behavior });
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior });
  }, []);

  const scrollToStart = useCallback((behavior: ScrollBehavior = "instant") => {
    containerRef.current?.scrollTo({ left: 0, behavior });
  }, []);

  const scrollToEnd = useCallback((behavior: ScrollBehavior = "instant") => {
    containerRef.current?.scrollTo({ left: containerRef.current?.scrollWidth, behavior });
  }, []);

  // Register API methods
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({ scrollToTop, scrollToBottom, scrollToStart, scrollToEnd });
    }
  }, [registerComponentApi, scrollToTop, scrollToBottom, scrollToStart, scrollToEnd]);

  return (
    <Scroller
      {...rest}
      onClick={onClick}
      onContextMenu={onContextMenu}
      ref={composedRef}
      style={style}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
      className={classnames(
        classes?.[COMPONENT_PART_KEY],
        className,
        styles.base,
        {
          [styles.desktopOnly]: desktopOnly,
          [styles.vertical]: orientation === "vertical",
          [styles.horizontal]: orientation === "horizontal",
          [styles.reverse]: reverse,
          [styles.hoverContainer]: hoverContainer,
          "display-on-hover": visibleOnHover,
          [styles.handlesClick]: !!onClick,
        },
        horizontal ?? "",
        vertical ?? "",
      )}
    >
      {children}
    </Scroller>
  );
}));
