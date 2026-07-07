/**
 * @deprecated HTML Tag Components are temporary and will be removed from the framework.
 *
 * DEPRECATION NOTICE:
 * All HTML tag wrapper components in this file are scheduled for removal in a future version.
 * These components were created as temporary solutions and should not be used in new development.
 *
 * Migration Path:
 * - Replace with native HTML elements or dedicated XMLUI components
 * - Use semantic HTML directly for better performance and maintainability
 * - Consider existing XMLUI components (Button, Link, Text, Heading, etc.) for common use cases
 *
 * Timeline: These components will be removed in the next major version release.
 */

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import styles from "./HtmlTags.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { ThemedLinkNative as LinkNative } from "../Link/Link";
import { ThemedHeading as Heading } from "../Heading/Heading";
import { ThemedText as Text } from "../Text/Text";
import { createMetadata } from "../metadata-helpers";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { ComponentExtension } from "../../extensions";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

type HtmlTagProps = Record<string, any> & {
  children?: React.ReactNode;
  classes?: Record<string, string>;
};

type HtmlTagOptions = {
  extraClassName?: string;
  booleanProps?: string[];
  voidElement?: boolean;
};

function getHtmlTagClassName(classes?: Record<string, string>, extraClassName?: string) {
  return classnames(extraClassName, classes?.[COMPONENT_PART_KEY]);
}

function createHtmlTag(tag: keyof React.JSX.IntrinsicElements, options: HtmlTagOptions = {}) {
  return function HtmlTag({ children, classes, className: _className, ...props }: HtmlTagProps) {
    const htmlProps = { ...props };
    for (const prop of options.booleanProps ?? []) {
      htmlProps[prop] = htmlProps[prop] ?? false;
    }
    htmlProps.className = getHtmlTagClassName(classes, options.extraClassName);
    return React.createElement(tag, htmlProps, options.voidElement ? undefined : children);
  };
}

function createHtmlTextTag(variant: string) {
  return function HtmlTextTag({
    children,
    classes,
    className: _className,
    ...props
  }: HtmlTagProps) {
    return (
      <Text className={getHtmlTagClassName(classes)} {...props} variant={variant}>
        {children}
      </Text>
    );
  };
}

function createHtmlHeadingTag(level: string) {
  return function HtmlHeadingTag({
    children,
    classes,
    className: _className,
    ...props
  }: HtmlTagProps) {
    return (
      <Heading
        className={getHtmlTagClassName(classes, styles.htmlHeading)}
        {...props}
        level={level}
      >
        {children}
      </Heading>
    );
  };
}

function HtmlLinkTag({
  children,
  classes,
  className: _className,
  href,
  disabled,
  ...props
}: HtmlTagProps) {
  return (
    <LinkNative
      to={href}
      enabled={!(disabled ?? false)}
      className={getHtmlTagClassName(classes)}
      {...props}
    >
      {children}
    </LinkNative>
  );
}

export const HtmlAMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `a` tag.",
  isHtmlTag: true,
  props: {
    href: {
      description: "Specifies the URL of the page the link goes to",
    },
    target: {
      description: "Specifies where to open the linked document",
    },
    rel: {
      description:
        "Specifies the relationship between the current document and the linked document",
    },
    download: {
      description:
        "Indicates that the target will be downloaded when a user clicks on the hyperlink",
    },
    hreflang: {
      description: "Specifies the language of the linked document",
    },
    type: {
      description: "Specifies the MIME type of the linked document",
    },
    ping: {
      description:
        "Specifies a space-separated list of URLs to be notified if the user follows the hyperlink",
    },
    referrerPolicy: {
      description: "Specifies the referrer policy for the element",
    },
    disabled: {
      description: "Specifies that the link should be disabled",
    },
  },
});

export const htmlATagRenderer = wrapComponent("a", HtmlLinkTag, HtmlAMd, {
  stateful: false,
  booleans: ["disabled"],
});

export const HtmlAbbrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `abbr` tag.",
  isHtmlTag: true,
});

export const htmlAbbrTagRenderer = wrapComponent("abbr", createHtmlTextTag("abbr"), HtmlAbbrMd, {
  stateful: false,
});

export const HtmlAddressMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `address` tag.",
  isHtmlTag: true,
});

export const htmlAddressTagRenderer = wrapComponent(
  "address",
  createHtmlTag("address"),
  HtmlAddressMd,
  {
    stateful: false,
  },
);

export const HtmlAreaMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `area` tag.",
  isHtmlTag: true,
  props: {
    alt: {
      description: "Specifies an alternate text for the area",
    },
    coords: {
      description: "Specifies the coordinates of the area",
    },
    download: {
      description: "Indicates that the target will be downloaded when a user clicks on the area",
    },
    href: {
      description: "Specifies the URL of the linked document",
    },
    hrefLang: {
      description: "Specifies the language of the linked document",
    },
    referrerPolicy: {
      description: "Specifies the referrer policy for the area",
    },
    rel: {
      description:
        "Specifies the relationship between the current document and the linked document",
    },
    shape: {
      description: "Specifies the shape of the area",
    },
    target: {
      description: "Specifies where to open the linked document",
    },
    media: {
      description: "Specifies a media query for the linked resource",
    },
  },
});

export const htmlAreaTagRenderer = wrapComponent(
  "area",
  createHtmlTag("area", { voidElement: true }),
  HtmlAreaMd,
  {
    stateful: false,
  },
);

export const HtmlArticleMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `article` tag.",
  isHtmlTag: true,
});

export const htmlArticleTagRenderer = wrapComponent(
  "article",
  createHtmlTag("article"),
  HtmlArticleMd,
  {
    stateful: false,
  },
);

export const HtmlAsideMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `aside` tag.",
  isHtmlTag: true,
});

export const htmlAsideTagRenderer = wrapComponent("aside", createHtmlTag("aside"), HtmlAsideMd, {
  stateful: false,
});

export const HtmlAudioMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `audio` tag.",
  isHtmlTag: true,
  props: {
    autoPlay: {
      description: "Specifies that the audio will start playing as soon as it is ready",
    },
    controls: {
      description: "Specifies that audio controls should be displayed",
    },
    crossOrigin: {
      description: "Specifies how the element handles cross-origin requests",
    },
    loop: {
      description: "Specifies that the audio will start over again every time it is finished",
    },
    muted: {
      description: "Specifies that the audio output should be muted",
    },
    preload: {
      description:
        "Specifies if and how the author thinks the audio should be loaded when the page loads",
    },
    src: {
      description: "Specifies the URL of the audio file",
    },
  },
});

export const htmlAudioTagRenderer = wrapComponent(
  "audio",
  createHtmlTag("audio", { booleanProps: ["autoPlay", "controls", "loop", "muted"] }),
  HtmlAudioMd,
  {
    stateful: false,
    booleans: ["autoPlay", "controls", "loop", "muted"],
  },
);

export const HtmlBMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `b` tag.",
  isHtmlTag: true,
});

export const htmlBTagRenderer = wrapComponent("b", createHtmlTag("b"), HtmlBMd, {
  stateful: false,
});

export const HtmlBdiMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `bdi` tag.",
  isHtmlTag: true,
});

export const htmlBdiTagRenderer = wrapComponent("bdi", createHtmlTag("bdi"), HtmlBdiMd, {
  stateful: false,
});

export const HtmlBdoMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `bdo` tag.",
  isHtmlTag: true,
  props: {
    dir: {
      description: "Specifies the text direction override",
    },
  },
});

export const htmlBdoTagRenderer = wrapComponent("bdo", createHtmlTag("bdo"), HtmlBdoMd, {
  stateful: false,
});

export const HtmlBlockquoteMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `blockquote` tag.",
  isHtmlTag: true,
  props: {
    cite: {
      description: "Specifies the source of the quotation",
    },
  },
});

export const htmlBlockquoteTagRenderer = wrapComponent(
  "blockquote",
  createHtmlTag("blockquote"),
  HtmlBlockquoteMd,
  {
    stateful: false,
  },
);

export const HtmlButtonMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `button` tag.",
  isHtmlTag: true,
  props: {
    autoFocus: {
      description: "Specifies that the button should automatically get focus when the page loads",
    },
    disabled: {
      description: "Specifies that the button should be disabled",
    },
    form: {
      description: "Specifies the form the button belongs to",
    },
    formAction: {
      description:
        "Specifies the URL of a file that processes the information submitted by the button",
    },
    formEncType: {
      description: "Specifies how the form-data should be encoded when submitting it to the server",
    },
    formMethod: {
      description: "Specifies the HTTP method to use when sending form-data",
    },
    formNoValidate: {
      description: "Specifies that the form should not be validated when submitted",
    },
    formTarget: {
      description: "Specifies where to display the response after submitting the form",
    },
    name: {
      description: "Specifies a name for the button",
    },
    type: {
      description: "Specifies the type of the button",
    },
    value: {
      description: "Specifies the value associated with the button",
    },
  },
});

export const htmlButtonTagRenderer = wrapComponent(
  "button",
  createHtmlTag("button", { booleanProps: ["autoFocus", "disabled", "formNoValidate"] }),
  HtmlButtonMd,
  {
    stateful: false,
    booleans: ["autoFocus", "disabled", "formNoValidate"],
  },
);

export const HtmlCanvasMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `canvas` tag.",
  isHtmlTag: true,
  props: {
    width: {
      description: "Specifies the width of the canvas",
    },
    height: {
      description: "Specifies the height of the canvas",
    },
  },
});

export const htmlCanvasTagRenderer = wrapComponent(
  "canvas",
  createHtmlTag("canvas"),
  HtmlCanvasMd,
  {
    stateful: false,
    numbers: ["width", "height"],
  },
);

export const HtmlCaptionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `caption` tag.",
  isHtmlTag: true,
});

export const htmlCaptionTagRenderer = wrapComponent(
  "caption",
  createHtmlTag("caption"),
  HtmlCaptionMd,
  {
    stateful: false,
  },
);

export const HtmlCiteMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `cite` tag.",
  isHtmlTag: true,
});

export const htmlCiteTagRenderer = wrapComponent("cite", createHtmlTextTag("cite"), HtmlCiteMd, {
  stateful: false,
});

export const HtmlCodeMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `code` tag.",
  isHtmlTag: true,
});

export const htmlCodeTagRenderer = wrapComponent("code", createHtmlTextTag("code"), HtmlCodeMd, {
  stateful: false,
});

export const HtmlColMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `col` tag.",
  isHtmlTag: true,
  props: {
    span: {
      description: "Specifies the number of columns a `col` element should span",
    },
  },
});

export const htmlColTagRenderer = wrapComponent(
  "col",
  createHtmlTag("col", { voidElement: true }),
  HtmlColMd,
  {
    stateful: false,
    numbers: ["span"],
  },
);

export const HtmlColgroupMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `colgroup` tag.",
  isHtmlTag: true,
  props: {
    span: {
      description: "Specifies the number of columns in a `colgroup`",
    },
  },
});

export const htmlColgroupTagRenderer = wrapComponent(
  "colgroup",
  createHtmlTag("colgroup"),
  HtmlColgroupMd,
  {
    stateful: false,
    numbers: ["span"],
  },
);

export const HtmlDataMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `data` tag.",
  isHtmlTag: true,
  props: {
    value: {
      description: "Specifies the machine-readable value of the element",
    },
  },
});

export const htmlDataTagRenderer = wrapComponent("data", createHtmlTag("data"), HtmlDataMd, {
  stateful: false,
});

export const HtmlDatalistMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `datalist` tag.",
  isHtmlTag: true,
});

export const htmlDatalistTagRenderer = wrapComponent(
  "datalist",
  createHtmlTag("datalist"),
  HtmlDatalistMd,
  {
    stateful: false,
  },
);

export const HtmlDdMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dd` tag.",
  isHtmlTag: true,
});

export const htmlDdTagRenderer = wrapComponent("dd", createHtmlTag("dd"), HtmlDdMd, {
  stateful: false,
});

export const HtmlDelMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `del` tag.",
  isHtmlTag: true,
  props: {
    cite: {
      description: "Specifies the source of the quotation",
    },
    dateTime: {
      description: "Specifies the date and time of the edit",
    },
  },
});

export const htmlDelTagRenderer = wrapComponent("del", createHtmlTextTag("deleted"), HtmlDelMd, {
  stateful: false,
});

export const HtmlDetailsMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `details` tag.",
  isHtmlTag: true,
  props: {
    open: {
      description: "Specifies that the details are visible (open)",
    },
  },
  themeVars: parseScssVar(styles.themeVarsDetails),
  defaultThemeVars: {
    "marginTop-HtmlDetails": "1rem",
    "marginBottom-HtmlDetails": "1rem",
  },
});

export const htmlDetailsTagRenderer = wrapComponent(
  "details",
  createHtmlTag("details", { extraClassName: styles.htmlDetails, booleanProps: ["open"] }),
  HtmlDetailsMd,
  {
    stateful: false,
    booleans: ["open"],
  },
);

export const HtmlDfnMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dfn` tag.",
  isHtmlTag: true,
});

export const htmlDfnTagRenderer = wrapComponent("dfn", createHtmlTag("dfn"), HtmlDfnMd, {
  stateful: false,
});

export const HtmlDialogMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dialog` tag.",
  isHtmlTag: true,
  props: {
    open: {
      description: "Specifies that the dialog is open",
    },
  },
});

export const htmlDialogTagRenderer = wrapComponent(
  "dialog",
  createHtmlTag("dialog", { booleanProps: ["open"] }),
  HtmlDialogMd,
  {
    stateful: false,
    booleans: ["open"],
  },
);

export const HtmlDivMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `div` tag.",
  isHtmlTag: true,
});

export const htmlDivTagRenderer = wrapComponent("div", createHtmlTag("div"), HtmlDivMd, {
  stateful: false,
});

export const HtmlDlMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dl` tag.",
  isHtmlTag: true,
});

export const htmlDlTagRenderer = wrapComponent("dl", createHtmlTag("dl"), HtmlDlMd, {
  stateful: false,
});

export const HtmlDtMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dt` tag.",
  isHtmlTag: true,
});

export const htmlDtTagRenderer = wrapComponent("dt", createHtmlTag("dt"), HtmlDtMd, {
  stateful: false,
});

export const HtmlEMMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `em` tag.",
  isHtmlTag: true,
});

export const htmlEMTagRenderer = wrapComponent("em", createHtmlTextTag("em"), HtmlEMMd, {
  stateful: false,
});

export const HtmlEmbedMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `embed` tag.",
  isHtmlTag: true,
  props: {
    src: {
      description: "Specifies the URL of the resource",
    },
    type: {
      description: "Specifies the type of the resource",
    },
    width: {
      description: "Specifies the width of the embed",
    },
    height: {
      description: "Specifies the height of the embed",
    },
  },
});

export const htmlEmbedTagRenderer = wrapComponent(
  "embed",
  createHtmlTag("embed", { voidElement: true }),
  HtmlEmbedMd,
  {
    stateful: false,
    resourceUrls: ["src"],
  },
);

export const HtmlFieldsetMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `fieldset` tag.",
  isHtmlTag: true,
  props: {
    disabled: {
      description: "Specifies that the fieldset should be disabled",
    },
    form: {
      description: "Specifies the form the fieldset belongs to",
    },
    name: {
      description: "Specifies a name for the fieldset",
    },
  },
});

export const htmlFieldsetTagRenderer = wrapComponent(
  "fieldset",
  createHtmlTag("fieldset", { booleanProps: ["disabled"] }),
  HtmlFieldsetMd,
  {
    stateful: false,
    booleans: ["disabled"],
  },
);

export const HtmlFigcaptionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `figcaption` tag.",
  isHtmlTag: true,
});

export const htmlFigcaptionTagRenderer = wrapComponent(
  "figcaption",
  createHtmlTag("figcaption"),
  HtmlFigcaptionMd,
  {
    stateful: false,
  },
);

export const HtmlFigureMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `figure` tag.",
  isHtmlTag: true,
});

export const htmlFigureTagRenderer = wrapComponent(
  "figure",
  createHtmlTag("figure"),
  HtmlFigureMd,
  {
    stateful: false,
  },
);

export const HtmlFooterMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `footer` tag.",
  isHtmlTag: true,
});

export const htmlFooterTagRenderer = wrapComponent(
  "footer",
  createHtmlTag("footer"),
  HtmlFooterMd,
  {
    stateful: false,
  },
);

export const HtmlFormMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `form` tag.",
  isHtmlTag: true,
  props: {
    acceptCharset: {
      description: "Specifies the character encodings that are to be used for the form submission",
    },
    action: {
      description: "Specifies where to send the form-data when a form is submitted",
    },
    autoComplete: {
      description: "Specifies whether a form should have auto-completion",
    },
    encType: {
      description: "Specifies how the form-data should be encoded when submitting it to the server",
    },
    method: {
      description: "Specifies the HTTP method to use when sending form-data",
    },
    name: {
      description: "Specifies the name of the form",
    },
    noValidate: {
      description: "Specifies that the form should not be validated when submitted",
    },
    target: {
      description: "Specifies where to display the response after submitting the form",
    },
  },
});

export const htmlFormTagRenderer = wrapComponent(
  "form",
  createHtmlTag("form", { booleanProps: ["noValidate"] }),
  HtmlFormMd,
  {
    stateful: false,
    booleans: ["noValidate"],
  },
);

export const HtmlH1Md = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `h1` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem",
  },
});

export const htmlH1TagRenderer = wrapComponent("h1", createHtmlHeadingTag("h1"), HtmlH1Md, {
  stateful: false,
});

export const HtmlH2Md = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `h2` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem",
  },
});

export const htmlH2TagRenderer = wrapComponent("h2", createHtmlHeadingTag("h2"), HtmlH2Md, {
  stateful: false,
});

export const HtmlH3Md = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `h3` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem",
  },
});

export const htmlH3TagRenderer = wrapComponent("h3", createHtmlHeadingTag("h3"), HtmlH3Md, {
  stateful: false,
});

export const HtmlH4Md = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `h4` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem",
  },
});

export const htmlH4TagRenderer = wrapComponent("h4", createHtmlHeadingTag("h4"), HtmlH4Md, {
  stateful: false,
});

export const HtmlH5Md = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `h5` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem",
  },
});

export const htmlH5TagRenderer = wrapComponent("h5", createHtmlHeadingTag("h5"), HtmlH5Md, {
  stateful: false,
});

export const HtmlH6Md = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `h6` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsHeading),
  defaultThemeVars: {
    "marginTop-HtmlHeading": "1rem",
    "marginBottom-HtmlHeading": ".5rem",
  },
});

export const htmlH6TagRenderer = wrapComponent("h6", createHtmlHeadingTag("h6"), HtmlH6Md, {
  stateful: false,
});

export const HtmlHeaderMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `header` tag.",
  isHtmlTag: true,
});

export const htmlHeaderTagRenderer = wrapComponent(
  "header",
  createHtmlTag("header"),
  HtmlHeaderMd,
  {
    stateful: false,
  },
);

export const HtmlHrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `hr` tag.",
  isHtmlTag: true,
});

export const htmlHrTagRenderer = wrapComponent(
  "hr",
  createHtmlTag("hr", { voidElement: true }),
  HtmlHrMd,
  {
    stateful: false,
  },
);

export const HtmlIMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `i` tag.",
  isHtmlTag: true,
});

export const htmlITagRenderer = wrapComponent("i", createHtmlTag("i"), HtmlIMd, {
  stateful: false,
});

export const HtmlIframeMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `iframe` tag.",
  isHtmlTag: true,
  props: {
    src: {
      description: "Specifies the URL of the page to embed",
    },
    srcDoc: {
      description: "Specifies the HTML content of the page to embed",
    },
    name: {
      description: "Specifies the name of the iframe",
    },
    sandbox: {
      description: "Specifies a set of extra restrictions for the content in the iframe",
    },
    allow: {
      description: "Specifies a feature policy for the iframe",
    },
    allowFullScreen: {
      description: "Specifies that the iframe can be displayed in full-screen mode",
    },
    width: {
      description: "Specifies the width of the iframe",
    },
    height: {
      description: "Specifies the height of the iframe",
    },
    loading: {
      description: "Specifies the loading behavior of the iframe",
    },
    referrerPolicy: {
      description: "Specifies the referrer policy for the iframe",
    },
  },
});

export const htmlIframeTagRenderer = wrapComponent(
  "iframe",
  createHtmlTag("iframe", { booleanProps: ["allowFullScreen"] }),
  HtmlIframeMd,
  {
    stateful: false,
    booleans: ["allowFullScreen"],
    resourceUrls: ["src"],
  },
);

export const HtmlImgMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `img` tag.",
  isHtmlTag: true,
  props: {
    alt: {
      description: "Specifies an alternate text for an image",
    },
    height: {
      description: "Specifies the height of an image",
    },
    src: {
      description: "Specifies the path to the image",
    },
    width: {
      description: "Specifies the width of an image",
    },
    useMap: {
      description: "Specifies an image as a client-side image map",
    },
    loading: {
      description: "Specifies the loading behavior of the image",
    },
    referrerPolicy: {
      description: "Specifies the referrer policy for the image",
    },
    sizes: {
      description: "Specifies image sizes for different page layouts",
    },
  },
});

export const htmlImgTagRenderer = wrapComponent(
  "img",
  createHtmlTag("img", { voidElement: true }),
  HtmlImgMd,
  {
    stateful: false,
    resourceUrls: ["src"],
  },
);

export const HtmlInputMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `input` tag.",
  isHtmlTag: true,
  props: {
    type: {
      description: "Specifies the type of input",
    },
    value: {
      description: "Specifies the value of the input",
    },
    placeholder: {
      description: "Specifies a short hint that describes the expected value of the input",
    },
    autoFocus: {
      description: "Specifies that the input should automatically get focus when the page loads",
    },
    checked: {
      description: "Specifies that the input should be pre-selected",
    },
    disabled: {
      description: "Specifies that the input should be disabled",
    },
    form: {
      description: "Specifies the form the input belongs to",
    },
    name: {
      description: "Specifies the name of the input",
    },
    list: {
      description:
        "Specifies the id of a datalist element that contains pre-defined options for the input",
    },
    max: {
      description: "Specifies the maximum value for an input",
    },
    maxLength: {
      description: "Specifies the maximum number of characters allowed in an input",
    },
    min: {
      description: "Specifies the minimum value for an input",
    },
    minLength: {
      description: "Specifies the minimum number of characters allowed in an input",
    },
    multiple: {
      description: "Specifies that a user can enter more than one value",
    },
    pattern: {
      description: "Specifies a regular expression that an input's value is checked against",
    },
    readOnly: {
      description: "Specifies that the input is read-only",
    },
    required: {
      description: "Specifies that the input is required",
    },
    size: {
      description: "Specifies the width, in characters, of an input",
    },
    step: {
      description: "Specifies the legal number intervals for an input",
    },
  },
});

export const htmlInputTagRenderer = wrapComponent(
  "input",
  createHtmlTag("input", {
    booleanProps: ["autoFocus", "checked", "disabled", "readOnly", "required", "multiple"],
    voidElement: true,
  }),
  HtmlInputMd,
  {
    stateful: false,
    booleans: ["autoFocus", "checked", "disabled", "readOnly", "required", "multiple"],
    numbers: ["maxLength", "minLength", "size"],
  },
);

export const HtmlInsMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `ins` tag.",
  isHtmlTag: true,
  props: {
    cite: {
      description: "Specifies the source URL for the inserted text",
    },
    dateTime: {
      description: "Specifies the date and time when the text was inserted",
    },
  },
});

export const htmlInsTagRenderer = wrapComponent("ins", createHtmlTextTag("inserted"), HtmlInsMd, {
  stateful: false,
});

export const HtmlKbdMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `kbd` tag.",
  isHtmlTag: true,
});

export const htmlKbdTagRenderer = wrapComponent("kbd", createHtmlTextTag("keyboard"), HtmlKbdMd, {
  stateful: false,
});

export const HtmlLabelMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `label` tag.",
  isHtmlTag: true,
  props: {
    htmlFor: {
      description: "Specifies which form element a label is bound to",
    },
  },
});

export const htmlLabelTagRenderer = wrapComponent("label", createHtmlTag("label"), HtmlLabelMd, {
  stateful: false,
});

export const HtmlLegendMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `legend` tag.",
  isHtmlTag: true,
});

export const htmlLegendTagRenderer = wrapComponent(
  "legend",
  createHtmlTag("legend"),
  HtmlLegendMd,
  {
    stateful: false,
  },
);

export const HtmlLiMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `li` tag.",
  isHtmlTag: true,
  props: {
    value: {
      description: "Specifies the value of the list item (if the parent is an ordered list)",
    },
  },
  defaultThemeVars: {
    "marginLeft-HtmlLi": "$space-6",
    "paddingLeft-HtmlLi": "$space-1",
  },
});

export const htmlLiTagRenderer = wrapComponent("li", createHtmlTag("li"), HtmlLiMd, {
  stateful: false,
  numbers: ["value"],
});

export const HtmlMainMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `main` tag.",
  isHtmlTag: true,
});

export const htmlMainTagRenderer = wrapComponent("main", createHtmlTag("main"), HtmlMainMd, {
  stateful: false,
});

export const HtmlMapMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `map` tag.",
  isHtmlTag: true,
  props: {
    name: {
      description: "Specifies the name of the map",
    },
  },
});

export const htmlMapTagRenderer = wrapComponent("map", createHtmlTag("map"), HtmlMapMd, {
  stateful: false,
});

export const HtmlMarkMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `mark` tag.",
  isHtmlTag: true,
});

export const htmlMarkTagRenderer = wrapComponent("mark", createHtmlTextTag("marked"), HtmlMarkMd, {
  stateful: false,
});

export const HtmlMenuMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `menu` tag.",
  isHtmlTag: true,
  props: {
    type: {
      description: "Specifies the type of the menu",
    },
  },
});

export const htmlMenuTagRenderer = wrapComponent("menu", createHtmlTag("menu"), HtmlMenuMd, {
  stateful: false,
});

export const HtmlMeterMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `meter` tag.",
  isHtmlTag: true,
  props: {
    min: {
      description: "Specifies the minimum value",
    },
    max: {
      description: "Specifies the maximum value",
    },
    low: {
      description: "Specifies the lower bound of the high value",
    },
    high: {
      description: "Specifies the upper bound of the low value",
    },
    optimum: {
      description: "Specifies the optimal value",
    },
    value: {
      description: "Specifies the current value",
    },
  },
});

export const htmlMeterTagRenderer = wrapComponent("meter", createHtmlTag("meter"), HtmlMeterMd, {
  stateful: false,
  numbers: ["value", "min", "max", "low", "high", "optimum"],
});

export const HtmlNavMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `nav` tag.",
  isHtmlTag: true,
});

export const htmlNavTagRenderer = wrapComponent("nav", createHtmlTag("nav"), HtmlNavMd, {
  stateful: false,
});

export const HtmlObjectMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `object` tag.",
  isHtmlTag: true,
  props: {
    data: {
      description: "Specifies the URL of the resource",
    },
    type: {
      description: "Specifies the MIME type of the resource",
    },
    name: {
      description: "Specifies the name of the object",
    },
    form: {
      description: "Specifies the form the object belongs to",
    },
    width: {
      description: "Specifies the width of the object",
    },
    height: {
      description: "Specifies the height of the object",
    },
  },
});

export const htmlObjectTagRenderer = wrapComponent(
  "object",
  createHtmlTag("object"),
  HtmlObjectMd,
  {
    stateful: false,
  },
);

export const HtmlOlMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `ol` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsList), // Use only themeVarsList
  defaultThemeVars: {
    "marginTop-HtmlOl": "$space-5",
    "marginBottom-HtmlOl": "$space-5",
  },
});

export const htmlOlTagRenderer = wrapComponent(
  "ol",
  createHtmlTag("ol", { extraClassName: styles.htmlOl }),
  HtmlOlMd,
  {
    stateful: false,
  },
);

export const HtmlOptgroupMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `optgroup` tag.",
  isHtmlTag: true,
  props: {
    label: {
      description: "Specifies the label for the option group",
    },
    disabled: {
      description: "Specifies that the option group is disabled",
    },
  },
});

export const htmlOptgroupTagRenderer = wrapComponent(
  "optgroup",
  createHtmlTag("optgroup", { booleanProps: ["disabled"] }),
  HtmlOptgroupMd,
  {
    stateful: false,
    booleans: ["disabled"],
  },
);

export const HtmlOptionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `option` tag.",
  isHtmlTag: true,
  props: {
    disabled: {
      description: "Specifies that the option should be disabled",
    },
    label: {
      description: "Specifies the label of the option",
    },
    selected: {
      description: "Specifies that the option should be pre-selected",
    },
    value: {
      description: "Specifies the value of the option",
    },
  },
});

export const htmlOptionTagRenderer = wrapComponent(
  "option",
  createHtmlTag("option", { booleanProps: ["disabled", "selected"] }),
  HtmlOptionMd,
  {
    stateful: false,
    booleans: ["disabled", "selected"],
  },
);

export const HtmlOutputMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `output` tag.",
  isHtmlTag: true,
  props: {
    form: {
      description: "Specifies the form element that the output is associated with",
    },
    htmlFor: {
      description: "Specifies the IDs of the elements that this output is related to",
    },
    name: {
      description: "Specifies the name of the output",
    },
  },
});

export const htmlOutputTagRenderer = wrapComponent(
  "output",
  createHtmlTag("output"),
  HtmlOutputMd,
  {
    stateful: false,
  },
);

export const HtmlPMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `p` tag.",
  isHtmlTag: true,
});

export const htmlPTagRenderer = wrapComponent("p", createHtmlTextTag("paragraph"), HtmlPMd, {
  stateful: false,
});

export const HtmlParamMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `param` tag.",
  isHtmlTag: true,
  props: {
    name: {
      description: "Specifies the name of the parameter",
    },
    value: {
      description: "Specifies the value of the parameter",
    },
  },
});

export const htmlParamTagRenderer = wrapComponent(
  "param",
  createHtmlTag("param", { voidElement: true }),
  HtmlParamMd,
  {
    stateful: false,
  },
);

export const HtmlPictureMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `picture` tag.",
  isHtmlTag: true,
});

export const htmlPictureTagRenderer = wrapComponent(
  "picture",
  createHtmlTag("picture"),
  HtmlPictureMd,
  {
    stateful: false,
  },
);

export const HtmlPreMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `pre` tag.",
  isHtmlTag: true,
});

export const htmlPreTagRenderer = wrapComponent("pre", createHtmlTextTag("codefence"), HtmlPreMd, {
  stateful: false,
});

export const HtmlProgressMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `progress` tag.",
  isHtmlTag: true,
  props: {
    max: {
      description: "Specifies the maximum value of the progress element",
    },
    value: {
      description: "Specifies the current value of the progress element",
    },
  },
});

export const htmlProgressTagRenderer = wrapComponent(
  "progress",
  createHtmlTag("progress"),
  HtmlProgressMd,
  {
    stateful: false,
    numbers: ["max", "value"],
  },
);

export const HtmlQMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `q` tag.",
  isHtmlTag: true,
  props: {
    cite: {
      description: "Specifies the source URL of the quotation",
    },
  },
});

export const htmlQTagRenderer = wrapComponent("q", createHtmlTag("q"), HtmlQMd, {
  stateful: false,
});

export const HtmlRpMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `rp` tag.",
  isHtmlTag: true,
});

export const htmlRpTagRenderer = wrapComponent("rp", createHtmlTag("rp"), HtmlRpMd, {
  stateful: false,
});

export const HtmlRtMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `rt` tag.",
  isHtmlTag: true,
});

export const htmlRtTagRenderer = wrapComponent("rt", createHtmlTag("rt"), HtmlRtMd, {
  stateful: false,
});

export const HtmlRubyMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `ruby` tag.",
  isHtmlTag: true,
});

export const htmlRubyTagRenderer = wrapComponent("ruby", createHtmlTag("ruby"), HtmlRubyMd, {
  stateful: false,
});

export const HtmlSMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `s` tag.",
  isHtmlTag: true,
});

export const htmlSTagRenderer = wrapComponent("s", createHtmlTag("s"), HtmlSMd, {
  stateful: false,
});

export const HtmlSampMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `samp` tag.",
  isHtmlTag: true,
});

export const htmlSampTagRenderer = wrapComponent("samp", createHtmlTextTag("sample"), HtmlSampMd, {
  stateful: false,
});

export const HtmlSectionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `section` tag.",
  isHtmlTag: true,
});

export const htmlSectionTagRenderer = wrapComponent(
  "section",
  createHtmlTag("section"),
  HtmlSectionMd,
  {
    stateful: false,
  },
);

export const HtmlSelectMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `select` tag.",
  isHtmlTag: true,
  props: {
    autoFocus: {
      description: "Specifies that the select should automatically get focus when the page loads",
    },
    disabled: {
      description: "Specifies that the select should be disabled",
    },
    form: {
      description: "Specifies the form the select belongs to",
    },
    multiple: {
      description: "Specifies that multiple options can be selected at once",
    },
    name: {
      description: "Specifies the name of the select",
    },
    required: {
      description: "Specifies that the select is required",
    },
    size: {
      description: "Specifies the number of visible options in the select",
    },
  },
});

export const htmlSelectTagRenderer = wrapComponent(
  "select",
  createHtmlTag("select", { booleanProps: ["autoFocus", "disabled", "multiple", "required"] }),
  HtmlSelectMd,
  {
    stateful: false,
    booleans: ["autoFocus", "disabled", "multiple", "required"],
    numbers: ["size"],
  },
);

export const HtmlSmallMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `small` tag.",
  isHtmlTag: true,
});

export const htmlSmallTagRenderer = wrapComponent(
  "small",
  createHtmlTextTag("small"),
  HtmlSmallMd,
  {
    stateful: false,
  },
);

export const HtmlSourceMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `source` tag.",
  isHtmlTag: true,
  props: {
    src: {
      description: "Specifies the URL of the media file",
    },
    type: {
      description: "Specifies the type of the media file",
    },
    media: {
      description: "Specifies a media query for the media file",
    },
    srcSet: {
      description: "Specifies the source set for responsive images",
    },
    sizes: {
      description: "Specifies the sizes attribute for responsive images",
    },
  },
});

export const htmlSourceTagRenderer = wrapComponent(
  "source",
  createHtmlTag("source", { voidElement: true }),
  HtmlSourceMd,
  {
    stateful: false,
    resourceUrls: ["src"],
  },
);

export const HtmlSpanMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `span` tag.",
  isHtmlTag: true,
});

export const htmlSpanTagRenderer = wrapComponent("span", createHtmlTag("span"), HtmlSpanMd, {
  stateful: false,
});

export const HtmlStrongMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `strong` tag.",
  isHtmlTag: true,
});

export const htmlStrongTagRenderer = wrapComponent(
  "strong",
  createHtmlTextTag("strong"),
  HtmlStrongMd,
  {
    stateful: false,
  },
);

export const HtmlSubMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `sub` tag.",
  isHtmlTag: true,
});

export const htmlSubTagRenderer = wrapComponent("sub", createHtmlTextTag("sub"), HtmlSubMd, {
  stateful: false,
});

export const HtmlSummaryMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `summary` tag.",
  isHtmlTag: true,
});

export const htmlSummaryTagRenderer = wrapComponent(
  "summary",
  createHtmlTag("summary"),
  HtmlSummaryMd,
  {
    stateful: false,
  },
);

export const HtmlSupMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `sup` tag.",
  isHtmlTag: true,
});

export const htmlSupTagRenderer = wrapComponent("sup", createHtmlTextTag("sup"), HtmlSupMd, {
  stateful: false,
});

export const HtmlTableMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `table` tag.",
  isHtmlTag: true,
  props: {
    border: {
      description: "Specifies the width of the border around the table",
    },
    cellPadding: {
      description: "Specifies the space between the cell content and its borders",
    },
    cellSpacing: {
      description: "Specifies the space between cells",
    },
    summary: {
      description: "Provides a summary of the table's purpose and structure",
    },
    width: {
      description: "Specifies the width of the table",
    },
    align: {
      description: "Specifies the alignment of the table",
    },
    frame: {
      description: "Specifies which parts of the table frame to render",
    },
    rules: {
      description: "Specifies which rules to draw between cells",
    },
  },
  themeVars: parseScssVar(styles.themeVarsTable),
  defaultThemeVars: {
    "backgroundColor-HtmlTable": "$backgroundColor",
    "border-HtmlTable": "1px solid $borderColor",
    "marginBottom-HtmlTable": "$space-4",
    "marginTop-HtmlTable": "$space-4",
  },
});

export const htmlTableTagRenderer = wrapComponent(
  "table",
  createHtmlTag("table", { extraClassName: styles.htmlTable }),
  HtmlTableMd,
  {
    stateful: false,
  },
);

export const HtmlTbodyMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `tbody` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsTbody),
});

export const htmlTbodyTagRenderer = wrapComponent(
  "tbody",
  createHtmlTag("tbody", { extraClassName: styles.htmlTbody }),
  HtmlTbodyMd,
  {
    stateful: false,
  },
);

export const HtmlTdMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `td` tag.",
  isHtmlTag: true,
  props: {
    align: {
      description: "Specifies the horizontal alignment of the content in the cell",
    },
    colSpan: {
      description: "Specifies the number of columns a cell should span",
    },
    headers: {
      description: "Specifies a list of header cells the current cell is related to",
    },
    rowSpan: {
      description: "Specifies the number of rows a cell should span",
    },
    valign: {
      description: "Specifies the vertical alignment of the content in the cell",
    },
    scope: {
      description:
        "Specifies whether a cell is a header for a column, row, or group of columns or rows",
    },
    abbr: {
      description: "Specifies an abbreviated version of the content in the cell",
    },
    height: {
      description: "Specifies the height of the cell",
    },
    width: {
      description: "Specifies the width of the cell",
    },
  },
  themeVars: parseScssVar(styles.themeVarsTd),
  defaultThemeVars: {
    "padding-HtmlTd": "$space-2",
    "borderBottom-HtmlTd": "1px solid $borderColor",
  },
});

export const htmlTdTagRenderer = wrapComponent(
  "td",
  createHtmlTag("td", { extraClassName: styles.htmlTd }),
  HtmlTdMd,
  {
    stateful: false,
  },
);

export const HtmlTemplateMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `template` tag.",
  isHtmlTag: true,
});

export const htmlTemplateTagRenderer = wrapComponent(
  "template",
  createHtmlTag("template"),
  HtmlTemplateMd,
  {
    stateful: false,
  },
);

export const HtmlTextareaMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `textarea` tag.",
  isHtmlTag: true,
  props: {
    autoFocus: {
      description: "Specifies that the textarea should automatically get focus when the page loads",
    },
    cols: {
      description: "Specifies the visible width of the text area in average character widths",
    },
    dirName: {
      description: "Specifies the text directionality",
    },
    disabled: {
      description: "Specifies that the textarea should be disabled",
    },
    form: {
      description: "Specifies the form the textarea belongs to",
    },
    maxLength: {
      description: "Specifies the maximum number of characters allowed in the textarea",
    },
    minLength: {
      description: "Specifies the minimum number of characters allowed in the textarea",
    },
    name: {
      description: "Specifies the name of the textarea",
    },
    placeholder: {
      description: "Specifies a short hint that describes the expected value",
    },
    readOnly: {
      description: "Specifies that the textarea is read-only",
    },
    required: {
      description: "Specifies that the textarea is required",
    },
    rows: {
      description: "Specifies the visible number of lines in the textarea",
    },
    value: {
      description: "Specifies the current value of the textarea",
    },
    wrap: {
      description: "Specifies how the text in a textarea is to be wrapped when submitted",
    },
  },
});

export const htmlTextareaTagRenderer = wrapComponent(
  "textarea",
  createHtmlTag("textarea", { booleanProps: ["autoFocus", "disabled", "readOnly", "required"] }),
  HtmlTextareaMd,
  {
    stateful: false,
    booleans: ["autoFocus", "disabled", "readOnly", "required"],
    numbers: ["cols", "rows", "maxLength", "minLength"],
  },
);

export const HtmlTfootMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `tfoot` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsTfoot),
});

export const htmlTfootTagRenderer = wrapComponent(
  "tfoot",
  createHtmlTag("tfoot", { extraClassName: styles.htmlTfoot }),
  HtmlTfootMd,
  {
    stateful: false,
  },
);

export const HtmlThMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `th` tag.",
  isHtmlTag: true,
  props: {
    abbr: {
      description: "Specifies an abbreviated version of the content in the header cell",
    },
    align: {
      description: "Specifies the horizontal alignment of the content in the header cell",
    },
    colSpan: {
      description: "Specifies the number of columns a header cell should span",
    },
    headers: {
      description: "Specifies a list of header cells the current header cell is related to",
    },
    rowSpan: {
      description: "Specifies the number of rows a header cell should span",
    },
    scope: {
      description:
        "Specifies whether a header cell is a header for a column, row, or group of columns or rows",
    },
  },
  themeVars: parseScssVar(styles.themeVarsTh),
  defaultThemeVars: {
    "padding-HtmlTh": "$space-2",
    "fontSize-HtmlTh": "$fontSize-tiny",
    "fontWeight-HtmlTh": "$fontWeight-bold",
    //"backgroundColor-HtmlTh--hover": "$color-surface-200",
  },
});

export const htmlThTagRenderer = wrapComponent(
  "th",
  createHtmlTag("th", { extraClassName: styles.htmlTh }),
  HtmlThMd,
  {
    stateful: false,
  },
);

export const HtmlTheadMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `thead` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsThead),
  defaultThemeVars: {
    "textTransform-HtmlThead": "uppercase",
    "backgroundColor-HtmlThead": "$color-surface-100",
    "textColor-HtmlThead": "$color-surface-500",
  },
});

export const htmlTheadTagRenderer = wrapComponent(
  "thead",
  createHtmlTag("thead", { extraClassName: styles.htmlThead }),
  HtmlTheadMd,
  {
    stateful: false,
  },
);

export const HtmlTimeMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `time` tag.",
  isHtmlTag: true,
  props: {
    dateTime: {
      description: "Specifies the date and time in a machine-readable format",
    },
  },
});

export const htmlTimeTagRenderer = wrapComponent("time", createHtmlTag("time"), HtmlTimeMd, {
  stateful: false,
});

export const HtmlTrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `tr` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsTr),
  defaultThemeVars: {
    "fontSize-HtmlTr": "$fontSize-sm",
    "backgroundColor-row-HtmlTr": "inherit",
    //"backgroundColor-HtmlTr--hover": "$color-primary-50",
  },
});

export const htmlTrTagRenderer = wrapComponent(
  "tr",
  createHtmlTag("tr", { extraClassName: styles.htmlTr }),
  HtmlTrMd,
  {
    stateful: false,
  },
);

export const HtmlTrackMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `track` tag.",
  isHtmlTag: true,
  props: {
    default: {
      description: "Specifies that the track is to be enabled if no other track is more suitable",
    },
    kind: {
      description: "Specifies the kind of text track",
    },
    label: {
      description: "Specifies the title of the text track",
    },
    src: {
      description: "Specifies the URL of the track file",
    },
    srcLang: {
      description: "Specifies the language of the track text data",
    },
  },
});

export const htmlTrackTagRenderer = wrapComponent(
  "track",
  createHtmlTag("track", { booleanProps: ["default"], voidElement: true }),
  HtmlTrackMd,
  {
    stateful: false,
    booleans: ["default"],
    resourceUrls: ["src"],
  },
);

export const HtmlUMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `u` tag.",
  isHtmlTag: true,
});

export const htmlUTagRenderer = wrapComponent("u", createHtmlTag("u"), HtmlUMd, {
  stateful: false,
});

export const HtmlUlMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `ul` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsList), // Use only themeVarsList
  defaultThemeVars: {
    "marginTop-HtmlUl": "$space-5",
    "marginBottom-HtmlUl": "$space-5",
  },
});

export const htmlUlTagRenderer = wrapComponent(
  "ul",
  createHtmlTag("ul", { extraClassName: styles.htmlUl }),
  HtmlUlMd,
  {
    stateful: false,
  },
);

export const HtmlVarMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `var` tag.",
  isHtmlTag: true,
});

export const htmlVarTagRenderer = wrapComponent("var", createHtmlTextTag("var"), HtmlVarMd, {
  stateful: false,
});

export const HtmlVideoMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `video` tag.",
  isHtmlTag: true,
  props: {
    autoPlay: {
      description: "Specifies that the video will start playing as soon as it is ready",
    },
    controls: {
      description: "Specifies that video controls should be displayed",
    },
    height: {
      description: "Specifies the height of the video player",
    },
    loop: {
      description: "Specifies that the video will start over again when finished",
    },
    muted: {
      description: "Specifies that the video output should be muted",
    },
    poster: {
      description: "Specifies an image to be shown while the video is downloading",
    },
    preload: {
      description:
        "Specifies if and how the author thinks the video should be loaded when the page loads",
    },
    src: {
      description: "Specifies the URL of the video file",
    },
    width: {
      description: "Specifies the width of the video player",
    },
  },
  themeVars: parseScssVar(styles.themeVarsVideo),
  defaultThemeVars: {
    "marginTop-HtmlVideo": "1rem",
    "marginBottom-HtmlVideo": "1rem",
  },
});

export const htmlVideoTagRenderer = wrapComponent(
  "video",
  createHtmlTag("video", { booleanProps: ["autoPlay", "controls", "loop", "muted"] }),
  HtmlVideoMd,
  {
    stateful: false,
    booleans: ["autoPlay", "controls", "loop", "muted"],
    resourceUrls: ["src"],
  },
);

export const HtmlWbrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `wbr` tag.",
  isHtmlTag: true,
});

export const htmlWbrTagRenderer = wrapComponent(
  "wbr",
  createHtmlTag("wbr", { voidElement: true }),
  HtmlWbrMd,
  {
    stateful: false,
  },
);

export const htmlTagMetadata: Record<string, ComponentMetadata> = {
  "a": HtmlAMd,
  "abbr": HtmlAbbrMd,
  "address": HtmlAddressMd,
  "area": HtmlAreaMd,
  "article": HtmlArticleMd,
  "aside": HtmlAsideMd,
  "audio": HtmlAudioMd,
  "b": HtmlBMd,
  "bdi": HtmlBdiMd,
  "bdo": HtmlBdoMd,
  "blockquote": HtmlBlockquoteMd,
  "button": HtmlButtonMd,
  "canvas": HtmlCanvasMd,
  "caption": HtmlCaptionMd,
  "cite": HtmlCiteMd,
  "code": HtmlCodeMd,
  "col": HtmlColMd,
  "colgroup": HtmlColgroupMd,
  "data": HtmlDataMd,
  "datalist": HtmlDatalistMd,
  "dd": HtmlDdMd,
  "del": HtmlDelMd,
  "details": HtmlDetailsMd,
  "dfn": HtmlDfnMd,
  "dialog": HtmlDialogMd,
  "div": HtmlDivMd,
  "dl": HtmlDlMd,
  "dt": HtmlDtMd,
  "em": HtmlEMMd,
  "embed": HtmlEmbedMd,
  "fieldset": HtmlFieldsetMd,
  "figcaption": HtmlFigcaptionMd,
  "figure": HtmlFigureMd,
  "footer": HtmlFooterMd,
  "form": HtmlFormMd,
  "h1": HtmlH1Md,
  "h2": HtmlH2Md,
  "h3": HtmlH3Md,
  "h4": HtmlH4Md,
  "h5": HtmlH5Md,
  "h6": HtmlH6Md,
  "header": HtmlHeaderMd,
  "hr": HtmlHrMd,
  "i": HtmlIMd,
  "iframe": HtmlIframeMd,
  "img": HtmlImgMd,
  "input": HtmlInputMd,
  "ins": HtmlInsMd,
  "kbd": HtmlKbdMd,
  "label": HtmlLabelMd,
  "legend": HtmlLegendMd,
  "li": HtmlLiMd,
  "main": HtmlMainMd,
  "map": HtmlMapMd,
  "mark": HtmlMarkMd,
  "menu": HtmlMenuMd,
  "meter": HtmlMeterMd,
  "nav": HtmlNavMd,
  "object": HtmlObjectMd,
  "ol": HtmlOlMd,
  "optgroup": HtmlOptgroupMd,
  "option": HtmlOptionMd,
  "output": HtmlOutputMd,
  "p": HtmlPMd,
  "param": HtmlParamMd,
  "picture": HtmlPictureMd,
  "pre": HtmlPreMd,
  "progress": HtmlProgressMd,
  "q": HtmlQMd,
  "rp": HtmlRpMd,
  "rt": HtmlRtMd,
  "ruby": HtmlRubyMd,
  "s": HtmlSMd,
  "samp": HtmlSampMd,
  "section": HtmlSectionMd,
  "select": HtmlSelectMd,
  "small": HtmlSmallMd,
  "source": HtmlSourceMd,
  "span": HtmlSpanMd,
  "strong": HtmlStrongMd,
  "sub": HtmlSubMd,
  "summary": HtmlSummaryMd,
  "sup": HtmlSupMd,
  "table": HtmlTableMd,
  "tbody": HtmlTbodyMd,
  "td": HtmlTdMd,
  "template": HtmlTemplateMd,
  "textarea": HtmlTextareaMd,
  "tfoot": HtmlTfootMd,
  "th": HtmlThMd,
  "thead": HtmlTheadMd,
  "time": HtmlTimeMd,
  "tr": HtmlTrMd,
  "track": HtmlTrackMd,
  "u": HtmlUMd,
  "ul": HtmlUlMd,
  "var": HtmlVarMd,
  "video": HtmlVideoMd,
  "wbr": HtmlWbrMd,
};

export const htmlTagRenderers: Record<string, XmluiBuiltInRenderer> = {
  "a": legacyHtmlTagRenderer(htmlATagRenderer, HtmlAMd),
  "abbr": legacyHtmlTagRenderer(htmlAbbrTagRenderer, HtmlAbbrMd),
  "address": legacyHtmlTagRenderer(htmlAddressTagRenderer, HtmlAddressMd),
  "area": legacyHtmlTagRenderer(htmlAreaTagRenderer, HtmlAreaMd),
  "article": legacyHtmlTagRenderer(htmlArticleTagRenderer, HtmlArticleMd),
  "aside": legacyHtmlTagRenderer(htmlAsideTagRenderer, HtmlAsideMd),
  "audio": legacyHtmlTagRenderer(htmlAudioTagRenderer, HtmlAudioMd),
  "b": legacyHtmlTagRenderer(htmlBTagRenderer, HtmlBMd),
  "bdi": legacyHtmlTagRenderer(htmlBdiTagRenderer, HtmlBdiMd),
  "bdo": legacyHtmlTagRenderer(htmlBdoTagRenderer, HtmlBdoMd),
  "blockquote": legacyHtmlTagRenderer(htmlBlockquoteTagRenderer, HtmlBlockquoteMd),
  "button": legacyHtmlTagRenderer(htmlButtonTagRenderer, HtmlButtonMd),
  "canvas": legacyHtmlTagRenderer(htmlCanvasTagRenderer, HtmlCanvasMd),
  "caption": legacyHtmlTagRenderer(htmlCaptionTagRenderer, HtmlCaptionMd),
  "cite": legacyHtmlTagRenderer(htmlCiteTagRenderer, HtmlCiteMd),
  "code": legacyHtmlTagRenderer(htmlCodeTagRenderer, HtmlCodeMd),
  "col": legacyHtmlTagRenderer(htmlColTagRenderer, HtmlColMd),
  "colgroup": legacyHtmlTagRenderer(htmlColgroupTagRenderer, HtmlColgroupMd),
  "data": legacyHtmlTagRenderer(htmlDataTagRenderer, HtmlDataMd),
  "datalist": legacyHtmlTagRenderer(htmlDatalistTagRenderer, HtmlDatalistMd),
  "dd": legacyHtmlTagRenderer(htmlDdTagRenderer, HtmlDdMd),
  "del": legacyHtmlTagRenderer(htmlDelTagRenderer, HtmlDelMd),
  "details": legacyHtmlTagRenderer(htmlDetailsTagRenderer, HtmlDetailsMd),
  "dfn": legacyHtmlTagRenderer(htmlDfnTagRenderer, HtmlDfnMd),
  "dialog": legacyHtmlTagRenderer(htmlDialogTagRenderer, HtmlDialogMd),
  "div": legacyHtmlTagRenderer(htmlDivTagRenderer, HtmlDivMd),
  "dl": legacyHtmlTagRenderer(htmlDlTagRenderer, HtmlDlMd),
  "dt": legacyHtmlTagRenderer(htmlDtTagRenderer, HtmlDtMd),
  "em": legacyHtmlTagRenderer(htmlEMTagRenderer, HtmlEMMd),
  "embed": legacyHtmlTagRenderer(htmlEmbedTagRenderer, HtmlEmbedMd),
  "fieldset": legacyHtmlTagRenderer(htmlFieldsetTagRenderer, HtmlFieldsetMd),
  "figcaption": legacyHtmlTagRenderer(htmlFigcaptionTagRenderer, HtmlFigcaptionMd),
  "figure": legacyHtmlTagRenderer(htmlFigureTagRenderer, HtmlFigureMd),
  "footer": legacyHtmlTagRenderer(htmlFooterTagRenderer, HtmlFooterMd),
  "form": legacyHtmlTagRenderer(htmlFormTagRenderer, HtmlFormMd),
  "h1": legacyHtmlTagRenderer(htmlH1TagRenderer, HtmlH1Md),
  "h2": legacyHtmlTagRenderer(htmlH2TagRenderer, HtmlH2Md),
  "h3": legacyHtmlTagRenderer(htmlH3TagRenderer, HtmlH3Md),
  "h4": legacyHtmlTagRenderer(htmlH4TagRenderer, HtmlH4Md),
  "h5": legacyHtmlTagRenderer(htmlH5TagRenderer, HtmlH5Md),
  "h6": legacyHtmlTagRenderer(htmlH6TagRenderer, HtmlH6Md),
  "header": legacyHtmlTagRenderer(htmlHeaderTagRenderer, HtmlHeaderMd),
  "hr": legacyHtmlTagRenderer(htmlHrTagRenderer, HtmlHrMd),
  "i": legacyHtmlTagRenderer(htmlITagRenderer, HtmlIMd),
  "iframe": legacyHtmlTagRenderer(htmlIframeTagRenderer, HtmlIframeMd),
  "img": legacyHtmlTagRenderer(htmlImgTagRenderer, HtmlImgMd),
  "input": legacyHtmlTagRenderer(htmlInputTagRenderer, HtmlInputMd),
  "ins": legacyHtmlTagRenderer(htmlInsTagRenderer, HtmlInsMd),
  "kbd": legacyHtmlTagRenderer(htmlKbdTagRenderer, HtmlKbdMd),
  "label": legacyHtmlTagRenderer(htmlLabelTagRenderer, HtmlLabelMd),
  "legend": legacyHtmlTagRenderer(htmlLegendTagRenderer, HtmlLegendMd),
  "li": legacyHtmlTagRenderer(htmlLiTagRenderer, HtmlLiMd),
  "main": legacyHtmlTagRenderer(htmlMainTagRenderer, HtmlMainMd),
  "map": legacyHtmlTagRenderer(htmlMapTagRenderer, HtmlMapMd),
  "mark": legacyHtmlTagRenderer(htmlMarkTagRenderer, HtmlMarkMd),
  "menu": legacyHtmlTagRenderer(htmlMenuTagRenderer, HtmlMenuMd),
  "meter": legacyHtmlTagRenderer(htmlMeterTagRenderer, HtmlMeterMd),
  "nav": legacyHtmlTagRenderer(htmlNavTagRenderer, HtmlNavMd),
  "object": legacyHtmlTagRenderer(htmlObjectTagRenderer, HtmlObjectMd),
  "ol": legacyHtmlTagRenderer(htmlOlTagRenderer, HtmlOlMd),
  "optgroup": legacyHtmlTagRenderer(htmlOptgroupTagRenderer, HtmlOptgroupMd),
  "option": legacyHtmlTagRenderer(htmlOptionTagRenderer, HtmlOptionMd),
  "output": legacyHtmlTagRenderer(htmlOutputTagRenderer, HtmlOutputMd),
  "p": legacyHtmlTagRenderer(htmlPTagRenderer, HtmlPMd),
  "param": legacyHtmlTagRenderer(htmlParamTagRenderer, HtmlParamMd),
  "picture": legacyHtmlTagRenderer(htmlPictureTagRenderer, HtmlPictureMd),
  "pre": legacyHtmlTagRenderer(htmlPreTagRenderer, HtmlPreMd),
  "progress": legacyHtmlTagRenderer(htmlProgressTagRenderer, HtmlProgressMd),
  "q": legacyHtmlTagRenderer(htmlQTagRenderer, HtmlQMd),
  "rp": legacyHtmlTagRenderer(htmlRpTagRenderer, HtmlRpMd),
  "rt": legacyHtmlTagRenderer(htmlRtTagRenderer, HtmlRtMd),
  "ruby": legacyHtmlTagRenderer(htmlRubyTagRenderer, HtmlRubyMd),
  "s": legacyHtmlTagRenderer(htmlSTagRenderer, HtmlSMd),
  "samp": legacyHtmlTagRenderer(htmlSampTagRenderer, HtmlSampMd),
  "section": legacyHtmlTagRenderer(htmlSectionTagRenderer, HtmlSectionMd),
  "select": legacyHtmlTagRenderer(htmlSelectTagRenderer, HtmlSelectMd),
  "small": legacyHtmlTagRenderer(htmlSmallTagRenderer, HtmlSmallMd),
  "source": legacyHtmlTagRenderer(htmlSourceTagRenderer, HtmlSourceMd),
  "span": legacyHtmlTagRenderer(htmlSpanTagRenderer, HtmlSpanMd),
  "strong": legacyHtmlTagRenderer(htmlStrongTagRenderer, HtmlStrongMd),
  "sub": legacyHtmlTagRenderer(htmlSubTagRenderer, HtmlSubMd),
  "summary": legacyHtmlTagRenderer(htmlSummaryTagRenderer, HtmlSummaryMd),
  "sup": legacyHtmlTagRenderer(htmlSupTagRenderer, HtmlSupMd),
  "table": legacyHtmlTagRenderer(htmlTableTagRenderer, HtmlTableMd),
  "tbody": legacyHtmlTagRenderer(htmlTbodyTagRenderer, HtmlTbodyMd),
  "td": legacyHtmlTagRenderer(htmlTdTagRenderer, HtmlTdMd),
  "template": legacyHtmlTagRenderer(htmlTemplateTagRenderer, HtmlTemplateMd),
  "textarea": legacyHtmlTagRenderer(htmlTextareaTagRenderer, HtmlTextareaMd),
  "tfoot": legacyHtmlTagRenderer(htmlTfootTagRenderer, HtmlTfootMd),
  "th": legacyHtmlTagRenderer(htmlThTagRenderer, HtmlThMd),
  "thead": legacyHtmlTagRenderer(htmlTheadTagRenderer, HtmlTheadMd),
  "time": legacyHtmlTagRenderer(htmlTimeTagRenderer, HtmlTimeMd),
  "tr": legacyHtmlTagRenderer(htmlTrTagRenderer, HtmlTrMd),
  "track": legacyHtmlTagRenderer(htmlTrackTagRenderer, HtmlTrackMd),
  "u": legacyHtmlTagRenderer(htmlUTagRenderer, HtmlUMd),
  "ul": legacyHtmlTagRenderer(htmlUlTagRenderer, HtmlUlMd),
  "var": legacyHtmlTagRenderer(htmlVarTagRenderer, HtmlVarMd),
  "video": legacyHtmlTagRenderer(htmlVideoTagRenderer, HtmlVideoMd),
  "wbr": legacyHtmlTagRenderer(htmlWbrTagRenderer, HtmlWbrMd),
};

function legacyHtmlTagRenderer(
  extension: ComponentExtension,
  metadata: ComponentMetadata,
): XmluiBuiltInRenderer {
  return wrapRuntimeComponent({
    name: extension.name,
    metadata,
    renderer: ({ adapter }) =>
      extension.component({
        props: {
          ...adapter.rootAttrs(),
          ...adapter.props,
        },
        events: adapter.events,
        children: adapter.renderChildren(),
        node: adapter.node,
        scope: adapter.scope,
        context: adapter.context,
      }),
  });
}
