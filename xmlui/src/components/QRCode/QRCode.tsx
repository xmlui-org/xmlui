import type { CSSProperties } from "react";

import { createMetadata, dInit } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import {
  collectComponentThemeDefaults,
  extractScssThemeVars,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
} from "../../styling/theme";
import { defaultProps } from "./QRCode.defaults";
import { QRCode } from "./QRCodeReact";

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

export const qrCodeRenderer = wrapComponent({
  name: COMP,
  metadata: QRCodeMd as ComponentMetadata,
  renderer: ({ adapter }) => {
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
        style={adapter.style as CSSProperties}
        onInit={() => { void adapter.event("init")(); }}
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
