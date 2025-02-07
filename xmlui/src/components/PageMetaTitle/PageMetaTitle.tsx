import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { PageMetaTitle } from "./PageMetaTilteNative";

const COMP = "PageMetaTitle";

export const PageMetaTitleMd = createMetadata({
  description:
    `A PageMetaTitle component allows setting up (or changing) the app title to display with the ` +
    `current browser tab.`,
  props: {
    value: d(`This property sets the page's title to display in the browser tab.`),
  },
});

export const pageMetaTitleComponentRenderer = createComponentRenderer(
  COMP,
  PageMetaTitleMd,
  ({ node, extractValue, renderChild }) => {
    return <PageMetaTitle title={extractValue(node.props.value) || renderChild(node.children)} />;
  },
);
