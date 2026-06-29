import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode, XmluiText } from "../../compiler/ir";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { PageMetaTitle } from "./PageMetaTitleReact";
import { defaultProps } from "./PageMetaTitle.defaults";

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
      valueType: "string",
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

export const pageMetaTitleRenderer = wrapComponent({
  name: COMP,
  metadata: PageMetaTitleMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const value = adapter.prop("value");
    const childTitle = textChildren(adapter.node.children);
    const title = value === undefined || value === null || value === ""
      ? childTitle || defaultProps.title
      : String(value).trim();

    return (
      <PageMetaTitle
        title={title}
        noSuffix={adapter.booleanProp("noSuffix", defaultProps.noSuffix)}
      />
    );
  },
});

function textChildren(children: XmluiNode[]): string {
  return children
    .filter((child): child is XmluiText => child.kind === "text")
    .map((child) => child.value)
    .join("")
    .trim();
}
