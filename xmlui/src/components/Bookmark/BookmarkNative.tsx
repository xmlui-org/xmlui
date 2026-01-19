import type { ReactNode } from "react";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import styles from "./Bookmark.module.scss";

type Props = {
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

export const Bookmark = ({
  uid,
  level = defaultProps.level,
  children,
  title,
  omitFromToc = defaultProps.omitFromToc,
  registerComponentApi,
  ...rest
}: Props) => {
  const elementRef = useRef<HTMLAnchorElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    if (elementRef.current) {
      // Try to find and scroll the nearest scrollable ancestor
      let scrollableParent = elementRef.current.parentElement;
      while (scrollableParent) {
        const style = window.getComputedStyle(scrollableParent);
        const isScrollable = (style.overflowY === 'scroll' || style.overflowY === 'auto') &&
                            scrollableParent.scrollHeight > scrollableParent.clientHeight;
        
        if (isScrollable) {
          // Found a scrollable parent, calculate the position
          const rect = elementRef.current.getBoundingClientRect();
          const parentRect = scrollableParent.getBoundingClientRect();
          
          // Calculate where the element is relative to the parent's viewport
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
      elementRef.current.scrollIntoView({
        behavior: options?.behavior || "smooth",
        block: "start",
      });
    }
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      scrollIntoView,
    });
  }, [registerComponentApi, scrollIntoView]);

  useLayoutEffect(() => {
    if (observeIntersection && elementRef.current && uid && !omitFromToc) {
      return registerHeading?.({
        id: uid,
        level,
        text: title || elementRef.current?.textContent?.trim()?.replace(/#$/, "") || uid,
        anchor: elementRef.current,
      });
    }
  }, [uid, observeIntersection, registerHeading, level, title, omitFromToc]);

  return (
    <span {...rest} ref={elementRef} id={uid} data-anchor={true} className={styles.anchorRef}>
      {children}
    </span>
  );
};
