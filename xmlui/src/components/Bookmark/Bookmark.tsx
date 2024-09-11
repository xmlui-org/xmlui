import { createComponentRenderer, createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d, type ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { Bookmark } from "./BookmarkNative";

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

export const BookmarkMd = createMetadata({
  description: "Places a bookmark into its parent component's view.",
  opaque: true,
  props: {
    id: d("The unique identifier of the bookmark. You can use this identifier in links to navigate to this component's location."),
    level: d("The level of the bookmark."),
  },
});

export const bookmarkComponentRenderer = createComponentRendererNew(
  "Bookmark",
  BookmarkMd,
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutContext } = rendererContext;

    return (
      <Bookmark uid={extractValue(node.uid)} level={extractValue(node.props.level)}>
        {renderChild(node.children, layoutContext)}
      </Bookmark>
    );
  },
);
