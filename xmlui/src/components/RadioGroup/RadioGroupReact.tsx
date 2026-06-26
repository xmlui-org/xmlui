import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { defaultProps } from "./RadioGroup.defaults";
import { convertOptionValue } from "../Option/OptionReact";
import { useFormContext } from "../Form/FormContext";
import styles from "./RadioGroup.module.scss";

export type RadioGroupOption = {
  value: unknown;
  label: ReactNode;
  enabled: boolean;
  testId?: string;
};

export type RadioGroupApi = {
  setValue: (value: unknown) => void;
  value: unknown;
};

export type RadioGroupProps = {
  id?: string;
  bindTo?: string;
  value?: unknown;
  initialValue?: unknown;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  orientation?: string;
  gap?: string;
  validationStatus?: string;
  label?: string;
  labelPosition?: string;
  requireLabelMode?: string;
  direction?: string;
  className?: string;
  style?: CSSProperties;
  options?: RadioGroupOption[];
  extraChildren?: ReactNode;
  onDidChange?: (value: unknown) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const RadioGroupNative = memo(forwardRef<RadioGroupApi, RadioGroupProps>(function RadioGroupNative(
  {
    id,
    bindTo,
    value: controlledValue,
    initialValue = defaultProps.initialValue,
    enabled = defaultProps.enabled,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    autoFocus,
    orientation = defaultProps.orientation,
    gap,
    validationStatus = defaultProps.validationStatus,
    label,
    labelPosition = "top",
    requireLabelMode,
    direction = "ltr",
    className,
    style,
    options = [],
    extraChildren,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const groupId = useId();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const form = useFormContext();
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const validateFormField = form?.validateField;
  const registerFormItem = form?.registerItem;
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const formError = form && fieldName !== undefined ? form.errors[fieldName] : undefined;
  const normalizedInitialValue = convertOptionValue(initialValue ?? "");
  const [internalValue, setInternalValue] = useState<unknown>(normalizedInitialValue);
  const effectiveControlledValue = formValue ?? controlledValue;
  const currentValue = effectiveControlledValue === undefined ? internalValue : effectiveControlledValue;
  const effectiveValidationStatus = formError ? "error" : validationStatus;

  useEffect(() => {
    setInternalValue(normalizedInitialValue);
  }, [normalizedInitialValue]);

  useEffect(() => {
    if (!getFormValue || !setFormValue || fieldName === undefined || getFormValue(fieldName) != null || initialValue === undefined) {
      return;
    }
    setFormValue(fieldName, normalizedInitialValue);
  }, [fieldName, getFormValue, initialValue, normalizedInitialValue, setFormValue]);

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      label,
      required,
    });
  }, [fieldName, label, registerFormItem, required]);

  const updateValue = useCallback((nextValue: unknown) => {
    setInternalValue(nextValue);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, nextValue);
      void validateFormField?.(fieldName, nextValue);
    }
    void onDidChange?.(nextValue);
  }, [fieldName, onDidChange, setFormValue, validateFormField]);

  const focusFirstOption = useCallback(() => {
    const firstRadio = groupRef.current?.querySelector<HTMLInputElement>('input[type="radio"]');
    firstRadio?.focus();
  }, []);

  useImperativeHandle(ref, () => ({
    setValue: updateValue,
    get value() {
      return currentValue;
    },
  }), [currentValue, updateValue]);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const firstRadio = groupRef.current?.querySelector<HTMLInputElement>('input[type="radio"]');
    firstRadio?.focus();
  }, [autoFocus]);

  const optionRadios = options.map((option, index) => {
    const inputId = `${id ?? groupId}__option_${index}`;
    const optionDisabled = !enabled || !option.enabled;
    const checked = Object.is(option.value, currentValue);
    const statusClass = checked ? validationStatusClass(effectiveValidationStatus) : undefined;
    return (
      <div
        className={styles.radioOptionContainer}
        data-radio-item
        data-testid={option.testId}
        key={`${String(option.value)}:${index}`}
      >
        <input
          id={inputId}
          className={cx(styles.radioOption, statusClass)}
          type="radio"
          role="radio"
          name={id ?? groupId}
          value={String(option.value ?? "")}
          checked={checked}
          disabled={optionDisabled}
          required={required}
          aria-checked={checked}
          onChange={() => {
            if (readOnly || optionDisabled) {
              return;
            }
            updateValue(option.value);
          }}
        />
        <label
          htmlFor={inputId}
          className={cx(styles.radioOptionLabel, optionDisabled ? styles.radioOptionDisabled : undefined, statusClass)}
        >
          {option.label ?? String(option.value ?? "")}
        </label>
      </div>
    );
  });

  const group = (
    <div
      {...rest}
      ref={groupRef}
      id={id}
      role="radiogroup"
      aria-required={required || undefined}
      aria-readonly={readOnly || undefined}
      aria-disabled={!enabled || undefined}
      data-testid={dataTestId}
      className={cx(
        styles.radioGroupContainer,
        orientation === "horizontal" ? styles.radioGroupHorizontal : undefined,
        !enabled ? styles.radioGroupDisabled : undefined,
        className,
      )}
      style={{
        ...style,
        ...(gap !== undefined ? { gap } : undefined),
      }}
      onFocus={() => void onFocus?.()}
      onBlur={() => void onBlur?.()}
    >
      {extraChildren}
      {optionRadios}
    </div>
  );

  if (!label) {
    return group;
  }

  const inlineLabel = labelPosition === "start" || labelPosition === "end";
  const labelBeforeOptions = inlineLabel && (
    (labelPosition === "start" && direction !== "rtl") ||
    (labelPosition === "end" && direction === "rtl")
  );
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    Boolean(required) && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");

  return (
    <fieldset
      className={styles.radioGroupField}
    >
      <div
        className={cx(
          inlineLabel ? styles.radioGroupFieldInline : styles.radioGroupFieldStacked,
          labelBeforeOptions ? styles.radioGroupLabelBefore : styles.radioGroupLabelAfter,
        )}
      >
        <legend
          className={styles.radioGroupLabel}
          onClick={() => {
            focusFirstOption();
            void onFocus?.();
          }}
        >
          {label}
          {showRequiredIndicator ? <span className={styles.requiredIndicator}>*</span> : null}
          {showOptionalIndicator ? <span className={styles.optionalIndicator}>(Optional)</span> : null}
        </legend>
        {group}
      </div>
    </fieldset>
  );
}));

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function validationStatusClass(status: string | undefined): string | undefined {
  switch (status) {
    case "error":
      return styles.radioOptionError;
    case "warning":
      return styles.radioOptionWarning;
    case "valid":
    case "success":
      return styles.radioOptionValid;
    default:
      return undefined;
  }
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
