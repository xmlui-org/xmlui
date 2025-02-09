import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";

export const HtmlAMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `a` tag.",
  isHtmlTag: true,
  props: {
    href: d("Specifies the URL of the page the link goes to"),
    target: d("Specifies where to open the linked document"),
    rel: d("Specifies the relationship between the current document and the linked document"),
    download: d("Indicates that the target will be downloaded when a user clicks on the hyperlink"),
    hrefLang: d("Specifies the language of the linked document"),
    type: d("Specifies the MIME type of the linked document"),
    ping: d(
      "Specifies a space-separated list of URLs to be notified if the user follows the hyperlink",
    ),
    referrerPolicy: d("Specifies the referrer policy for the element"),
  },
});

export const htmlATagRenderer = createComponentRenderer(
  "a",
  HtmlAMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <a
        style={layoutCss}
        href={extractValue(node.props.href)}
        target={extractValue(node.props.target)}
        rel={extractValue(node.props.rel)}
        download={extractValue(node.props.download)}
        hrefLang={extractValue(node.props.hrefLang)}
        type={extractValue(node.props.type)}
        ping={extractValue(node.props.ping)}
        referrerPolicy={extractValue(node.props.referrerPolicy)}
      >
        {renderChild(node.children)}
      </a>
    );
  },
);

export const HtmlAddressMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `address` tag.",
  isHtmlTag: true,
});

export const htmlAddressTagRenderer = createComponentRenderer(
  "address",
  HtmlAddressMd,
  ({ node, renderChild, layoutCss }) => {
    return <address style={layoutCss}>{renderChild(node.children)}</address>;
  },
);

export const HtmlAreaMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <area
        style={layoutCss}
        alt={extractValue(node.props.alt)}
        coords={extractValue(node.props.coords)}
        download={extractValue(node.props.download)}
        href={extractValue(node.props.href)}
        hrefLang={extractValue(node.props.hrefLang)}
        referrerPolicy={extractValue(node.props.referrerPolicy)}
        rel={extractValue(node.props.rel)}
        shape={extractValue(node.props.shape)}
        target={extractValue(node.props.target)}
        media={extractValue(node.props.media)}
      >
        {renderChild(node.children)}
      </area>
    );
  },
);

export const HtmlArticleMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `article` tag.",
  isHtmlTag: true,
});

export const htmlArticleTagRenderer = createComponentRenderer(
  "article",
  HtmlArticleMd,
  ({ node, renderChild, layoutCss }) => {
    return <article style={layoutCss}>{renderChild(node.children)}</article>;
  },
);

export const HtmlAsideMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `aside` tag.",
  isHtmlTag: true,
});

export const htmlAsideTagRenderer = createComponentRenderer(
  "aside",
  HtmlAsideMd,
  ({ node, renderChild, layoutCss }) => {
    return <aside style={layoutCss}>{renderChild(node.children)}</aside>;
  },
);

export const HtmlAudioMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <audio
        style={layoutCss}
        autoPlay={extractValue.asOptionalBoolean(node.props.autoPlay, false)}
        controls={extractValue.asOptionalBoolean(node.props.controls, false)}
        crossOrigin={extractValue(node.props.crossOrigin)}
        loop={extractValue.asOptionalBoolean(node.props.loop, false)}
        muted={extractValue.asOptionalBoolean(node.props.muted, false)}
        preload={extractValue(node.props.preload)}
        src={extractValue(node.props.src)}
      >
        {renderChild(node.children)}
      </audio>
    );
  },
);

export const HtmlBMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `b` tag.",
  isHtmlTag: true,
});

export const htmlBTagRenderer = createComponentRenderer(
  "b",
  HtmlBMd,
  ({ node, renderChild, layoutCss }) => {
    return <b style={layoutCss}>{renderChild(node.children)}</b>;
  },
);

export const HtmlBdiMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `bdi` tag.",
  isHtmlTag: true,
});

export const htmlBdiTagRenderer = createComponentRenderer(
  "bdi",
  HtmlBdiMd,
  ({ node, renderChild, layoutCss }) => {
    return <bdi style={layoutCss}>{renderChild(node.children)}</bdi>;
  },
);

export const HtmlBdoMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `bdo` tag.",
  isHtmlTag: true,
  props: {
    dir: d("Specifies the text direction override"),
  },
});

export const htmlBdoTagRenderer = createComponentRenderer(
  "bdo",
  HtmlBdoMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <bdo style={layoutCss} dir={extractValue(node.props.dir)}>
        {renderChild(node.children)}
      </bdo>
    );
  },
);

export const HtmlBlockquoteMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `blockquote` tag.",
  isHtmlTag: true,
  props: {
    cite: d("Specifies the source of the quotation"),
  },
});

export const htmlBlockquoteTagRenderer = createComponentRenderer(
  "blockquote",
  HtmlBlockquoteMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <blockquote style={layoutCss} cite={extractValue(node.props.cite)}>
        {renderChild(node.children)}
      </blockquote>
    );
  },
);

export const HtmlBrMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `br` tag.",
  isHtmlTag: true,
});

export const htmlBrTagRenderer = createComponentRenderer(
  "br",
  HtmlBrMd,
  ({ node, renderChild, layoutCss }) => {
    return <br style={layoutCss} />;
  },
);

export const HtmlButtonMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <button
        style={layoutCss}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, false)}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
        form={extractValue(node.props.form)}
        formAction={extractValue(node.props.formAction)}
        formEncType={extractValue(node.props.formEncType)}
        formMethod={extractValue(node.props.formMethod)}
        formNoValidate={extractValue.asOptionalBoolean(node.props.formNoValidate, false)}
        formTarget={extractValue(node.props.formTarget)}
        name={extractValue(node.props.name)}
        type={extractValue(node.props.type)}
        value={extractValue(node.props.value)}
      >
        {renderChild(node.children)}
      </button>
    );
  },
);

export const HtmlCanvasMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <canvas
        style={layoutCss}
        width={extractValue.asOptionalNumber(node.props.width)}
        height={extractValue.asOptionalNumber(node.props.height)}
      >
        {renderChild(node.children)}
      </canvas>
    );
  },
);

export const HtmlCaptionMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `caption` tag.",
  isHtmlTag: true,
});

export const htmlCaptionTagRenderer = createComponentRenderer(
  "caption",
  HtmlCaptionMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return <caption style={layoutCss}>{renderChild(node.children)}</caption>;
  },
);

export const HtmlCiteMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `cite` tag.",
  isHtmlTag: true,
});

export const htmlCiteTagRenderer = createComponentRenderer(
  "cite",
  HtmlCiteMd,
  ({ node, renderChild, layoutCss }) => {
    return <cite style={layoutCss}>{renderChild(node.children)}</cite>;
  },
);

export const HtmlCodeMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `code` tag.",
  isHtmlTag: true,
});

export const htmlCodeTagRenderer = createComponentRenderer(
  "code",
  HtmlCodeMd,
  ({ node, renderChild, layoutCss }) => {
    return <code style={layoutCss}>{renderChild(node.children)}</code>;
  },
);

export const HtmlColMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `col` tag.",
  isHtmlTag: true,
  props: {
    span: d("Specifies the number of columns a `col` element should span"),
  },
});

export const htmlColTagRenderer = createComponentRenderer(
  "col",
  HtmlColMd,
  ({ node, extractValue, layoutCss }) => {
    return <col style={layoutCss} span={extractValue.asOptionalNumber(node.props.span)} />;
  },
);

export const HtmlColgroupMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `colgroup` tag.",
  isHtmlTag: true,
  props: {
    span: d("Specifies the number of columns in a `colgroup`"),
  },
});

export const htmlColgroupTagRenderer = createComponentRenderer(
  "colgroup",
  HtmlColgroupMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <colgroup style={layoutCss} span={extractValue.asOptionalNumber(node.props.span)}>
        {renderChild(node.children)}
      </colgroup>
    );
  },
);

export const HtmlDataMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `data` tag.",
  isHtmlTag: true,
  props: {
    value: d("Specifies the machine-readable value of the element"),
  },
});

export const htmlDataTagRenderer = createComponentRenderer(
  "data",
  HtmlDataMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <data style={layoutCss} value={extractValue(node.props.value)}>
        {renderChild(node.children)}
      </data>
    );
  },
);

export const HtmlDatalistMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `datalist` tag.",
  isHtmlTag: true,
});

export const htmlDatalistTagRenderer = createComponentRenderer(
  "datalist",
  HtmlDatalistMd,
  ({ node, renderChild, layoutCss }) => {
    return <datalist style={layoutCss}>{renderChild(node.children)}</datalist>;
  },
);

export const HtmlDdMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `dd` tag.",
  isHtmlTag: true,
});

export const htmlDdTagRenderer = createComponentRenderer(
  "dd",
  HtmlDdMd,
  ({ node, renderChild, layoutCss }) => {
    return <dd style={layoutCss}>{renderChild(node.children)}</dd>;
  },
);

export const HtmlDelMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <del
        style={layoutCss}
        cite={extractValue(node.props.cite)}
        dateTime={extractValue(node.props.dateTime)}
      >
        {renderChild(node.children)}
      </del>
    );
  },
);

export const HtmlDetailsMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `details` tag.",
  isHtmlTag: true,
  props: {
    open: d("Specifies that the details are visible (open)"),
  },
});

export const htmlDetailsTagRenderer = createComponentRenderer(
  "details",
  HtmlDetailsMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <details style={layoutCss} open={extractValue.asOptionalBoolean(node.props.open, false)}>
        {renderChild(node.children)}
      </details>
    );
  },
);

export const HtmlDfnMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `dfn` tag.",
  isHtmlTag: true,
});

export const htmlDfnTagRenderer = createComponentRenderer(
  "dfn",
  HtmlDfnMd,
  ({ node, renderChild, layoutCss }) => {
    return <dfn style={layoutCss}>{renderChild(node.children)}</dfn>;
  },
);

export const HtmlDialogMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `dialog` tag.",
  isHtmlTag: true,
  props: {
    open: d("Specifies that the dialog is open"),
  },
});

export const htmlDialogTagRenderer = createComponentRenderer(
  "dialog",
  HtmlDialogMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <dialog style={layoutCss} open={extractValue.asOptionalBoolean(node.props.open, false)}>
        {renderChild(node.children)}
      </dialog>
    );
  },
);

export const HtmlDivMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `div` tag.",
  isHtmlTag: true,
});

export const htmlDivTagRenderer = createComponentRenderer(
  "div",
  HtmlDivMd,
  ({ node, renderChild, layoutCss }) => {
    return <div style={layoutCss}>{renderChild(node.children)}</div>;
  },
);

export const HtmlDlMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `dl` tag.",
  isHtmlTag: true,
});

export const htmlDlTagRenderer = createComponentRenderer(
  "dl",
  HtmlDlMd,
  ({ node, renderChild, layoutCss }) => {
    return <dl style={layoutCss}>{renderChild(node.children)}</dl>;
  },
);

export const HtmlDtMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `dt` tag.",
  isHtmlTag: true,
});

export const htmlDtTagRenderer = createComponentRenderer(
  "dt",
  HtmlDtMd,
  ({ node, renderChild, layoutCss }) => {
    return <dt style={layoutCss}>{renderChild(node.children)}</dt>;
  },
);

export const HtmlEMMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `em` tag.",
  isHtmlTag: true,
});

export const htmlEMTagRenderer = createComponentRenderer(
  "em",
  HtmlEMMd,
  ({ node, renderChild, layoutCss }) => {
    return <em style={layoutCss}>{renderChild(node.children)}</em>;
  },
);

export const HtmlEmbedMd = createMetadata({
  status: "experimental",
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
  ({ node, extractValue, layoutCss }) => {
    return (
      <embed
        style={layoutCss}
        src={extractValue(node.props.src)}
        type={extractValue(node.props.type)}
        width={extractValue(node.props.width)}
        height={extractValue(node.props.height)}
      />
    );
  },
);

export const HtmlFieldsetMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <fieldset
        style={layoutCss}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
        form={extractValue(node.props.form)}
        name={extractValue(node.props.name)}
      >
        {renderChild(node.children)}
      </fieldset>
    );
  },
);

export const HtmlFigcaptionMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `figcaption` tag.",
  isHtmlTag: true,
});

export const htmlFigcaptionTagRenderer = createComponentRenderer(
  "figcaption",
  HtmlFigcaptionMd,
  ({ node, renderChild, layoutCss }) => {
    return <figcaption style={layoutCss}>{renderChild(node.children)}</figcaption>;
  },
);

export const HtmlFigureMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `figure` tag.",
  isHtmlTag: true,
});

export const htmlFigureTagRenderer = createComponentRenderer(
  "figure",
  HtmlFigureMd,
  ({ node, renderChild, layoutCss }) => {
    return <figure style={layoutCss}>{renderChild(node.children)}</figure>;
  },
);

export const HtmlFooterMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `footer` tag.",
  isHtmlTag: true,
});

export const htmlFooterTagRenderer = createComponentRenderer(
  "footer",
  HtmlFooterMd,
  ({ node, renderChild, layoutCss }) => {
    return <footer style={layoutCss}>{renderChild(node.children)}</footer>;
  },
);

export const HtmlFormMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <form
        style={layoutCss}
        acceptCharset={extractValue(node.props.acceptCharset)}
        action={extractValue(node.props.action)}
        autoComplete={extractValue(node.props.autoComplete)}
        encType={extractValue(node.props.encType)}
        method={extractValue(node.props.method)}
        name={extractValue(node.props.name)}
        noValidate={extractValue.asOptionalBoolean(node.props.noValidate, false)}
        target={extractValue(node.props.target)}
      >
        {renderChild(node.children)}
      </form>
    );
  },
);

export const HtmlH1Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h1` tag.",
  isHtmlTag: true,
});

export const htmlH1TagRenderer = createComponentRenderer(
  "h1",
  HtmlH1Md,
  ({ node, renderChild, layoutCss }) => {
    return <h1 style={layoutCss}>{renderChild(node.children)}</h1>;
  },
);

export const HtmlH2Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h2` tag.",
  isHtmlTag: true,
});

export const htmlH2TagRenderer = createComponentRenderer(
  "h2",
  HtmlH2Md,
  ({ node, renderChild, layoutCss }) => {
    return <h2 style={layoutCss}>{renderChild(node.children)}</h2>;
  },
);

export const HtmlH3Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h2` tag.",
  isHtmlTag: true,
});

export const htmlH3TagRenderer = createComponentRenderer(
  "h3",
  HtmlH3Md,
  ({ node, renderChild, layoutCss }) => {
    return <h3 style={layoutCss}>{renderChild(node.children)}</h3>;
  },
);

export const HtmlH4Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h4` tag.",
  isHtmlTag: true,
});

export const htmlH4TagRenderer = createComponentRenderer(
  "h4",
  HtmlH4Md,
  ({ node, renderChild, layoutCss }) => {
    return <h3 style={layoutCss}>{renderChild(node.children)}</h3>;
  },
);

export const HtmlH5Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h5` tag.",
  isHtmlTag: true,
});

export const htmlH5TagRenderer = createComponentRenderer(
  "h5",
  HtmlH5Md,
  ({ node, renderChild, layoutCss }) => {
    return <h5 style={layoutCss}>{renderChild(node.children)}</h5>;
  },
);

export const HtmlH6Md = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h6` tag.",
  isHtmlTag: true,
});

export const htmlH6TagRenderer = createComponentRenderer(
  "h6",
  HtmlH6Md,
  ({ node, renderChild, layoutCss }) => {
    return <h6 style={layoutCss}>{renderChild(node.children)}</h6>;
  },
);

export const HtmlHeaderMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `header` tag.",
  isHtmlTag: true,
});

export const htmlHeaderTagRenderer = createComponentRenderer(
  "header",
  HtmlHeaderMd,
  ({ node, renderChild, layoutCss }) => {
    return <header style={layoutCss}>{renderChild(node.children)}</header>;
  },
);

export const HtmlHrMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `hr` tag.",
  isHtmlTag: true,
});

export const htmlHrTagRenderer = createComponentRenderer("hr", HtmlHrMd, ({ node, layoutCss }) => {
  return <hr style={layoutCss} />;
});

export const HtmlIMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `i` tag.",
  isHtmlTag: true,
});

export const htmlITagRenderer = createComponentRenderer(
  "i",
  HtmlIMd,
  ({ node, renderChild, layoutCss }) => {
    return <i style={layoutCss}>{renderChild(node.children)}</i>;
  },
);

export const HtmlIframeMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <iframe
        style={layoutCss}
        src={extractValue(node.props.src)}
        srcDoc={extractValue(node.props.srcDoc)}
        name={extractValue(node.props.name)}
        sandbox={extractValue(node.props.sandbox)}
        allow={extractValue(node.props.allow)}
        allowFullScreen={extractValue.asOptionalBoolean(node.props.allowFullScreen, false)}
        width={extractValue(node.props.width)}
        height={extractValue(node.props.height)}
        loading={extractValue(node.props.loading)}
        referrerPolicy={extractValue(node.props.referrerPolicy)}
      >
        {renderChild(node.children)}
      </iframe>
    );
  },
);

export const HtmlImgMd = createMetadata({
  status: "experimental",
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
  },
});

export const htmlImgTagRenderer = createComponentRenderer(
  "img",
  HtmlImgMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <img
        style={layoutCss}
        alt={extractValue(node.props.alt)}
        height={extractValue(node.props.height)}
        width={node.props.width}
        src={extractValue(node.props.src)}
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

export const HtmlInputMd = createMetadata({
  status: "experimental",
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
  ({ node, extractValue, layoutCss }) => {
    return (
      <input
        style={layoutCss}
        type={extractValue(node.props.type)}
        value={extractValue(node.props.value)}
        placeholder={extractValue(node.props.placeholder)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, false)}
        checked={extractValue.asOptionalBoolean(node.props.checked, false)}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
        form={extractValue(node.props.form)}
        name={extractValue(node.props.name)}
        list={extractValue(node.props.list)}
        max={extractValue(node.props.max)}
        maxLength={extractValue.asOptionalNumber(node.props.maxLength)}
        min={extractValue(node.props.min)}
        minLength={extractValue.asOptionalNumber(node.props.minLength)}
        multiple={extractValue.asOptionalBoolean(node.props.multiple, false)}
        pattern={extractValue(node.props.pattern)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly, false)}
        required={extractValue.asOptionalBoolean(node.props.required, false)}
        size={extractValue.asOptionalNumber(node.props.size)}
        step={extractValue(node.props.step)}
      />
    );
  },
);

export const HtmlInsMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <ins
        style={layoutCss}
        cite={extractValue(node.props.cite)}
        dateTime={extractValue(node.props.dateTime)}
      >
        {renderChild(node.children)}
      </ins>
    );
  },
);

export const HtmlKbdMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `kbd` tag.",
  isHtmlTag: true,
});

export const htmlKbdTagRenderer = createComponentRenderer(
  "kbd",
  HtmlKbdMd,
  ({ node, renderChild, layoutCss }) => {
    return <kbd style={layoutCss}>{renderChild(node.children)}</kbd>;
  },
);

export const HtmlLabelMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `label` tag.",
  isHtmlTag: true,
  props: {
    htmlFor: d("Specifies which form element a label is bound to"),
  },
});

export const htmlLabelTagRenderer = createComponentRenderer(
  "label",
  HtmlLabelMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <label style={layoutCss} htmlFor={extractValue(node.props.htmlFor)}>
        {renderChild(node.children)}
      </label>
    );
  },
);

export const HtmlLegendMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `legend` tag.",
  isHtmlTag: true,
});

export const htmlLegendTagRenderer = createComponentRenderer(
  "legend",
  HtmlLegendMd,
  ({ node, renderChild, layoutCss }) => {
    return <legend style={layoutCss}>{renderChild(node.children)}</legend>;
  },
);

export const HtmlLiMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `li` tag.",
  isHtmlTag: true,
  props: {
    value: d("Specifies the value of the list item (if the parent is an ordered list)"),
  },
});

export const htmlLiTagRenderer = createComponentRenderer(
  "li",
  HtmlLiMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <li style={layoutCss} value={extractValue.asOptionalNumber(node.props.value)}>
        {renderChild(node.children)}
      </li>
    );
  },
);

export const HtmlMainMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `main` tag.",
  isHtmlTag: true,
});

export const htmlMainTagRenderer = createComponentRenderer(
  "main",
  HtmlMainMd,
  ({ node, renderChild, layoutCss }) => {
    return <main style={layoutCss}>{renderChild(node.children)}</main>;
  },
);

export const HtmlMapMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `map` tag.",
  isHtmlTag: true,
  props: {
    name: d("Specifies the name of the map"),
  },
});

export const htmlMapTagRenderer = createComponentRenderer(
  "map",
  HtmlMapMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <map style={layoutCss} name={extractValue(node.props.name)}>
        {renderChild(node.children)}
      </map>
    );
  },
);

export const HtmlMarkMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `mark` tag.",
  isHtmlTag: true,
});

export const htmlMarkTagRenderer = createComponentRenderer(
  "mark",
  HtmlMarkMd,
  ({ node, renderChild, layoutCss }) => {
    return <mark style={layoutCss}>{renderChild(node.children)}</mark>;
  },
);

export const HtmlMenuMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `menu` tag.",
  isHtmlTag: true,
  props: {
    type: d("Specifies the type of the menu"),
  },
});

export const htmlMenuTagRenderer = createComponentRenderer(
  "menu",
  HtmlMenuMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <menu style={layoutCss} type={extractValue(node.props.type)}>
        {renderChild(node.children)}
      </menu>
    );
  },
);

export const HtmlMeterMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <meter
        style={layoutCss}
        min={extractValue.asOptionalNumber(node.props.min)}
        max={extractValue.asOptionalNumber(node.props.max)}
        low={extractValue.asOptionalNumber(node.props.low)}
        high={extractValue.asOptionalNumber(node.props.high)}
        optimum={extractValue.asOptionalNumber(node.props.optimum)}
        value={extractValue.asOptionalNumber(node.props.value)}
      >
        {renderChild(node.children)}
      </meter>
    );
  },
);

export const HtmlNavMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `nav` tag.",
  isHtmlTag: true,
});

export const htmlNavTagRenderer = createComponentRenderer(
  "nav",
  HtmlNavMd,
  ({ node, renderChild, layoutCss }) => {
    return <nav style={layoutCss}>{renderChild(node.children)}</nav>;
  },
);

export const HtmlObjectMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <object
        style={layoutCss}
        data={extractValue(node.props.data)}
        type={extractValue(node.props.type)}
        name={extractValue(node.props.name)}
        form={extractValue(node.props.form)}
        width={extractValue(node.props.width)}
        height={extractValue(node.props.height)}
      >
        {renderChild(node.children)}
      </object>
    );
  },
);

export const HtmlOlMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `ol` tag.",
  isHtmlTag: true,
  props: {
    reversed: d("Specifies that the list order should be descending (9, 8, 7, ...)"),
    start: d("Specifies the start value of the first list item"),
    type: d("Specifies the kind of marker to use in the list (e.g., '1', 'A', 'a', 'I', 'i')"),
  },
});

export const htmlOlTagRenderer = createComponentRenderer(
  "ol",
  HtmlOlMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <ol
        style={layoutCss}
        reversed={extractValue.asOptionalBoolean(node.props.reversed, false)}
        start={extractValue.asOptionalNumber(node.props.start, 1)}
        type={extractValue(node.props.type)}
      >
        {renderChild(node.children)}
      </ol>
    );
  },
);

export const HtmlOptgroupMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <optgroup
        style={layoutCss}
        label={extractValue(node.props.label)}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
      >
        {renderChild(node.children)}
      </optgroup>
    );
  },
);

export const HtmlOptionMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <option
        style={layoutCss}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
        label={extractValue(node.props.label)}
        selected={extractValue.asOptionalBoolean(node.props.selected, false)}
        value={extractValue(node.props.value)}
      >
        {renderChild(node.children)}
      </option>
    );
  },
);

export const HtmlOutputMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <output
        style={layoutCss}
        form={extractValue(node.props.form)}
        htmlFor={extractValue(node.props.htmlFor)}
        name={extractValue(node.props.name)}
      >
        {renderChild(node.children)}
      </output>
    );
  },
);

export const HtmlPMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `h1` tag.",
  isHtmlTag: true,
});

export const htmlPTagRenderer = createComponentRenderer(
  "p",
  HtmlPMd,
  ({ node, renderChild, layoutCss }) => {
    return <p style={layoutCss}>{renderChild(node.children)}</p>;
  },
);

export const HtmlParamMd = createMetadata({
  status: "experimental",
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
  ({ node, extractValue, layoutCss }) => {
    return (
      <param
        style={layoutCss}
        name={extractValue(node.props.name)}
        value={extractValue(node.props.value)}
      />
    );
  },
);

export const HtmlPictureMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `picture` tag.",
  isHtmlTag: true,
});

export const htmlPictureTagRenderer = createComponentRenderer(
  "picture",
  HtmlPictureMd,
  ({ node, renderChild, layoutCss }) => {
    return <picture style={layoutCss}>{renderChild(node.children)}</picture>;
  },
);

export const HtmlPreMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `pre` tag.",
  isHtmlTag: true,
});

export const htmlPreTagRenderer = createComponentRenderer(
  "pre",
  HtmlPreMd,
  ({ node, renderChild, layoutCss }) => {
    return <pre style={layoutCss}>{renderChild(node.children)}</pre>;
  },
);

export const HtmlProgressMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <progress
        style={layoutCss}
        max={extractValue.asOptionalNumber(node.props.max)}
        value={extractValue.asOptionalNumber(node.props.value)}
      >
        {renderChild(node.children)}
      </progress>
    );
  },
);

export const HtmlQMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `q` tag.",
  isHtmlTag: true,
  props: {
    cite: d("Specifies the source URL of the quotation"),
  },
});

export const htmlQTagRenderer = createComponentRenderer(
  "q",
  HtmlQMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <q style={layoutCss} cite={extractValue(node.props.cite)}>
        {renderChild(node.children)}
      </q>
    );
  },
);

export const HtmlRpMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `rp` tag.",
  isHtmlTag: true,
});

export const htmlRpTagRenderer = createComponentRenderer(
  "rp",
  HtmlRpMd,
  ({ node, renderChild, layoutCss }) => {
    return <rp style={layoutCss}>{renderChild(node.children)}</rp>;
  },
);

export const HtmlRtMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `rt` tag.",
  isHtmlTag: true,
});

export const htmlRtTagRenderer = createComponentRenderer(
  "rt",
  HtmlRtMd,
  ({ node, renderChild, layoutCss }) => {
    return <rt style={layoutCss}>{renderChild(node.children)}</rt>;
  },
);

export const HtmlRubyMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `ruby` tag.",
  isHtmlTag: true,
});

export const htmlRubyTagRenderer = createComponentRenderer(
  "ruby",
  HtmlRubyMd,
  ({ node, renderChild, layoutCss }) => {
    return <ruby style={layoutCss}>{renderChild(node.children)}</ruby>;
  },
);

export const HtmlSMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `s` tag.",
  isHtmlTag: true,
});

export const htmlSTagRenderer = createComponentRenderer(
  "s",
  HtmlSMd,
  ({ node, renderChild, layoutCss }) => {
    return <s style={layoutCss}>{renderChild(node.children)}</s>;
  },
);

export const HtmlSampMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `samp` tag.",
  isHtmlTag: true,
});

export const htmlSampTagRenderer = createComponentRenderer(
  "samp",
  HtmlSampMd,
  ({ node, renderChild, layoutCss }) => {
    return <samp style={layoutCss}>{renderChild(node.children)}</samp>;
  },
);

export const HtmlScriptMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `script` tag.",
  isHtmlTag: true,
  props: {
    src: d("Specifies the URL of the external script file"),
    type: d("Specifies the MIME type of the script"),
    async: d("Specifies that the script should be executed asynchronously"),
    defer: d("Specifies that the script should be executed after the document has been parsed"),
    crossOrigin: d("Specifies how the script should handle cross-origin requests"),
    integrity: d("Specifies the integrity of the script"),
    noModule: d("Specifies that the script should not be executed in module-supporting browsers"),
    referrerPolicy: d("Specifies the referrer policy for the script"),
  },
});

export const htmlScriptTagRenderer = createComponentRenderer(
  "script",
  HtmlScriptMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <script
        style={layoutCss}
        src={extractValue(node.props.src)}
        type={extractValue(node.props.type)}
        async={extractValue.asOptionalBoolean(node.props.async, false)}
        defer={extractValue.asOptionalBoolean(node.props.defer, false)}
        crossOrigin={extractValue(node.props.crossOrigin)}
        integrity={extractValue(node.props.integrity)}
        noModule={extractValue.asOptionalBoolean(node.props.noModule, false)}
        referrerPolicy={extractValue(node.props.referrerPolicy)}
      >
        {renderChild(node.children)}
      </script>
    );
  },
);

export const HtmlSectionMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `section` tag.",
  isHtmlTag: true,
});

export const htmlSectionTagRenderer = createComponentRenderer(
  "section",
  HtmlSectionMd,
  ({ node, renderChild, layoutCss }) => {
    return <section style={layoutCss}>{renderChild(node.children)}</section>;
  },
);

export const HtmlSelectMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <select
        style={layoutCss}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, false)}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
        form={extractValue(node.props.form)}
        multiple={extractValue.asOptionalBoolean(node.props.multiple, false)}
        name={extractValue(node.props.name)}
        required={extractValue.asOptionalBoolean(node.props.required, false)}
        size={extractValue.asOptionalNumber(node.props.size)}
      >
        {renderChild(node.children)}
      </select>
    );
  },
);

export const HtmlSmallMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `small` tag.",
  isHtmlTag: true,
});

export const htmlSmallTagRenderer = createComponentRenderer(
  "small",
  HtmlSmallMd,
  ({ node, renderChild, layoutCss }) => {
    return <small style={layoutCss}>{renderChild(node.children)}</small>;
  },
);

export const HtmlSourceMd = createMetadata({
  status: "experimental",
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
  ({ node, extractValue, layoutCss }) => {
    return (
      <source
        style={layoutCss}
        src={extractValue(node.props.src)}
        type={extractValue(node.props.type)}
        media={extractValue(node.props.media)}
        srcSet={extractValue(node.props.srcSet)}
        sizes={extractValue(node.props.sizes)}
      />
    );
  },
);

export const HtmlSpanMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `span` tag.",
  isHtmlTag: true,
});

export const htmlSpanTagRenderer = createComponentRenderer(
  "span",
  HtmlSpanMd,
  ({ node, renderChild, layoutCss }) => {
    return <span style={layoutCss}>{renderChild(node.children)}</span>;
  },
);

export const HtmlStrongMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `strong` tag.",
  isHtmlTag: true,
});

export const htmlStrongTagRenderer = createComponentRenderer(
  "strong",
  HtmlStrongMd,
  ({ node, renderChild, layoutCss }) => {
    return <strong style={layoutCss}>{renderChild(node.children)}</strong>;
  },
);

export const HtmlSubMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `sub` tag.",
  isHtmlTag: true,
});

export const htmlSubTagRenderer = createComponentRenderer(
  "sub",
  HtmlSubMd,
  ({ node, renderChild, layoutCss }) => {
    return <sub style={layoutCss}>{renderChild(node.children)}</sub>;
  },
);

export const HtmlSummaryMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `summary` tag.",
  isHtmlTag: true,
});

export const htmlSummaryTagRenderer = createComponentRenderer(
  "summary",
  HtmlSummaryMd,
  ({ node, renderChild, layoutCss }) => {
    return <summary style={layoutCss}>{renderChild(node.children)}</summary>;
  },
);

export const HtmlSupMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `sup` tag.",
  isHtmlTag: true,
});

export const htmlSupTagRenderer = createComponentRenderer(
  "sup",
  HtmlSupMd,
  ({ node, renderChild, layoutCss }) => {
    return <sup style={layoutCss}>{renderChild(node.children)}</sup>;
  },
);

export const HtmlTableMd = createMetadata({
  status: "experimental",
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
});

export const htmlTableTagRenderer = createComponentRenderer(
  "table",
  HtmlTableMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <table
        style={layoutCss}
        border={extractValue(node.props.border)}
        cellPadding={extractValue(node.props.cellPadding)}
        cellSpacing={extractValue(node.props.cellSpacing)}
        summary={extractValue(node.props.summary)}
        width={extractValue(node.props.width)}
        align={extractValue(node.props.align)}
        frame={extractValue(node.props.frame)}
        rules={extractValue(node.props.rules)}
      >
        {renderChild(node.children)}
      </table>
    );
  },
);

export const HtmlTbodyMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `tbody` tag.",
  isHtmlTag: true,
});

export const htmlTbodyTagRenderer = createComponentRenderer(
  "tbody",
  HtmlTbodyMd,
  ({ node, renderChild, layoutCss }) => {
    return <tbody style={layoutCss}>{renderChild(node.children)}</tbody>;
  },
);

export const HtmlTdMd = createMetadata({
  status: "experimental",
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
});

export const htmlTdTagRenderer = createComponentRenderer(
  "td",
  HtmlTdMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <td
        style={layoutCss}
        align={extractValue(node.props.align)}
        colSpan={extractValue(node.props.colSpan)}
        headers={extractValue(node.props.headers)}
        rowSpan={extractValue(node.props.rowSpan)}
        valign={extractValue(node.props.valign)}
        scope={extractValue(node.props.scope)}
        abbr={extractValue(node.props.abbr)}
        height={extractValue(node.props.height)}
        width={extractValue(node.props.width)}
      >
        {renderChild(node.children)}
      </td>
    );
  },
);

export const HtmlTemplateMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `template` tag.",
  isHtmlTag: true,
});

export const htmlTemplateTagRenderer = createComponentRenderer(
  "template",
  HtmlTemplateMd,
  ({ node, renderChild, layoutCss }) => {
    return <template style={layoutCss}>{renderChild(node.children)}</template>;
  },
);

export const HtmlTextareaMd = createMetadata({
  status: "experimental",
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
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <textarea
        style={layoutCss}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, false)}
        cols={extractValue.asOptionalNumber(node.props.cols)}
        dirName={extractValue(node.props.dirName)}
        disabled={extractValue.asOptionalBoolean(node.props.disabled, false)}
        form={extractValue(node.props.form)}
        maxLength={extractValue.asOptionalNumber(node.props.maxLength)}
        minLength={extractValue.asOptionalNumber(node.props.minLength)}
        name={extractValue(node.props.name)}
        placeholder={extractValue(node.props.placeholder)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly, false)}
        required={extractValue.asOptionalBoolean(node.props.required, false)}
        rows={extractValue.asOptionalNumber(node.props.rows)}
        value={extractValue(node.props.value)}
        wrap={extractValue(node.props.wrap)}
      >
        {renderChild(node.children)}
      </textarea>
    );
  },
);

export const HtmlTfootMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `tfoot` tag.",
  isHtmlTag: true,
});

export const htmlTfootTagRenderer = createComponentRenderer(
  "tfoot",
  HtmlTfootMd,
  ({ node, renderChild, layoutCss }) => {
    return <tfoot style={layoutCss}>{renderChild(node.children)}</tfoot>;
  },
);

export const HtmlThMd = createMetadata({
  status: "experimental",
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
});

export const htmlThTagRenderer = createComponentRenderer(
  "th",
  HtmlThMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <th
        style={layoutCss}
        abbr={extractValue(node.props.abbr)}
        align={extractValue(node.props.align)}
        colSpan={extractValue(node.props.colSpan)}
        headers={extractValue(node.props.headers)}
        rowSpan={extractValue(node.props.rowSpan)}
        scope={extractValue(node.props.scope)}
      >
        {renderChild(node.children)}
      </th>
    );
  },
);

export const HtmlTheadMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `thead` tag.",
  isHtmlTag: true,
});

export const htmlTheadTagRenderer = createComponentRenderer(
  "thead",
  HtmlTheadMd,
  ({ node, renderChild, layoutCss }) => {
    return <thead style={layoutCss}>{renderChild(node.children)}</thead>;
  },
);

export const HtmlTimeMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `time` tag.",
  isHtmlTag: true,
  props: {
    dateTime: d("Specifies the date and time in a machine-readable format"),
  },
});

export const htmlTimeTagRenderer = createComponentRenderer(
  "time",
  HtmlTimeMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <time style={layoutCss} dateTime={extractValue(node.props.dateTime)}>
        {renderChild(node.children)}
      </time>
    );
  },
);

export const HtmlTrMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `tr` tag.",
  isHtmlTag: true,
});

export const htmlTrTagRenderer = createComponentRenderer(
  "tr",
  HtmlTrMd,
  ({ node, renderChild, layoutCss }) => {
    return <tr style={layoutCss}>{renderChild(node.children)}</tr>;
  },
);

export const HtmlTrackMd = createMetadata({
  status: "experimental",
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
  ({ node, extractValue, layoutCss }) => {
    return (
      <track
        style={layoutCss}
        default={extractValue.asOptionalBoolean(node.props.default, false)}
        kind={extractValue(node.props.kind)}
        label={extractValue(node.props.label)}
        src={extractValue(node.props.src)}
        srcLang={extractValue(node.props.srcLang)}
      />
    );
  },
);

export const HtmlUMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `u` tag.",
  isHtmlTag: true,
});

export const htmlUTagRenderer = createComponentRenderer(
  "u",
  HtmlUMd,
  ({ node, renderChild, layoutCss }) => {
    return <u style={layoutCss}>{renderChild(node.children)}</u>;
  },
);

export const HtmlUlMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `ul` tag.",
  isHtmlTag: true,
});

export const htmlUlTagRenderer = createComponentRenderer(
  "ul",
  HtmlUlMd,
  ({ node, renderChild, layoutCss }) => {
    return <ul style={layoutCss}>{renderChild(node.children)}</ul>;
  },
);

export const HtmlVideoMd = createMetadata({
  status: "experimental",
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
});

export const htmlVideoTagRenderer = createComponentRenderer(
  "video",
  HtmlVideoMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <video
        style={layoutCss}
        autoPlay={extractValue.asOptionalBoolean(node.props.autoPlay, false)}
        controls={extractValue.asOptionalBoolean(node.props.controls, false)}
        height={extractValue(node.props.height)}
        loop={extractValue.asOptionalBoolean(node.props.loop, false)}
        muted={extractValue.asOptionalBoolean(node.props.muted, false)}
        poster={extractValue(node.props.poster)}
        preload={extractValue(node.props.preload)}
        src={extractValue(node.props.src)}
        width={extractValue(node.props.width)}
      >
        {renderChild(node.children)}
      </video>
    );
  },
);

export const HtmlWbrMd = createMetadata({
  status: "experimental",
  description: "This component renders an HTML `wbr` tag.",
  isHtmlTag: true,
});

export const htmlWbrTagRenderer = createComponentRenderer(
  "wbr",
  HtmlWbrMd,
  ({ node, layoutCss }) => {
    return <wbr style={layoutCss} />;
  },
);
