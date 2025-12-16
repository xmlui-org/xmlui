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

import { createComponentRenderer } from "../../components-core/renderers";
import styles from "./HtmlTags.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { LinkNative } from "../Link/LinkNative";
import { Heading } from "../Heading/HeadingNative";
import { Text } from "../Text/TextNative";
import { PropsTrasform } from "../../components-core/utils/extractParam";
import { createMetadata, d } from "../metadata-helpers";
import classnames from 'classnames';

export const HtmlAMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `a` tag.",
  isHtmlTag: true,
  props: {
    href: d("Specifies the URL of the page the link goes to"),
    target: d("Specifies where to open the linked document"),
    rel: d("Specifies the relationship between the current document and the linked document"),
    download: d("Indicates that the target will be downloaded when a user clicks on the hyperlink"),
    hreflang: d("Specifies the language of the linked document"),
    type: d("Specifies the MIME type of the linked document"),
    ping: d(
      "Specifies a space-separated list of URLs to be notified if the user follows the hyperlink",
    ),
    referrerPolicy: d("Specifies the referrer policy for the element"),
    disabled: d("Specifies that the link should be disabled"),
  },
});

export const htmlATagRenderer = createComponentRenderer(
  "a",
  HtmlAMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { disabled } = p.asOptionalBoolean("disabled");
    const { href, ...rest } = p.asRest();
    return (
      <LinkNative to={href} disabled={disabled ?? false} className={className} {...rest}>
        {renderChild(node.children)}
      </LinkNative>
    );
  },
);

export const HtmlAbbrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `abbr` tag.",
  isHtmlTag: true,
});

export const htmlAbbrTagRenderer = createComponentRenderer(
  "abbr",
  HtmlAbbrMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="abbr">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlAddressMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `address` tag.",
  isHtmlTag: true,
});

export const htmlAddressTagRenderer = createComponentRenderer(
  "address",
  HtmlAddressMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <address className={className} {...props}>
        {renderChild(node.children)}
      </address>
    );
  },
);

export const HtmlAreaMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `area` tag.",
  isHtmlTag: true,
  props: {
    alt: d("Specifies an alternate text for the area"),
    coords: d("Specifies the coordinates of the area"),
    download: d("Indicates that the target will be downloaded when a user clicks on the area"),
    href: d("Specifies the URL of the linked document"),
    hrefLang: d("Specifies the language of the linked document"),
    referrerPolicy: d("Specifies the referrer policy for the area"),
    rel: d("Specifies the relationship between the current document and the linked document"),
    shape: d("Specifies the shape of the area"),
    target: d("Specifies where to open the linked document"),
    media: d("Specifies a media query for the linked resource"),
  },
});

export const htmlAreaTagRenderer = createComponentRenderer(
  "area",
  HtmlAreaMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <area className={className} {...props}>
        {renderChild(node.children)}
      </area>
    );
  },
);

export const HtmlArticleMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `article` tag.",
  isHtmlTag: true,
});

export const htmlArticleTagRenderer = createComponentRenderer(
  "article",
  HtmlArticleMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <article className={className} {...props}>
        {renderChild(node.children)}
      </article>
    );
  },
);

export const HtmlAsideMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `aside` tag.",
  isHtmlTag: true,
});

export const htmlAsideTagRenderer = createComponentRenderer(
  "aside",
  HtmlAsideMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <aside className={className} {...props}>
        {renderChild(node.children)}
      </aside>
    );
  },
);

export const HtmlAudioMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `audio` tag.",
  isHtmlTag: true,
  props: {
    autoPlay: d("Specifies that the audio will start playing as soon as it is ready"),
    controls: d("Specifies that audio controls should be displayed"),
    crossOrigin: d("Specifies how the element handles cross-origin requests"),
    loop: d("Specifies that the audio will start over again every time it is finished"),
    muted: d("Specifies that the audio output should be muted"),
    preload: d(
      "Specifies if and how the author thinks the audio should be loaded when the page loads",
    ),
    src: d("Specifies the URL of the audio file"),
  },
});

export const htmlAudioTagRenderer = createComponentRenderer(
  "audio",
  HtmlAudioMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { autoPlay, controls, loop, muted } = p.asOptionalBoolean(
      "autoPlay",
      "controls",
      "loop",
      "muted",
    );
    const props = p.asRest();
    return (
      <audio
        className={className}
        autoPlay={autoPlay ?? false}
        controls={controls ?? false}
        loop={loop ?? false}
        muted={muted ?? false}
        {...props}
      >
        {renderChild(node.children)}
      </audio>
    );
  },
);

export const HtmlBMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `b` tag.",
  isHtmlTag: true,
});

export const htmlBTagRenderer = createComponentRenderer(
  "b",
  HtmlBMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <b className={className} {...props}>
        {renderChild(node.children)}
      </b>
    );
  },
);

export const HtmlBdiMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `bdi` tag.",
  isHtmlTag: true,
});

export const htmlBdiTagRenderer = createComponentRenderer(
  "bdi",
  HtmlBdiMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <bdi className={className} {...props}>
        {renderChild(node.children)}
      </bdi>
    );
  },
);

export const HtmlBdoMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `bdo` tag.",
  isHtmlTag: true,
  props: {
    dir: d("Specifies the text direction override"),
  },
});

export const htmlBdoTagRenderer = createComponentRenderer(
  "bdo",
  HtmlBdoMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <bdo className={className} {...props}>
        {renderChild(node.children)}
      </bdo>
    );
  },
);

export const HtmlBlockquoteMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `blockquote` tag.",
  isHtmlTag: true,
  props: {
    cite: d("Specifies the source of the quotation"),
  },
});

export const htmlBlockquoteTagRenderer = createComponentRenderer(
  "blockquote",
  HtmlBlockquoteMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <blockquote className={className} {...props}>
        {renderChild(node.children)}
      </blockquote>
    );
  },
);

export const HtmlButtonMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `button` tag.",
  isHtmlTag: true,
  props: {
    autoFocus: d("Specifies that the button should automatically get focus when the page loads"),
    disabled: d("Specifies that the button should be disabled"),
    form: d("Specifies the form the button belongs to"),
    formAction: d(
      "Specifies the URL of a file that processes the information submitted by the button",
    ),
    formEncType: d(
      "Specifies how the form-data should be encoded when submitting it to the server",
    ),
    formMethod: d("Specifies the HTTP method to use when sending form-data"),
    formNoValidate: d("Specifies that the form should not be validated when submitted"),
    formTarget: d("Specifies where to display the response after submitting the form"),
    name: d("Specifies a name for the button"),
    type: d("Specifies the type of the button"),
    value: d("Specifies the value associated with the button"),
  },
});

export const htmlButtonTagRenderer = createComponentRenderer(
  "button",
  HtmlButtonMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { autoFocus, disabled, formNoValidate } = p.asOptionalBoolean(
      "autoFocus",
      "disabled",
      "formNoValidate",
    );
    const props = p.asRest();
    return (
      <button
        className={className}
        autoFocus={autoFocus ?? false}
        disabled={disabled ?? false}
        formNoValidate={formNoValidate ?? false}
        {...props}
      >
        {renderChild(node.children)}
      </button>
    );
  },
);

export const HtmlCanvasMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `canvas` tag.",
  isHtmlTag: true,
  props: {
    width: d("Specifies the width of the canvas"),
    height: d("Specifies the height of the canvas"),
  },
});

export const htmlCanvasTagRenderer = createComponentRenderer(
  "canvas",
  HtmlCanvasMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const sizeProps = p.asOptionalNumber("width", "height");
    const props = p.asRest();
    return (
      <canvas className={className} {...sizeProps} {...props}>
        {renderChild(node.children)}
      </canvas>
    );
  },
);

export const HtmlCaptionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `caption` tag.",
  isHtmlTag: true,
});

export const htmlCaptionTagRenderer = createComponentRenderer(
  "caption",
  HtmlCaptionMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <caption className={className} {...props}>
        {renderChild(node.children)}
      </caption>
    );
  },
);

export const HtmlCiteMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `cite` tag.",
  isHtmlTag: true,
});

export const htmlCiteTagRenderer = createComponentRenderer(
  "cite",
  HtmlCiteMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="cite">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlCodeMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `code` tag.",
  isHtmlTag: true,
});

export const htmlCodeTagRenderer = createComponentRenderer(
  "code",
  HtmlCodeMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="code">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlColMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `col` tag.",
  isHtmlTag: true,
  props: {
    span: d("Specifies the number of columns a `col` element should span"),
  },
});

export const htmlColTagRenderer = createComponentRenderer(
  "col",
  HtmlColMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { span } = p.asOptionalNumber("span");
    const props = p.asRest();
    return (
      <col className={className} span={span} {...props}>
        {renderChild(node.children)}
      </col>
    );
  },
);

export const HtmlColgroupMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `colgroup` tag.",
  isHtmlTag: true,
  props: {
    span: d("Specifies the number of columns in a `colgroup`"),
  },
});

export const htmlColgroupTagRenderer = createComponentRenderer(
  "colgroup",
  HtmlColgroupMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { span } = p.asOptionalNumber("span");
    const props = p.asRest();
    return (
      <colgroup className={className} span={span} {...props}>
        {renderChild(node.children)}
      </colgroup>
    );
  },
);

export const HtmlDataMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `data` tag.",
  isHtmlTag: true,
  props: {
    value: d("Specifies the machine-readable value of the element"),
  },
});

export const htmlDataTagRenderer = createComponentRenderer(
  "data",
  HtmlDataMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <data className={className} {...props}>
        {renderChild(node.children)}
      </data>
    );
  },
);

export const HtmlDatalistMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `datalist` tag.",
  isHtmlTag: true,
});

export const htmlDatalistTagRenderer = createComponentRenderer(
  "datalist",
  HtmlDatalistMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <datalist className={className} {...props}>
        {renderChild(node.children)}
      </datalist>
    );
  },
);

export const HtmlDdMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dd` tag.",
  isHtmlTag: true,
});

export const htmlDdTagRenderer = createComponentRenderer(
  "dd",
  HtmlDdMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <dd className={className} {...props}>
        {renderChild(node.children)}
      </dd>
    );
  },
);

export const HtmlDelMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `del` tag.",
  isHtmlTag: true,
  props: {
    cite: d("Specifies the source of the quotation"),
    dateTime: d("Specifies the date and time of the edit"),
  },
});

export const htmlDelTagRenderer = createComponentRenderer(
  "del",
  HtmlDelMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="deleted">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlDetailsMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `details` tag.",
  isHtmlTag: true,
  props: {
    open: d("Specifies that the details are visible (open)"),
  },
  themeVars: parseScssVar(styles.themeVarsDetails),
  defaultThemeVars: {
    "marginTop-HtmlDetails": "1rem",
    "marginBottom-HtmlDetails": "1rem",
  },
});

export const htmlDetailsTagRenderer = createComponentRenderer(
  "details",
  HtmlDetailsMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { open } = p.asOptionalBoolean("open");
    const props = p.asRest();
    return (
      <details className={classnames(styles.htmlDetails, className)} open={open ?? false} {...props}>
        {renderChild(node.children)}
      </details>
    );
  },
);

export const HtmlDfnMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dfn` tag.",
  isHtmlTag: true,
});

export const htmlDfnTagRenderer = createComponentRenderer(
  "dfn",
  HtmlDfnMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <dfn className={className} {...props}>
        {renderChild(node.children)}
      </dfn>
    );
  },
);

export const HtmlDialogMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dialog` tag.",
  isHtmlTag: true,
  props: {
    open: d("Specifies that the dialog is open"),
  },
});

export const htmlDialogTagRenderer = createComponentRenderer(
  "dialog",
  HtmlDialogMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { open } = p.asOptionalBoolean("open");
    const props = p.asRest();
    return (
      <dialog className={className} open={open ?? false} {...props}>
        {renderChild(node.children)}
      </dialog>
    );
  },
);

export const HtmlDivMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `div` tag.",
  isHtmlTag: true,
});

export const htmlDivTagRenderer = createComponentRenderer(
  "div",
  HtmlDivMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <div className={className} {...props}>
        {renderChild(node.children)}
      </div>
    );
  },
);

export const HtmlDlMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dl` tag.",
  isHtmlTag: true,
});

export const htmlDlTagRenderer = createComponentRenderer(
  "dl",
  HtmlDlMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <dl className={className} {...props}>
        {renderChild(node.children)}
      </dl>
    );
  },
);

export const HtmlDtMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `dt` tag.",
  isHtmlTag: true,
});

export const htmlDtTagRenderer = createComponentRenderer(
  "dt",
  HtmlDtMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <dt className={className} {...props}>
        {renderChild(node.children)}
      </dt>
    );
  },
);

export const HtmlEMMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `em` tag.",
  isHtmlTag: true,
});

export const htmlEMTagRenderer = createComponentRenderer(
  "em",
  HtmlEMMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="em">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlEmbedMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `embed` tag.",
  isHtmlTag: true,
  props: {
    src: d("Specifies the URL of the resource"),
    type: d("Specifies the type of the resource"),
    width: d("Specifies the width of the embed"),
    height: d("Specifies the height of the embed"),
  },
});

export const htmlEmbedTagRenderer = createComponentRenderer(
  "embed",
  HtmlEmbedMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { src } = p.asUrlResource("src");
    const props = p.asRest();
    return (
      <embed className={className} src={src} {...props}>
        {renderChild(node.children)}
      </embed>
    );
  },
);

export const HtmlFieldsetMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `fieldset` tag.",
  isHtmlTag: true,
  props: {
    disabled: d("Specifies that the fieldset should be disabled"),
    form: d("Specifies the form the fieldset belongs to"),
    name: d("Specifies a name for the fieldset"),
  },
});

export const htmlFieldsetTagRenderer = createComponentRenderer(
  "fieldset",
  HtmlFieldsetMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { disabled } = p.asOptionalBoolean("disabled");
    const props = p.asRest();
    return (
      <fieldset className={className} disabled={disabled ?? false} {...props}>
        {renderChild(node.children)}
      </fieldset>
    );
  },
);

export const HtmlFigcaptionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `figcaption` tag.",
  isHtmlTag: true,
});

export const htmlFigcaptionTagRenderer = createComponentRenderer(
  "figcaption",
  HtmlFigcaptionMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <figcaption className={className} {...props}>
        {renderChild(node.children)}
      </figcaption>
    );
  },
);

export const HtmlFigureMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `figure` tag.",
  isHtmlTag: true,
});

export const htmlFigureTagRenderer = createComponentRenderer(
  "figure",
  HtmlFigureMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <figure className={className} {...props}>
        {renderChild(node.children)}
      </figure>
    );
  },
);

export const HtmlFooterMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `footer` tag.",
  isHtmlTag: true,
});

export const htmlFooterTagRenderer = createComponentRenderer(
  "footer",
  HtmlFooterMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <footer className={className} {...props}>
        {renderChild(node.children)}
      </footer>
    );
  },
);

export const HtmlFormMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `form` tag.",
  isHtmlTag: true,
  props: {
    acceptCharset: d(
      "Specifies the character encodings that are to be used for the form submission",
    ),
    action: d("Specifies where to send the form-data when a form is submitted"),
    autoComplete: d("Specifies whether a form should have auto-completion"),
    encType: d("Specifies how the form-data should be encoded when submitting it to the server"),
    method: d("Specifies the HTTP method to use when sending form-data"),
    name: d("Specifies the name of the form"),
    noValidate: d("Specifies that the form should not be validated when submitted"),
    target: d("Specifies where to display the response after submitting the form"),
  },
});

export const htmlFormTagRenderer = createComponentRenderer(
  "form",
  HtmlFormMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { noValidate } = p.asOptionalBoolean("noValidate");
    const props = p.asRest();
    return (
      <form className={className} noValidate={noValidate ?? false} {...props}>
        {renderChild(node.children)}
      </form>
    );
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

export const htmlH1TagRenderer = createComponentRenderer(
  "h1",
  HtmlH1Md,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Heading className={classnames(className, styles.htmlHeading)} {...props} level="h1">
        {renderChild(node.children)}
      </Heading>
    );
  },
);

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

export const htmlH2TagRenderer = createComponentRenderer(
  "h2",
  HtmlH2Md,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Heading className={classnames(className, styles.htmlHeading)} {...props} level="h2">
        {renderChild(node.children)}
      </Heading>
    );
  },
);

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

export const htmlH3TagRenderer = createComponentRenderer(
  "h3",
  HtmlH3Md,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Heading className={classnames(className, styles.htmlHeading)} {...props} level="h3">
        {renderChild(node.children)}
      </Heading>
    );
  },
);

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

export const htmlH4TagRenderer = createComponentRenderer(
  "h4",
  HtmlH4Md,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Heading className={classnames(className, styles.htmlHeading)} {...props} level="h4">
        {renderChild(node.children)}
      </Heading>
    );
  },
);

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

export const htmlH5TagRenderer = createComponentRenderer(
  "h5",
  HtmlH5Md,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Heading className={classnames(className, styles.htmlHeading)} {...props} level="h5">
        {renderChild(node.children)}
      </Heading>
    );
  },
);

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

export const htmlH6TagRenderer = createComponentRenderer(
  "h6",
  HtmlH6Md,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Heading className={classnames(className, styles.htmlHeading)} {...props} level="h6">
        {renderChild(node.children)}
      </Heading>
    );
  },
);

export const HtmlHeaderMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `header` tag.",
  isHtmlTag: true,
});

export const htmlHeaderTagRenderer = createComponentRenderer(
  "header",
  HtmlHeaderMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <header className={className} {...props}>
        {renderChild(node.children)}
      </header>
    );
  },
);

export const HtmlHrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `hr` tag.",
  isHtmlTag: true,
});

export const htmlHrTagRenderer = createComponentRenderer(
  "hr",
  HtmlHrMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <hr className={className} {...props}>
        {renderChild(node.children)}
      </hr>
    );
  },
);

export const HtmlIMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `i` tag.",
  isHtmlTag: true,
});

export const htmlITagRenderer = createComponentRenderer(
  "i",
  HtmlIMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <i className={className} {...props}>
        {renderChild(node.children)}
      </i>
    );
  },
);

export const HtmlIframeMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `iframe` tag.",
  isHtmlTag: true,
  props: {
    src: d("Specifies the URL of the page to embed"),
    srcDoc: d("Specifies the HTML content of the page to embed"),
    name: d("Specifies the name of the iframe"),
    sandbox: d("Specifies a set of extra restrictions for the content in the iframe"),
    allow: d("Specifies a feature policy for the iframe"),
    allowFullScreen: d("Specifies that the iframe can be displayed in full-screen mode"),
    width: d("Specifies the width of the iframe"),
    height: d("Specifies the height of the iframe"),
    loading: d("Specifies the loading behavior of the iframe"),
    referrerPolicy: d("Specifies the referrer policy for the iframe"),
  },
});

export const htmlIframeTagRenderer = createComponentRenderer(
  "iframe",
  HtmlIframeMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { src } = p.asUrlResource("src");
    const { allowFullScreen } = p.asOptionalBoolean("allowFullScreen");
    const props = p.asRest();
    return (
      <iframe className={className} src={src} allowFullScreen={allowFullScreen ?? false} {...props}>
        {renderChild(node.children)}
      </iframe>
    );
  },
);

export const HtmlImgMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `img` tag.",
  isHtmlTag: true,
  props: {
    alt: d("Specifies an alternate text for an image"),
    height: d("Specifies the height of an image"),
    src: d("Specifies the path to the image"),
    width: d("Specifies the width of an image"),
    useMap: d("Specifies an image as a client-side image map"),
    loading: d("Specifies the loading behavior of the image"),
    referrerPolicy: d("Specifies the referrer policy for the image"),
    sizes: d("Specifies image sizes for different page layouts"),
  }
});

export const htmlImgTagRenderer = createComponentRenderer(
  "img",
  HtmlImgMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { src } = p.asUrlResource("src");
    const props = p.asRest() as Record<string, any>;
    return (
      <img className={className} src={src} {...props}>
        {renderChild(node.children)}
      </img>
    );
  },
);

export const HtmlInputMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `input` tag.",
  isHtmlTag: true,
  props: {
    type: d("Specifies the type of input"),
    value: d("Specifies the value of the input"),
    placeholder: d("Specifies a short hint that describes the expected value of the input"),
    autoFocus: d("Specifies that the input should automatically get focus when the page loads"),
    checked: d("Specifies that the input should be pre-selected"),
    disabled: d("Specifies that the input should be disabled"),
    form: d("Specifies the form the input belongs to"),
    name: d("Specifies the name of the input"),
    list: d(
      "Specifies the id of a datalist element that contains pre-defined options for the input",
    ),
    max: d("Specifies the maximum value for an input"),
    maxLength: d("Specifies the maximum number of characters allowed in an input"),
    min: d("Specifies the minimum value for an input"),
    minLength: d("Specifies the minimum number of characters allowed in an input"),
    multiple: d("Specifies that a user can enter more than one value"),
    pattern: d("Specifies a regular expression that an input's value is checked against"),
    readOnly: d("Specifies that the input is read-only"),
    required: d("Specifies that the input is required"),
    size: d("Specifies the width, in characters, of an input"),
    step: d("Specifies the legal number intervals for an input"),
  },
});

export const htmlInputTagRenderer = createComponentRenderer(
  "input",
  HtmlInputMd,
  ({ node, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { autoFocus, checked, disabled, readOnly, required, multiple } = p.asOptionalBoolean(
      "autoFocus",
      "checked",
      "disabled",
      "readOnly",
      "required",
      "multiple",
    );
    const numberProps = p.asOptionalNumber("maxLength", "minLength", "size");
    const props = p.asRest();
    return (
      <input
        className={className}
        autoFocus={autoFocus ?? false}
        checked={checked ?? false}
        disabled={disabled ?? false}
        multiple={multiple ?? false}
        readOnly={readOnly ?? false}
        required={required ?? false}
        {...numberProps}
        {...props}
      />
    );
  },
);

export const HtmlInsMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `ins` tag.",
  isHtmlTag: true,
  props: {
    cite: d("Specifies the source URL for the inserted text"),
    dateTime: d("Specifies the date and time when the text was inserted"),
  },
});

export const htmlInsTagRenderer = createComponentRenderer(
  "ins",
  HtmlInsMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="inserted">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlKbdMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `kbd` tag.",
  isHtmlTag: true,
});

export const htmlKbdTagRenderer = createComponentRenderer(
  "kbd",
  HtmlKbdMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="keyboard">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlLabelMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `label` tag.",
  isHtmlTag: true,
  props: {
    htmlFor: d("Specifies which form element a label is bound to"),
  },
});

export const htmlLabelTagRenderer = createComponentRenderer(
  "label",
  HtmlLabelMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <label className={className} {...props}>
        {renderChild(node.children)}
      </label>
    );
  },
);

export const HtmlLegendMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `legend` tag.",
  isHtmlTag: true,
});

export const htmlLegendTagRenderer = createComponentRenderer(
  "legend",
  HtmlLegendMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <legend className={className} {...props}>
        {renderChild(node.children)}
      </legend>
    );
  },
);

export const HtmlLiMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `li` tag.",
  isHtmlTag: true,
  props: {
    value: d("Specifies the value of the list item (if the parent is an ordered list)"),
  },
  defaultThemeVars: {
    "marginLeft-HtmlLi": "$space-6",
    "paddingLeft-HtmlLi": "$space-1",
  }
});

export const htmlLiTagRenderer = createComponentRenderer(
  "li",
  HtmlLiMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { value } = p.asOptionalNumber("value");
    const props = p.asRest();
    return (
      <li className={className} value={value} {...props}>
        {renderChild(node.children)}
      </li>
    );
  },
);

export const HtmlMainMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `main` tag.",
  isHtmlTag: true,
});

export const htmlMainTagRenderer = createComponentRenderer(
  "main",
  HtmlMainMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <main className={className} {...props}>
        {renderChild(node.children)}
      </main>
    );
  },
);

export const HtmlMapMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `map` tag.",
  isHtmlTag: true,
  props: {
    name: d("Specifies the name of the map"),
  },
});

export const htmlMapTagRenderer = createComponentRenderer(
  "map",
  HtmlMapMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <map className={className} {...props}>
        {renderChild(node.children)}
      </map>
    );
  },
);

export const HtmlMarkMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `mark` tag.",
  isHtmlTag: true,
});

export const htmlMarkTagRenderer = createComponentRenderer(
  "mark",
  HtmlMarkMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="marked">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlMenuMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `menu` tag.",
  isHtmlTag: true,
  props: {
    type: d("Specifies the type of the menu"),
  },
});

export const htmlMenuTagRenderer = createComponentRenderer(
  "menu",
  HtmlMenuMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <menu className={className} {...props}>
        {renderChild(node.children)}
      </menu>
    );
  },
);

export const HtmlMeterMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `meter` tag.",
  isHtmlTag: true,
  props: {
    min: d("Specifies the minimum value"),
    max: d("Specifies the maximum value"),
    low: d("Specifies the lower bound of the high value"),
    high: d("Specifies the upper bound of the low value"),
    optimum: d("Specifies the optimal value"),
    value: d("Specifies the current value"),
  },
});

export const htmlMeterTagRenderer = createComponentRenderer(
  "meter",
  HtmlMeterMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const numberProps = p.asOptionalNumber("value", "min", "max", "low", "high", "optimum");
    const props = p.asRest();
    return (
      <meter className={className} {...numberProps} {...props}>
        {renderChild(node.children)}
      </meter>
    );
  },
);

export const HtmlNavMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `nav` tag.",
  isHtmlTag: true,
});

export const htmlNavTagRenderer = createComponentRenderer(
  "nav",
  HtmlNavMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <nav className={className} {...props}>
        {renderChild(node.children)}
      </nav>
    );
  },
);

export const HtmlObjectMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `object` tag.",
  isHtmlTag: true,
  props: {
    data: d("Specifies the URL of the resource"),
    type: d("Specifies the MIME type of the resource"),
    name: d("Specifies the name of the object"),
    form: d("Specifies the form the object belongs to"),
    width: d("Specifies the width of the object"),
    height: d("Specifies the height of the object"),
  },
});

export const htmlObjectTagRenderer = createComponentRenderer(
  "object",
  HtmlObjectMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <object className={className} {...props}>
        {renderChild(node.children)}
      </object>
    );
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

export const htmlOlTagRenderer = createComponentRenderer(
  "ol",
  HtmlOlMd, // Use HtmlOlMd instead of HtmlListMd
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <ol className={classnames(styles.htmlOl, className)} {...props}>
        {renderChild(node.children)}
      </ol>
    );
  },
);

export const HtmlOptgroupMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `optgroup` tag.",
  isHtmlTag: true,
  props: {
    label: d("Specifies the label for the option group"),
    disabled: d("Specifies that the option group is disabled"),
  },
});

export const htmlOptgroupTagRenderer = createComponentRenderer(
  "optgroup",
  HtmlOptgroupMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { disabled } = p.asOptionalBoolean("disabled");
    const props = p.asRest();
    return (
      <optgroup className={className} disabled={disabled ?? false} {...props}>
        {renderChild(node.children)}
      </optgroup>
    );
  },
);

export const HtmlOptionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `option` tag.",
  isHtmlTag: true,
  props: {
    disabled: d("Specifies that the option should be disabled"),
    label: d("Specifies the label of the option"),
    selected: d("Specifies that the option should be pre-selected"),
    value: d("Specifies the value of the option"),
  },
});

export const htmlOptionTagRenderer = createComponentRenderer(
  "option",
  HtmlOptionMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { disabled, selected } = p.asOptionalBoolean("disabled", "selected");
    const props = p.asRest();
    return (
      <option
        className={className}
        disabled={disabled ?? false}
        selected={selected ?? false}
        {...props}
      >
        {renderChild(node.children)}
      </option>
    );
  },
);

export const HtmlOutputMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `output` tag.",
  isHtmlTag: true,
  props: {
    form: d("Specifies the form element that the output is associated with"),
    htmlFor: d("Specifies the IDs of the elements that this output is related to"),
    name: d("Specifies the name of the output"),
  },
});

export const htmlOutputTagRenderer = createComponentRenderer(
  "output",
  HtmlOutputMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <output className={className} {...props}>
        {renderChild(node.children)}
      </output>
    );
  },
);

export const HtmlPMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `p` tag.",
  isHtmlTag: true,
});

export const htmlPTagRenderer = createComponentRenderer(
  "p",
  HtmlPMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="paragraph">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlParamMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `param` tag.",
  isHtmlTag: true,
  props: {
    name: d("Specifies the name of the parameter"),
    value: d("Specifies the value of the parameter"),
  },
});

export const htmlParamTagRenderer = createComponentRenderer(
  "param",
  HtmlParamMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <param className={className} {...props}>
        {renderChild(node.children)}
      </param>
    );
  },
);

export const HtmlPictureMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `picture` tag.",
  isHtmlTag: true,
});

export const htmlPictureTagRenderer = createComponentRenderer(
  "picture",
  HtmlPictureMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <picture className={className} {...props}>
        {renderChild(node.children)}
      </picture>
    );
  },
);

export const HtmlPreMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `pre` tag.",
  isHtmlTag: true,
});

export const htmlPreTagRenderer = createComponentRenderer(
  "pre",
  HtmlPreMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="codefence">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlProgressMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `progress` tag.",
  isHtmlTag: true,
  props: {
    max: d("Specifies the maximum value of the progress element"),
    value: d("Specifies the current value of the progress element"),
  },
});

export const htmlProgressTagRenderer = createComponentRenderer(
  "progress",
  HtmlProgressMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const numberProps = p.asOptionalNumber("max", "value");
    const props = p.asRest();
    return (
      <progress className={className} {...numberProps} {...props}>
        {renderChild(node.children)}
      </progress>
    );
  },
);

export const HtmlQMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `q` tag.",
  isHtmlTag: true,
  props: {
    cite: d("Specifies the source URL of the quotation"),
  },
});

export const htmlQTagRenderer = createComponentRenderer(
  "q",
  HtmlQMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <q className={className} {...props}>
        {renderChild(node.children)}
      </q>
    );
  },
);

export const HtmlRpMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `rp` tag.",
  isHtmlTag: true,
});

export const htmlRpTagRenderer = createComponentRenderer(
  "rp",
  HtmlRpMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <rp className={className} {...props}>
        {renderChild(node.children)}
      </rp>
    );
  },
);

export const HtmlRtMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `rt` tag.",
  isHtmlTag: true,
});

export const htmlRtTagRenderer = createComponentRenderer(
  "rt",
  HtmlRtMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <rt className={className} {...props}>
        {renderChild(node.children)}
      </rt>
    );
  },
);

export const HtmlRubyMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `ruby` tag.",
  isHtmlTag: true,
});

export const htmlRubyTagRenderer = createComponentRenderer(
  "ruby",
  HtmlRubyMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <ruby className={className} {...props}>
        {renderChild(node.children)}
      </ruby>
    );
  },
);

export const HtmlSMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `s` tag.",
  isHtmlTag: true,
});

export const htmlSTagRenderer = createComponentRenderer(
  "s",
  HtmlSMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <s className={className} {...props}>
        {renderChild(node.children)}
      </s>
    );
  },
);

export const HtmlSampMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `samp` tag.",
  isHtmlTag: true,
});

export const htmlSampTagRenderer = createComponentRenderer(
  "samp",
  HtmlSampMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="sample">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlSectionMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `section` tag.",
  isHtmlTag: true,
});

export const htmlSectionTagRenderer = createComponentRenderer(
  "section",
  HtmlSectionMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <section className={className} {...props}>
        {renderChild(node.children)}
      </section>
    );
  },
);

export const HtmlSelectMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `select` tag.",
  isHtmlTag: true,
  props: {
    autoFocus: d("Specifies that the select should automatically get focus when the page loads"),
    disabled: d("Specifies that the select should be disabled"),
    form: d("Specifies the form the select belongs to"),
    multiple: d("Specifies that multiple options can be selected at once"),
    name: d("Specifies the name of the select"),
    required: d("Specifies that the select is required"),
    size: d("Specifies the number of visible options in the select"),
  },
});

export const htmlSelectTagRenderer = createComponentRenderer(
  "select",
  HtmlSelectMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { autoFocus, disabled, multiple, required } = p.asOptionalBoolean(
      "autoFocus",
      "disabled",
      "multiple",
      "required",
    );
    const { size } = p.asOptionalNumber("size");
    const props = p.asRest();
    return (
      <select
        className={className}
        autoFocus={autoFocus ?? false}
        disabled={disabled ?? false}
        multiple={multiple ?? false}
        required={required ?? false}
        size={size}
        {...props}
      >
        {renderChild(node.children)}
      </select>
    );
  },
);

export const HtmlSmallMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `small` tag.",
  isHtmlTag: true,
});

export const htmlSmallTagRenderer = createComponentRenderer(
  "small",
  HtmlSmallMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="small">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlSourceMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `source` tag.",
  isHtmlTag: true,
  props: {
    src: d("Specifies the URL of the media file"),
    type: d("Specifies the type of the media file"),
    media: d("Specifies a media query for the media file"),
    srcSet: d("Specifies the source set for responsive images"),
    sizes: d("Specifies the sizes attribute for responsive images"),
  },
});

export const htmlSourceTagRenderer = createComponentRenderer(
  "source",
  HtmlSourceMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { src } = p.asUrlResource("src");
    const props = p.asRest();
    return (
      <source className={className} src={src} {...props}>
        {renderChild(node.children)}
      </source>
    );
  },
);

export const HtmlSpanMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `span` tag.",
  isHtmlTag: true,
});

export const htmlSpanTagRenderer = createComponentRenderer(
  "span",
  HtmlSpanMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <span className={className} {...props}>
        {renderChild(node.children)}
      </span>
    );
  },
);

export const HtmlStrongMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `strong` tag.",
  isHtmlTag: true,
});

export const htmlStrongTagRenderer = createComponentRenderer(
  "strong",
  HtmlStrongMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="strong">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlSubMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `sub` tag.",
  isHtmlTag: true,
});

export const htmlSubTagRenderer = createComponentRenderer(
  "sub",
  HtmlSubMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="sub">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlSummaryMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `summary` tag.",
  isHtmlTag: true,
});

export const htmlSummaryTagRenderer = createComponentRenderer(
  "summary",
  HtmlSummaryMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <summary className={className} {...props}>
        {renderChild(node.children)}
      </summary>
    );
  },
);

export const HtmlSupMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `sup` tag.",
  isHtmlTag: true,
});

export const htmlSupTagRenderer = createComponentRenderer(
  "sup",
  HtmlSupMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="sup">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlTableMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `table` tag.",
  isHtmlTag: true,
  props: {
    border: d("Specifies the width of the border around the table"),
    cellPadding: d("Specifies the space between the cell content and its borders"),
    cellSpacing: d("Specifies the space between cells"),
    summary: d("Provides a summary of the table's purpose and structure"),
    width: d("Specifies the width of the table"),
    align: d("Specifies the alignment of the table"),
    frame: d("Specifies which parts of the table frame to render"),
    rules: d("Specifies which rules to draw between cells"),
  },
  themeVars: parseScssVar(styles.themeVarsTable),
  defaultThemeVars: {
    "backgroundColor-HtmlTable": "$backgroundColor",
    "border-HtmlTable": "1px solid $borderColor",
    "marginBottom-HtmlTable": "$space-4",
    "marginTop-HtmlTable": "$space-4",
  },
});

export const htmlTableTagRenderer = createComponentRenderer(
  "table",
  HtmlTableMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <table className={classnames(styles.htmlTable, className)} {...props}>
        {renderChild(node.children)}
      </table>
    );
  },
);

export const HtmlTbodyMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `tbody` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsTbody),
});

export const htmlTbodyTagRenderer = createComponentRenderer(
  "tbody",
  HtmlTbodyMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <tbody className={classnames(styles.htmlTbody, className)} {...props}>
        {renderChild(node.children)}
      </tbody>
    );
  },
);

export const HtmlTdMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `td` tag.",
  isHtmlTag: true,
  props: {
    align: d("Specifies the horizontal alignment of the content in the cell"),
    colSpan: d("Specifies the number of columns a cell should span"),
    headers: d("Specifies a list of header cells the current cell is related to"),
    rowSpan: d("Specifies the number of rows a cell should span"),
    valign: d("Specifies the vertical alignment of the content in the cell"),
    scope: d("Specifies whether a cell is a header for a column, row, or group of columns or rows"),
    abbr: d("Specifies an abbreviated version of the content in the cell"),
    height: d("Specifies the height of the cell"),
    width: d("Specifies the width of the cell"),
  },
  themeVars: parseScssVar(styles.themeVarsTd),
  defaultThemeVars: {
    "padding-HtmlTd": "$space-2",
    "borderBottom-HtmlTd": "1px solid $borderColor",
  },
});

export const htmlTdTagRenderer = createComponentRenderer(
  "td",
  HtmlTdMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <td className={classnames(styles.htmlTd, className)} {...props}>
        {renderChild(node.children)}
      </td>
    );
  },
);

export const HtmlTemplateMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `template` tag.",
  isHtmlTag: true,
});

export const htmlTemplateTagRenderer = createComponentRenderer(
  "template",
  HtmlTemplateMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <template className={className} {...props}>
        {renderChild(node.children)}
      </template>
    );
  },
);

export const HtmlTextareaMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `textarea` tag.",
  isHtmlTag: true,
  props: {
    autoFocus: d("Specifies that the textarea should automatically get focus when the page loads"),
    cols: d("Specifies the visible width of the text area in average character widths"),
    dirName: d("Specifies the text directionality"),
    disabled: d("Specifies that the textarea should be disabled"),
    form: d("Specifies the form the textarea belongs to"),
    maxLength: d("Specifies the maximum number of characters allowed in the textarea"),
    minLength: d("Specifies the minimum number of characters allowed in the textarea"),
    name: d("Specifies the name of the textarea"),
    placeholder: d("Specifies a short hint that describes the expected value"),
    readOnly: d("Specifies that the textarea is read-only"),
    required: d("Specifies that the textarea is required"),
    rows: d("Specifies the visible number of lines in the textarea"),
    value: d("Specifies the current value of the textarea"),
    wrap: d("Specifies how the text in a textarea is to be wrapped when submitted"),
  },
});

export const htmlTextareaTagRenderer = createComponentRenderer(
  "textarea",
  HtmlTextareaMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { autoFocus, disabled, readOnly, required } = p.asOptionalBoolean(
      "autoFocus",
      "disabled",
      "readOnly",
      "required",
    );
    const numberProps = p.asOptionalNumber("cols", "rows", "maxLength", "minLength");
    const props = p.asRest();
    return (
      <textarea
        className={className}
        autoFocus={autoFocus ?? false}
        disabled={disabled ?? false}
        readOnly={readOnly ?? false}
        required={required ?? false}
        {...numberProps}
        {...props}
      >
        {renderChild(node.children)}
      </textarea>
    );
  },
);

export const HtmlTfootMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `tfoot` tag.",
  isHtmlTag: true,
  themeVars: parseScssVar(styles.themeVarsTfoot),
});

export const htmlTfootTagRenderer = createComponentRenderer(
  "tfoot",
  HtmlTfootMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <tfoot className={classnames(styles.htmlTfoot, className)} {...props}>
        {renderChild(node.children)}
      </tfoot>
    );
  },
);

export const HtmlThMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `th` tag.",
  isHtmlTag: true,
  props: {
    abbr: d("Specifies an abbreviated version of the content in the header cell"),
    align: d("Specifies the horizontal alignment of the content in the header cell"),
    colSpan: d("Specifies the number of columns a header cell should span"),
    headers: d("Specifies a list of header cells the current header cell is related to"),
    rowSpan: d("Specifies the number of rows a header cell should span"),
    scope: d(
      "Specifies whether a header cell is a header for a column, row, or group of columns or rows",
    ),
  },
  themeVars: parseScssVar(styles.themeVarsTh),
  defaultThemeVars: {
    "padding-HtmlTh": "$space-2",
    "fontSize-HtmlTh": "$fontSize-tiny",
    "fontWeight-HtmlTh": "$fontWeight-bold",
    //"backgroundColor-HtmlTh--hover": "$color-surface-200",
  },
});

export const htmlThTagRenderer = createComponentRenderer(
  "th",
  HtmlThMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <th className={classnames(styles.htmlTh, className)} {...props}>
        {renderChild(node.children)}
      </th>
    );
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

export const htmlTheadTagRenderer = createComponentRenderer(
  "thead",
  HtmlTheadMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <thead className={classnames(styles.htmlThead, className)} {...props}>
        {renderChild(node.children)}
      </thead>
    );
  },
);

export const HtmlTimeMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `time` tag.",
  isHtmlTag: true,
  props: {
    dateTime: d("Specifies the date and time in a machine-readable format"),
  },
});

export const htmlTimeTagRenderer = createComponentRenderer(
  "time",
  HtmlTimeMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <time className={className} {...props}>
        {renderChild(node.children)}
      </time>
    );
  },
);

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

export const htmlTrTagRenderer = createComponentRenderer(
  "tr",
  HtmlTrMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <tr className={classnames(styles.htmlTr, className)} {...props}>
        {renderChild(node.children)}
      </tr>
    );
  },
);

export const HtmlTrackMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `track` tag.",
  isHtmlTag: true,
  props: {
    default: d("Specifies that the track is to be enabled if no other track is more suitable"),
    kind: d("Specifies the kind of text track"),
    label: d("Specifies the title of the text track"),
    src: d("Specifies the URL of the track file"),
    srcLang: d("Specifies the language of the track text data"),
  },
});

export const htmlTrackTagRenderer = createComponentRenderer(
  "track",
  HtmlTrackMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { src } = p.asUrlResource("src");
    const { default: defaultProp } = p.asOptionalBoolean("default");
    const props = p.asRest();
    return (
      <track className={className} default={defaultProp ?? false} src={src} {...props}>
        {renderChild(node.children)}
      </track>
    );
  },
);

export const HtmlUMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `u` tag.",
  isHtmlTag: true,
});

export const htmlUTagRenderer = createComponentRenderer(
  "u",
  HtmlUMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <u className={className} {...props}>
        {renderChild(node.children)}
      </u>
    );
  },
);

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

export const htmlUlTagRenderer = createComponentRenderer(
  "ul",
  HtmlUlMd, // Use HtmlOlMd instead of HtmlListMd
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <ul className={classnames(styles.htmlUl, className)} {...props}>
        {renderChild(node.children)}
      </ul>
    );
  },
);

export const HtmlVarMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `var` tag.",
  isHtmlTag: true,
});

export const htmlVarTagRenderer = createComponentRenderer(
  "var",
  HtmlCodeMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <Text className={className} {...props} variant="var">
        {renderChild(node.children)}
      </Text>
    );
  },
);

export const HtmlVideoMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `video` tag.",
  isHtmlTag: true,
  props: {
    autoPlay: d("Specifies that the video will start playing as soon as it is ready"),
    controls: d("Specifies that video controls should be displayed"),
    height: d("Specifies the height of the video player"),
    loop: d("Specifies that the video will start over again when finished"),
    muted: d("Specifies that the video output should be muted"),
    poster: d("Specifies an image to be shown while the video is downloading"),
    preload: d(
      "Specifies if and how the author thinks the video should be loaded when the page loads",
    ),
    src: d("Specifies the URL of the video file"),
    width: d("Specifies the width of the video player"),
  },
  themeVars: parseScssVar(styles.themeVarsVideo),
  defaultThemeVars: {
    "marginTop-HtmlVideo": "1rem",
    "marginBottom-HtmlVideo": "1rem",
  },
});

export const htmlVideoTagRenderer = createComponentRenderer(
  "video",
  HtmlVideoMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const { src } = p.asUrlResource("src");
    const { autoPlay, controls, loop, muted } = p.asOptionalBoolean(
      "autoPlay",
      "controls",
      "loop",
      "muted",
    );
    const props = p.asRest();
    return (
      <video
        className={className}
        src={src}
        autoPlay={autoPlay ?? false}
        controls={controls ?? false}
        loop={loop ?? false}
        muted={muted ?? false}
        {...props}
      >
        {renderChild(node.children)}
      </video>
    );
  },
);

export const HtmlWbrMd = createMetadata({
  status: "deprecated",
  description: "This component renders an HTML `wbr` tag.",
  isHtmlTag: true,
});

export const htmlWbrTagRenderer = createComponentRenderer(
  "wbr",
  HtmlWbrMd,
  ({ node, renderChild, extractValue, extractResourceUrl, className }) => {
    const p = new PropsTrasform(extractValue, extractResourceUrl, node.props);
    const props = p.asRest();
    return (
      <wbr className={className} {...props}>
        {renderChild(node.children)}
      </wbr>
    );
  },
);
