import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";

export const HtmlBMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`b\` tag.",
  props: {},
  events: {}
});

export const htmlBTagRenderer = createComponentRenderer("b", HtmlBMd, ({ node, renderChild }) => {
  return <b>{renderChild(node.children)}</b>;
});

export const HtmlEMMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`em\` tag.",
  props: {},
  events: {}
});

export const htmlEMTagRenderer = createComponentRenderer("em", HtmlEMMd, ({ node, renderChild }) => {
  return <em>{renderChild(node.children)}</em>;
});

export const HtmlCodeMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`code\` tag.",
  props: {},
  events: {}
});

export const htmlCodeTagRenderer = createComponentRenderer("code", HtmlCodeMd, ({ node, renderChild }) => {
  return <code>{renderChild(node.children)}</code>;
});
