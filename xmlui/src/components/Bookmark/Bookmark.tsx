import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Bookmark } from "./BookmarkNative";

const COMP = "Bookmark";

export const BookmarkMd = createMetadata({
  description:
    "As its name suggests, this component places a bookmark into its parent component's view. The " +
    "component has an \`id\` that you can use in links to navigate (scroll to) the bookmark's location.",
  opaque: true,
  props: {
    uid: {
      description: "The unique identifier of the bookmark. You can use this identifier in links to navigate " +
        "to this component's location.",
      valueType: "string",
    },
    level: {
      description: "The level of the bookmark. The level is used to determine the bookmark's " +
        "position in the table of contents.",
      valueType: "number",
      defaultValue: 1,
    },
    title: {
      description: "Defines the text to display the bookmark in the table of contents. If this property is " +
        "empty, the text falls back to the value of \`id\`.",
      valueType: "string",
    },
    omitFromToc: {
      description: "If true, this bookmark will be excluded from the table of contents.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
});

export const bookmarkComponentRenderer = createComponentRenderer(
  COMP,
  BookmarkMd,
  (rendererContext) => {
    const { node, renderChild, extractValue, layoutContext } = rendererContext;

    return (
      <Bookmark
        uid={extractValue(node.uid)}
        level={extractValue(node.props.level)}
        title={extractValue(node.props.title)}
        omitFromToc={extractValue.asOptionalBoolean(node.props.omitFromToc)}
      >
        {renderChild(node.children, layoutContext)}
      </Bookmark>
    );
  },
);
