import styles from "./DateInput.module.scss";

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
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
  dReadonly,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { defaultProps } from "./DateInput.defaults";
import {
  dateFormats,
  DateInput,
  DateInputModeValues,
  WeekDays,
} from "./DateInputReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { useFormContext } from "../Form/FormContext";
import { readContext } from "../../runtime/state";
import { FormItemContext } from "../FormItem/FormItemContext";
import { resolveFormItemId } from "../FormItem/FormItemUtils";
import { ValidationWrapper } from "../FormItem/ValidationWrapper";
import type { FormItemValidations } from "../Form/FormContext";

const COMP = "DateInput";

export const DateInputMd = createMetadata({
  status: "experimental",
  description:
    "`DateInput` provides a text-based date input interface for selecting single dates " +
    "or date ranges, with direct keyboard input similar to TimeInput. It offers customizable " +
    "formatting and validation options without dropdown calendars.",
  parts: {
    day: {
      description: "The day input field.",
    },
    month: {
      description: "The month input field.",
    },
    year: {
      description: "The year input field.",
    },
    clearButton: {
      description: "The button to clear the date input.",
    },
    conciseValidationFeedback: {
      description: "The concise validation feedback indicator shown when verboseValidationFeedback is false.",
    },
  },
  props: {
    initialValue: dInitialValue(null, "string"),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    invalidMessages: {
      description: "The invalid messages to display for the input component.",
      valueType: "string[]",
    },
    mode: {
      description: "The mode of the date input (single or range)",
      valueType: "string",
      availableValues: DateInputModeValues,
      defaultValue: defaultProps.mode,
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: defaultProps.dateFormat,
      availableValues: dateFormats,
    },
    emptyCharacter: {
      description: "Character used to create placeholder text for empty input fields",
      valueType: "string",
      defaultValue: defaultProps.emptyCharacter,
    },
    showWeekNumber: {
      description: "Whether to show the week number (compatibility with DatePicker, not used in DateInput)",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumber,
    },
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc. (compatibility with DatePicker, not used in DateInput)",
      valueType: "number",
      defaultValue: defaultProps.weekStartsOn,
      availableValues: [
        {
          value: WeekDays.Sunday,
          description: "Sunday",
        },
        {
          value: WeekDays.Monday,
          description: "Monday",
        },
        {
          value: WeekDays.Tuesday,
          description: "Tuesday",
        },
        {
          value: WeekDays.Wednesday,
          description: "Wednesday",
        },
        {
          value: WeekDays.Thursday,
          description: "Thursday",
        },
        {
          value: WeekDays.Friday,
          description: "Friday",
        },
        {
          value: WeekDays.Saturday,
          description: "Saturday",
        },
      ],
    },
    minValue: {
      description:
        "The optional start date of the selectable date range. If not defined, the range " +
        "allows any dates in the past.",
      valueType: "string",
    },
    maxValue: {
      description:
        "The optional end date of the selectable date range. If not defined, the range allows " +
        "any future dates.",
      valueType: "string",
    },
    disabledDates: {
      description: "An optional array of dates that are disabled (compatibility with DatePicker, not used in DateInput)",
      valueType: "any",
    },
    inline: {
      description: "Whether to display the date input inline (compatibility with DatePicker, always true for DateInput)",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    clearable: {
      description: "Whether to show a clear button to reset the input",
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    clearIcon: {
      description: "Icon name for the clear button",
      valueType: "string",
    },
    clearToInitialValue: {
      description: "Whether clearing resets to initial value or null",
      valueType: "boolean",
      defaultValue: defaultProps.clearToInitialValue,
    },
    gap: {
      description: "The gap between input elements",
      valueType: "string",
    },
    required: {
      description: "Whether the input is required",
      valueType: "boolean",
      defaultValue: defaultProps.required,
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
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
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): any",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: any): void",
      parameters: {
        value: "The new value to set for the date input.",
      },
    },
    isoValue: {
      description: `Get the current date value formatted in ISO standard (YYYY-MM-DD) format, suitable for JSON serialization.`,
      signature: "isoValue(): string | null",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // DateInput specific theme variables (matching TimeInput structure)
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "1px 0",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "center",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 6px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "2px",
  },
});

export const dateInputComponentRenderer = wrapComponent(
  COMP,
  DateInput,
  DateInputMd,
  {
    events: { didChange: "onDidChange", gotFocus: "onFocus", lostFocus: "onBlur" },
    booleans: ["verboseValidationFeedback"],
    strings: ["validationIconSuccess", "validationIconError"],
    exclude: ["invalidMessages"],
    exposeRegisterApi: true,
    customRender: (props, { node, extractValue }) => {
      props.id = node.uid;
      props.invalidMessages = extractValue(node.props.invalidMessages);
      return <DateInput {...props} />;
    },
  },
);

type RuntimeDateInputProps = React.ComponentProps<typeof DateInput> & {
  adapter: XmluiComponentAdapter;
  bindTo?: string;
};

function RuntimeDateInputShell({
  adapter,
  bindTo,
  value,
  initialValue,
  invalidMessages,
  required,
  validationStatus,
  validationResult: _validationResult,
  validationInProgress: _validationInProgress,
  verboseValidationFeedback,
  onDidChange,
  onFocus,
  onBlur,
  onInvalidChange,
  ...props
}: RuntimeDateInputProps) {
  const form = useFormContext();
  const defaultId = React.useId();
  const { parentFormItemId } = React.useContext(FormItemContext);
  const formRef = React.useRef(form);
  const adapterRef = React.useRef(adapter);
  const itemIndex =
    typeof readContext(adapter.scope, "$itemIndex") === "number"
      ? (readContext(adapter.scope, "$itemIndex") as number)
      : undefined;
  const fieldName = React.useMemo(
    () =>
      bindTo !== undefined || parentFormItemId
        ? resolveFormItemId({ bindTo, defaultId, parentFormItemId, itemIndex })
        : undefined,
    [bindTo, defaultId, itemIndex, parentFormItemId],
  );
  const formValue = fieldName ? form?.getValue(fieldName) : undefined;
  const formError = fieldName ? form?.errors[fieldName] : undefined;
  const controlledValue = nullableStringValue(formValue) ?? nullableStringValue(value);
  const initial = stringValue(initialValue);
  const [localValue, setLocalValue] = React.useState<string | null | undefined>(controlledValue ?? initial);
  const apiRef = React.useRef<Record<string, unknown>>({});
  const lastRegisteredValueRef = React.useRef<unknown>(undefined);
  formRef.current = form;
  adapterRef.current = adapter;

  React.useEffect(() => {
    const nextValue = nullableStringValue(formValue) ?? nullableStringValue(value);
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
    const nextValue = nullableStringValue(state.value);
    setLocalValue(nextValue);
    const currentForm = formRef.current;
    if (currentForm && fieldName && !options?.initial) {
      currentForm.setValue(fieldName, nextValue);
      void currentForm.validateField(fieldName, nextValue);
    }
    if (!options?.initial) {
      adapterRef.current.registerApi({ ...apiRef.current, value: nextValue });
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

  const renderedDateInput = (
    <DateInput
      {...props}
      value={(controlledValue !== undefined ? controlledValue : localValue) as string | undefined}
      initialValue={initial}
      updateState={updateState}
      registerComponentApi={registerApi}
      required={required}
      validationStatus={effectiveValidationStatus}
      invalidMessages={effectiveInvalidMessages}
      verboseValidationFeedback={effectiveVerboseValidationFeedback}
      onDidChange={(nextValue) => {
        setLocalValue(nullableStringValue(nextValue));
        onDidChange?.(nextValue);
        void adapter.event("didChange")(nextValue);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        void adapter.event("gotFocus")();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        void adapter.event("lostFocus")();
      }}
      onInvalidChange={() => {
        onInvalidChange?.();
        void adapter.event("invalidChange")();
      }}
    />
  );

  if (formError && effectiveVerboseValidationFeedback) {
    return (
      <>
        {renderedDateInput}
        <div data-validation-display-severity="error">{formError}</div>
      </>
    );
  }

  return renderedDateInput;
}

function runtimeDateInputProps(adapter: XmluiComponentAdapter) {
  const rootAttrs = adapter.rootAttrs("input") as React.HTMLAttributes<HTMLDivElement>;
  return {
    ...rootAttrs,
    id: adapter.stringProp("id"),
    bindTo: adapter.stringProp("bindTo"),
    value: adapter.prop("value"),
    initialValue: adapter.prop("initialValue"),
    enabled: adapter.booleanProp("enabled", defaultProps.enabled),
    readOnly: adapter.booleanProp("readOnly", defaultProps.readOnly),
    required: adapter.booleanProp("required", defaultProps.required),
    autoFocus: adapter.booleanProp("autoFocus", defaultProps.autoFocus),
    validationStatus: adapter.stringProp("validationStatus", defaultProps.validationStatus) as React.ComponentProps<typeof DateInput>["validationStatus"],
    mode: adapter.stringProp("mode", defaultProps.mode) as React.ComponentProps<typeof DateInput>["mode"],
    dateFormat: adapter.stringProp("dateFormat", defaultProps.dateFormat) as React.ComponentProps<typeof DateInput>["dateFormat"],
    showWeekNumber: adapter.booleanProp("showWeekNumber", defaultProps.showWeekNumber),
    weekStartsOn: adapter.numberProp("weekStartsOn", defaultProps.weekStartsOn) as React.ComponentProps<typeof DateInput>["weekStartsOn"],
    minValue: adapter.stringProp("minValue"),
    maxValue: adapter.stringProp("maxValue"),
    disabledDates: adapter.prop("disabledDates"),
    inline: adapter.booleanProp("inline", defaultProps.inline),
    clearable: adapter.booleanProp("clearable", defaultProps.clearable),
    clearIcon: adapter.stringProp("clearIcon"),
    clearToInitialValue: adapter.booleanProp("clearToInitialValue", defaultProps.clearToInitialValue),
    emptyCharacter: adapter.stringProp("emptyCharacter", defaultProps.emptyCharacter),
    startText: adapter.stringProp("startText"),
    startIcon: adapter.stringProp("startIcon"),
    endText: adapter.stringProp("endText"),
    endIcon: adapter.stringProp("endIcon"),
    gap: adapter.stringProp("gap"),
    verboseValidationFeedback: Object.prototype.hasOwnProperty.call(adapter.props, "verboseValidationFeedback")
      ? adapter.booleanProp("verboseValidationFeedback", true)
      : undefined,
    validationIconSuccess: adapter.stringProp("validationIconSuccess"),
    validationIconError: adapter.stringProp("validationIconError"),
    invalidMessages: adapter.prop("invalidMessages") as string[] | undefined,
    classes: { [COMPONENT_PART_KEY]: adapter.className },
  };
}

function stringValue(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

function nullableStringValue(value: unknown): string | null | undefined {
  return value === undefined ? undefined : value === null ? null : String(value);
}

const dateInputThemeAliases = {
  [`padding-button-${COMP}`]: "1.5px 6px",
  [`minHeight-${COMP}`]: "2.5rem",
  [`gap-adornment-${COMP}`]: "$space-2",
  [`borderRadius-${COMP}`]: "$borderRadius",
  [`borderColor-${COMP}`]: "$borderColor-Input-default",
  [`borderWidth-${COMP}`]: "1px",
  [`borderStyle-${COMP}`]: "solid",
  [`fontSize-${COMP}`]: "$fontSize-base",
  [`boxShadow-${COMP}`]: "none",
  [`textColor-${COMP}`]: "$textColor-primary",
  [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
  [`backgroundColor-${COMP}--hover`]: `$backgroundColor-${COMP}`,
  [`boxShadow-${COMP}--hover`]: `$boxShadow-${COMP}`,
  [`textColor-${COMP}--hover`]: `$textColor-${COMP}`,
  [`borderColor-${COMP}--focus`]: "$borderColor-Input-default--focus",
  [`backgroundColor-${COMP}--focus`]: `$backgroundColor-${COMP}`,
  [`boxShadow-${COMP}--focus`]: `$boxShadow-${COMP}`,
  [`textColor-${COMP}--focus`]: `$textColor-${COMP}`,
  [`outlineWidth-${COMP}--focus`]: "0",
  [`outlineColor-${COMP}--focus`]: "$color-primary-500",
  [`outlineStyle-${COMP}--focus`]: "solid",
  [`outlineOffset-${COMP}--focus`]: "0",
  [`opacity-${COMP}--disabled`]: "1",
  [`backgroundColor-${COMP}--disabled`]: "$backgroundColor",
  [`textColor-${COMP}--disabled`]: "$textColor--disabled",
  [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
  [`borderColor-${COMP}--error`]: "hsl(356, 100%, 48%)",
  [`borderColor-${COMP}--warning`]: "hsl(35, 100%, 42.8%)",
  [`borderColor-${COMP}--success`]: "hsl(129.5, 58.4%, 58.1%)",
  [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
  [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
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

Object.assign(DateInputMd.defaultThemeVars ??= {}, dateInputThemeAliases);

Object.assign(DateInputMd, {
  defaultPart: "input",
} satisfies Partial<ComponentMetadata>);

export const dateInputRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: DateInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const props = runtimeDateInputProps(adapter);
    const validations: FormItemValidations = {
      required: adapter.booleanProp("required", defaultProps.required),
      requiredInvalidMessage: adapter.stringProp("requiredInvalidMessage"),
    };
    const shell = <RuntimeDateInputShell adapter={adapter} {...props} />;
    return validations.required ? (
      <ValidationWrapper
        bindTo={props.bindTo}
        validations={validations}
        validationMode={adapter.stringProp("validationMode") as any}
        componentType={COMP}
      >
        {shell}
      </ValidationWrapper>
    ) : shell;
  },
});
