import styles from "./IFrame.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { IFrame } from "./IFrameNative";

const COMP = "IFrame";

export const IFrameMd = createMetadata({
  status: "stable",
  description:
    "`IFrame` embeds external content from another HTML document into the current page. " +
    "It provides security controls through sandbox and allow attributes, and supports " +
    "features like fullscreen display and referrer policy configuration.",
  props: {
    src: d(
      "Specifies the URL of the document to embed in the iframe. " +
      "Either `src` or `srcdoc` should be specified, but not both.",
    ),
    srcdoc: d(
      "Specifies the HTML content to display in the iframe. " +
      "Either `src` or `srcdoc` should be specified, but not both.",
    ),
    allow: d(
      "Specifies the permissions policy for the iframe. " +
      "Controls which features (like camera, microphone, geolocation) the embedded content can use.",
    ),
    name: d(
      "Specifies a name for the iframe, which can be used as a target for links and forms.",
    ),
    referrerPolicy: {
      description: "Controls how much referrer information is sent when fetching the iframe content.",
      type: "string",
      availableValues: [
        { value: "no-referrer", description: "Never send referrer information" },
        { value: "no-referrer-when-downgrade", description: "Send referrer only for same-security destinations" },
        { value: "origin", description: "Send only the origin as referrer" },
        { value: "origin-when-cross-origin", description: "Send full URL for same-origin, origin only for cross-origin" },
        { value: "same-origin", description: "Send referrer only for same-origin requests" },
        { value: "strict-origin", description: "Send origin only for same-security destinations" },
        { value: "strict-origin-when-cross-origin", description: "Full URL for same-origin, origin for cross-origin same-security" },
        { value: "unsafe-url", description: "Always send full URL as referrer" },
      ],
    },
    sandbox: d(
      "Applies extra restrictions to the content in the iframe. " +
      "Value is a space-separated list of sandbox flags (e.g., 'allow-scripts allow-same-origin').",
    ),
  },
  events: {
    load: {
      description: `This event is triggered when the ${COMP} content has finished loading.`,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`width-${COMP}`]: "100%",
    [`height-${COMP}`]: "300px",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`border-${COMP}`]: "1px solid $borderColor",
  },
});

export const iframeComponentRenderer = createComponentRenderer(
  COMP,
  IFrameMd,
  ({ node, extractValue, layoutCss, extractResourceUrl, lookupEventHandler }) => {
    return (
      <IFrame
        src={extractResourceUrl(node.props.src)}
        srcdoc={extractValue.asOptionalString(node.props.srcdoc)}
        allow={extractValue.asOptionalString(node.props.allow)}
        name={extractValue.asOptionalString(node.props.name)}
        referrerPolicy={extractValue.asOptionalString(node.props.referrerPolicy) as any}
        sandbox={extractValue.asOptionalString(node.props.sandbox)}
        style={layoutCss}
        onLoad={lookupEventHandler("load")}
      />
    );
  },
);
