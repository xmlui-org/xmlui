import styles from "./Badge.module.scss";

import type { CSSProperties } from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling/theme";
import {
  Badge,
  badgeVariantValues,
  isBadgeColors,
  type BadgeColors,
} from "./BadgeReact";
import { defaultProps } from "./Badge.defaults";
import { createMetadata, dContextMenu, dInternal } from "../metadata-helpers";
import { toCssVar } from "../../parsers/style-parser/StyleParser";

const COMP = "Badge";

export const BadgeMd = createMetadata({
  status: "stable",
  description:
    "`Badge` displays small text labels with colored backgrounds, commonly used for " +
    "status indicators, categories, tags, and counts. It supports dynamic color " +
    "mapping based on content values, useful for status systems and data categorization.",
  props: {
    value: {
      description:
        "The text that the component displays. If this is not defined, the component renders " +
        "its children as the content of the badge. If neither text nor any child is defined, " +
        "the component renders a single frame for the badge with a non-breakable space.",
      valueType: "string",
      isRequired: true,
    },
    variant: {
      description:
        "Modifies the shape of the component. Comes in the regular \`badge\` variant or the \`pill\` variant " +
        "with fully rounded corners.",
      valueType: "string",
      availableValues: badgeVariantValues,
      defaultValue: defaultProps.variant,
    },
    colorMap: {
      description:
        `The \`${COMP}\` component supports the mapping of a list of colors using the \`value\` prop as the ` +
        `key. If this property is not set, no color mapping is used.`,
      valueType: "hash",
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-${COMP}`]: `$space-0_5 $space-2`,
    [`border-${COMP}`]: `0px solid $borderColor`,
    [`padding-${COMP}-pill`]: `$space-0_5 $space-2`,
    [`borderRadius-${COMP}`]: "4px",
    [`fontSize-${COMP}`]: "0.8em",
    [`fontSize-${COMP}-pill`]: "0.8em",
    [`backgroundColor-${COMP}`]: "rgb(from $color-secondary-500 r g b / 0.6)",
    [`textColor-${COMP}`]: "$const-color-surface-0",
    [`textAlign-${COMP}`]: "center",
  },
});

export const badgeComponentRenderer = wrapComponent(
  COMP,
  Badge,
  BadgeMd,
  {
    events: { contextMenu: "onContextMenu" },
    exclude: ["value", "colorMap"],
    customRender: (props, { node, extractValue, renderChild }) => {
      const value = extractValue.asDisplayText(node.props.value);
      const colorMap: Record<string, string | BadgeColors> | undefined = extractValue(
        node.props?.colorMap,
      );
      let colorValue: string | BadgeColors | undefined;
      if (colorMap && value) {
        const resolvedColor = colorMap[value];
        if (typeof resolvedColor === "string") {
          colorValue = resolveColor(resolvedColor);
        } else if (isBadgeColors(resolvedColor)) {
          colorValue = {
            label: resolveColor(resolvedColor.label),
            background: resolveColor(resolvedColor.background),
          };
        }
      }
      return (
        <Badge
          {...props}
          color={colorValue}
        >
          {value || (node.children && renderChild(node.children)) || String.fromCharCode(0xa0)}
        </Badge>
      );
    },
  },
);

function resolveColor(value: string): string {
  return value.startsWith("$") ? toCssVar(value) : value;
}

export const badgeRenderer = wrapRuntimeComponent({
  name: COMP,
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
    return resolveRuntimeColor(colorValue);
  }
  if (isBadgeColors(colorValue)) {
    return {
      label: resolveRuntimeColor(colorValue.label),
      background: resolveRuntimeColor(colorValue.background),
    };
  }
  return undefined;
}

function resolveRuntimeColor(value: string): string {
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
