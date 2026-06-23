import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  level: 1,
  omitFromToc: false,
};

export const BookmarkMd = createMetadata({
  status: "stable",
  deprecationMessage:
    "The Bookmark component is deprecated. We will remove it in a future release. Please use the `bookmark` property instead.",
  description:
    "Places a bookmark into its parent component's view so links and component APIs can scroll to it.",
  opaque: true,
  props: {
    id: {
      description: "The unique identifier of the bookmark.",
      valueType: "string",
    },
    level: {
      description: "The bookmark level used by table-of-contents components.",
      valueType: "number",
      defaultValue: defaultProps.level,
    },
    title: {
      description: "The text used by table-of-contents components.",
      valueType: "string",
    },
    omitFromToc: {
      description: "If true, this bookmark will be excluded from the table of contents.",
      valueType: "boolean",
      defaultValue: defaultProps.omitFromToc,
    },
    testId: {
      description: "Adds a test identifier to the bookmark anchor.",
      valueType: "string",
    },
  },
  apis: {
    scrollIntoView: {
      signature: "scrollIntoView()",
      description: "Scrolls the bookmark into view.",
    },
  },
});
