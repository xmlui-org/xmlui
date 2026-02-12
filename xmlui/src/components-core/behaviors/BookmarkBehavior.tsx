import { useIsomorphicLayoutEffect } from "framer-motion";
import { ReactElement, useRef, useContext, useCallback, useEffect, cloneElement } from "react";
import { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { TableOfContentsContext } from "../TableOfContentsContext";
import { Behavior } from "./Behavior";

/**
 * Behavior for adding bookmark functionality to any visual component.
 * When a component has a `bookmark` property, this behavior adds bookmark-related
 * attributes and functionality without wrapping the component.
 */
export const bookmarkBehavior: Behavior = {
  metadata: {
    name: "bookmark",
    friendlyName: "Bookmark",
    description:
      "Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.",
    triggerProps: ["bookmark"],
    props: {
      bookmark: {
        valueType: "string",
        description: "The ID of the bookmark to create for this component.",
      },
      bookmarkLevel: {
        valueType: "number",
        description: "The heading level for this bookmark (used in table of contents).",
      },
      bookmarkTitle: {
        valueType: "string",
        description:
          "The title to use for this bookmark in the table of contents. Defaults to the component's text content.",
      },
      bookmarkOmitFromToc: {
        valueType: "boolean",
        description: "Whether to omit this bookmark from the table of contents.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (context, node, metadata) => {
    // Don't attach to non-visual components
    if (metadata?.nonVisual) {
      return false;
    }

    const { extractValue } = context;
    const bookmark = extractValue(node.props?.bookmark, true);
    return !!bookmark;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode, registerComponentApi } = context;
    const bookmarkId = extractValue.asOptionalString(componentNode.props?.bookmark);
    const bookmarkLevel = extractValue.asOptionalNumber(componentNode.props?.bookmarkLevel, 1);
    const bookmarkTitle = extractValue.asOptionalString(componentNode.props?.bookmarkTitle);
    const bookmarkOmitFromToc = extractValue.asOptionalBoolean(
      componentNode.props?.bookmarkOmitFromToc,
      false,
    );

    if (!bookmarkId) {
      return node;
    }

    // Wrap the node in a component that provides bookmark functionality
    return (
      <BookmarkWrapper
        bookmarkId={bookmarkId}
        level={bookmarkLevel}
        title={bookmarkTitle}
        omitFromToc={bookmarkOmitFromToc}
        registerComponentApi={registerComponentApi}
      >
        {node as ReactElement}
      </BookmarkWrapper>
    );
  },
};

/**
 * Wrapper component that adds bookmark functionality to any child element
 * using React.cloneElement to avoid extra DOM wrappers.
 */
function BookmarkWrapper({
  children,
  bookmarkId,
  level,
  title,
  omitFromToc,
  registerComponentApi,
}: {
  children: ReactElement;
  bookmarkId: string;
  level: number;
  title?: string;
  omitFromToc: boolean;
  registerComponentApi?: RegisterComponentApiFn;
}) {
  const elementRef = useRef<HTMLElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    if (elementRef.current) {
      // Try to find and scroll the nearest scrollable ancestor
      let scrollableParent = elementRef.current.parentElement;
      while (scrollableParent) {
        const style = window.getComputedStyle(scrollableParent);
        const isScrollable =
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
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

  useIsomorphicLayoutEffect(() => {
    if (observeIntersection && elementRef.current && bookmarkId && !omitFromToc) {
      return registerHeading?.({
        id: bookmarkId,
        level,
        text: title || elementRef.current?.textContent?.trim()?.replace(/#$/, "") || bookmarkId,
        anchor: elementRef.current as any,
      });
    }
  }, [bookmarkId, observeIntersection, registerHeading, level, title, omitFromToc]);

  // Clone the child element and add bookmark-related props
  return cloneElement(children, {
    ref: elementRef,
    id: bookmarkId,
    "data-anchor": true,
  } as any);
}

