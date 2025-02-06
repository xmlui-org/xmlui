import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";

export const HtmlH1Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h1\` tag.",
});

export const htmlH1TagRenderer = createComponentRenderer("h1", HtmlH1Md, ({ node, renderChild }) => {
  return <h1>{renderChild(node.children)}</h1>;
});

export const HtmlH2Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h2\` tag.",
});

export const htmlH2TagRenderer = createComponentRenderer("h2", HtmlH2Md, ({ node, renderChild }) => {
  return <h2>{renderChild(node.children)}</h2>;
});

export const HtmlH3Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h2\` tag.",
});

export const htmlH3TagRenderer = createComponentRenderer("h3", HtmlH3Md, ({ node, renderChild }) => {
  return <h3>{renderChild(node.children)}</h3>;
});

export const HtmlH4Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h4\` tag.",
});

export const htmlH4TagRenderer = createComponentRenderer("h4", HtmlH4Md, ({ node, renderChild }) => {
  return <h3>{renderChild(node.children)}</h3>;
});

export const HtmlH5Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h5\` tag.",
});

export const htmlH5TagRenderer = createComponentRenderer("h5", HtmlH5Md, ({ node, renderChild }) => {
  return <h5>{renderChild(node.children)}</h5>;
});

export const HtmlH6Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h6\` tag.",
});

export const htmlH6TagRenderer = createComponentRenderer("h6", HtmlH6Md, ({ node, renderChild }) => {
  return <h6>{renderChild(node.children)}</h6>;
});

export const HtmlPMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`h1\` tag.",
});

export const htmlPTagRenderer = createComponentRenderer("p", HtmlPMd, ({ node, renderChild }) => {
  return <p>{renderChild(node.children)}</p>;
});

export const HtmlBMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`b\` tag.",
});

export const htmlBTagRenderer = createComponentRenderer("b", HtmlBMd, ({ node, renderChild }) => {
  return <b>{renderChild(node.children)}</b>;
});

export const HtmlEMMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`em\` tag.",
});

export const htmlEMTagRenderer = createComponentRenderer("em", HtmlEMMd, ({ node, renderChild }) => {
  return <em>{renderChild(node.children)}</em>;
});

export const HtmlCodeMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`code\` tag.",
});

export const htmlCodeTagRenderer = createComponentRenderer("code", HtmlCodeMd, ({ node, renderChild }) => {
  return <code>{renderChild(node.children)}</code>;
});

export const HtmlPreMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML \`pre\` tag.",
});

export const htmlPreTagRenderer = createComponentRenderer("pre", HtmlPreMd, ({ node, renderChild }) => {
  return <pre>{renderChild(node.children)}</pre>;
});
