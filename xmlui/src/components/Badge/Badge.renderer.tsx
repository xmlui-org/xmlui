import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling/theme";
import { BadgeMd } from "./Badge";
import { defaultProps } from "./Badge.defaults";
import { Badge, isBadgeColors, type BadgeColors } from "./BadgeReact";

export const badgeRenderer = wrapComponent({
  name: "Badge",
  metadata: BadgeMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const variant = adapter.stringProp("variant", defaultProps.variant);
    const themeVariables = useThemeVariables();
    const rootAttrs = adapter.rootAttrs();
    const value = adapter.prop("value");
    const displayValue = value === undefined || value === null ? undefined : String(value);
    const renderedChildren = adapter.node.children.length > 0 ? adapter.renderChildren() : undefined;
    const colorMap = adapter.prop<Record<string, string | BadgeColors> | undefined>("colorMap");
    const hasContextMenu = Object.prototype.hasOwnProperty.call(adapter.node.events, "contextMenu");

    return (
      <Badge
        {...rootAttrs}
        variant={variant === "pill" ? "pill" : "badge"}
        color={resolveColorMapValue(colorMap, displayValue)}
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          ...currentBorderStyles(themeVariables, variant === "pill" ? "Badge-pill" : "Badge"),
        }}
        onContextMenu={
          hasContextMenu ? (event) => void adapter.event("contextMenu")(event) : undefined
        }
      >
        {displayValue || renderedChildren || String.fromCharCode(0xa0)}
      </Badge>
    );
  },
});

function resolveColorMapValue(
  colorMap: Record<string, string | BadgeColors> | undefined,
  value: string | undefined,
): string | BadgeColors | undefined {
  if (!colorMap || !value) {
    return undefined;
  }
  const colorValue = colorMap[value];
  if (typeof colorValue === "string") {
    return resolveColor(colorValue);
  }
  if (isBadgeColors(colorValue)) {
    return {
      label: resolveColor(colorValue.label),
      background: resolveColor(colorValue.background),
    };
  }
  return undefined;
}

function resolveColor(value: string): string {
  return String(resolveThemeReferences(value));
}

function currentBorderStyles(
  themeVariables: Record<string, unknown>,
  componentName: "Badge" | "Badge-pill",
): CSSProperties {
  const style: CSSProperties = {};
  const key = (name: string) => `${name}-${componentName}`;

  applyBorderValue(style, themeVariables, key("borderColor"), [
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
  ]);
  applyBorderValue(style, themeVariables, key("borderHorizontalColor"), [
    "borderRightColor",
    "borderLeftColor",
  ]);
  applyBorderValue(style, themeVariables, key("borderVerticalColor"), [
    "borderTopColor",
    "borderBottomColor",
  ]);
  applyBorderValue(style, themeVariables, key("borderTopColor"), ["borderTopColor"]);
  applyBorderValue(style, themeVariables, key("borderRightColor"), ["borderRightColor"]);
  applyBorderValue(style, themeVariables, key("borderBottomColor"), ["borderBottomColor"]);
  applyBorderValue(style, themeVariables, key("borderLeftColor"), ["borderLeftColor"]);

  applyBorderValue(style, themeVariables, key("borderStyle"), [
    "borderTopStyle",
    "borderRightStyle",
    "borderBottomStyle",
    "borderLeftStyle",
  ]);
  applyBorderValue(style, themeVariables, key("borderHorizontalStyle"), [
    "borderRightStyle",
    "borderLeftStyle",
  ]);
  applyBorderValue(style, themeVariables, key("borderVerticalStyle"), [
    "borderTopStyle",
    "borderBottomStyle",
  ]);
  applyBorderValue(style, themeVariables, key("borderTopStyle"), ["borderTopStyle"]);
  applyBorderValue(style, themeVariables, key("borderRightStyle"), ["borderRightStyle"]);
  applyBorderValue(style, themeVariables, key("borderBottomStyle"), ["borderBottomStyle"]);
  applyBorderValue(style, themeVariables, key("borderLeftStyle"), ["borderLeftStyle"]);

  applyBorderValue(style, themeVariables, key("borderWidth"), [
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
  ]);
  applyBorderValue(style, themeVariables, key("borderHorizontalWidth"), [
    "borderRightWidth",
    "borderLeftWidth",
  ]);
  applyBorderValue(style, themeVariables, key("borderVerticalWidth"), [
    "borderTopWidth",
    "borderBottomWidth",
  ]);
  applyBorderValue(style, themeVariables, key("borderTopWidth"), ["borderTopWidth"]);
  applyBorderValue(style, themeVariables, key("borderRightWidth"), ["borderRightWidth"]);
  applyBorderValue(style, themeVariables, key("borderBottomWidth"), ["borderBottomWidth"]);
  applyBorderValue(style, themeVariables, key("borderLeftWidth"), ["borderLeftWidth"]);

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
