import styles from "./QRCode.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { QRCodeNative, defaultProps } from "./QRCodeNative";
import { createMetadata, d, dInit } from "../metadata-helpers";

const COMP = "QRCode";

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
      availableValues: ["L", "M", "Q", "H"],
      valueType: "string",
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
  themeVars: parseScssVar(styles.themeVars),
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

export const qrCodeComponentRenderer = createComponentRenderer(
  COMP,
  QRCodeMd,
  ({ node, extractValue, className, lookupEventHandler }) => {
    const value = extractValue.asString(node.props.value);
    const size = extractValue.asOptionalNumber(node.props.size);
    const level = extractValue.asOptionalString(node.props.level) as "L" | "M" | "Q" | "H" | undefined;
    const color = extractValue.asOptionalString(node.props.color);
    const backgroundColor = extractValue.asOptionalString(node.props.backgroundColor);
    const title = extractValue.asOptionalString(node.props.title);

    return (
      <QRCodeNative
        className={className}
        value={value}
        size={size}
        level={level}
        color={color}
        backgroundColor={backgroundColor}
        title={title}
      />
    );
  },
);
