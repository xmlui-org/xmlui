import { createMetadata, d, PropertyValueDescription } from "@abstractions/ComponentDefs";

import { createComponentRenderer } from "@components-core/renderers";
import { RawHtml } from "./RawHtmlNative";

const COMP = "RawHtml";

const hostTypesMd: PropertyValueDescription[] = [
  {
    value: "div",
    description: "Use a 'div' as the host element.",
  },
  {
    value: "span",
    description: "Use a 'span' as the host element.",
  },
];

export const RawHtmlMd = createMetadata({
  status: "experimental",
  description: "This component injects a raw HTML string into the DOM.",
  props: {
    content: d("Specifies the raw HTML content to inject"),
    hostElement: d(
      "Specifies the host element to inject the content into.",
      hostTypesMd,
      "string",
      "span",
    ),
  },
  events: {},
  apis: {},
  themeVars: [],
  defaultThemeVars: {
    light: {},
    dark: {},
  },
});

export const rawHtmlComponentRenderer = createComponentRenderer(
  COMP,
  RawHtmlMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    const childText = renderChild(node.children);
    const content =
      extractValue.asDisplayText(node.props.content) ||
      (typeof childText === "string" ? childText : "");
    return (
      <RawHtml
        content={content}
        hostElement={node.props.hostElement}
        style={layoutCss}
      />
    );
  },
);
