import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";

export const HtmlH1Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h1` tag.",
});

export const htmlH1TagRenderer = createComponentRenderer(
  "h1",
  HtmlH1Md,
  ({ node, renderChild }) => {
    return <h1>{renderChild(node.children)}</h1>;
  },
);

export const HtmlH2Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h2` tag.",
});

export const htmlH2TagRenderer = createComponentRenderer(
  "h2",
  HtmlH2Md,
  ({ node, renderChild }) => {
    return <h2>{renderChild(node.children)}</h2>;
  },
);

export const HtmlH3Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h2` tag.",
});

export const htmlH3TagRenderer = createComponentRenderer(
  "h3",
  HtmlH3Md,
  ({ node, renderChild }) => {
    return <h3>{renderChild(node.children)}</h3>;
  },
);

export const HtmlH4Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h4` tag.",
});

export const htmlH4TagRenderer = createComponentRenderer(
  "h4",
  HtmlH4Md,
  ({ node, renderChild }) => {
    return <h3>{renderChild(node.children)}</h3>;
  },
);

export const HtmlH5Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h5` tag.",
});

export const htmlH5TagRenderer = createComponentRenderer(
  "h5",
  HtmlH5Md,
  ({ node, renderChild }) => {
    return <h5>{renderChild(node.children)}</h5>;
  },
);

export const HtmlH6Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h6` tag.",
});

export const htmlH6TagRenderer = createComponentRenderer(
  "h6",
  HtmlH6Md,
  ({ node, renderChild }) => {
    return <h6>{renderChild(node.children)}</h6>;
  },
);

export const HtmlPMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h1` tag.",
});

export const htmlPTagRenderer = createComponentRenderer("p", HtmlPMd, ({ node, renderChild }) => {
  return <p>{renderChild(node.children)}</p>;
});

export const HtmlBMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `b` tag.",
});

export const htmlBTagRenderer = createComponentRenderer("b", HtmlBMd, ({ node, renderChild }) => {
  return <b>{renderChild(node.children)}</b>;
});

export const HtmlEMMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `em` tag.",
});

export const htmlEMTagRenderer = createComponentRenderer(
  "em",
  HtmlEMMd,
  ({ node, renderChild }) => {
    return <em>{renderChild(node.children)}</em>;
  },
);

export const HtmlCodeMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `code` tag.",
});

export const htmlCodeTagRenderer = createComponentRenderer(
  "code",
  HtmlCodeMd,
  ({ node, renderChild }) => {
    return <code>{renderChild(node.children)}</code>;
  },
);

export const HtmlPreMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `pre` tag.",
});

export const htmlPreTagRenderer = createComponentRenderer(
  "pre",
  HtmlPreMd,
  ({ node, renderChild }) => {
    return <pre>{renderChild(node.children)}</pre>;
  },
);

export const HtmlImgMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `img` tag.",
  props: {
    alt: d("Specifies an alternate text for an image"),
    height: d("Specifies the height of an image"),
    src: d("Specifies the path to the image"),
    width: d("Specifies the width of an image"),
    useMap: d("Specifies an image as a client-side image map"),
    loading: d("Specifies the loading behavior of the image"),
    referrerPolicy: d("Specifies the referrer policy for the image"),
    sizes: d("Specifies image sizes for different page layouts"),
  },
});

export const htmlImgTagRenderer = createComponentRenderer(
  "img",
  HtmlImgMd,
  ({ node, renderChild, extractValue, extractResourceUrl }) => {
    return (
      <img
        alt={extractValue(node.props.alt)}
        height={extractValue(node.props.height)}
        width={node.props.width}
        src={extractResourceUrl(node.props.src)}
        useMap={extractValue(node.props.useMap)}
        loading={extractValue(node.props.loading)}
        referrerPolicy={extractValue(node.props.referrerPolicy)}
        sizes={extractValue(node.props.sizes)}
      >
        {renderChild(node.children)}
      </img>
    );
  },
);

export const HtmlUlMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `ul` tag.",
});

export const htmlUlTagRenderer = createComponentRenderer(
  "ul",
  HtmlUlMd,
  ({ node, renderChild }) => {
    return <ul>{renderChild(node.children)}</ul>;
  },
);

export const HtmlOlMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `ol` tag.",
  props: {
    reversed: d("Specifies that the list order should be descending (9, 8, 7, ...)"),
    start: d("Specifies the start value of the first list item"),
    type: d("Specifies the kind of marker to use in the list (e.g., '1', 'A', 'a', 'I', 'i')"),
  },
});

export const htmlOlTagRenderer = createComponentRenderer(
  "ol",
  HtmlOlMd,
  ({ node, renderChild, extractValue }) => {
    return (
      <ol
        reversed={extractValue.asOptionalBoolean(node.props.reversed, false)}
        start={extractValue.asOptionalNumber(node.props.start, 1)}
        type={extractValue(node.props.type)}
      >
        {renderChild(node.children)}
      </ol>
    );
  },
);

export const HtmlLiMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `li` tag.",
  props: {
    value: d(
      "Specifies the value of the list item. This is used to override the default numbering in ordered lists.",
    ),
  },
});

export const htmlLiTagRenderer = createComponentRenderer(
  "li",
  HtmlLiMd,
  ({ node, renderChild, extractValue }) => {
    return <li value={extractValue(node.props.value)}>{renderChild(node.children)}</li>;
  },
);

export const HtmlDivMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `div` tag.",
  props: {
    value: d(
      "Specifies the value of the list item. This is used to override the default numbering in ordered lists.",
    ),
  },
});

export const htmlDivTagRenderer = createComponentRenderer(
  "div",
  HtmlDivMd,
  ({ node, renderChild }) => {
    return <div>{renderChild(node.children)}</div>;
  },
);

export const HtmlSpanMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `div` tag.",
  props: {
    value: d(
      "Specifies the value of the list item. This is used to override the default numbering in ordered lists.",
    ),
  },
});

export const htmlSpanTagRenderer = createComponentRenderer(
  "span",
  HtmlSpanMd,
  ({ node, renderChild }) => {
    return <span>{renderChild(node.children)}</span>;
  },
);

export const HtmlAMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `a` tag.",
  props: {
    href: d("Specifies the URL of the page the link goes to"),
    target: d("Specifies where to open the linked document"),
    rel: d("Specifies the relationship between the current document and the linked document"),
    download: d("Specifies that the target will be downloaded when a user clicks on the hyperlink"),
    hrefLang: d("Specifies the language of the linked document"),
    type: d("Specifies the media type of the linked document"),
    referrerPolicy: d("Specifies which referrer information to send with the link"),
  },
});

export const htmlATagRenderer = createComponentRenderer(
  "a",
  HtmlAMd,
  ({ node, renderChild, extractResourceUrl, extractValue }) => {
    return (
      <a
        href={extractResourceUrl(node.props.href)}
        target={extractValue(node.props.target)}
        rel={extractValue(node.props.rel)}
        download={extractValue(node.props.download)}
        hrefLang={extractValue(node.props.hrefLang)}
        type={extractValue(node.props.type)}
        referrerPolicy={extractValue(node.props.referrerPolicy)}
      >
        {renderChild(node.children)}
      </a>
    );
  },
);

// TODO: table
// TODO: thead
// TODO: tbody
// TODO: tr
// TODO: th
// TODO: td
