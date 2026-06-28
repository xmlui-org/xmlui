import React from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import {
  createMetadata,
  dAutoFocus,
  dClick,
  dContextMenu,
  dEnabled,
  dGotFocus,
  dLostFocus,
} from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Button } from "./ButtonReact";
import buttonStylesSource from "./Button.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Button.defaults";
import { ThemedIcon } from "../Icon/Icon";
import { COMPONENT_PART_KEY } from "../../styling";

const COMP = "Button";

export const ButtonMd = createMetadata({
  status: "stable",
  description:
    "`Button` is the primary interactive component for triggering actions like form submissions, navigation, opening modals, and API calls.",
  parts: {
    icon: {
      description: "The icon displayed within the button, if any.",
    },
  },
  props: {
    id: {
      description: "Defines a component instance identifier.",
      valueType: "string",
    },
    autoFocus: dAutoFocus(),
    variant: {
      description: "The button variant determines the level of emphasis the button should possess.",
      valueType: "string",
      availableValues: ["solid", "outlined", "ghost"],
      defaultValue: defaultProps.variant,
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      valueType: "string",
      availableValues: ["primary", "secondary", "attention"],
      defaultValue: defaultProps.themeColor,
    },
    size: {
      description: "Sets the size of the button.",
      valueType: "string",
      availableValues: ["xs", "sm", "md", "lg"],
      defaultValue: defaultProps.size,
    },
    label: {
      description:
        `This property is an optional string to set a label for the ${COMP}. When the ${COMP} has nested children, it displays them and ignores the value of the label prop.`,
      valueType: "string",
    },
    type: {
      description: `This optional string describes how the ${COMP} appears in an HTML context.`,
      valueType: "string",
      availableValues: ["button", "submit", "reset"],
      defaultValue: defaultProps.type,
    },
    enabled: dEnabled(defaultProps.enabled),
    orientation: {
      description: `This optional string determines the orientation of the ${COMP} content.`,
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
    icon: {
      description: "This string value denotes an icon name.",
      valueType: "string",
    },
    iconPosition: {
      description: `This optional string determines the location of the icon in the ${COMP}.`,
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: defaultProps.iconPosition,
    },
    contentPosition: {
      description: `This optional value determines how the label and icon should be placed inside the ${COMP}.`,
      valueType: "string",
      availableValues: ["start", "center", "end"],
      defaultValue: defaultProps.contentPosition,
    },
    contextualLabel: {
      description: `This optional value is used to provide an accessible name for the ${COMP}.`,
      valueType: "string",
    },
    testId: {
      description: `This optional property adds a test identifier to the ${COMP} root element.`,
      valueType: "string",
    },
    busyOnClick: {
      description: "When `true`, the Button auto-disables itself while its `onClick` handler is running.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  themeVars: {
    ...extractScssThemeVars(buttonStylesSource),
    ...buttonVariantThemeVars(),
  },
  defaultThemeVars: {
    [`padding-${COMP}`]: "$space-2 $space-4",
    [`gap-${COMP}`]: "$space-2",
    [`borderColor-${COMP}`]: "transparent",
    [`backgroundColor-${COMP}`]: "transparent",
    [`transition-${COMP}`]: "color 0.2s, background 0.2s",
    [`width-${COMP}`]: "fit-content",
    [`height-${COMP}`]: "fit-content",
    [`width-${COMP}-vertical`]: "fit-content",
    [`height-${COMP}-vertical`]: "fit-content",
    [`gap-${COMP}-vertical`]: "$space-1",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`fontSize-${COMP}`]: "$fontSize-sm",
    [`fontWeight-${COMP}`]: "$fontWeight-medium",
    [`fontStyle-${COMP}`]: "$fontStyle-normal",
    [`backgroundColor-${COMP}-primary`]: "$color-primary-500",
    [`borderColor-${COMP}-primary`]: "$color-primary-500",
    [`backgroundColor-${COMP}-attention`]: "$backgroundColor-attention",
    [`borderColor-${COMP}-attention`]: "$color-attention",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor--disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`borderStyle-${COMP}`]: "solid",
    [`textColor-${COMP}--disabled`]: "$textColor--disabled",
    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`borderWidth-${COMP}`]: "1px",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset--focus",
    [`paddingHorizontal-${COMP}-xs`]: "$space-1",
    [`paddingVertical-${COMP}-xs`]: "$space-0_5",
    [`paddingHorizontal-${COMP}-sm`]: "$space-4",
    [`paddingVertical-${COMP}-sm`]: "$space-2",
    [`paddingHorizontal-${COMP}-md`]: "$space-4",
    [`paddingVertical-${COMP}-md`]: "$space-3",
    [`paddingHorizontal-${COMP}-lg`]: "$space-5",
    [`paddingVertical-${COMP}-lg`]: "$space-4",
    [`textColor-${COMP}`]: "$color-surface-950",
    [`textColor-${COMP}-solid`]: "$const-color-surface-50",
    [`backgroundColor-${COMP}-primary--hover`]: "$color-primary-400",
    [`backgroundColor-${COMP}-primary--active`]: "$color-primary-500",
    [`backgroundColor-${COMP}-primary-outlined--hover`]: "$color-primary-50",
    [`backgroundColor-${COMP}-primary-outlined--active`]: "$color-primary-100",
    [`borderColor-${COMP}-primary-outlined`]: "$borderColor-outlined",
    [`borderColor-${COMP}-primary-outlined--hover`]: "$borderColor-outlined--hover",
    [`borderColor-${COMP}-primary-outlined--active`]: "$borderColor-outlined--active",
    [`textColor-${COMP}-primary-outlined`]: "$color-primary-900",
    [`textColor-${COMP}-primary-outlined--hover`]: "$color-primary-950",
    [`textColor-${COMP}-primary-outlined--active`]: "$color-primary-900",
    [`backgroundColor-${COMP}-primary-ghost--hover`]: "$color-primary-50",
    [`backgroundColor-${COMP}-primary-ghost--active`]: "$color-primary-100",
    [`borderColor-${COMP}-secondary`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-secondary`]: "$color-secondary-500",
    [`backgroundColor-${COMP}-secondary--hover`]: "$color-secondary-400",
    [`backgroundColor-${COMP}-secondary--active`]: "$color-secondary-500",
    [`backgroundColor-${COMP}-secondary-outlined--hover`]: "$color-secondary-50",
    [`backgroundColor-${COMP}-secondary-outlined--active`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-secondary-ghost--hover`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-secondary-ghost--active`]: "$color-secondary-100",
    [`backgroundColor-${COMP}-attention--hover`]: "$color-danger-400",
    [`backgroundColor-${COMP}-attention--active`]: "$color-danger-500",
    [`backgroundColor-${COMP}-attention-outlined--hover`]: "$color-danger-50",
    [`backgroundColor-${COMP}-attention-outlined--active`]: "$color-danger-100",
    [`backgroundColor-${COMP}-attention-ghost--hover`]: "$color-danger-50",
    [`backgroundColor-${COMP}-attention-ghost--active`]: "$color-danger-100",
  },
});

export const buttonRenderer = wrapComponent({
  name: "Button",
  metadata: ButtonMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const label = adapter.prop("label");
    const hasLabelProp = Object.prototype.hasOwnProperty.call(adapter.node.props, "label");
    const enabled = adapter.booleanProp("enabled", defaultProps.enabled);
    const children = adapter.node.children.length > 0
      ? adapter.renderChildren()
      : !hasLabelProp
        ? undefined
        : stringifyButtonLabel(label);
    const iconName = buttonIconValue(adapter.prop("icon"));
    const rootAttrs = adapter.rootAttrs();
    const className = typeof rootAttrs.className === "string" ? rootAttrs.className : "";
    const buttonProps = {
      ...rootAttrs,
      id: adapter.stringProp("id"),
      "data-testid": adapter.stringProp("testId") ?? adapter.stringProp("id"),
      type: normalizeButtonType(adapter.stringProp("type", defaultProps.type)),
      variant: normalizeButtonVariant(adapter.stringProp("variant", defaultProps.variant)),
      themeColor: normalizeButtonThemeColor(adapter.stringProp("themeColor", defaultProps.themeColor)),
      size: normalizeButtonSize(adapter.stringProp("size", defaultProps.size)),
      iconPosition: normalizeIconPosition(adapter.stringProp("iconPosition", defaultProps.iconPosition)),
      contentPosition: normalizeContentPosition(adapter.stringProp("contentPosition", defaultProps.contentPosition)),
      orientation: normalizeOrientation(adapter.stringProp("orientation", defaultProps.orientation)),
      contextualLabel: adapter.stringProp("contextualLabel"),
      icon: iconName ? <ThemedIcon name={iconName} aria-hidden /> : undefined,
      autoFocus: adapter.booleanProp("autoFocus", defaultProps.autoFocus),
      disabled: !enabled,
      classes: { [COMPONENT_PART_KEY]: className },
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => adapter.event("click")(event),
      onContextMenu: (event: React.MouseEvent<HTMLButtonElement>) => adapter.event("contextMenu")(event),
      onFocus: () => adapter.event("gotFocus")(),
      onBlur: () => adapter.event("lostFocus")(),
    };
    const busyOnClick = adapter.booleanProp("busyOnClick", false);

    return busyOnClick
      ? <BusyButtonShell buttonProps={buttonProps} enabled={enabled}>{children}</BusyButtonShell>
      : <Button {...buttonProps}>{children}</Button>;
  },
});

function stringifyButtonLabel(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "";
  }
  if (typeof value === "function") {
    return "[object Object]";
  }
  return String(value);
}

function buttonIconValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  if (
    value === "" ||
    value === "_" ||
    value === "null" ||
    value === "undefined" ||
    value === "[object Object]" ||
    value.includes("=>") ||
    value.startsWith("function")
  ) {
    return undefined;
  }
  return value;
}

function normalizeButtonType(value: string | undefined) {
  return value === "submit" || value === "reset" || value === "button" ? value : defaultProps.type;
}

function normalizeButtonVariant(value: string | undefined) {
  return value === "outlined" || value === "ghost" || value === "solid" ? value : defaultProps.variant;
}

function normalizeButtonThemeColor(value: string | undefined) {
  return value === "primary" || value === "secondary" || value === "attention" ? value : defaultProps.themeColor;
}

function normalizeButtonSize(value: string | undefined) {
  return value === "xs" || value === "sm" || value === "md" || value === "lg" ? value : defaultProps.size;
}

function normalizeIconPosition(value: string | undefined) {
  if (value === "right") {
    return "end";
  }
  if (value === "left") {
    return "start";
  }
  return value === "end" || value === "start" ? value : defaultProps.iconPosition;
}

function normalizeContentPosition(value: string | undefined) {
  return value === "start" || value === "center" || value === "end" ? value : defaultProps.contentPosition;
}

function normalizeOrientation(value: string | undefined) {
  return value === "vertical" || value === "horizontal" ? value : defaultProps.orientation;
}

function buttonVariantThemeVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  const themeColors = ["attention", "primary", "secondary"];
  const variants = ["solid", "outlined", "ghost"];
  const states = ["", "--hover", "--active", "--focus"];
  const properties = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "borderRadius",
    "borderWidth",
    "borderColor",
    "borderStyle",
    "backgroundColor",
    "textColor",
    "boxShadow",
    "transition",
    "outlineWidth",
    "outlineColor",
    "outlineStyle",
    "outlineOffset",
    "border",
  ];
  for (const themeColor of themeColors) {
    for (const variant of variants) {
      for (const property of properties) {
        for (const state of states) {
          const name = `${property}-${COMP}-${themeColor}-${variant}${state}`;
          vars[name] = `Theme variable declared by ${name}.`;
        }
      }
    }
  }
  return vars;
}

type BusyButtonShellProps = {
  buttonProps: React.ComponentProps<typeof Button>;
  enabled: boolean;
  children: React.ReactNode;
};

function BusyButtonShell({ buttonProps, enabled, children }: BusyButtonShellProps) {
  const [busy, setBusy] = React.useState(false);
  const originalOnClick = buttonProps.onClick;
  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (busy) {
        return;
      }
      const result = originalOnClick?.(event);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setBusy(true);
        (result as Promise<unknown>).finally(() => setBusy(false));
      }
    },
    [busy, originalOnClick],
  );
  return (
    <Button
      {...buttonProps}
      disabled={!enabled || busy}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
