import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { resolveThemeReferences } from "../../styling/theme";
import { COMPONENT_PART_KEY } from "../../styling";
import { BadgeMd } from "./Badge";
import { defaultProps } from "./Badge.defaults";
import { Badge, isBadgeColors, type BadgeColors } from "./BadgeReact";

export const badgeRenderer = wrapComponent({
  name: "Badge",
  metadata: BadgeMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const variant = adapter.stringProp("variant", defaultProps.variant);
    const rootAttrs = adapter.rootAttrs();
    const className = typeof rootAttrs.className === "string" ? rootAttrs.className : "";
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
        classes={{ [COMPONENT_PART_KEY]: className }}
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
