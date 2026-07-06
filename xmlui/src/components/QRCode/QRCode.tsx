import styles from "./QRCode.module.scss";

import { useEffect, useRef, type CSSProperties } from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { defaultProps } from "./QRCode.defaults";
import { QRCode } from "./QRCodeReact";
import { createMetadata, dInit } from "../metadata-helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { collectComponentThemeDefaults, mergeThemeVariableLayers, resolveThemeReferences, resolveThemeVariable } from "../../styling/theme";

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
      isStrictEnum: true,
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

export const qrCodeComponentRenderer = wrapComponent(COMP, QRCode, QRCodeMd, {
  customRender: (_props, { node, extractValue, classes }) => (
    <QRCode
      classes={classes}
      value={extractValue.asString(node.props.value)}
      size={extractValue.asOptionalNumber(node.props.size)}
      level={extractValue.asOptionalString(node.props.level) as "L" | "M" | "Q" | "H" | undefined}
      color={extractValue.asOptionalString(node.props.color)}
      backgroundColor={extractValue.asOptionalString(node.props.backgroundColor)}
      title={extractValue.asOptionalString(node.props.title)}
    />
  ),
});

export const qrCodeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: QRCodeMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const init = adapter.event("init");
    const initFiredRef = useRef(false);
    useEffect(() => {
      if (initFiredRef.current) {
        return;
      }
      initFiredRef.current = true;
      void init();
    }, [init]);

    const themeVariables = useThemeVariables();
    const mergedThemeVariables = mergeThemeVariableLayers([
      collectComponentThemeDefaults(QRCodeMd),
      themeVariables,
    ]);
    const explicitSize = adapter.numberProp("size", Number.NaN);
    const effectiveSize = Number.isFinite(explicitSize)
      ? explicitSize
      : numberThemeValue(mergedThemeVariables, `size-${COMP}`, defaultProps.size);
    const color = adapter.stringProp("color") ?? stringThemeValue(mergedThemeVariables, `color-${COMP}`, defaultProps.color);
    const backgroundColor = adapter.stringProp("backgroundColor") ??
      stringThemeValue(mergedThemeVariables, `backgroundColor-${COMP}`, defaultProps.backgroundColor);

    return (
      <QRCode
        {...adapter.rootAttrs()}
        value={adapter.stringProp("value", "") ?? ""}
        size={effectiveSize}
        level={(adapter.stringProp("level", defaultProps.level) as "L" | "M" | "Q" | "H") ?? defaultProps.level}
        color={color}
        backgroundColor={backgroundColor}
        title={adapter.stringProp("title")}
        style={adapter.rootAttrs().style as CSSProperties}
      />
    );
  },
});

function numberThemeValue(themeVariables: Record<string, unknown>, name: string, fallback: number): number {
  const value = stringThemeValue(themeVariables, name, String(fallback));
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringThemeValue(themeVariables: Record<string, unknown>, name: string, fallback: string): string {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(resolveThemeReferences(value));
}
