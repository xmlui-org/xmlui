import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ReactNode } from "react";
import { useContext, useEffect, useRef } from "react";
import { TableOfContentsContext } from "@components-core/TableOfContentsContext";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

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

  return (
    <span ref={elementRef} style={{ width: 0, height: 0 }} id={uid}>
      {children}
    </span>
  );
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
    /**
     * The level of the bookmark. The level is used to determine the bookmark's position in the
     * table of contents.
     */
    level: number;
  };
}

export const BookmarkMd: ComponentDescriptor<BookmarkComponentDef> = {
  displayName: "Bookmark",
  description: "Places a bookmark into its parent component's view.",
  opaque: true,
  props: {
    id: desc("The unique identifier of the bookmark."),
    level: desc("The level of the bookmark."),
  },
};

export const bookmarkComponentRenderer = createComponentRenderer<BookmarkComponentDef>(
  "Bookmark",
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutContext } = rendererContext;

    return (
      <Bookmark uid={extractValue(node.uid)} level={extractValue(node.props.level)}>
        {renderChild(node.children, layoutContext)}
      </Bookmark>
    );
  },
  BookmarkMd,
);
