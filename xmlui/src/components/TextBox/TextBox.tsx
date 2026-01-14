import styles from "./TextBox.module.scss";

import type { RegisterComponentApiFn, ValueExtractor } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { LookupActionOptions } from "../../abstractions/ActionDefs";
import { type ComponentDef } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
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
      type: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      type: "string",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      type: "string",
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
    "backgroundColor-Input": "$backgroundColor",
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
    "borderColor-Input--default": "$borderColor-Input-default",
    "borderColor-Input--default--hover": "$borderColor-Input-default--hover",
    "borderColor-Input--error": "$borderColor-Input-default--error",
    "borderColor-Input--warning": "$borderColor-Input-default--warning",
    "borderColor-Input--success": "$borderColor-Input-default--success",
    "textColor-placeholder-Input": "$textColor-subtitle",
    "color-adornment-Input": "$textColor-subtitle",

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

type TextBoxComponentDef = ComponentDef<typeof TextBoxMd>;

function renderTextBox(
  className: string | undefined,
  state: any,
  updateState: (componentState: any) => void,
  extractValue: ValueExtractor,
  node: TextBoxComponentDef,
  lookupEventHandler: (
    eventName: keyof NonNullable<TextBoxComponentDef["events"]>,
    actionOptions?: LookupActionOptions,
  ) => AsyncFunction | undefined,
  registerComponentApi: RegisterComponentApiFn,
  type: "text" | "password" = "text",
) {
  // TODO: How can we use the gap from the className?
  //delete layoutCss.gap;
  return (
    <TextBox
      type={type}
      className={className}
      value={state.value}
      updateState={updateState}
      initialValue={extractValue(node.props.initialValue)}
      maxLength={extractValue(node.props.maxLength)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      placeholder={extractValue.asOptionalString(node.props.placeholder)}
      validationStatus={extractValue(node.props.validationStatus)}
      invalidMessages={extractValue(node.props.invalidMessages)}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      registerComponentApi={registerComponentApi}
      startText={extractValue.asOptionalString(node.props.startText)}
      startIcon={extractValue.asOptionalString(node.props.startIcon)}
      endText={extractValue.asOptionalString(node.props.endText)}
      endIcon={extractValue.asOptionalString(node.props.endIcon)}
      gap={extractValue.asOptionalString(node.props.gap)}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      required={extractValue.asOptionalBoolean(node.props.required)}
      showPasswordToggle={extractValue.asOptionalBoolean(node.props.showPasswordToggle, false)}
      passwordVisibleIcon={extractValue.asOptionalString(node.props.passwordVisibleIcon)}
      passwordHiddenIcon={extractValue.asOptionalString(node.props.passwordHiddenIcon)}
      verboseValidationFeedback={extractValue.asOptionalBoolean(node.props.verboseValidationFeedback)}
      validationIconSuccess={extractValue.asOptionalString(node.props.validationIconSuccess)}
      validationIconError={extractValue.asOptionalString(node.props.validationIconError)}
    />
  );
}

export const textBoxComponentRenderer = createComponentRenderer(
  COMP,
  TextBoxMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    className,
    registerComponentApi,
  }) => {
    return renderTextBox(
      className,
      state,
      updateState,
      extractValue,
      node as TextBoxComponentDef,
      lookupEventHandler,
      registerComponentApi,
    );
  },
);

export const PasswordMd = createMetadata({
  ...TextBoxMd,
  description:
    "`Password` is a specialized [TextBox](/components/TextBox) that enables users " +
    "to input and edit passwords.",
});

export const passwordInputComponentRenderer = createComponentRenderer(
  "PasswordInput",
  PasswordMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    className,
    registerComponentApi,
  }) => {
    return renderTextBox(
      className,
      state,
      updateState,
      extractValue,
      node as TextBoxComponentDef,
      lookupEventHandler,
      registerComponentApi,
      "password",
    );
  },
);
