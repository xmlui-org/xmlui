import { createMetadata, dInit } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./QRCode.defaults";

const COMP = "QRCode";
const qrCodeStylesSource = `
$component: "QRCode";
$backgroundColor-QRCode: createThemeVar("backgroundColor-#{$component}");
$color-QRCode: createThemeVar("color-#{$component}");
$padding-QRCode: createThemeVar("padding-#{$component}");
$size-QRCode: createThemeVar("size-#{$component}");
`;

export const QRCodeMd = createMetadata({
  status: "stable",
  description:
    "`QRCode` generates a scannable QR code from text, URLs, or any string value. " +
    "It supports UTF-8 text including emoji and non-ASCII characters, customizable colors, " +
    "sizes, and error correction levels. Perfect for sharing links, contact information, " +
    "or any data that needs to be quickly scanned by mobile devices.",
  props: {
    value: {
      description:
        `This property specifies the text or data to encode in the QR code. ` +
        `The QR code can store up to 2953 characters according to the official QR specification. ` +
        `Supports UTF-8 text including emoji, Korean, Japanese, and other non-ASCII characters.`,
      valueType: "string",
      required: true,
    },
    size: {
      description:
        `This property defines the intrinsic size of the QR code in pixels. ` +
        `The actual display size can be controlled using layout properties (width/height). ` +
        `This value affects the internal resolution and detail level of the generated QR code. ` +
        `If not specified, uses the \`size-QRCode\` theme variable, or defaults to ${defaultProps.size}.`,
      valueType: "number",
      defaultValue: defaultProps.size,
    },
    level: {
      description:
        `This property sets the error correction level of the QR code. ` +
        `Higher levels increase reliability but also increase the QR code density. ` +
        `'L' = Low (7% recovery), 'M' = Medium (15% recovery), 'Q' = Quartile (25% recovery), 'H' = High (30% recovery).`,
      valueType: "string",
      availableValues: ["L", "M", "Q", "H"],
      isStrictEnum: true,
      defaultValue: defaultProps.level,
    },
    color: {
      description:
        `This property sets the foreground color (the dark squares) of the QR code. ` +
        `Accepts any valid CSS color value (hex, rgb, color name).`,
      valueType: "string",
      defaultValue: defaultProps.color,
    },
    backgroundColor: {
      description:
        `This property sets the background color (the light squares) of the QR code. ` +
        `Accepts any valid CSS color value (hex, rgb, color name). ` +
        `Note: QR codes should maintain good contrast for reliable scanning.`,
      valueType: "string",
      defaultValue: defaultProps.backgroundColor,
    },
    title: {
      description:
        `This property sets the accessible title attribute for the QR code SVG element. ` +
        `Improves accessibility by providing a text description for screen readers.`,
      valueType: "string",
    },
  },
  events: {
    init: dInit(COMP),
  },
  themeVars: extractScssThemeVars(qrCodeStylesSource),
  themeVarDescriptions: {
    [`size-${COMP}`]:
      `Sets the default intrinsic size of the QR code in pixels. ` +
      `The size prop overrides this theme variable, which falls back to the default of ${defaultProps.size}. ` +
      `Must be a numeric string (e.g., "256", "512").`,
  },
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "#FFFFFF",
    [`color-${COMP}`]: "#000000",
    [`padding-${COMP}`]: "$space-4",
    [`size-${COMP}`]: String(defaultProps.size),
  },
});
