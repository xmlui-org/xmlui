import type { CSSProperties, HTMLAttributeReferrerPolicy } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
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
    const to = adapter.prop("to");
    const hasClickEvent = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const needsRuntimeNavigation =
      typeof to === "string" &&
      (to.startsWith("#") || (to.startsWith("/") && !to.startsWith("//") && !adapter.stringProp("target")));

    return (
      <LinkNative
        {...rootAttrs}
        to={to}
        target={adapter.stringProp("target")}
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
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          ...currentVariantCssVariables(variant, mergedThemeVariables),
        }}
        onClick={
          hasClickEvent || needsRuntimeNavigation
            ? (event) => {
                if (needsRuntimeNavigation && typeof to === "string") {
                  window.history.pushState({}, "", to);
                  const hashIndex = to.indexOf("#");
                  if (hashIndex >= 0 && hashIndex < to.length - 1) {
                    scrollHashTarget(to.slice(hashIndex + 1));
                  }
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }
                void adapter.event("click")(event);
              }
            : undefined
        }
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
): CSSProperties {
  if (!variant) {
    return {};
  }
  const style: Record<string, string> = {};
  for (const prop of currentVariantThemeProps) {
    const value = resolveThemeVariable(`${prop}-${COMP}-${variant}`, [themeVariables]);
    if (value !== undefined && value !== null && value !== "") {
      style[`--xmlui-current-${prop}-${COMP}`] = String(resolveThemeReferences(value));
    }
  }
  return style as CSSProperties;
}

function scrollHashTarget(hash: string) {
  try {
    document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
  } catch {
    document.getElementById(hash)?.scrollIntoView();
  }
}
