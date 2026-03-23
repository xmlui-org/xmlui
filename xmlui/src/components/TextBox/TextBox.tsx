import styles from "./TextBox.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { TextBox, defaultProps } from "./TextBoxNative";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "TextBox";

export const TextBoxMd = createMetadata({
  status: "stable",
  description:
    "`TextBox` captures user text input for forms, search fields, and data entry " +
    "with support for validation, icons, and formatting hints.",
  parts: {
    label: {
      description: "The label displayed for the text box.",
    },
    startAdornment: {
      description: "The adornment displayed at the start of the text box.",
    },
    endAdornment: {
      description: "The adornment displayed at the end of the text box.",
    },
    input: {
      description: "The text box input area.",
    },
  },
  defaultPart: "input",
  props: {
    placeholder: dPlaceholder(),
    initialValue: {
      ...dInitialValue(),
      defaultValue: defaultProps.initialValue,
    },
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    invalidMessages: {
      description: "The invalid messages to display for the input component.",
      type: "array",
      valueType: "string",
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    gap: {
      description:
        "This property defines the gap between the adornments and the input area. If not " +
        "set, the gap declared by the current theme is used.",
    },
    showPasswordToggle: {
      description:
        "If `true`, a toggle button is displayed to switch between showing and hiding the password input.",
      valueType: "boolean",
      defaultValue: false,
    },
    passwordVisibleIcon: {
      description:
        "The icon to display when the password is visible (when showPasswordToggle is true).",
      valueType: "string",
      defaultValue: "eye",
    },
    passwordHiddenIcon: {
      description:
        "The icon to display when the password is hidden (when showPasswordToggle is true).",
      valueType: "string",
      defaultValue: "eye-off",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "string",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "string",
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This method sets the focus on the \`${COMP}\` component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): string | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: string): void",
      parameters: {
        value: "The new value to set. If the value is empty, it will clear the input.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "backgroundColor-Input": "transparent",
    "borderRadius-Input": "$borderRadius",
    "textColor-Input": "$textColor-primary",
    "backgroundColor-Input--disabled": "$backgroundColor--disabled",
    "borderWidth-Input": "1px",
    "minHeight-Input": "39px",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    "gap-adornment-Input": "$space-2",
    "borderStyle-Input": "solid",
    "borderColor-Input--disabled": "$borderColor--disabled",
    "textColor-Input--disabled": "$textColor--disabled",
    "borderColor-Input": "$borderColor-Input-default",
    "borderColor-Input--hover": "$borderColor-Input-default--hover",
    "borderColor-Input--error": "$borderColor-Input-default--error",
    "borderColor-Input--warning": "$borderColor-Input-default--warning",
    "borderColor-Input--success": "$borderColor-Input-default--success",
    "textColor-placeholder-Input": "$textColor-subtitle",
    "color-adornment-Input": "$textColor-subtitle",
    "color-adornment-TextBox": "$textColor-subtitle",

    "outlineColor-Input--focus": "$outlineColor--focus",
    "outlineWidth-Input--focus": "$outlineWidth--focus",
    "outlineStyle-Input--focus": "$outlineStyle--focus",
    "outlineOffset-Input--focus": "$outlineOffset--focus",
    "color-passwordToggle-Input": "$textColor-subtitle",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

type ThemedTextBoxProps = React.ComponentProps<typeof TextBox> & { className?: string };
export const ThemedTextBox = React.forwardRef<HTMLDivElement, ThemedTextBoxProps>(
  function ThemedTextBox({ className, classes, ...props }: ThemedTextBoxProps, ref) {
    const themeClass = useComponentThemeClass(TextBoxMd);
    const themedClasses: Record<string, string> = {
      ...(classes ?? {}),
      [COMPONENT_PART_KEY]: [themeClass, classes?.[COMPONENT_PART_KEY]].filter(Boolean).join(" "),
    };
    return <TextBox {...props} className={className} classes={themedClasses} ref={ref} />;
  },
);

export const textBoxComponentRenderer = wrapComponent(COMP, ThemedTextBox, TextBoxMd, {
  exposeRegisterApi: true,
  events: {
    gotFocus: "onFocus",
    lostFocus: "onBlur",
  },
  deriveAriaLabel: (props) => props.label || props.placeholder,
});

export const PasswordMd = createMetadata({
  ...TextBoxMd,
  description:
    "`Password` is a specialized [TextBox](/components/TextBox) that enables users " +
    "to input and edit passwords.",
});

// Password: same as ThemedTextBox but forces type="password"
const PasswordBox = React.forwardRef((props: any, ref: any) =>
  <ThemedTextBox {...props} ref={ref} type="password" />
);
PasswordBox.displayName = "PasswordBox";

export const passwordInputComponentRenderer = wrapComponent("PasswordInput", PasswordBox, PasswordMd, {
  exposeRegisterApi: true,
  events: {
    gotFocus: "onFocus",
    lostFocus: "onBlur",
  },
  deriveAriaLabel: (props) => props.label || props.placeholder,
});
