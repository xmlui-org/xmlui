import styles from "./TextBoxNew.module.scss";

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
import { TextBoxNew, defaultProps } from "./TextBoxNewNative";

const COMP = "TextBoxNew";

export const TextBoxNewMd = createMetadata({
  status: "in progress",
  description:
    "`TextBoxNew` captures user text input for forms, search fields, and data entry " +
    "with support for validation, icons, and formatting hints.",
  parts: {
    startAdornment: {
      description: "The adornment displayed at the start of the text box.",
    },
    endAdornment: {
      description: "The adornment displayed at the end of the text box.",
    },
    input: {
      description: "The text box input area.",
    }
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
    "borderColor-Input-error": "$borderColor-Input-default--error",
    "borderColor-Input-warning": "$borderColor-Input-default--warning",
    "borderColor-Input-success": "$borderColor-Input-default--success",
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

type TextBoxNewComponentDef = ComponentDef<typeof TextBoxNewMd>;

function renderTextBoxNew(
  className: string | undefined,
  state: any,
  updateState: (componentState: any) => void,
  extractValue: ValueExtractor,
  node: TextBoxNewComponentDef,
  lookupEventHandler: (
    eventName: keyof NonNullable<TextBoxNewComponentDef["events"]>,
    actionOptions?: LookupActionOptions,
  ) => AsyncFunction | undefined,
  registerComponentApi: RegisterComponentApiFn,
  type: "text" | "password" = "text",
) {
  // TODO: How can we use the gap from the className?
  //delete layoutCss.gap;

  return (
    <TextBoxNew
      id={node.uid}
      type={type}
      className={className}
      value={state.value}
      updateState={updateState}
      initialValue={extractValue(node.props.initialValue)}
      maxLength={extractValue(node.props.maxLength)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      placeholder={extractValue.asOptionalString(node.props.placeholder)}
      validationStatus={extractValue(node.props.validationStatus)}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      required={extractValue.asOptionalBoolean(node.props.required)}
      registerComponentApi={registerComponentApi}
      startText={extractValue.asOptionalString(node.props.startText)}
      startIcon={extractValue.asOptionalString(node.props.startIcon)}
      endText={extractValue.asOptionalString(node.props.endText)}
      endIcon={extractValue.asOptionalString(node.props.endIcon)}
      gap={extractValue.asOptionalString(node.props.gap)}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      showPasswordToggle={extractValue.asOptionalBoolean(node.props.showPasswordToggle, false)}
      passwordVisibleIcon={extractValue.asOptionalString(node.props.passwordVisibleIcon)}
      passwordHiddenIcon={extractValue.asOptionalString(node.props.passwordHiddenIcon)}
    />
  );
}

export const textBoxNewComponentRenderer = createComponentRenderer(
  COMP,
  TextBoxNewMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    className,
    registerComponentApi,
  }) => {
    return renderTextBoxNew(
      className,
      state,
      updateState,
      extractValue,
      node as TextBoxNewComponentDef,
      lookupEventHandler,
      registerComponentApi,
    );
  },
);

export const PasswordNewMd = createMetadata({
  ...TextBoxNewMd,
  description:
    "`PasswordNew` is a specialized [TextBoxNew](/components/TextBoxNew) that enables users " +
    "to input and edit passwords.",
});

export const passwordInputNewComponentRenderer = createComponentRenderer(
  "PasswordInputNew",
  PasswordNewMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    className,
    registerComponentApi,
  }) => {
    return renderTextBoxNew(
      className,
      state,
      updateState,
      extractValue,
      node as TextBoxNewComponentDef,
      lookupEventHandler,
      registerComponentApi,
      "password",
    );
  },
);
