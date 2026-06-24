import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling/theme";
import { AvatarMd } from "./Avatar";
import { defaultProps } from "./Avatar.defaults";
import { Avatar } from "./AvatarReact";

export const avatarRenderer = wrapComponent({
  name: "Avatar",
  metadata: AvatarMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const themeVariables = useThemeVariables();
    const hasClick = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const hasContextMenu = Object.prototype.hasOwnProperty.call(adapter.node.events, "contextMenu");
    const rootAttrs = adapter.rootAttrs();
    return (
      <Avatar
        {...rootAttrs}
        size={adapter.stringProp("size", defaultProps.size)}
        name={adapter.stringProp("name")}
        url={normalizeAvatarUrl(adapter.resourceUrl(adapter.prop("url")))}
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          ...currentBorderStyles(themeVariables),
        }}
        onClick={hasClick ? (event) => void adapter.event("click")(event) : undefined}
        onContextMenu={hasContextMenu ? (event) => void adapter.event("contextMenu")(event) : undefined}
      />
    );
  },
});

function normalizeAvatarUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `/${url}`;
}

function currentBorderStyles(themeVariables: Record<string, unknown>): CSSProperties {
  const style: CSSProperties = {};

  applyBorderValue(style, themeVariables, "borderColor-Avatar", [
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
  ]);
  applyBorderValue(style, themeVariables, "borderHorizontalColor-Avatar", [
    "borderRightColor",
    "borderLeftColor",
  ]);
  applyBorderValue(style, themeVariables, "borderVerticalColor-Avatar", [
    "borderTopColor",
    "borderBottomColor",
  ]);
  applyBorderValue(style, themeVariables, "borderTopColor-Avatar", ["borderTopColor"]);
  applyBorderValue(style, themeVariables, "borderRightColor-Avatar", ["borderRightColor"]);
  applyBorderValue(style, themeVariables, "borderBottomColor-Avatar", ["borderBottomColor"]);
  applyBorderValue(style, themeVariables, "borderLeftColor-Avatar", ["borderLeftColor"]);

  applyBorderValue(style, themeVariables, "borderStyle-Avatar", [
    "borderTopStyle",
    "borderRightStyle",
    "borderBottomStyle",
    "borderLeftStyle",
  ]);
  applyBorderValue(style, themeVariables, "borderTopStyle-Avatar", ["borderTopStyle"]);
  applyBorderValue(style, themeVariables, "borderRightStyle-Avatar", ["borderRightStyle"]);
  applyBorderValue(style, themeVariables, "borderBottomStyle-Avatar", ["borderBottomStyle"]);
  applyBorderValue(style, themeVariables, "borderLeftStyle-Avatar", ["borderLeftStyle"]);

  applyBorderValue(style, themeVariables, "borderWidth-Avatar", [
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
  ]);
  applyBorderValue(style, themeVariables, "borderHorizontalWidth-Avatar", [
    "borderRightWidth",
    "borderLeftWidth",
  ]);
  applyBorderValue(style, themeVariables, "borderVerticalWidth-Avatar", [
    "borderTopWidth",
    "borderBottomWidth",
  ]);
  applyBorderValue(style, themeVariables, "borderTopWidth-Avatar", ["borderTopWidth"]);
  applyBorderValue(style, themeVariables, "borderRightWidth-Avatar", ["borderRightWidth"]);
  applyBorderValue(style, themeVariables, "borderBottomWidth-Avatar", ["borderBottomWidth"]);
  applyBorderValue(style, themeVariables, "borderLeftWidth-Avatar", ["borderLeftWidth"]);

  return style;
}

function applyBorderValue(
  style: CSSProperties,
  themeVariables: Record<string, unknown>,
  themeKey: string,
  properties: Array<keyof CSSProperties>,
): void {
  if (!Object.prototype.hasOwnProperty.call(themeVariables, themeKey)) {
    return;
  }
  const value = themeVariables[themeKey];
  if (value === undefined || value === null || value === "") {
    return;
  }
  const resolvedValue = String(resolveThemeReferences(value));
  for (const property of properties) {
    style[property] = resolvedValue as never;
  }
}
