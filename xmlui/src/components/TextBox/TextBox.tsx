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
import { TextBox } from "./TextBoxReact";
import { defaultProps } from "./TextBox.defaults";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";

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
    type: {
      description:
        'Sets the HTML input type. Use `"password"` to hide the entered text and ' +
        'classify the value as a secret in the audit pipeline; `"email"` to classify ' +
        "the value as sensitive (PII).",
      valueType: "string",
      availableValues: ["text", "password", "search", "email"],
      isStrictEnum: true,
      defaultValue: "text",
    },
    placeholder: dPlaceholder(),
    initialValue: {
      ...dInitialValue(),
      valueType: "string",
      defaultValue: defaultProps.initialValue,
      audit: {
        classification: "sensitive",
        defaultRedaction: "hash",
      },
    },
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    autoComplete: {
      description:
        "Sets the HTML `autocomplete` attribute on the underlying input. Boolean values are " +
        'passed as `"on"` or `"off"`; string values are passed through.',
      valueType: "any",
      defaultValue: defaultProps.autoComplete,
    },
    autoCorrect: {
      description:
        "Sets the HTML `autocorrect` attribute on the underlying input. When set, `true` is " +
        'passed as `"on"` and `false` as `"off"`.',
      valueType: "boolean",
    },
    spellCheck: {
      description: "Sets the HTML `spellcheck` attribute on the underlying input.",
      valueType: "boolean",
    },
    autoCapitalize: {
      description: "Sets the HTML `autocapitalize` attribute on the underlying input.",
      valueType: "string",
      availableValues: ["off", "none", "sentences", "words", "characters"],
      isStrictEnum: true,
    },
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
      valueType: "string[]",
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    gap: {
      description:
        "This property defines the gap between the adornments and the input area. If not " +
        "set, the gap declared by the current theme is used.",
      valueType: "length",
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
      valueType: "icon",
      defaultValue: "eye",
    },
    passwordHiddenIcon: {
      description:
        "The icon to display when the password is hidden (when showPasswordToggle is true).",
      valueType: "icon",
      defaultValue: "eye-off",
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "icon",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "icon",
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
    "minHeight-Input": "2.5rem",
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
  props: {
    ...TextBoxMd.props,
    initialValue: {
      ...TextBoxMd.props!.initialValue,
      audit: {
        classification: "secret",
        defaultRedaction: "mask",
      },
    },
  },
});

// Password: same as ThemedTextBox but forces type="password"
const PasswordBox = React.forwardRef((props: any, ref: any) => (
  <ThemedTextBox {...props} ref={ref} type="password" />
));
PasswordBox.displayName = "PasswordBox";

export const passwordInputComponentRenderer = wrapComponent(
  "PasswordInput",
  PasswordBox,
  PasswordMd,
  {
    exposeRegisterApi: true,
    events: {
      gotFocus: "onFocus",
      lostFocus: "onBlur",
    },
    deriveAriaLabel: (props) => props.label || props.placeholder,
  },
);

type RuntimeTextBoxProps = React.ComponentProps<typeof TextBox> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
  forcedType?: "password";
};

function RuntimeTextBoxShell({
  adapter,
  bindTo,
  value,
  initialValue,
  invalidMessages,
  required,
  validationStatus,
  verboseValidationFeedback,
  onDidChange,
  forcedType,
  ...props
}: RuntimeTextBoxProps) {
  const form = useFormContext();
  const formRef = React.useRef(form);
  const adapterRef = React.useRef(adapter);
  const fieldName = bindTo;
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const formError = fieldName ? form?.errors[fieldName] : undefined;
  const controlledValue = value === undefined || value === null ? undefined : String(value);
  const initial = initialValue === undefined || initialValue === null ? "" : String(initialValue);
  const [localValue, setLocalValue] = React.useState(stringValue(formValue) ?? controlledValue ?? initial);
  const apiRef = React.useRef<Record<string, unknown>>({});
  const lastRegisteredValueRef = React.useRef<unknown>(undefined);
  formRef.current = form;
  adapterRef.current = adapter;

  React.useEffect(() => {
    const nextValue = stringValue(formValue) ?? controlledValue;
    if (nextValue !== undefined) {
      setLocalValue(nextValue);
    }
  }, [controlledValue, formValue]);

  React.useEffect(() => {
    if (!form || !fieldName) {
      return;
    }
    return form.registerItem({
      name: fieldName,
      required,
    });
  }, [fieldName, required]);

  const registerApi = React.useCallback((api: Record<string, unknown>) => {
    apiRef.current = api;
    lastRegisteredValueRef.current = localValue;
    adapterRef.current.registerApi({
      ...api,
      value: localValue,
    });
  }, [localValue]);

  React.useEffect(() => {
    if (lastRegisteredValueRef.current === localValue) {
      return;
    }
    lastRegisteredValueRef.current = localValue;
    adapterRef.current.registerApi({
      ...apiRef.current,
      value: localValue,
    });
  }, [localValue]);

  const updateState = React.useCallback((state: Record<string, unknown>, options?: { initial?: boolean }) => {
    if (typeof state.value === "string") {
      setLocalValue(state.value);
      const currentForm = formRef.current;
      if (currentForm && fieldName && !options?.initial) {
        currentForm.setValue(fieldName, state.value);
        void currentForm.validateField(fieldName, state.value);
      }
    }
  }, [fieldName]);

  const effectiveValidationStatus = formError
    ? "error"
    : required && localValue
      ? "valid"
      : validationStatus;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback =
    verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;

  const renderedTextBox = (
    <TextBox
      {...props}
      type={forcedType ?? props.type}
      value={controlledValue ?? localValue}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={registerApi}
      required={required}
      validationStatus={effectiveValidationStatus}
      invalidMessages={effectiveInvalidMessages}
      verboseValidationFeedback={effectiveVerboseValidationFeedback}
      onDidChange={(newValue) => {
        onDidChange?.(newValue);
        void adapter.event("didChange")(newValue);
      }}
      onFocus={() => {
        void adapter.event("gotFocus")();
      }}
      onBlur={() => {
        void adapter.event("lostFocus")();
      }}
    />
  );

  if (formError && effectiveVerboseValidationFeedback) {
    return (
      <>
        {renderedTextBox}
        <div data-validation-display-severity="error">{formError}</div>
      </>
    );
  }

  return renderedTextBox;
}

function runtimeTextBoxProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  const { onFocus, onBlur, onChange, ...safeRootAttrs } = rootAttrs;
  return {
    ...safeRootAttrs,
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    type: adapter.stringProp("type", defaultProps.type) as "text" | "password" | "search",
    value: stringValue(adapter.prop("value")),
    initialValue: adapter.prop("initialValue", defaultProps.initialValue),
    maxLength: adapter.prop("maxLength") as number | undefined,
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    placeholder: adapter.stringProp("placeholder"),
    validationStatus: adapter.stringProp(
      "validationStatus",
      defaultProps.validationStatus,
    ) as React.ComponentProps<typeof TextBox>["validationStatus"],
    invalidMessages: adapter.prop("invalidMessages", defaultProps.invalidMessages) as string[],
    startText: adapter.stringProp("startText"),
    startIcon: adapter.stringProp("startIcon"),
    endText: adapter.stringProp("endText"),
    endIcon: adapter.stringProp("endIcon"),
    gap: adapter.stringProp("gap"),
    autoFocus: adapter.booleanProp("autoFocus", false),
    autoComplete: adapter.prop("autoComplete", defaultProps.autoComplete) as string | boolean,
    autoCorrect: adapter.prop("autoCorrect") as boolean | undefined,
    spellCheck: adapter.prop("spellCheck") as boolean | undefined,
    autoCapitalize: adapter.stringProp("autoCapitalize"),
    readOnly: adapter.booleanProp("readOnly", false),
    tabIndex: adapter.prop("tabIndex") as number | undefined,
    required: adapter.booleanProp("required", false),
    showPasswordToggle: adapter.booleanProp("showPasswordToggle", false),
    passwordVisibleIcon: adapter.stringProp("passwordVisibleIcon", defaultProps.passwordVisibleIcon),
    passwordHiddenIcon: adapter.stringProp("passwordHiddenIcon", defaultProps.passwordHiddenIcon),
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(
      adapter.props,
      "verboseValidationFeedback",
    )
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    classes: { [COMPONENT_PART_KEY]: adapter.className },
    style: rootAttrs.style,
    className: rootAttrs.className as string | undefined,
  };
}

function stringValue(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

const textBoxInputThemeAliases = {
  [`backgroundColor-${COMP}`]: "$backgroundColor-Input",
  [`backgroundColor-${COMP}--disabled`]: "$backgroundColor-Input--disabled",
  [`borderRadius-${COMP}`]: "$borderRadius-Input",
  [`borderColor-${COMP}`]: "$borderColor-Input",
  [`borderWidth-${COMP}`]: "$borderWidth-Input",
  [`borderStyle-${COMP}`]: "$borderStyle-Input",
  [`fontSize-${COMP}`]: "inherit",
  [`boxShadow-${COMP}`]: "none",
  [`textColor-${COMP}`]: "$textColor-Input",
  [`borderColor-${COMP}--hover`]: "$borderColor-Input--hover",
  [`backgroundColor-${COMP}--hover`]: "$backgroundColor-Input",
  [`boxShadow-${COMP}--hover`]: "none",
  [`textColor-${COMP}--hover`]: "$textColor-Input",
  [`borderColor-${COMP}--focus`]: "$borderColor-Input",
  [`backgroundColor-${COMP}--focus`]: "$backgroundColor-Input",
  [`boxShadow-${COMP}--focus`]: "none",
  [`textColor-${COMP}--focus`]: "$textColor-Input",
  [`outlineColor-${COMP}--focus`]: "$outlineColor-Input--focus",
  [`outlineWidth-${COMP}--focus`]: "$outlineWidth-Input--focus",
  [`outlineStyle-${COMP}--focus`]: "$outlineStyle-Input--focus",
  [`outlineOffset-${COMP}--focus`]: "$outlineOffset-Input--focus",
  [`textColor-placeholder-${COMP}`]: "$textColor-placeholder-Input",
  [`color-adornment-${COMP}`]: "$color-adornment-Input",
  [`color-passwordToggle-${COMP}`]: "$color-passwordToggle-Input",
  [`minHeight-${COMP}`]: "$minHeight-Input",
  [`gap-adornment-${COMP}`]: "$gap-adornment-Input",
  [`textColor-${COMP}--disabled`]: "$textColor-Input--disabled",
  [`borderColor-${COMP}--disabled`]: "$borderColor-Input--disabled",
  [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
  [`borderColor-${COMP}--error`]: "$borderColor-Input--error",
  [`borderColor-${COMP}--warning`]: "$borderColor-Input--warning",
  [`borderColor-${COMP}--success`]: "$borderColor-Input--success",
  [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
  [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
  [`borderWidth-${COMP}--success`]: `$borderWidth-${COMP}`,
  [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
  [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
  [`borderStyle-${COMP}--success`]: `$borderStyle-${COMP}`,
  [`fontSize-${COMP}--error`]: `$fontSize-${COMP}`,
  [`fontSize-${COMP}--warning`]: `$fontSize-${COMP}`,
  [`fontSize-${COMP}--success`]: `$fontSize-${COMP}`,
  [`backgroundColor-${COMP}--error`]: `$backgroundColor-${COMP}`,
  [`backgroundColor-${COMP}--warning`]: `$backgroundColor-${COMP}`,
  [`backgroundColor-${COMP}--success`]: `$backgroundColor-${COMP}`,
  [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
  [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
  [`boxShadow-${COMP}--success`]: `$boxShadow-${COMP}`,
  [`textColor-${COMP}--error`]: `$textColor-${COMP}`,
  [`textColor-${COMP}--warning`]: `$textColor-${COMP}`,
  [`textColor-${COMP}--success`]: `$textColor-${COMP}`,
  [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
  [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
  [`borderColor-${COMP}--success--hover`]: `$borderColor-${COMP}--success`,
  [`backgroundColor-${COMP}--error--hover`]: `$backgroundColor-${COMP}--error`,
  [`backgroundColor-${COMP}--warning--hover`]: `$backgroundColor-${COMP}--warning`,
  [`backgroundColor-${COMP}--success--hover`]: `$backgroundColor-${COMP}--success`,
  [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
  [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
  [`boxShadow-${COMP}--success--hover`]: `$boxShadow-${COMP}--success`,
  [`textColor-${COMP}--error--hover`]: `$textColor-${COMP}--error`,
  [`textColor-${COMP}--warning--hover`]: `$textColor-${COMP}--warning`,
  [`textColor-${COMP}--success--hover`]: `$textColor-${COMP}--success`,
};

Object.assign(TextBoxMd.defaultThemeVars ??= {}, textBoxInputThemeAliases);
Object.assign(PasswordMd.defaultThemeVars ??= {}, textBoxInputThemeAliases);

export const PasswordInputMd = PasswordMd;

export const textBoxRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: TextBoxMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeTextBoxShell adapter={adapter} {...runtimeTextBoxProps(adapter)} />
  ),
});

export const passwordInputRenderer = wrapRuntimeComponent({
  name: "PasswordInput",
  metadata: PasswordMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeTextBoxShell
      adapter={adapter}
      {...runtimeTextBoxProps(adapter)}
      forcedType="password"
    />
  ),
});
