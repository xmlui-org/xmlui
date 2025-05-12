import type { ReactNode} from "react";
import { useContext, useLayoutEffect, useRef } from "react";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";
import styles from './Bookmark.module.scss';

type Props = {
  uid?: string;
  level?: number;
  title?: string;
  omitFromToc?: boolean;
  children: ReactNode;
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
}: Props) => {
  const elementRef = useRef<HTMLAnchorElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

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
