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
  themeVars: extractScssThemeVars(buttonStylesSource),
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

    return (
      <Button
        {...adapter.rootAttrs()}
        type={adapter.stringProp("type", defaultProps.type)}
        variant={adapter.stringProp("variant", defaultProps.variant)}
        themeColor={adapter.stringProp("themeColor", defaultProps.themeColor)}
        size={adapter.stringProp("size", defaultProps.size)}
        iconPosition={adapter.stringProp("iconPosition", defaultProps.iconPosition)}
        contentPosition={adapter.stringProp("contentPosition", defaultProps.contentPosition)}
        orientation={adapter.stringProp("orientation", defaultProps.orientation)}
        contextualLabel={adapter.stringProp("contextualLabel")}
        icon={buttonIconValue(adapter.prop("icon"))}
        autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
        disabled={!enabled}
        onClick={(event) => void adapter.event("click")(event)}
        onContextMenu={(event) => void adapter.event("contextMenu")(event)}
        onFocus={() => void adapter.event("gotFocus")()}
        onBlur={() => void adapter.event("lostFocus")()}
      >
        {children}
      </Button>
    );
  },
});

function stringifyButtonLabel(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
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
