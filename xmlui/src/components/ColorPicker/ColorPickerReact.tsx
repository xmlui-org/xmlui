import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import { defaultProps } from "./ColorPicker.defaults";
import styles from "./ColorPicker.module.scss";
import { useFormContext } from "../Form/FormContext";

export type ColorPickerApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: string;
};

export type ColorPickerProps = {
  id?: string;
  bindTo?: string;
  value?: unknown;
  initialValue?: unknown;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  label?: unknown;
  requireLabelMode?: string;
  validationStatus?: string;
  className?: string;
  style?: CSSProperties;
  registerComponentApi?: (api: Record<string, unknown>) => void;
  onDidChange?: (value: string) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const ColorPickerNative = memo(forwardRef<ColorPickerApi, ColorPickerProps>(function ColorPickerNative(
  {
    id,
    bindTo,
    value,
    initialValue = defaultProps.initialValue,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    autoFocus,
    tabIndex = 0,
    label,
    requireLabelMode,
    validationStatus = defaultProps.validationStatus,
    className,
    style,
    registerComponentApi,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedInputId = useId();
  const form = useFormContext();
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const registerFormItem = form?.registerItem;
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const effectiveValue = formValue ?? value;
  const inputId = id ?? generatedInputId;
  const controlled = effectiveValue !== undefined;
  const [localValue, setLocalValue] = useState(() =>
    normalizeColor(controlled ? effectiveValue : initialValue),
  );
  const currentValue = controlled ? normalizeColor(effectiveValue) : localValue;

  useEffect(() => {
    if (!controlled) {
      const normalizedInitialValue = normalizeColor(initialValue);
      setLocalValue((previousValue) => previousValue === normalizedInitialValue ? previousValue : normalizedInitialValue);
    }
  }, [controlled, initialValue]);

  const updateValue = useCallback((nextValue: unknown) => {
    const color = normalizeColor(nextValue);
    setLocalValue((previousValue) => previousValue === color ? previousValue : color);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, color);
    }
    void onDidChange?.(color);
  }, [fieldName, onDidChange, setFormValue]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue: updateValue,
    });
  }, [focus, registerComponentApi, updateValue]);

  useEffect(() => {
    registerComponentApi?.({
      value: currentValue,
    });
  }, [currentValue, registerComponentApi]);

  useImperativeHandle(ref, () => ({
    focus,
    setValue: updateValue,
    get value() {
      return currentValue;
    },
  }), [currentValue, focus, updateValue]);

  useEffect(() => {
    if (
      !getFormValue ||
      !setFormValue ||
      fieldName === undefined ||
      getFormValue(fieldName) != null ||
      initialValue === undefined
    ) {
      return;
    }
    setFormValue(fieldName, normalizeColor(initialValue));
  }, [fieldName, getFormValue, initialValue, setFormValue]);

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      label: stringifyLabel(label),
      required,
    });
  }, [fieldName, label, registerFormItem, required]);

  const labelText = stringifyLabel(label);
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    Boolean(required) && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");

  const input = (
    <input
      {...rest}
      id={inputId}
      ref={inputRef}
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!label ? dataTestId ?? id : undefined}
      className={cx(
        styles.colorPickerInput,
        validationStatus === "error" ? styles.colorPickerError : undefined,
        validationStatus === "warning" ? styles.colorPickerWarning : undefined,
        validationStatus === "valid" ? styles.colorPickerSuccess : undefined,
        !label ? className : undefined,
      )}
      style={!label ? style : undefined}
      disabled={!enabled || readOnly}
      readOnly={readOnly}
      required={required}
      autoFocus={autoFocus}
      tabIndex={enabled ? tabIndex : -1}
      type="color"
      inputMode="text"
      value={currentValue}
      onChange={(event: ChangeEvent<HTMLInputElement>) => updateValue(event.currentTarget.value)}
      onFocus={(_event: FocusEvent<HTMLInputElement>) => void onFocus?.()}
      onBlur={(_event: FocusEvent<HTMLInputElement>) => void onBlur?.()}
    />
  );

  if (!labelText) {
    return input;
  }

  return (
    <div
      data-xmlui-component="ColorPicker"
      data-xmlui-part="input"
      data-xmlui-id={id}
      data-testid={dataTestId ?? id}
      className={className}
      style={style}
    >
      <div data-part-id="labeledItem" data-xmlui-part="labeledItem" className={styles.colorPickerLabeledItem}>
        <label htmlFor={inputId} className={styles.colorPickerLabel}>
          {labelText}
          {showRequiredIndicator ? <span className={styles.colorPickerLabelRequired}>*</span> : null}
          {showOptionalIndicator ? <span className={styles.colorPickerLabelOptional}>(Optional)</span> : null}
        </label>
        {input}
      </div>
    </div>
  );
}));

function normalizeColor(value: unknown): string {
  if (typeof value !== "string") {
    return defaultProps.value;
  }
  const normalized = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : defaultProps.value;
}

function stringifyLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function cx(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}
