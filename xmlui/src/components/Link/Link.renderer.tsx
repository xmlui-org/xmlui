import type { CSSProperties, HTMLAttributeReferrerPolicy, MouseEvent } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useComponentStyle } from "../../components-core/theming/StyleContext";
import { useThemeVariables } from "../../runtime/rendering/theme";
import {
  collectComponentThemeDefaults,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
} from "../../styling/theme";
import { LinkMd } from "./Link";
import { defaultProps } from "./Link.defaults";
import { LinkNative } from "./LinkReact";

const COMP = "Link";

export const linkRenderer = wrapComponent({
  name: COMP,
  metadata: LinkMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const themeVariables = useThemeVariables();
    const mergedThemeVariables = mergeThemeVariableLayers([
      collectComponentThemeDefaults(LinkMd),
      themeVariables,
    ]);
    const variant = adapter.stringProp("variant");
    const rootAttrs = adapter.rootAttrs();
    const currentVariantClassName = useComponentStyle(currentVariantCssVariables(variant, mergedThemeVariables), {
      layer: "themes",
    });
    const to = adapter.prop("to");
    const toString = typeof to === "string" ? to : undefined;
    const target = adapter.stringProp("target");
    const routing = adapter.scope.routing;
    const isInternalRoute = !!toString && !target && !isExternalUrl(toString);
    const hasClickHandler = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const routedTo = isInternalRoute ? routing?.href(toString) ?? toString : to;
    const clickHandler = isInternalRoute || hasClickHandler
      ? async (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => {
        if (isInternalRoute && routing) {
          await routing.navigate(toString);
        }
        if (hasClickHandler) {
          await adapter.event("click")(event);
        }
      }
      : undefined;

    return (
      <LinkNative
        {...rootAttrs}
        className={[rootAttrs.className, currentVariantClassName].filter(Boolean).join(" ")}
        to={routedTo}
        target={target}
        label={adapter.prop("label")}
        icon={adapter.prop("icon")}
        active={adapter.booleanProp("active", defaultProps.active)}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        noIndicator={adapter.booleanProp("noIndicator", defaultProps.noIndicator)}
        horizontalAlignment={adapter.stringProp("horizontalAlignment")}
        verticalAlignment={adapter.stringProp("verticalAlignment")}
        maxLines={adapter.numberProp("maxLines", 0)}
        preserveLinebreaks={adapter.booleanProp("preserveLinebreaks", defaultProps.preserveLinebreaks)}
        ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
        overflowMode={adapter.stringProp("overflowMode")}
        breakMode={adapter.stringProp("breakMode")}
        rel={adapter.stringProp("rel")}
        download={adapter.prop("download")}
        referrerPolicy={adapter.stringProp("referrerPolicy") as HTMLAttributeReferrerPolicy | undefined}
        ping={adapter.stringProp("ping")}
        hreflang={adapter.stringProp("hreflang")}
        type={adapter.stringProp("type")}
        style={rootAttrs.style as CSSProperties | undefined}
        onClick={clickHandler}
        onContextMenu={(event) => void adapter.event("contextMenu")(event)}
      >
        {adapter.renderChildren()}
      </LinkNative>
    );
  },
});

const currentVariantThemeProps = [
  "borderColor",
  "borderWidth",
  "borderStyle",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "backgroundColor",
  "textColor",
] as const;

function currentVariantCssVariables(
  variant: string | undefined,
  themeVariables: Record<string, unknown>,
): Record<string, CSSProperties[keyof CSSProperties]> {
  if (!variant) {
    return {};
  }
  const style: Record<string, CSSProperties[keyof CSSProperties]> = {};
  for (const prop of currentVariantThemeProps) {
    const value = resolveThemeVariable(`${prop}-${COMP}-${variant}`, [themeVariables]);
    if (value !== undefined && value !== null && value !== "") {
      style[`--xmlui-current-${prop}-${COMP}`] = String(resolveThemeReferences(value));
    }
  }
  return style;
}

function isExternalUrl(to: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(to);
}
