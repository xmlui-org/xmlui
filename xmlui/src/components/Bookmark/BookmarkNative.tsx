import type { ReactNode } from "react";
import { useContext, useEffect, useRef } from "react";
import { TableOfContentsContext } from "@components-core/TableOfContentsContext";

type Props = {
  uid?: string;
  level?: number;
  children: ReactNode;
};

export const Bookmark = ({ uid, level, children }: Props) => {
  const elementRef = useRef<HTMLAnchorElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.observeIntersection;

  useEffect(() => {
    if (observeIntersection && elementRef.current && uid) {
      return registerHeading?.({
        id: uid,
        level,
        text: uid,
        anchor: elementRef.current,
      });
    }
  }, [uid, observeIntersection, registerHeading, level]);

  return (
    <span ref={elementRef} style={{ width: 0, height: 0 }} id={uid}>
      {children}
    </span>
  );
};
