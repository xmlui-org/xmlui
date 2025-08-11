import type { ReactNode} from "react";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import styles from './Bookmark.module.scss';

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
}: Props) => {
  const elementRef = useRef<HTMLAnchorElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
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
    <span ref={elementRef} id={uid} data-anchor={true} className={styles.anchorRef}>
      {children}
    </span>
  );
};
