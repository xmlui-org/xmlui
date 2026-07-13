import styles from "./Link.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dEnabled, dLabel } from "../metadata-helpers";
import { LinkTargetMd, alignmentOptionValues } from "../abstractions";
import { defaultProps } from "./Link.defaults";
import { LinkNative } from "./LinkReact";
import { useComponentThemeClass, useThemeVariables } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";
import type { CSSProperties } from "react";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { collectComponentThemeDefaults, mergeThemeVariableLayers, resolveThemeReferences, resolveThemeVariable } from "../../styling/theme";

const COMP = "Link";

export const LinkMd = createMetadata({
  status: "stable",
  description:
    "`Link` creates clickable navigation elements for internal app routes or " +
    "external URLs. You can use the `label` and `icon` properties for simple text " +
    "links, or embed custom components like buttons, cards, or complex layouts " +
    "for rich interactive link presentations.",
  parts: {
    icon: {
      description: "The icon within the Link component.",
    },
  },
  props: {
    to: {
      description:
        "This property defines the URL of the link. If the value is not defined, the link cannot be activated.",
    },
    enabled: dEnabled(),
    active: {
      description: `Indicates whether this link is active or not. If so, it will have a distinct visual appearance.`,
      valueType: "boolean",
      defaultValue: defaultProps.active,
    },
    noIndicator: {
      description: `Indicates whether this link should have a distinct visual appearance.`,
      valueType: "boolean",
      defaultValue: false,
    },
    target: {
      description:
        `This property specifies where to open the link represented by the \`${COMP}\`. This ` +
        `property accepts the following values (in accordance with the HTML standard):`,
      availableValues: LinkTargetMd,
      valueType: "string",
    },
    label: dLabel(),
    icon: {
      description: `This property allows you to add an optional icon (specify the icon's name) to the link.`,
    },
    horizontalAlignment: {
      description: "Manages the horizontal content alignment for child elements in the Link.",
      availableValues: alignmentOptionValues,
      valueType: "string",
      defaultValue: "start",
    },
    verticalAlignment: {
      description: "Manages the vertical content alignment for child elements in the Link.",
      availableValues: alignmentOptionValues,
      valueType: "string",
      defaultValue: "start",
    },
    maxLines: {
      description:
        "This property determines the maximum number of lines the component can wrap to. " +
        "If there is no space to display all the contents, the component displays up to as " +
        "many lines as specified in this property. When the value is not defined, there is " +
        "no limit on the displayed lines.",
      valueType: "number",
    },
    preserveLinebreaks: {
      description: `This property indicates if linebreaks should be preserved when displaying text.`,
      valueType: "boolean",
      defaultValue: defaultProps.preserveLinebreaks,
    },
    ellipses: {
      description:
        "This property indicates whether ellipses should be displayed when the text is " +
        "cropped (`true`) or not (`false`).",
      valueType: "boolean",
      defaultValue: defaultProps.ellipses,
    },
    breakMode: {
      description:
        "This property controls how text breaks into multiple lines. " +
        "`normal` uses standard word boundaries, `word` breaks long words to prevent overflow, " +
        "`anywhere` breaks at any character, `keep` prevents word breaking, " +
        "and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior.",
      valueType: "string",
      defaultValue: "normal",
      availableValues: [
        { value: "normal", description: "Uses standard word boundaries for breaking" },
        { value: "word", description: "Breaks long words when necessary to prevent overflow" },
        { value: "anywhere", description: "Breaks at any character if needed to fit content" },
        { value: "keep", description: "Prevents breaking within words entirely" },
        { value: "hyphenate", description: "Uses automatic hyphenation when breaking words" },
      ],
    },
    overflowMode: {
      description:
        "This property controls how text overflow is handled. " +
        "`none` prevents wrapping and shows no overflow indicator, " +
        "`ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, " +
        "and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). " +
        "When not specified, uses the default text behavior.",
      valueType: "string",
      defaultValue: "not specified",
      availableValues: [
        {
          value: "none",
          description:
            "No wrapping, text stays on a single line with no overflow indicator (ignores maxLines)",
        },
        { value: "ellipsis", description: "Truncates with an ellipsis (default)" },
        {
          value: "scroll",
          description:
            "Forces single line with horizontal scrolling when content overflows (ignores maxLines)",
        },
        {
          value: "flow",
          description:
            "Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines)",
        },
      ],
    },
  },
  events: {
    click: {
      description: "This event is triggered when the link is clicked.",
      signature: "click(event: MouseEvent): void",
      parameters: {
        event: "The mouse event that triggered the click.",
      },
    },
    contextMenu: {
      description: "This event is triggered when the link is right-clicked.",
      signature: "contextMenu(event: MouseEvent): void",
      parameters: {
        event: "The mouse event that triggered the context menu.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`gap-icon-${COMP}`]:
      "This property defines the size of the gap between the icon and the label.",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`textColor-${COMP}`]: "$color-primary-500",
    [`textDecorationColor-${COMP}`]: `$textColor-${COMP}`,
    [`textColor-${COMP}--hover`]: `$color-primary-400`,
    [`textDecorationColor-${COMP}--hover`]: `$textColor-${COMP}--hover`,
    [`textColor-${COMP}--active`]: "$color-primary-400",
    [`textDecorationColor-${COMP}--active`]: `$textColor-${COMP}--active`,
    [`textColor-${COMP}--hover--active`]: `$textColor-${COMP}--active`,
    [`textUnderlineOffset-${COMP}`]: "$space-1",
    [`textDecorationLine-${COMP}`]: "underline",
    [`textDecorationStyle-${COMP}`]: "solid",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`fontSize-${COMP}`]: "inherit",
    [`fontWeight-${COMP}--active`]: "$fontWeight-bold",
    [`gap-icon-${COMP}`]: "$gap-tight",
    [`padding-icon-${COMP}`]: "$space-0_5",
    dark: {
      [`textColor-${COMP}`]: "$color-primary-600",
      [`textColor-${COMP}--hover`]: `$color-primary-500`,
      [`textColor-${COMP}--active`]: "$color-primary-500",
    },
  },
});

/**
 * This function defines the renderer for the Link component.
 */
type ThemedLinkNativeProps = React.ComponentProps<typeof LinkNative> & { className?: string };
export const ThemedLinkNative = React.forwardRef<HTMLDivElement, ThemedLinkNativeProps>(
  function ThemedLinkNative({ className, ...props }: ThemedLinkNativeProps, ref) {
    const themeClass = useComponentThemeClass(LinkMd);
    return (
      <LinkNative
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const localLinkComponentRenderer = wrapComponent(COMP, ThemedLinkNative, LinkMd, {
  deriveAriaLabel: (props) => props.label,
});

export const linkRenderer = wrapRuntimeComponent({
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
    const childLayoutContext = adapter.props.layoutContext as Record<string, unknown> | undefined;
    const hasClickEvent = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const hasContextMenuEvent = Object.prototype.hasOwnProperty.call(adapter.node.events, "contextMenu");
    const needsRuntimeNavigation =
      typeof to === "string" &&
      (to.startsWith("#") ||
        (to.startsWith("/") && !to.startsWith("//") && !adapter.stringProp("target")));

    return (
      <ThemedLinkNative
        {...rootAttrs}
        to={to as any}
        target={adapter.stringProp("target")}
        label={adapter.stringProp("label")}
        icon={adapter.stringProp("icon")}
        active={adapter.booleanProp("active", defaultProps.active)}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        noIndicator={adapter.booleanProp("noIndicator", defaultProps.noIndicator)}
        horizontalAlignment={adapter.stringProp("horizontalAlignment")}
        verticalAlignment={adapter.stringProp("verticalAlignment")}
        maxLines={adapter.numberProp("maxLines", 0)}
        preserveLinebreaks={adapter.booleanProp("preserveLinebreaks", defaultProps.preserveLinebreaks)}
        ellipses={adapter.booleanProp("ellipses", defaultProps.ellipses)}
        overflowMode={adapter.stringProp("overflowMode") as any}
        breakMode={adapter.stringProp("breakMode") as any}
        rel={adapter.stringProp("rel")}
        download={adapter.prop("download") as any}
        referrerPolicy={adapter.stringProp("referrerPolicy") as any}
        ping={adapter.stringProp("ping")}
        hreflang={adapter.stringProp("hreflang")}
        type={adapter.stringProp("type")}
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          ...currentVariantCssVariables(variant, mergedThemeVariables),
        }}
        onClick={
          hasClickEvent || needsRuntimeNavigation
            ? () => {
                if (needsRuntimeNavigation && typeof to === "string") {
                  window.history.pushState({}, "", to);
                  const hashIndex = to.indexOf("#");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                  if (hashIndex >= 0 && hashIndex < to.length - 1) {
                    scheduleHashTargetScroll(to.slice(hashIndex + 1));
                  }
                }
                void adapter.event("click")();
              }
            : undefined
        }
        onContextMenu={hasContextMenuEvent ? (event) => void adapter.event("contextMenu")(event) : undefined}
      >
        {adapter.renderChildren(undefined, childLayoutContext)}
      </ThemedLinkNative>
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
      const resolved = String(resolveThemeReferences(value));
      style[`--xmlui-${prop}-${COMP}`] = resolved;
      if (prop === "borderColor") {
        style.borderColor = resolved;
      }
    }
  }
  return style as CSSProperties;
}

function scrollHashTarget(hash: string) {
  const target = getHashTarget(hash);
  if (!target) {
    return;
  }

  const scrollParent = getScrollableParent(target);
  if (!scrollParent) {
    target.scrollIntoView({ block: "start" });
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const parentRect = scrollParent.getBoundingClientRect();
  scrollParent.scrollTo({
    top: targetRect.top - parentRect.top + scrollParent.scrollTop,
    behavior: "auto",
  });
}

function scheduleHashTargetScroll(hash: string) {
  scrollHashTarget(hash);
  requestAnimationFrame(() => {
    scrollHashTarget(hash);
    requestAnimationFrame(() => scrollHashTarget(hash));
  });
}

function getHashTarget(hash: string): HTMLElement | null {
  try {
    return document.getElementById(decodeURIComponent(hash));
  } catch {
    return document.getElementById(hash);
  }
}

function getScrollableParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}
