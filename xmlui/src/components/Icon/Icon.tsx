import React from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import {
  createMetadata,
  dClick,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { COMPONENT_PART_KEY } from "../../styling";
import Icon from "./IconReact";
import type { IconBaseProps } from "./IconReact";
import iconStylesSource from "./Icon.module.scss?xmlui-theme-vars";

const COMP = "Icon";

export const IconMd = createMetadata({
  status: "stable",
  description:
    "`Icon` displays scalable vector icons from XMLUI's built-in icon registry " +
    "using simple name references. Icons are commonly used in buttons, navigation " +
    "elements, and status indicators.",
  props: {
    name: {
      description:
        "This string property specifies the name of the icon to display. All icons have " +
        "unique, case-sensitive names identifying them. If the icon name is not set, the " +
        "`fallback` value is used.",
      valueType: "string",
    },
    size: {
      description:
        `This property defines the size of the \`${COMP}\`. Note that setting the \`height\` and/or ` +
        `the \`width\` of the component will override this property. You can use az explicit size ` +
        "value (e.g., 32px) or one of these predefined values: `xs`, `sm`, `md`, `lg`.",
      availableValues: ["xs", "sm", "md", "lg"],
      valueType: "string",
    },
    fallback: {
      description:
        "This optional property provides a way to handle situations when the icon with the provided " +
        "[icon name](#name) name does not exist. If the icon cannot be found, no icon is displayed.",
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
  },

  themeVars: extractScssThemeVars(iconStylesSource),
  defaultThemeVars: {
    [`size-${COMP}`]: "1.2em",
  },
});

type ThemedIconProps = IconBaseProps & {
  className?: string;
  classes?: Record<string, string>;
  tooltip?: string;
  onClick?: React.MouseEventHandler;
};

export const ThemedIcon = React.forwardRef<HTMLElement, ThemedIconProps>(function ThemedIcon(
  { className, classes, tooltip, style, ...props }: ThemedIconProps,
  ref,
) {
  const themeClass = useComponentThemeClass(COMP, IconMd as ComponentMetadata);
  const mergedClass = `${themeClass.className}${classes?.[COMPONENT_PART_KEY] ? ` ${classes[COMPONENT_PART_KEY]}` : ""}${className ? ` ${className}` : ""}`;
  return <Icon {...props} className={mergedClass} ref={ref} aria-label={tooltip} style={{ ...themeClass.style, ...style }} />;
});

export const iconRenderer = wrapComponent({
  name: COMP,
  metadata: IconMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const className = typeof rootAttrs.className === "string" ? rootAttrs.className : "";
    const name = adapter.prop("name") as string | undefined;
    const fallback = adapter.prop("fallback") as string | undefined;
    const size = normalizeIconSize(adapter.prop("size"));
    return (
      <ThemedIcon
        {...rootAttrs}
        data-testid={adapter.stringProp("testId", "test-id-component")}
        name={name}
        fallback={fallback}
        size={size}
        classes={{ [COMPONENT_PART_KEY]: className }}
        onClick={adapter.node.events.click ? (event) => void adapter.event("click")(event) : undefined}
      />
    );
  },
});

function normalizeIconSize(size: unknown): string | undefined {
  if (size == null) {
    return undefined;
  }
  if (typeof size !== "string") {
    return undefined;
  }
  const trimmed = size.trim();
  if (!trimmed) {
    return undefined;
  }
  if (
    ["xs", "sm", "md", "lg"].includes(trimmed) ||
    /^\$[a-zA-Z0-9_$-]+$/.test(trimmed) ||
    /^-?(?:\d+|\d*\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?$/.test(trimmed) ||
    /^(?:var|calc|min|max|clamp)\(.+\)$/.test(trimmed)
  ) {
    return trimmed;
  }
  return "0";
}
