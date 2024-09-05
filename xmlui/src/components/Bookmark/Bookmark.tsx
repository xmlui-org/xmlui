import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ReactNode} from "react";
import { useContext, useEffect, useRef } from "react";
import { TableOfContentsContext } from "@components-core/TableOfContentsContext";

export type BookmarkProps = {
  uid?: string;
  level?: number;
  children: ReactNode;
};

export const Bookmark = ({ uid, level, children }: BookmarkProps) => {
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

  return <span ref={elementRef} style={{ width: 0, height: 0 }} id={uid}>{children}</span>;
};

/**
 * As its name suggests, this component places a bookmark into its parent component's view. The
 * component has an `id` that you can use in links to navigate (scroll to) the bookmark's location.
 */
export interface BookmarkComponentDef extends ComponentDef<"Bookmark"> {
  props: {
    /**
     * The unique identifier of the bookmark. You can use this identifier in links to navigate to
     * this component's location.
     */
    id: string;
    level: number;
  };
}

export const bookmarkComponentRenderer = createComponentRenderer<BookmarkComponentDef>(
  "Bookmark",
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutContext } = rendererContext;

    return (
      <Bookmark
          uid={extractValue(node.uid)}
          level={extractValue(node.props.level)}
      >
        {renderChild(node.children, layoutContext)}
      </Bookmark>
    );
  },
  {
    opaque: true,
  },
);
