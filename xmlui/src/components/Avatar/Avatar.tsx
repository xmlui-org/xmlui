import styles from "./Avatar.module.scss";

import React, { type CSSProperties } from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass, useThemeVariables } from "../../components-core/theming/utils";
import { sizeMd } from "../../components/abstractions";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { resolveThemeReferences } from "../../styling/theme";
import { defaultProps } from "./Avatar.defaults";
import { Avatar } from "./AvatarReact";
import { createMetadata, dClick, dContextMenu } from "../metadata-helpers";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "Avatar";

export const AvatarMd = createMetadata({
  status: "stable",
  description:
    "`Avatar` displays a user or entity's profile picture as a circular image, " +
    "with automatic fallback to initials when no image is provided. It's commonly " +
    "used in headers, user lists, comments, and anywhere you need to represent a " +
    "person or organization.",
  props: {
    size: {
      description: `This property defines the display size of the ${COMP}. ` +
        `Predefined sizes (xs, sm, md, lg) scale with the current font size (using em units). ` +
        `Custom CSS values (e.g., '50px', '3rem', '5em') are supported for both width and height, ` +
        `with font-size automatically calculated at approximately 33% of the width for proper initial display.`,
      availableValues: sizeMd,
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description:
        `This property sets the name value the ${COMP} uses to display initials. If neither ` +
        "this property nor \`url\` is defined, an empty avatar is displayed.",
      valueType: "string",
    },
    url: {
      description:
        `This property specifies the URL of the image to display in the ${COMP}. ` +
        "If neither this property nor \`name\` is defined, an empty avatar is displayed.",
      valueType: "string",
      isResourceUrl: true,
    },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "4px",
    [`boxShadow-${COMP}`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`fontWeight-${COMP}`]: "$fontWeight-bold",
    [`border-${COMP}`]: "0px solid $color-surface-400A80",
    [`backgroundColor-${COMP}`]: "$color-surface-100",
  },
});

type ThemedAvatarProps = Omit<React.ComponentProps<typeof Avatar>, "classes"> & { className?: string };
export const ThemedAvatar = React.forwardRef<HTMLImageElement | HTMLDivElement, ThemedAvatarProps>(
  function ThemedAvatar({ className, ...props }: ThemedAvatarProps, ref) {
    const themeClass = useComponentThemeClass(AvatarMd);
    const combinedClass = [themeClass, className].filter(Boolean).join(" ");
    return <Avatar {...props} classes={{ [COMPONENT_PART_KEY]: combinedClass }} ref={ref} />;
  },
);

export const avatarComponentRenderer = wrapComponent(
  COMP,
  Avatar,
  AvatarMd,
  {
    deriveAriaLabel: (props) => props.name,
  },
);

export const avatarRenderer = wrapRuntimeComponent({
  name: COMP,
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
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
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
  if (isGeneratedSideBorder(themeVariables, themeKey, value)) {
    return;
  }
  const resolvedValue = String(resolveThemeReferences(value));
  for (const property of properties) {
    style[property] = resolvedValue as never;
  }
}

function isGeneratedSideBorder(
  themeVariables: Record<string, unknown>,
  themeKey: string,
  value: unknown,
): boolean {
  const match = /^border(Top|Right|Bottom|Left)(Color|Style|Width)-(.+)$/.exec(themeKey);
  if (!match) {
    return false;
  }
  const [, side, prop, suffix] = match;
  const aggregateKeys = [`border${prop}-${suffix}`];
  const shorthandKeys = [`border-${suffix}`];
  if (side === "Left" || side === "Right") {
    aggregateKeys.push(`borderHorizontal${prop}-${suffix}`);
    shorthandKeys.push(`borderHorizontal-${suffix}`);
  }
  if (side === "Top" || side === "Bottom") {
    aggregateKeys.push(`borderVertical${prop}-${suffix}`);
    shorthandKeys.push(`borderVertical-${suffix}`);
  }
  if (!aggregateKeys.some((key) => Object.prototype.hasOwnProperty.call(themeVariables, key))) {
    return false;
  }
  const resolvedValue = String(resolveThemeReferences(value));
  return shorthandKeys.some((key) => {
    const shorthand = themeVariables[key];
    if (shorthand === undefined || shorthand === null || shorthand === "") {
      return false;
    }
    const parsed = parseBorderShorthand(String(resolveThemeReferences(shorthand)));
    const parsedValue = prop === "Color"
      ? parsed?.color
      : prop === "Style"
        ? parsed?.style
        : parsed?.width;
    return parsedValue === resolvedValue;
  });
}

function parseBorderShorthand(
  value: string,
): { width?: string; style?: string; color?: string } | undefined {
  const source = value.trim();
  if (!source) {
    return undefined;
  }
  const stylePattern = /\b(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)\b/;
  const widthPattern = /(?:^|\s)(thin|medium|thick|-?\d*\.?\d+(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex)?)(?=\s|$)/;
  const style = source.match(stylePattern)?.[1];
  const widthMatch = source.match(widthPattern);
  const width = widthMatch?.[1];
  const color = source
    .replace(stylePattern, "")
    .replace(widthPattern, " ")
    .trim()
    .replace(/\s+/g, " ");
  return { width, style, color: color || undefined };
}
