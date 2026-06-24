import type { HTMLAttributeReferrerPolicy } from "react";

import { extractScssThemeVars } from "../../styling/theme";
import { createMetadata } from "../../component-core/metadata/helpers";

const COMP = "IFrame";
const iframeStylesSource = `
$width-IFrame: createThemeVar("width-IFrame");
$height-IFrame: createThemeVar("height-IFrame");
$border-IFrame: createThemeVar("border-IFrame");
$borderRadius-IFrame: createThemeVar("borderRadius-IFrame");
`;

export const IFrameMd = createMetadata({
  status: "stable",
  description:
    "`IFrame` embeds external content from another HTML document and exposes security, referrer, and messaging controls.",
  props: {
    id: {
      description: "Defines a component instance identifier used for references and APIs.",
      valueType: "string",
    },
    src: {
      description: "Specifies the URL of the document to embed.",
      valueType: "string",
      isResourceUrl: true,
    },
    srcdoc: {
      description: "Specifies inline HTML content for the iframe.",
      valueType: "string",
    },
    allow: {
      description: "Permissions policy for the iframe.",
      valueType: "string",
    },
    name: {
      description: "Name for targeting links and forms.",
      valueType: "string",
    },
    referrerPolicy: {
      description: "Controls referrer information sent when loading iframe content.",
      valueType: "string",
    },
    sandbox: {
      description: "Applies sandbox restrictions to iframe content.",
      valueType: "string",
    },
    testId: {
      description: "Adds a test identifier to the iframe element.",
      valueType: "string",
    },
  },
  events: {
    load: {
      description: `Triggered when the ${COMP} content has loaded.`,
      signature: "load(event: Event): void",
    },
  },
  apis: {
    postMessage: {
      description: "Sends a message to the iframe content window.",
      signature: "postMessage(message: any, targetOrigin?: string): void",
    },
    getContentWindow: {
      description: "Returns the iframe content window.",
      signature: "getContentWindow(): Window | null",
    },
    getContentDocument: {
      description: "Returns the iframe content document.",
      signature: "getContentDocument(): Document | null",
    },
  },
  themeVars: extractScssThemeVars(iframeStylesSource),
  defaultThemeVars: {
    [`width-${COMP}`]: "100%",
    [`height-${COMP}`]: "300px",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`border-${COMP}`]: "1px solid $borderColor",
  },
});
