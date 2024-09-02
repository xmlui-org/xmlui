import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";

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
  }
}

export const bookmarkComponentRenderer = createComponentRenderer<BookmarkComponentDef>(
  "Bookmark",
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutContext } = rendererContext;
    return (
      <>
        <span id={extractValue(node.uid)} style={{width: 0, height: 0}} />
        {renderChild(node.children, layoutContext)}
      </>
    );
  },
  {
    opaque: true,
  }
);
