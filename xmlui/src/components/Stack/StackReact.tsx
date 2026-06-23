import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";

import { defaultProps } from "./Stack.defaults";
import styles from "./Stack.module.scss?xmlui-css-module";

type StackProps = Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "onContextMenu"> & {
  orientation?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  reverse?: boolean;
  wrapContent?: boolean;
  hoverContainer?: boolean;
  visibleOnHover?: boolean;
  desktopOnly?: boolean;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void | Promise<void>;
  onContextMenu?: () => void | Promise<void>;
  onMount?: () => void | Promise<void>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
  children?: ReactNode;
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    orientation = defaultProps.orientation,
    horizontalAlignment,
    verticalAlignment,
    reverse = defaultProps.reverse,
    wrapContent = false,
    hoverContainer = defaultProps.hoverContainer,
    visibleOnHover = defaultProps.visibleOnHover,
    desktopOnly = defaultProps.desktopOnly,
    className,
    onClick,
    onContextMenu,
    onMount,
    registerComponentApi,
    children,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const normalizedOrientation = orientation === "horizontal" ? "horizontal" : "vertical";

  useEffect(() => {
    void onMount?.();
  }, [onMount]);

  const scrollToTop = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ top: 0, behavior });
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ top: innerRef.current.scrollHeight, behavior });
  }, []);

  const scrollToStart = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ left: 0, behavior });
  }, []);

  const scrollToEnd = useCallback((behavior: ScrollBehavior = "instant") => {
    innerRef.current?.scrollTo({ left: innerRef.current.scrollWidth, behavior });
  }, []);

  useEffect(() => {
    registerComponentApi?.({ scrollToTop, scrollToBottom, scrollToStart, scrollToEnd });
  }, [registerComponentApi, scrollToBottom, scrollToEnd, scrollToStart, scrollToTop]);

  return (
    <div
      {...rest}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cx(
        styles.base,
        normalizedOrientation === "horizontal" ? styles.horizontal : styles.vertical,
        reverse ? styles.reverse : undefined,
        wrapContent ? styles.wrap : undefined,
        hoverContainer ? styles.hoverContainer : undefined,
        visibleOnHover ? "display-on-hover" : undefined,
        desktopOnly ? styles.desktopOnly : undefined,
        onClick ? styles.handlesClick : undefined,
        alignmentClass("horizontal", normalizedOrientation, horizontalAlignment),
        alignmentClass("vertical", normalizedOrientation, verticalAlignment),
        className,
      )}
      onClick={() => void onClick?.()}
      onContextMenu={() => void onContextMenu?.()}
    >
      {children}
    </div>
  );
});

function alignmentClass(axis: "horizontal" | "vertical", orientation: string, value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = alignmentValue(value);
  if (!normalized) {
    return undefined;
  }
  const isMainAxis =
    (axis === "horizontal" && orientation === "horizontal") ||
    (axis === "vertical" && orientation === "vertical");
  return styles[`${isMainAxis ? "justify" : "align"}Items${normalized}`];
}

function alignmentValue(value: string): "Start" | "Center" | "Stretch" | "End" | "Baseline" | undefined {
  switch (value) {
    case "start":
      return "Start";
    case "center":
      return "Center";
    case "stretch":
      return "Stretch";
    case "end":
      return "End";
    case "baseline":
      return "Baseline";
    default:
      return undefined;
  }
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
