import { createMetadata, dInit } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./QRCode.defaults";

const COMP = "QRCode";
const qrCodeStylesSource = `
$backgroundColor-QRCode: createThemeVar("backgroundColor-QRCode");
$color-QRCode: createThemeVar("color-QRCode");
$padding-QRCode: createThemeVar("padding-QRCode");
$size-QRCode: createThemeVar("size-QRCode");
`;

export const QRCodeMd = createMetadata({
  status: "stable",
  description:
    "`QRCode` generates a scannable QR code from text, URLs, or any string value.",
  props: {
    value: {
      description: "The text or data to encode in the QR code.",
      valueType: "string",
      required: true,
    },
    size: {
      description: "The intrinsic size of the QR code in pixels.",
      valueType: "number",
      defaultValue: defaultProps.size,
    },
    level: {
      description: "The error correction level of the QR code.",
      valueType: "string",
      availableValues: ["L", "M", "Q", "H"],
      isStrictEnum: true,
      defaultValue: defaultProps.level,
    },
    color: {
      description: "The foreground color of the QR code.",
      valueType: "string",
      defaultValue: defaultProps.color,
    },
    backgroundColor: {
      description: "The background color of the QR code.",
      valueType: "string",
      defaultValue: defaultProps.backgroundColor,
    },
    title: {
      description: "The accessible title for the QR code SVG element.",
      valueType: "string",
    },
    testId: {
      description: "Adds a test identifier to the QRCode root.",
      valueType: "string",
    },
  },
  events: {
    init: dInit(COMP),
  },
  themeVars: extractScssThemeVars(qrCodeStylesSource),
  themeVarDescriptions: {
    [`size-${COMP}`]: "Sets the default intrinsic size of the QR code in pixels.",
  },
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: defaultProps.backgroundColor,
    [`color-${COMP}`]: defaultProps.color,
    [`padding-${COMP}`]: "$space-4",
    [`size-${COMP}`]: String(defaultProps.size),
  },
});
