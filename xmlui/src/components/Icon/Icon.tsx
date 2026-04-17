import styles from "./Icon.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import Icon from "./IconReact";
import type { IconBaseProps } from "./IconReact";
import { createMetadata, d } from "../metadata-helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";

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
    click: d("This event is triggered when the icon is clicked."),
  },

  themeVars: parseScssVar(styles.themeVars),
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
  { className, classes, tooltip, ...props }: ThemedIconProps,
  ref,
) {
  const themeClass = useComponentThemeClass(IconMd);
  const mergedClass = `${themeClass}${classes?.[COMPONENT_PART_KEY] ? ` ${classes[COMPONENT_PART_KEY]}` : ""}${className ? ` ${className}` : ""}`;
  return <Icon {...props} className={mergedClass} ref={ref} aria-label={tooltip} />;
});

export const iconComponentRenderer = wrapComponent(
  COMP,
  ThemedIcon,
  IconMd,
);
