import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";

import { defaultProps, type ScrollStyle } from "./ScrollViewer.defaults";
import styles from "./ScrollViewer.module.scss";

export type ScrollViewerProps = Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
  registerComponentApi?: (api: Record<string, unknown>) => void;
};

export const ScrollViewer = forwardRef<HTMLDivElement, ScrollViewerProps>(function ScrollViewer(
  {
    children,
    header,
    footer,
    className,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    registerComponentApi,
    ...rest
  },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const setScrollNode = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const scrollToTop = useCallback((behavior: ScrollBehavior = "instant") => {
    scrollRef.current?.scrollTo({ top: 0, behavior });
  }, []);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "instant") => {
    const node = scrollRef.current;
    node?.scrollTo({ top: node.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    registerComponentApi?.({ scrollToTop, scrollToBottom });
  }, [registerComponentApi, scrollToBottom, scrollToTop]);

  const scrollClassName = cx(
    scrollStyleClass(scrollStyle),
    showScrollerFade ? styles.showScrollerFade : undefined,
  );

  if (header || footer) {
    return (
      <div {...rest} className={cx(styles.headerFooterWrapper, className)}>
        {header ? <div className={styles.stickyHeader}>{header}</div> : null}
        <div ref={setScrollNode} className={cx(styles.scrollerFlex, scrollClassName)}>
          {children}
        </div>
        {footer ? <div className={styles.stickyFooter}>{footer}</div> : null}
      </div>
    );
  }

  return (
    <div
      {...rest}
      ref={setScrollNode}
      className={cx(styles.wrapper, scrollClassName, className)}
    >
      {children}
    </div>
  );
});

function scrollStyleClass(scrollStyle: ScrollStyle): string | undefined {
  if (scrollStyle === "overlay") {
    return styles.overlay;
  }
  if (scrollStyle === "whenMouseOver") {
    return styles.whenMouseOver;
  }
  if (scrollStyle === "whenScrolling") {
    return styles.whenScrolling;
  }
  return undefined;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
