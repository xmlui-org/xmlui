import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./QRCode.defaults";
import { QRCodeMd } from "./QRCode";
import { QRCode } from "./QRCodeReact";

export const qrCodeRenderer = wrapComponent({
  name: "QRCode",
  metadata: QRCodeMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const size = optionalNumber(adapter.prop("size"));

    return (
      <QRCode
        {...adapter.rootAttrs()}
        value={adapter.stringProp("value", "") ?? ""}
        size={size}
        level={(adapter.stringProp("level", defaultProps.level) as "L" | "M" | "Q" | "H") ?? defaultProps.level}
        color={adapter.stringProp("color")}
        backgroundColor={adapter.stringProp("backgroundColor")}
        title={adapter.stringProp("title")}
        style={adapter.style as CSSProperties}
        onInit={() => { void adapter.event("init")(); }}
      />
    );
  },
});

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
