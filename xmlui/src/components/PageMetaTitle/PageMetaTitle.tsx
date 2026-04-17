import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { PageMetaTitle, defaultProps } from "./PageMetaTitleReact";

const COMP = "PageMetaTitle";

export const PageMetaTitleMd = createMetadata({
  status: "stable",
  nonVisual: true,
  description:
    "`PageMetaTitle` dynamically sets or updates the browser tab title, enabling " +
    "pages and components to override the default application name with context-specific titles.",
  props: {
    value: {
      description: `This property sets the page's title to display in the browser tab.`,
      defaultValue: defaultProps.title,
    },
    noSuffix: {
      description:
        "When set to `true`, suppresses the app name suffix (e.g. `| XMLUI`) that is " +
        "automatically appended to the page title.",
      valueType: "boolean",
      defaultValue: defaultProps.noSuffix,
    },
  },
});

export const pageMetaTitleComponentRenderer = wrapComponent(COMP, PageMetaTitle, PageMetaTitleMd, {
  customRender: (_props, { node, extractValue, renderChild }) => {
    return (
      <PageMetaTitle
        title={extractValue(node.props.value) || renderChild(node.children)}
        noSuffix={extractValue.asOptionalBoolean(node.props.noSuffix)}
      />
    );
  },
});
