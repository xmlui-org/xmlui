import styles from "./Button.module.scss";

import {
  buttonThemeMd,
  alignmentOptionMd,
  sizeMd,
  buttonVariantMd,
  buttonTypesMd,
  iconPositionMd,
} from "../abstractions";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dClick,
  dContextMenu,
  dGotFocus,
  dLostFocus,
  dOrientation,
} from "../../components/metadata-helpers";
import { defaultProps } from "./Button.defaults";
import { Button } from "./ButtonReact";
import { hasRenderableChildren } from "../../components-core/rendering/nodeUtils";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import React from "react";
import { ThemedIcon } from "../Icon/Icon";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "Button";

export const ButtonMd = createMetadata({
  status: "stable",
  description:
    "`Button` is the primary interactive component for triggering actions like " +
    "form submissions, navigation, opening modals, and API calls. It supports " +
    "multiple visual styles and sizes to match different UI contexts and importance levels.",
  parts: {
    icon: {
      description: "The icon displayed within the button, if any.",
    },
  },
  props: {
    autoFocus: {
      description: "Indicates if the button should receive focus when the page loads.",
      isRequired: false,
      valueType: "boolean",
      defaultValue: defaultProps.autoFocus,
    },
    variant: {
      description: "The button variant determines the level of emphasis the button should possess.",
      isRequired: false,
      valueType: "string",
      availableValues: buttonVariantMd,
      defaultValue: defaultProps.variant,
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      isRequired: false,
      valueType: "string",
      availableValues: buttonThemeMd,
      defaultValue: defaultProps.themeColor,
    },
    size: {
      description: "Sets the size of the button.",
      isRequired: false,
      valueType: "string",
      availableValues: sizeMd,
      defaultValue: defaultProps.size,
    },
    label: {
      description:
        `This property is an optional string to set a label for the ${COMP}. If no label is ` +
        `specified and an icon is set, the ${COMP} will modify its styling to look like a ` +
        `small icon button. When the ${COMP} has nested children, it will display them and ` +
        `ignore the value of the \`label\` prop.`,
      valueType: "string",
    },
    type: {
      description:
        `This optional string describes how the ${COMP} appears in an HTML context. You ` +
        `rarely need to set this property explicitly.`,
      availableValues: buttonTypesMd,
      valueType: "string",
      defaultValue: defaultProps.type,
    },
    enabled: {
      description:
        `The value of this property indicates whether the button accepts actions (\`true\`) ` +
        `or does not react to them (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    orientation: dOrientation(defaultProps.orientation),
    icon: {
      description:
        `This string value denotes an icon name. The framework will render an icon if XMLUI ` +
        `recognizes the icon by its name. If no label is specified and an icon is set, the ${COMP} ` +
        `displays only that icon.`,
      valueType: "string",
    },
    iconPosition: {
      description: `This optional string determines the location of the icon in the ${COMP}.`,
      availableValues: iconPositionMd,
      valueType: "string",
      defaultValue: defaultProps.iconPosition,
    },
    contentPosition: {
      description:
        `This optional value determines how the label and icon (or nested children) should be placed` +
        `inside the ${COMP} component.`,
      availableValues: alignmentOptionMd,
      valueType: "string",
      defaultValue: defaultProps.contentPosition,
    },
    contextualLabel: {
      description: `This optional value is used to provide an accessible name for the ${COMP} in the context of its usage.`,
      valueType: "string",
    },
    busyOnClick: {
      description:
        `When \`true\`, the ${COMP} auto-disables itself while its \`onClick\` ` +
        `handler is running, preventing accidental double-submits. ` +
        `Combine with \`handlerPolicy:click="single-flight"\` for full ` +
        `dispatcher-level deduplication of rapid repeated clicks.`,
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
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // --- Default styles for supporting "variant" behavior
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
    [`backgroundColor-${COMP}-attention`]: "rgb(255, 31, 20)",
    [`backgroundColor-${COMP}-attention-solid`]: "$backgroundColor-Button-attention",
    [`borderColor-${COMP}-attention-solid`]: "$borderColor-Button-attention",
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
    [`borderColor-${COMP}-primary`]: "$color-primary-500",
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

type ThemedButtonProps = React.ComponentProps<typeof Button> & { className?: string };
export const ThemedButton = React.forwardRef<HTMLButtonElement, ThemedButtonProps>(
  function ThemedButton({ className, ...props }: ThemedButtonProps, ref) {
    const themeClass = useComponentThemeClass(ButtonMd);
    return <Button {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />;
  },
);

export const buttonComponentRenderer = wrapComponent(
  "Button",
  Button,
  ButtonMd,
  {
    booleans: ["autoFocus", "busyOnClick"],
    strings: ["variant", "themeColor", "size", "iconPosition", "orientation", "contentPosition", "contextualLabel"],
    events: { click: "onClick", contextMenu: "onContextMenu", gotFocus: "onFocus", lostFocus: "onBlur" },
    exclude: ["icon", "label", "enabled", "busyOnClick"],
    customRender: (props, { node, extractValue, renderChild }) => {
      const iconName = extractValue.asString(node.props.icon);
      const label = extractValue.asDisplayText(node.props.label);
      const renderedChildren = hasRenderableChildren(node.children)
        ? renderChild(node.children, { type: "Stack", orientation: "horizontal" })
        : label;
      const enabled = extractValue.asOptionalBoolean(node.props.enabled, defaultProps.enabled);
      const busyOnClick = extractValue.asOptionalBoolean(node.props.busyOnClick, false);
      if (busyOnClick) {
        // --- Plan #6 W7-1: `busyOnClick` is a UX convenience that
        // --- auto-disables the button while its `onClick` handler is
        // --- in flight. Combined with `handlerPolicy:click =
        // --- "single-flight"` it gives the most common “prevent
        // --- double-submit” behaviour with one prop. The dispatcher
        // --- already implements single-flight semantics; this shell
        // --- only manages the local visual `disabled` state.
        return (
          <BusyButtonShell
            buttonProps={props}
            icon={iconName && <ThemedIcon name={iconName} aria-hidden />}
            enabled={enabled}
          >
            {renderedChildren}
          </BusyButtonShell>
        );
      }
      return (
        <Button
          {...props}
          icon={iconName && <ThemedIcon name={iconName} aria-hidden />}
          disabled={!enabled}
        >
          {renderedChildren}
        </Button>
      );
    },
  },
);

/**
 * Local shell that tracks whether the wrapped Button's `onClick`
 * handler is still running, so the button can be auto-disabled
 * ("busy") for the duration. Implements the visible half of the
 * `busyOnClick` convenience; the dispatcher's single-flight policy
 * handles handler-level deduplication.
 */
type BusyButtonShellProps = {
  buttonProps: any;
  icon: React.ReactNode;
  enabled: boolean;
  children: React.ReactNode;
};
function BusyButtonShell({ buttonProps, icon, enabled, children }: BusyButtonShellProps) {
  const [busy, setBusy] = React.useState(false);
  const originalOnClick = buttonProps.onClick;
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (busy) return;
      const result = originalOnClick?.(e);
      if (result && typeof (result as any).then === "function") {
        setBusy(true);
        (result as Promise<unknown>).finally(() => setBusy(false));
      }
    },
    [busy, originalOnClick],
  );
  return (
    <Button
      {...buttonProps}
      icon={icon}
      disabled={!enabled || busy}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export const buttonRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ButtonMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const iconName = adapter.stringProp("icon");
    const label = adapter.prop("label");
    const hasLabelProp = Object.prototype.hasOwnProperty.call(adapter.node.props, "label");
    const children = adapter.node.children.length > 0
      ? adapter.renderChildren()
      : hasLabelProp
        ? stringifyButtonLabel(label)
        : undefined;
    const enabled = adapter.booleanProp("enabled", defaultProps.enabled);
    const busyOnClick = adapter.booleanProp("busyOnClick", false);
    const icon = iconName && isRenderableIconName(iconName)
      ? <ThemedIcon name={iconName} aria-hidden />
      : undefined;
    const buttonProps = {
      ...adapter.rootAttrs(),
      id: adapter.stringProp("id"),
      type: adapter.stringProp("type", defaultProps.type),
      variant: adapter.stringProp("variant", defaultProps.variant),
      themeColor: adapter.stringProp("themeColor", defaultProps.themeColor),
      size: adapter.stringProp("size", defaultProps.size),
      iconPosition: adapter.stringProp("iconPosition", defaultProps.iconPosition),
      contentPosition: adapter.stringProp("contentPosition", defaultProps.contentPosition),
      orientation: adapter.stringProp("orientation", defaultProps.orientation),
      contextualLabel: adapter.stringProp("contextualLabel"),
      autoFocus: adapter.booleanProp("autoFocus", defaultProps.autoFocus),
      icon,
      classes: { "-component": adapter.className },
      disabled: !enabled,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => adapter.event("click")(event),
      onContextMenu: (event: React.MouseEvent<HTMLButtonElement>) => adapter.event("contextMenu")(event),
      onFocus: () => adapter.event("gotFocus")(),
      onBlur: () => adapter.event("lostFocus")(),
    };

    if (busyOnClick) {
      return (
        <BusyButtonShell buttonProps={buttonProps} icon={icon} enabled={enabled}>
          {children}
        </BusyButtonShell>
      );
    }

    return (
      <Button {...buttonProps}>
        {children}
      </Button>
    );
  },
});

function stringifyButtonLabel(value: unknown): string | undefined {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "function") {
    return "[object Object]";
  }
  return String(value);
}

function isRenderableIconName(value: string): boolean {
  return !(
    value === "" ||
    value === "_" ||
    value === "null" ||
    value === "undefined" ||
    value === "[object Object]" ||
    value.includes("=>") ||
    value.startsWith("function")
  );
}
