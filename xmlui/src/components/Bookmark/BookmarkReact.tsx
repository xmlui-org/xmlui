import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, memo, useCallback, useContext, useEffect, useRef } from "react";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import classnames from "classnames";
import styles from "./Bookmark.module.scss";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  uid?: string;
  level?: number;
  title?: string;
  omitFromToc?: boolean;
  children: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps: Pick<Props, "level" | "omitFromToc"> = {
  level: 1,
  omitFromToc: false,
};

export const Bookmark = memo(forwardRef(function Bookmark(
  {
    uid,
    level = defaultProps.level,
    children,
    title,
    omitFromToc = defaultProps.omitFromToc,
    registerComponentApi,
    className,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLSpanElement>,
) {
  const internalRef = useRef<HTMLSpanElement>(null);
  const elementRef = useComposedRefs(forwardedRef, internalRef);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

  // Empty dep array is intentional: scrollIntoView only uses internalRef.current,
  // which is a stable ref object — its .current value is read at call time.
  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    if (internalRef.current) {
      // Try to find and scroll the nearest scrollable ancestor
      let scrollableParent = internalRef.current.parentElement;
      while (scrollableParent) {
        const style = window.getComputedStyle(scrollableParent);
        const isScrollable =
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          scrollableParent.scrollHeight > scrollableParent.clientHeight;

        if (isScrollable) {
          const rect = internalRef.current.getBoundingClientRect();
          const parentRect = scrollableParent.getBoundingClientRect();
          const relativeTop = rect.top - parentRect.top + scrollableParent.scrollTop;
          scrollableParent.scrollTo({
            top: relativeTop,
            behavior: options?.behavior || "smooth",
          });
          return;
        }
        scrollableParent = scrollableParent.parentElement;
      }

      // Fallback to browser's default scrollIntoView
      internalRef.current.scrollIntoView({
        behavior: options?.behavior || "smooth",
        block: "start",
      });
    }
  }, []);

  useEffect(() => {
    registerComponentApi?.({ scrollIntoView });
  }, [registerComponentApi, scrollIntoView]);

  useIsomorphicLayoutEffect(() => {
    if (observeIntersection && internalRef.current && uid && !omitFromToc) {
      return registerHeading?.({
        id: uid,
        level,
        text: title || internalRef.current?.textContent?.trim()?.replace(/#$/, "") || uid,
        anchor: internalRef.current,
      });
    }
  }, [uid, observeIntersection, registerHeading, level, title, omitFromToc]);

  return (
    <span {...rest} ref={elementRef} id={uid} data-anchor={true} className={classnames(styles.anchorRef, className)}>
      {children}
    </span>
  );
}));
