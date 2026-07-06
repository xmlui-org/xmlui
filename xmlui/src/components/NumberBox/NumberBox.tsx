import styles from "./NumberBox.module.scss";

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
import { defaultProps } from "./NumberBox.defaults";
import { NumberBox } from "./NumberBoxReact";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";

const COMP = "NumberBox";

export const NumberBoxMd = createMetadata({
  status: "stable",
  description:
    "`NumberBox` provides a specialized input field for numeric values with built-in " +
    "validation, spinner buttons, and flexible formatting options. It supports both " +
    "integer and floating-point numbers, handles empty states as null values, and " +
    "integrates seamlessly with form validation.",
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
    spinnerUp: {
      description: "The spinner button for incrementing the value.",
    },
    spinnerDown: {
      description: "The spinner button for decrementing the value.",
    },
    conciseValidationFeedback: {
      description: "The concise validation feedback indicator.",
    },
  },
  props: {
    placeholder: dPlaceholder(),
    initialValue: {
      ...dInitialValue(),
      valueType: "number",
    },
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    gap: {
      description: "This property defines the gap between the adornments and the input area.",
      valueType: "length",
    },
    hasSpinBox: {
      description: `This boolean prop shows (\`true\`) or hides (\`false\`) the spinner buttons for the input field.`,
      valueType: "boolean",
      defaultValue: defaultProps.hasSpinBox,
    },
    spinnerUpIcon: {
      description:
        `Allows setting an alternate icon displayed in the ${COMP} spinner for incrementing values. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.spinnerUp:NumberBox" declaration in the ` +
        `app configuration file.`,
      valueType: "icon",
    },
    spinnerDownIcon: {
      description:
        `Allows setting an alternate icon displayed in the ${COMP} spinner for decrementing values. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.spinnerDown:NumberBox" declaration in the ` +
        `app configuration file.`,
      valueType: "icon",
    },
    step: {
      description: `This prop governs how big the step when clicking on the spinner of the field.`,
      valueType: "number",
      defaultValue: defaultProps.step,
    },
    integersOnly: {
      description:
        `This boolean property signs whether the input field accepts integers only (\`true\`) ` +
        `or not (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.integersOnly,
    },
    zeroOrPositive: {
      description:
        `This boolean property determines whether the input value can only be 0 or positive numbers ` +
        `(\`true\`) or also negative (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.zeroOrPositive,
    },
    minValue: {
      description:
        "The minimum value the input field allows. Can be a float or an integer if " +
        "[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer." +
        "If not set, no minimum value check is done.",
      valueType: "number",
      defaultValue: defaultProps.min,
    },
    maxValue: {
      description:
        "The maximum value the input field allows. Can be a float or an integer if " +
        "[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer." +
        "If not set, no maximum value check is done.",
      valueType: "number",
      defaultValue: defaultProps.max,
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
      description: `This API focuses the input field of the \`${COMP}\`. You can use it to programmatically focus the field.`,
      signature: "focus(): void",
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: number | undefined): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
  },
});

type ThemedNumberBoxProps = React.ComponentProps<typeof NumberBox> & { className?: string };

export const ThemedNumberBox = React.forwardRef<HTMLDivElement, ThemedNumberBoxProps>(
  function ThemedNumberBox({ className, classes, ...props }: ThemedNumberBoxProps, ref) {
    const themeClass = useComponentThemeClass(NumberBoxMd);
    const themedClasses: Record<string, string> = {
      ...(classes ?? {}),
      [COMPONENT_PART_KEY]: [themeClass, classes?.[COMPONENT_PART_KEY]].filter(Boolean).join(" "),
    };
    return <NumberBox {...props} className={className} classes={themedClasses} ref={ref} />;
  },
);

export const numberBoxComponentRenderer = wrapComponent(COMP, ThemedNumberBox, NumberBoxMd, {
  exposeRegisterApi: true,
  rename: {
    minValue: "min",
    maxValue: "max",
  },
  events: {
    gotFocus: "onFocus",
    lostFocus: "onBlur",
    didChange: "onDidChange",
  },
  deriveAriaLabel: (props) => props.label || props.placeholder,
});

type RuntimeNumberBoxProps = React.ComponentProps<typeof NumberBox> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
};

function RuntimeNumberBoxShell({
  adapter,
  bindTo,
  value,
  initialValue,
  invalidMessages,
  required,
  validationStatus,
  verboseValidationFeedback,
  onDidChange,
  ...props
}: RuntimeNumberBoxProps) {
  const form = useFormContext();
  const formRef = React.useRef(form);
  const adapterRef = React.useRef(adapter);
  const fieldName = bindTo;
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const formError = fieldName ? form?.errors[fieldName] : undefined;
  const controlledValue = numberBoxValue(formValue) ?? numberBoxValue(value);
  const initial = numberBoxValue(initialValue);
  const [localValue, setLocalValue] = React.useState<number | string | null | undefined>(
    controlledValue ?? initial,
  );
  const apiRef = React.useRef<Record<string, unknown>>({});
  const lastRegisteredValueRef = React.useRef<unknown>(undefined);
  formRef.current = form;
  adapterRef.current = adapter;

  React.useEffect(() => {
    const nextValue = numberBoxValue(formValue) ?? numberBoxValue(value);
    if (nextValue !== undefined) {
      setLocalValue(nextValue);
    }
  }, [formValue, value]);

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
    if (Object.prototype.hasOwnProperty.call(state, "value")) {
      const nextValue = numberBoxValue(state.value);
      setLocalValue(nextValue);
      const currentForm = formRef.current;
      if (currentForm && fieldName && !options?.initial) {
        currentForm.setValue(fieldName, nextValue);
        void currentForm.validateField(fieldName, nextValue);
      }
    }
  }, [fieldName]);

  const effectiveValidationStatus = formError
    ? "error"
    : required && localValue !== null && localValue !== undefined && localValue !== ""
      ? "valid"
      : validationStatus;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback =
    verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;

  const renderedNumberBox = (
    <NumberBox
      {...props}
      value={controlledValue ?? (localValue === null ? undefined : localValue)}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={registerApi}
      required={required}
      validationStatus={effectiveValidationStatus}
      invalidMessages={effectiveInvalidMessages}
      verboseValidationFeedback={effectiveVerboseValidationFeedback}
      onDidChange={(newValue) => {
        const nextValue = numberBoxValue(newValue);
        setLocalValue(nextValue);
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
        {renderedNumberBox}
        <div data-validation-display-severity="error">{formError}</div>
      </>
    );
  }

  return renderedNumberBox;
}

function runtimeNumberBoxProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  const { onFocus, onBlur, onChange, ...safeRootAttrs } = rootAttrs;
  return {
    ...safeRootAttrs,
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    value: numberBoxValue(adapter.prop("value")),
    initialValue: numberBoxValue(adapter.prop("initialValue")),
    maxLength: adapter.prop("maxLength") as number | undefined,
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    placeholder: adapter.stringProp("placeholder"),
    validationStatus: adapter.stringProp(
      "validationStatus",
      defaultProps.validationStatus,
    ) as React.ComponentProps<typeof NumberBox>["validationStatus"],
    invalidMessages: adapter.prop("invalidMessages") as string[] | undefined,
    startText: adapter.stringProp("startText"),
    startIcon: adapter.stringProp("startIcon"),
    endText: adapter.stringProp("endText"),
    endIcon: adapter.stringProp("endIcon"),
    gap: adapter.stringProp("gap"),
    hasSpinBox: adapter.booleanProp("hasSpinBox", defaultProps.hasSpinBox),
    spinnerUpIcon: adapter.stringProp("spinnerUpIcon"),
    spinnerDownIcon: adapter.stringProp("spinnerDownIcon"),
    step: adapter.prop("step", defaultProps.step) as number | string,
    integersOnly: adapter.booleanProp("integersOnly", defaultProps.integersOnly),
    zeroOrPositive: adapter.booleanProp("zeroOrPositive", defaultProps.zeroOrPositive),
    min: adapter.prop("minValue", defaultProps.min) as number,
    max: adapter.prop("maxValue", defaultProps.max) as number,
    autoFocus: adapter.booleanProp("autoFocus", false),
    readOnly: adapter.booleanProp("readOnly", false),
    required: adapter.booleanProp("required", false),
    direction: adapter.stringProp("direction") as "ltr" | "rtl" | undefined,
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
    "aria-label": adapter.stringProp("aria-label"),
  };
}

function numberBoxValue(value: unknown): number | string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return value as null | undefined | "";
  }
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  return String(value);
}

const numberBoxInputThemeAliases = {
  "backgroundColor-Input": "transparent",
  "borderRadius-Input": "$borderRadius",
  "textColor-Input": "$textColor-primary",
  "backgroundColor-Input--disabled": "$backgroundColor--disabled",
  "borderWidth-Input": "1px",
  "minHeight-Input": "2.5rem",
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
  "outlineColor-Input--focus": "$outlineColor--focus",
  "outlineWidth-Input--focus": "$outlineWidth--focus",
  "outlineStyle-Input--focus": "$outlineStyle--focus",
  "outlineOffset-Input--focus": "$outlineOffset--focus",
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
  [`fontSize-placeholder-${COMP}`]: "inherit",
  [`color-adornment-${COMP}`]: "$color-adornment-Input",
  [`color-adornment-${COMP}--focus`]: `$color-adornment-${COMP}`,
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

Object.assign(NumberBoxMd.defaultThemeVars ??= {}, numberBoxInputThemeAliases);

export const numberBoxRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: NumberBoxMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <RuntimeNumberBoxShell adapter={adapter} {...runtimeNumberBoxProps(adapter)} />
  ),
});
