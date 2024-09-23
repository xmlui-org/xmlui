import { createComponentRenderer } from "@components-core/renderers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { Bookmark } from "./BookmarkNative";

const COMP = "Bookmark";

export const BookmarkMd = createMetadata({
  description:
    `As its name suggests, this component places a bookmark into its parent component's view. The ` +
    `component has an \`id\` that you can use in links to navigate (scroll to) the bookmark's location.`,
  opaque: true,
  props: {
    id: d(
      `The unique identifier of the bookmark. You can use this identifier in links to navigate ` +
        `to this component's location.`,
    ),
    level: d(
      `The level of the bookmark. The level is used to determine the bookmark's ` +
        `position in the table of contents.`,
    ),
  },
});

export const bookmarkComponentRenderer = createComponentRenderer(
  COMP,
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
