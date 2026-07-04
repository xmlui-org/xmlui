import {
  Children,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  isValidElement,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

import { FormProvider, useFormContext, type FormContextValue } from "../Form/FormContext";
import { Select } from "../Select/SelectReact";
import { RadioGroup, RadioGroupOption } from "../RadioGroup/RadioGroupReact";
import { SliderNative } from "../Slider/SliderReact";
import { NumberBox as NumberBoxNative } from "../NumberBox/NumberBoxReact";
import { ColorPicker } from "../ColorPicker/ColorPickerReact";
import { DateInput } from "../DateInput/DateInputReact";
import { DatePicker } from "../DatePicker/DatePickerReact";
import { TimeInputNative } from "../TimeInput/TimeInputReact";
import type { Option as XmluiOption } from "../abstractions";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling/theme";
import styles from "./FormItem.module.scss";

export type FormItemProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  bindTo?: string;
  label?: string;
  labelPosition?: string;
  labelWidth?: string | number;
  labelBreak?: boolean;
  enabled?: boolean;
  autoFocus?: boolean;
  type?: string;
  initialValue?: unknown;
  required?: boolean;
  requireLabelMode?: string;
  requiredInvalidMessage?: string;
  minLength?: number;
  lengthInvalidMessage?: string;
  pattern?: string;
  patternInvalidMessage?: string;
  patternInvalidSeverity?: "error" | "warning" | string;
  regex?: string;
  regexInvalidMessage?: string;
  regexInvalidSeverity?: "error" | "warning" | string;
  matchValue?: unknown;
  matchInvalidMessage?: string;
  noSubmit?: boolean;
  validationMode?: string;
  customValidationsDebounce?: number;
  onValidate?: (value: unknown) => unknown | Promise<unknown>;
  options?: XmluiOption[];
  searchable?: boolean;
  groupBy?: string;
  groupHeaderTemplateRenderer?: (contextVars: Record<string, unknown>, key?: string | number) => ReactNode;
  ungroupedHeaderTemplateRenderer?: (contextVars: Record<string, unknown>, key?: string | number) => ReactNode;
  children?: ReactNode;
  inputRenderer?: (contextVars: Record<string, unknown>) => ReactNode;
  renderItemTemplate?: (contextVars: Record<string, unknown>, key: number) => ReactNode;
  registerComponentApi?: (api: Record<string, unknown>) => void;
};

export function FormItem({
  id,
  className,
  style,
  bindTo,
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  enabled = true,
  autoFocus = false,
  type = "text",
  initialValue,
  required = false,
  requireLabelMode,
  requiredInvalidMessage,
  minLength,
  lengthInvalidMessage,
  pattern,
  patternInvalidMessage,
  patternInvalidSeverity,
  regex,
  regexInvalidMessage,
  regexInvalidSeverity,
  matchValue,
  matchInvalidMessage,
  noSubmit = false,
  validationMode,
  customValidationsDebounce = 0,
  onValidate,
  options,
  searchable,
  groupBy,
  groupHeaderTemplateRenderer,
  ungroupedHeaderTemplateRenderer,
  children,
  inputRenderer,
  renderItemTemplate,
  registerComponentApi,
  ...rest
}: FormItemProps) {
  const generatedId = useId();
  const inputId = id ? `${id}-input` : generatedId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const validateRef = useRef(onValidate);
  const form = useFormContext();
  const registerFormItem = form?.registerItem;
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const themeVariables = useThemeVariables();
  const effectiveLabelPosition = labelPosition ?? form?.itemLabelPosition ?? "top";
  const effectiveLabelWidth = labelWidth ?? form?.itemLabelWidth;
  const effectiveLabelBreak = labelBreak ?? form?.itemLabelBreak ?? false;
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const fieldName = resolveFieldName(bindTo, id, generatedId, form?.fieldPrefix);
  const formEnabled = form?.enabled ?? true;
  const itemEnabled = enabled && formEnabled;
  const value = form?.getValue(fieldName) ?? initialValue ?? "";
  const error = form?.errors[fieldName];
  const fieldIssue = form?.issues.find((issue) => issue.field === fieldName);
  const validationStatus = fieldIssue?.severity ?? (error ? "error" : undefined);
  const validationMessage = error ?? fieldIssue?.message;
  const showRequiredIndicator =
    required && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");

  useEffect(() => {
    validateRef.current = onValidate;
  }, [onValidate]);

  const validateRegisteredItem = useCallback((value: unknown) => validateRef.current?.(value), []);

  useEffect(() => {
    if (!getFormValue || !setFormValue || getFormValue(fieldName) != null || initialValue === undefined) {
      return;
    }
    setFormValue(fieldName, initialValue);
  }, [fieldName, getFormValue, initialValue, setFormValue]);

  useEffect(() => {
    if (!registerFormItem) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      label,
      required,
      requiredInvalidMessage,
      minLength,
      lengthInvalidMessage,
      pattern,
      patternInvalidMessage,
      patternInvalidSeverity,
      regex,
      regexInvalidMessage,
      regexInvalidSeverity,
      matchValue,
      matchInvalidMessage,
      noSubmit: noSubmit || bindTo === undefined,
      validate: validateRegisteredItem,
    });
  }, [
    fieldName,
    label,
    lengthInvalidMessage,
    matchInvalidMessage,
    matchValue,
    minLength,
    pattern,
    patternInvalidMessage,
    patternInvalidSeverity,
    regex,
    regexInvalidMessage,
    regexInvalidSeverity,
    noSubmit,
    required,
    requiredInvalidMessage,
    registerFormItem,
    validateRegisteredItem,
  ]);

  useEffect(() => () => {
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }
  }, []);

  const addItem = useCallback((item: unknown = {}) => {
    const currentValue = getFormValue?.(fieldName);
    const currentItems = Array.isArray(currentValue) ? currentValue : [];
    setFormValue?.(fieldName, [...currentItems, item]);
  }, [fieldName, getFormValue, setFormValue]);

  const removeItem = useCallback((index: number) => {
    const currentValue = getFormValue?.(fieldName);
    const currentItems = Array.isArray(currentValue) ? currentValue : [];
    setFormValue?.(fieldName, currentItems.filter((_, itemIndex) => itemIndex !== index));
  }, [fieldName, getFormValue, setFormValue]);

  useEffect(() => {
    if (type !== "items") {
      return;
    }
    registerComponentApi?.({
      addItem,
      removeItem,
    });
  }, [addItem, registerComponentApi, removeItem, type]);

  const itemArray = useMemo(() => Array.isArray(value) ? value : [], [value]);

  const scheduleChangedValidation = (nextValue: unknown) => {
    const shouldValidate =
      validationMode === "onChanged" ||
      Boolean(onValidate) ||
      (validationMode === "errorLate" && Boolean(error));
    if (!shouldValidate) {
      return;
    }
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
      validationTimerRef.current = undefined;
    }
    if (customValidationsDebounce > 0) {
      validationTimerRef.current = setTimeout(() => {
        validationTimerRef.current = undefined;
        void form?.validateField(fieldName, nextValue);
      }, customValidationsDebounce);
      return;
    }
    void form?.validateField(fieldName, nextValue);
  };
  const handleBlurValidation = () => {
    if (validationMode === "onLostFocus" || validationMode === "errorLate" || required) {
      void form?.validateField(fieldName);
    }
  };

  const labelStyle = effectiveLabelWidth ? { width: cssLength(effectiveLabelWidth, themeVariables) } : undefined;
  const control = renderControl({
    autoFocus,
    children,
    enabled: itemEnabled,
    error,
    fieldName,
    form,
    inputId,
    inputRenderer,
    options,
    searchable,
    groupBy,
    groupHeaderTemplateRenderer,
    ungroupedHeaderTemplateRenderer,
    parentForm: form,
    renderItemTemplate,
    required,
    scheduleChangedValidation,
    handleBlurValidation,
    type,
    value,
    itemArray,
  }) ?? (
    <input
      id={inputId}
      className={cx(styles.input, error ? styles.errorInput : undefined)}
      data-xmlui-part="input"
      value={type === "checkbox" ? undefined : stringify(value)}
      checked={type === "checkbox" ? Boolean(value) : undefined}
      type={type}
      required={required}
      disabled={!itemEnabled}
      autoFocus={autoFocus}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${inputId}-error` : undefined}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = normalizeInputValue(event.currentTarget, type);
        form?.setValue(fieldName, nextValue);
        scheduleChangedValidation(nextValue);
      }}
      onBlur={handleBlurValidation}
    />
  );

  return (
    <div
      {...rest}
      ref={rootRef}
      className={cx(styles.formItem, !label ? styles.noLabel : undefined, className)}
      style={style}
      data-xmlui-form-field={fieldName}
      onClick={(event) => {
        if (type !== "select") {
          return;
        }
        if ((event.target as HTMLElement).closest("button")) {
          return;
        }
        rootRef.current?.querySelector<HTMLButtonElement>('button[role="combobox"]')?.click();
      }}
    >
      <div className={cx(styles.row, labelPositionClass(effectiveLabelPosition))}>
        {label && (
          <label
            className={cx(styles.label, effectiveLabelBreak ? styles.labelBreak : undefined)}
            data-part-id="label"
            data-xmlui-part="label"
            htmlFor={inputId}
            style={labelStyle}
          >
            {label}
            {showRequiredIndicator && <span className={styles.requiredIndicator}>*</span>}
            {showOptionalIndicator && <span className={styles.optionalIndicator}>(Optional)</span>}
          </label>
        )}
        <div className={styles.control} data-xmlui-part="control">
          {control}
        </div>
        {validationStatus && (
          <span
            className={styles.validationStatusIndicator}
            data-validation-status={validationStatus}
            data-xmlui-part="validationStatusIndicator"
            aria-hidden="true"
          />
        )}
      </div>
      {validationMessage && (
        <div id={`${inputId}-error`} className={styles.error} data-xmlui-part="error">
          {validationMessage}
        </div>
      )}
    </div>
  );
}

function renderControl({
  autoFocus,
  children,
  enabled,
  error,
  fieldName,
  form,
  inputId,
  inputRenderer,
  itemArray,
  options,
  searchable,
  groupBy,
  groupHeaderTemplateRenderer,
  ungroupedHeaderTemplateRenderer,
  parentForm,
  renderItemTemplate,
  required,
  scheduleChangedValidation,
  handleBlurValidation,
  type,
  value,
}: {
  autoFocus: boolean;
  children?: ReactNode;
  enabled: boolean;
  error?: string;
  fieldName: string;
  form: ReturnType<typeof useFormContext>;
  inputId: string;
  inputRenderer?: (contextVars: Record<string, unknown>) => ReactNode;
  itemArray: unknown[];
  options?: XmluiOption[];
  searchable?: boolean;
  groupBy?: string;
  groupHeaderTemplateRenderer?: (contextVars: Record<string, unknown>, key?: string | number) => ReactNode;
  ungroupedHeaderTemplateRenderer?: (contextVars: Record<string, unknown>, key?: string | number) => ReactNode;
  parentForm: ReturnType<typeof useFormContext>;
  renderItemTemplate?: (contextVars: Record<string, unknown>, key: number) => ReactNode;
  required: boolean;
  scheduleChangedValidation: (nextValue: unknown) => void;
  handleBlurValidation: () => void;
  type: string;
  value: unknown;
}): ReactNode | undefined {
  if (inputRenderer && type !== "items") {
    return inputRenderer({
      $value: value,
      $setValue: (nextValue: unknown) => {
        form?.setValue(fieldName, nextValue);
        scheduleChangedValidation(nextValue);
      },
      $validationResult: error ? { isValid: false, invalidMessage: error, severity: "error" } : undefined,
    });
  }
  if (type === "items") {
    return (
      <div className={styles.itemsStack}>
        {itemArray.map((item, index) => {
          const itemForm = parentForm ? scopedFormContext(parentForm, `${fieldName}.${index}`) : undefined;
          const contextVars = {
            $item: item,
            $itemIndex: index,
            $isFirst: index === 0,
            $isLast: index === itemArray.length - 1,
          };
          return (
            <div key={index}>
              {itemForm
                ? <FormProvider value={itemForm}>{renderItemTemplate?.(contextVars, index) ?? children}</FormProvider>
                : renderItemTemplate?.(contextVars, index) ?? children}
            </div>
          );
        })}
      </div>
    );
  }
  if (type === "select") {
    return (
      <Select
        id={inputId}
        value={value as any}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        data={options ?? optionsFromChildren(children)}
        searchable={searchable}
        groupBy={groupBy}
        groupHeaderRenderer={groupHeaderTemplateRenderer}
        ungroupedHeaderRenderer={() => ungroupedHeaderTemplateRenderer?.({})}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
      />
    );
  }
  if (type === "radioGroup") {
    return (
      <RadioGroup
        id={inputId}
        value={stringify(value)}
        enabled={enabled}
        required={required}
        autofocus={autoFocus}
        validationStatus={error ? "error" : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
      >
        {(options ?? optionsFromChildren(children)).map((option, index) => (
          <RadioGroupOption
            key={`${option.value}:${index}`}
            value={stringify(option.value) ?? ""}
            label={option.label}
            enabled={option.enabled}
            optionRenderer={option.optionRenderer}
            style={option.style}
            className={option.className}
          />
        ))}
      </RadioGroup>
    );
  }
  if (type === "slider") {
    return (
      <SliderNative
        id={inputId}
        value={value}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        validationStatus={error ? "error" : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
      />
    );
  }
  if (type === "number" || type === "integer") {
    return (
      <NumberBoxNative
        id={inputId}
        value={value as string | number | null | undefined}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        integersOnly={type === "integer"}
        hasSpinBox={false}
        validationStatus={error ? "error" : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
      />
    );
  }
  if (type === "colorpicker" || type === "colorPicker" || type === "color") {
    return (
      <ColorPicker
        id={inputId}
        value={stringify(value)}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        validationStatus={error ? "error" : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
        onBlur={handleBlurValidation}
      />
    );
  }
  if (type === "dateinput" || type === "dateInput" || type === "date") {
    return (
      <DateInput
        id={inputId}
        value={stringify(value)}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        validationStatus={error ? "error" : undefined}
        invalidMessages={error ? error.split("\n") : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
        onBlur={handleBlurValidation}
      />
    );
  }
  if (type === "datepicker" || type === "datePicker") {
    return (
      <DatePicker
        id={inputId}
        value={value}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        validationStatus={error ? "error" : undefined}
        invalidMessages={error ? error.split("\n") : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
        onBlur={handleBlurValidation}
      />
    );
  }
  if (type === "timeinput" || type === "timeInput" || type === "time") {
    return (
      <TimeInputNative
        id={inputId}
        value={value}
        enabled={enabled}
        required={required}
        autoFocus={autoFocus}
        validationStatus={error ? "error" : undefined}
        onDidChange={(nextValue) => {
          form?.setValue(fieldName, nextValue);
          scheduleChangedValidation(nextValue);
        }}
        onBlur={handleBlurValidation}
      />
    );
  }
  if (type === "textarea") {
    return (
      <div
        data-part-id="input"
        data-xmlui-part="input"
      >
        <textarea
          id={inputId}
          className={cx(styles.input, error ? styles.errorInput : undefined)}
          value={stringify(value)}
          required={required}
          disabled={!enabled}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            const nextValue = event.currentTarget.value;
            form?.setValue(fieldName, nextValue);
            scheduleChangedValidation(nextValue);
          }}
          onBlur={handleBlurValidation}
        />
      </div>
    );
  }
  return children;
}

function scopedFormContext(parent: FormContextValue, fieldPrefix: string): FormContextValue {
  return {
    ...parent,
    fieldPrefix,
    getValue: parent.getValue,
    setValue: parent.setValue,
    validateField: parent.validateField,
    registerItem: parent.registerItem,
  };
}

function resolveFieldName(
  bindTo: string | undefined,
  id: string | undefined,
  generatedId: string,
  fieldPrefix: string | undefined,
): string {
  if (fieldPrefix !== undefined) {
    return prefixFieldName(fieldPrefix, bindTo ?? id ?? generatedId);
  }
  if (bindTo === undefined || bindTo === "") {
    return id || generatedId;
  }
  return bindTo;
}

function prefixFieldName(prefix: string, name: string | undefined): string {
  return name ? `${prefix}.${name}` : prefix;
}

function optionsFromChildren(children: ReactNode): XmluiOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }
    const props = child.props as Partial<XmluiOption>;
    const label = props.label ?? props.children ?? props.value;
    return [{
      value: props.value,
      label: isReactNode(label) ? label : String(label ?? ""),
      enabled: props.enabled !== false,
      ...props,
    }];
  });
}

function isReactNode(value: unknown): value is ReactNode {
  return value === undefined ||
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    isValidElement(value) ||
    Array.isArray(value);
}

function labelPositionClass(value: string): string {
  if (value === "start") {
    return styles.labelStart;
  }
  if (value === "before") {
    return styles.labelBefore;
  }
  if (value === "end") {
    return styles.labelEnd;
  }
  if (value === "after") {
    return styles.labelAfter;
  }
  return styles.labelTop;
}

function cssLength(value: string | number, themeVariables: Record<string, unknown>): string {
  const normalized = resolveThemeReferences(resolveThemeValue(value, themeVariables));
  return typeof normalized === "number" ? `${normalized}px` : String(normalized);
}

function resolveThemeValue(value: string | number, themeVariables: Record<string, unknown>): string | number {
  if (typeof value !== "string" || !value.startsWith("$")) {
    return value;
  }
  return themeVariables[value.slice(1)] as string | number | undefined ?? value;
}

function stringify(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function normalizeInputValue(input: HTMLInputElement, type: string): unknown {
  if (type === "checkbox") {
    return input.checked;
  }
  if (input.value === "") {
    return "";
  }
  if (type === "number" || type === "integer") {
    const parsed = Number(input.value);
    return Number.isFinite(parsed) ? parsed : input.value;
  }
  return input.value;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
