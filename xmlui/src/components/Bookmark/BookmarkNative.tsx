import type { ReactNode } from "react";
import { useContext, useEffect, useRef } from "react";
import { TableOfContentsContext } from "../../components-core/TableOfContentsContext";

type Props = {
  uid?: string;
  level?: number;
  title?: string;
  omitFromToc?: boolean;
  children: ReactNode;
};

export const Bookmark = ({ uid, level = 1, children, title, omitFromToc = false }: Props) => {
  const elementRef = useRef<HTMLAnchorElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.observeIntersection;

  useEffect(() => {
    if (observeIntersection && elementRef.current && uid && !omitFromToc) {
      return registerHeading?.({
        id: uid,
        level,
        text: title || elementRef.current?.textContent?.trim() || uid,
        anchor: elementRef.current,
      });
    }
  }, [uid, observeIntersection, registerHeading, level, title, omitFromToc]);

  return (
    <span ref={elementRef} id={uid}>
      {children}
    </span>
  );
};
