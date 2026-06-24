import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import {
  collectComponentThemeDefaults,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
} from "../../styling/theme";
import { defaultProps } from "./QRCode.defaults";
import { QRCodeMd } from "./QRCode";
import { QRCode } from "./QRCodeReact";

const COMP = "QRCode";

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
