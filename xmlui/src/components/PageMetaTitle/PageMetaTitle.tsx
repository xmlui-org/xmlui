import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { PageMetaTitle, defaultProps } from "./PageMetaTilteNative";

const COMP = "PageMetaTitle";

export const PageMetaTitleMd = createMetadata({
  status: "stable",
  description:
    "`PageMetaTitle` dynamically sets or updates the browser tab title, enabling " +
    "pages and components to override the default application name with context-specific titles.",
  props: {
    value: {
      description: `This property sets the page's title to display in the browser tab.`,
      defaultValue: defaultProps.title,
    },
  },
});

export const pageMetaTitleComponentRenderer = createComponentRenderer(
  COMP,
  PageMetaTitleMd,
  ({ node, extractValue, renderChild }) => {
    return <PageMetaTitle title={extractValue(node.props.value) || renderChild(node.children)} />;
  },
);
